import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  reload,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db, handleFirestoreError, sanitizeForFirestore, OperationType } from '../lib/firebase';
import { UserProfile, UserRole, Business } from '../types';

export function getReadableAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your details and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes before trying again.';
    case 'auth/requires-recent-login':
      return 'For security reasons, please confirm your password before deleting your account.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    displayName: string,
    role?: UserRole,
    extraDetails?: {
      phoneNumber?: string;
      location?: string;
      businessName?: string;
      businessCategory?: string;
    }
  ) => Promise<void>;
  signInWithGoogleAdmin: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  signOut: () => Promise<void>;
  reauthenticateUser: (password: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  setSupplierOnboardingStep: (step: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Persistent local session backup for offline/demo support
    const saved = localStorage.getItem('constrora_user_session') || localStorage.getItem('buildora_user_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time sync between Firebase Auth state and Firestore 'users' document
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const userRef = doc(db, 'users', user.uid);

        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            // New user document initialization
            const isAdminEmail = user.email?.toLowerCase() === 'buildsafe247@gmail.com';
            const tempRole = (localStorage.getItem('constrora_temp_role') as UserRole) || (localStorage.getItem('buildora_temp_role') as UserRole) || 'client';
            const tempStepStr = localStorage.getItem('constrora_supplier_onboarding_step') || localStorage.getItem('buildora_supplier_onboarding_step');
            const tempStep = tempStepStr ? parseInt(tempStepStr, 10) : 1;

            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Constrora Member',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              phoneNumber: user.phoneNumber || undefined,
              role: isAdminEmail ? 'admin' : tempRole,
              onboardingCompleted: true,
              supplierOnboardingCompleted: true,
              supplierOnboardingStep: 6,
              clientOnboardingCompleted: true,
              activeProjectId: 'proj_osogbo_01',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            const sanitized = sanitizeForFirestore(newProfile);
            await setDoc(userRef, sanitized);
          }
        } catch (error) {
          console.warn('Error verifying or creating initial Firestore user document:', error);
        }

        // Real-time listener for user profile document in Firestore
        unsubscribeSnapshot = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const profile = docSnap.data() as UserProfile;
              // Strict security check: buildsafe247@gmail.com ALWAYS receives admin role; others are stripped of admin role
              const isExactAdminEmail = user.email?.toLowerCase() === 'buildsafe247@gmail.com';
              if (isExactAdminEmail) {
                profile.role = 'admin';
              } else if (profile.role === 'admin') {
                profile.role = 'client';
              }
              setCurrentUser(profile);
              localStorage.setItem('constrora_user_session', JSON.stringify(profile));
              if (profile.role) {
                localStorage.setItem('constrora_temp_role', profile.role);
              }
              if (profile.supplierOnboardingStep !== undefined) {
                localStorage.setItem('constrora_supplier_onboarding_step', profile.supplierOnboardingStep.toString());
              }
            }
            setLoading(false);
          },
          (error) => {
            console.warn('Real-time Firestore user snapshot error:', error);
            setLoading(false);
          }
        );
      } else {
        if (!localStorage.getItem('constrora_demo_active')) {
          setCurrentUser(null);
          localStorage.removeItem('constrora_user_session');
        }
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (email.toLowerCase() === 'buildsafe247@gmail.com') {
        const userRef = doc(db, 'users', res.user.uid);
        await setDoc(userRef, { role: 'admin', updatedAt: new Date().toISOString() }, { merge: true });
      }
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    }
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (err) {
        console.warn('sendEmailVerification error:', err);
      }
    }
  };

  const checkEmailVerification = async (): Promise<boolean> => {
    if (auth.currentUser) {
      try {
        await reload(auth.currentUser);
        const isVerified = auth.currentUser.emailVerified;
        if (isVerified) {
          await updateUserProfile({ emailVerified: true });
        }
        return isVerified;
      } catch (e) {
        console.warn('Error checking email verification:', e);
      }
    }
    return currentUser?.emailVerified || false;
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName: string,
    roleOverride?: UserRole,
    extraDetails?: {
      phoneNumber?: string;
      location?: string;
      businessName?: string;
      businessCategory?: string;
    }
  ) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      
      try {
        await sendEmailVerification(res.user);
      } catch (e) {
        console.warn('Initial sendEmailVerification error:', e);
      }

      const isAdminEmail = email.toLowerCase() === 'buildsafe247@gmail.com';
      const userRole = roleOverride || (localStorage.getItem('constrora_temp_role') as UserRole) || 'client';
      const bizId = userRole === 'supplier' ? `biz_${res.user.uid.slice(0, 8)}` : undefined;

      const newProfile: UserProfile = {
        uid: res.user.uid,
        displayName: displayName || (userRole === 'supplier' ? extraDetails?.businessName || 'Constrora Supplier' : 'Constrora Client'),
        email,
        phoneNumber: extraDetails?.phoneNumber,
        role: isAdminEmail ? 'admin' : userRole,
        onboardingCompleted: true,
        supplierOnboardingCompleted: userRole === 'supplier',
        supplierOnboardingStep: 6,
        clientOnboardingCompleted: userRole === 'client',
        activeProjectId: 'proj_osogbo_01',
        businessId: bizId,
        emailVerified: res.user.emailVerified || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const sanitizedProfile = sanitizeForFirestore(newProfile);
      await setDoc(doc(db, 'users', res.user.uid), sanitizedProfile);

      if (userRole === 'supplier' && bizId) {
        const newBiz: Business = {
          businessId: bizId,
          ownerId: res.user.uid,
          businessName: extraDetails?.businessName || displayName || 'Supplier Enterprise',
          category: (extraDetails?.businessCategory as any) || 'Equipment Rental',
          description: `Certified Supplier depot based in ${extraDetails?.location || 'Osogbo, Osun State'}.`,
          phone: extraDetails?.phoneNumber || '+234 800 000 0000',
          whatsapp: extraDetails?.phoneNumber || '+234 800 000 0000',
          email,
          location: {
            address: extraDetails?.location || 'Depot Address, Osogbo',
            city: 'Osogbo',
            state: 'Osun State',
            country: 'Nigeria',
            latitude: 7.7827,
            longitude: 4.5418,
          },
          verificationStatus: 'VERIFICATION_PENDING',
          rating: 5.0,
          reviewCount: 0,
          deliveryAvailable: true,
          photos: [
            'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const sanitizedBiz = sanitizeForFirestore(newBiz);
        await setDoc(doc(db, 'businesses', bizId), sanitizedBiz);
      }

      localStorage.removeItem('constrora_demo_active');
      localStorage.setItem('constrora_temp_role', userRole);
      if (userRole === 'supplier') {
        localStorage.setItem('constrora_supplier_onboarding_completed', 'true');
      } else {
        localStorage.setItem('constrora_client_onboarding_completed', 'true');
      }

      setCurrentUser(sanitizedProfile as UserProfile);
      localStorage.setItem('constrora_user_session', JSON.stringify(sanitizedProfile));
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('constrora_user_session');
    setCurrentUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Signout error:', e);
    }
  };

  const reauthenticateUser = async (password: string) => {
    const userObj = auth.currentUser || firebaseUser;
    if (!userObj || !userObj.email) {
      throw new Error('No active user session found for reauthentication.');
    }
    try {
      const credential = EmailAuthProvider.credential(userObj.email, password);
      await reauthenticateWithCredential(userObj, credential);
    } catch (error: any) {
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        throw new Error('Incorrect password. Please enter your correct password to confirm account deletion.');
      }
      throw new Error(getReadableAuthError(error));
    }
  };

  const deleteAccount = async (password?: string) => {
    const userObj = auth.currentUser || firebaseUser;
    const uid = userObj?.uid || currentUser?.uid;

    if (!uid || !userObj) {
      throw new Error('No active user session found.');
    }

    // Reauthenticate if password provided
    if (password) {
      await reauthenticateUser(password);
    }

    // 1. Delete user-owned Firestore documents
    try {
      // a) Delete users/{uid}
      await deleteDoc(doc(db, 'users', uid));

      // b) If supplier: delete business and subcollections
      const bizId = currentUser?.businessId;
      if (bizId) {
        try {
          const listingsRef = collection(db, 'businesses', bizId, 'listings');
          const listingsSnap = await getDocs(listingsRef);
          for (const listDoc of listingsSnap.docs) {
            await deleteDoc(listDoc.ref);
          }
        } catch (e) {
          console.warn('Error deleting business listings subcollection:', e);
        }

        try {
          const quotesRef = collection(db, 'businesses', bizId, 'quotes');
          const quotesSnap = await getDocs(quotesRef);
          for (const qDoc of quotesSnap.docs) {
            await deleteDoc(qDoc.ref);
          }
        } catch (e) {
          console.warn('Error deleting business quotes subcollection:', e);
        }

        try {
          await deleteDoc(doc(db, 'businesses', bizId));
        } catch (e) {
          console.warn('Error deleting business document:', e);
        }
      } else {
        try {
          const bizQuery = query(collection(db, 'businesses'), where('ownerId', '==', uid));
          const bizSnap = await getDocs(bizQuery);
          for (const bDoc of bizSnap.docs) {
            await deleteDoc(bDoc.ref);
          }
        } catch (e) {
          console.warn('Error deleting owner businesses:', e);
        }
      }

      // c) Delete projects owned by user
      try {
        const projQuery = query(collection(db, 'projects'), where('ownerId', '==', uid));
        const projSnap = await getDocs(projQuery);
        for (const pDoc of projSnap.docs) {
          await deleteDoc(pDoc.ref);
        }
      } catch (e) {
        console.warn('Error deleting user projects:', e);
      }

      // d) Delete user quote requests
      try {
        const qrQuery = query(collection(db, 'quoteRequests'), where('clientId', '==', uid));
        const qrSnap = await getDocs(qrQuery);
        for (const qrDoc of qrSnap.docs) {
          await deleteDoc(qrDoc.ref);
        }
      } catch (e) {
        console.warn('Error deleting user quote requests:', e);
      }
    } catch (err) {
      console.warn('Error cleaning up Firestore user data during deletion:', err);
    }

    // 2. Delete Firebase Auth user
    try {
      await deleteUser(userObj);
    } catch (err: any) {
      if (err?.code === 'auth/requires-recent-login') {
        const reauthError = new Error('auth/requires-recent-login');
        (reauthError as any).code = 'auth/requires-recent-login';
        throw reauthError;
      }
      throw new Error(getReadableAuthError(err));
    }

    // 3. Clear all user session and local storage state
    localStorage.removeItem('constrora_user_session');
    localStorage.removeItem('constrora_temp_role');
    localStorage.removeItem('constrora_supplier_onboarding_completed');
    localStorage.removeItem('constrora_supplier_onboarding_step');
    localStorage.removeItem('constrora_client_onboarding_completed');
    localStorage.removeItem('constrora_demo_active');
    localStorage.removeItem('constrora_saved_items');
    localStorage.removeItem('constrora_user_projects');
    localStorage.removeItem('constrora_active_project_id');
    localStorage.removeItem('buildora_user_session');
    localStorage.removeItem('buildora_temp_role');
    localStorage.removeItem('buildora_supplier_onboarding_completed');
    localStorage.removeItem('buildora_client_onboarding_completed');
    localStorage.removeItem('buildora_onboarding_done');

    setCurrentUser(null);
    setFirebaseUser(null);

    try {
      await firebaseSignOut(auth);
    } catch (e) {
      // Ignore error if user deleted
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
    const sanitizedLocal = sanitizeForFirestore(updated);
    setCurrentUser(sanitizedLocal as UserProfile);
    localStorage.setItem('constrora_user_session', JSON.stringify(sanitizedLocal));

    const uid = firebaseUser?.uid || auth.currentUser?.uid || currentUser.uid;
    if (uid) {
      try {
        const patchData = sanitizeForFirestore({
          ...data,
          updatedAt: new Date().toISOString(),
        });
        await setDoc(doc(db, 'users', uid), patchData, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      }
    }
  };

  const signInWithGoogleAdmin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const authenticatedEmail = user.email?.toLowerCase() || '';

      if (authenticatedEmail !== 'buildsafe247@gmail.com') {
        // Immediately sign out unauthorized user
        await firebaseSignOut(auth);
        setCurrentUser(null);
        localStorage.removeItem('constrora_user_session');
        throw new Error('Access denied. This Google account is not authorized to access the Constrora admin portal.');
      }

      // Exact match authorized admin
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const adminProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || 'Constrora Admin',
        email: 'buildsafe247@gmail.com',
        photoURL: user.photoURL || undefined,
        role: 'admin',
        onboardingCompleted: true,
        supplierOnboardingCompleted: true,
        supplierOnboardingStep: 6,
        clientOnboardingCompleted: true,
        activeProjectId: 'proj_osogbo_01',
        createdAt: snap.exists() ? snap.data().createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const sanitized = sanitizeForFirestore(adminProfile);
      await setDoc(userRef, sanitized, { merge: true });
      setCurrentUser(adminProfile);
      localStorage.setItem('constrora_user_session', JSON.stringify(adminProfile));
    } catch (error: any) {
      if (error?.message?.includes('Access denied')) {
        throw error;
      }
      throw new Error(getReadableAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = async (role: UserRole) => {
    localStorage.setItem('constrora_temp_role', role);
    await updateUserProfile({ role });
  };

  const setSupplierOnboardingStep = async (step: number) => {
    localStorage.setItem('constrora_supplier_onboarding_step', step.toString());
    await updateUserProfile({ supplierOnboardingStep: step });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogleAdmin,
        sendPasswordReset,
        sendVerificationEmail,
        checkEmailVerification,
        signOut,
        reauthenticateUser,
        deleteAccount,
        updateUserProfile,
        setUserRole,
        setSupplierOnboardingStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
