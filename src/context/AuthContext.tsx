import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  IdTokenResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db, handleFirestoreError, sanitizeForFirestore, OperationType } from '../lib/firebase';
import { UserProfile, UserRole, Business } from '../types';

export function getReadableAuthError(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const errObj = error as { code?: string; message?: string };
  const code = errObj.code || '';
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
    case 'auth/popup-closed-by-user':
      return 'The Google sign-in window was closed before completing. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'The sign-in popup was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address using a different sign-in method. Please sign in with your email and password.';
    default:
      return errObj.message || 'Authentication failed. Please try again.';
  }
}

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
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
      address?: string;
      city?: string;
      state?: string;
      description?: string;
    }
  ) => Promise<void>;
  signInWithGoogle: (roleOverride?: UserRole) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  signOut: () => Promise<void>;
  reauthenticateUser: (password: string) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  getAdminToken: () => Promise<string | null>;
  setSupplierOnboardingStep: (step: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync admin custom claim server-side if user is the designated admin
  const syncAdminClaimIfEligible = useCallback(async (user: FirebaseUser): Promise<boolean> => {
    if (!user.emailVerified) {
      return false;
    }

    try {
      const rawToken = await user.getIdToken();
      const res = await fetch('/api/admin/claim', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${rawToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.admin) {
          // Refresh token once so client picks up the new custom claim
          const refreshedToken = await user.getIdTokenResult(true);
          return refreshedToken.claims.admin === true;
        }
      }
    } catch (err) {
      console.warn('[Admin Claim Sync Warning]:', err);
    }
    return false;
  }, []);

  // Real-time sync between Firebase Auth and Firestore 'users' document
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        let isUserAdmin = false;
        try {
          const idTokenResult: IdTokenResult = await user.getIdTokenResult();
          isUserAdmin = idTokenResult.claims.admin === true && Boolean(user.emailVerified);

          // If not possessing claim and email is verified, request server sync
          if (!isUserAdmin && user.emailVerified) {
            isUserAdmin = await syncAdminClaimIfEligible(user);
          }
        } catch (tokenErr) {
          console.warn('[Token Claim Inspection Warning]:', tokenErr);
        }

        setIsAdmin(isUserAdmin);

        const userRef = doc(db, 'users', user.uid);

        try {
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            // New user document initialization: client always writes 'client' or 'supplier', never 'admin'
            // Server Admin SDK elevates to 'admin' via /api/admin/claim
            const tempRole = (localStorage.getItem('constrora_temp_role') as UserRole) || 'client';
            const assignedRole: UserRole = tempRole === 'supplier' ? 'supplier' : 'client';

            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Constrora Member',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              phoneNumber: user.phoneNumber || undefined,
              role: assignedRole,
              onboardingCompleted: true,
              supplierOnboardingCompleted: assignedRole === 'supplier',
              supplierOnboardingStep: 6,
              clientOnboardingCompleted: assignedRole === 'client',
              activeProjectId: 'proj_osogbo_01',
              emailVerified: Boolean(user.emailVerified),
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
              if (isUserAdmin) {
                profile.role = 'admin';
                profile.emailVerified = true;
              }
              setCurrentUser(profile);
            }
            setLoading(false);
          },
          (error) => {
            console.warn('Real-time Firestore user snapshot error:', error);
            setLoading(false);
          }
        );
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, [syncAdminClaimIfEligible]);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user.emailVerified) {
        const hasClaim = await syncAdminClaimIfEligible(cred.user);
        setIsAdmin(hasClaim);
      }
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (roleOverride?: UserRole) => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let isUserAdmin = false;
      if (user.emailVerified) {
        isUserAdmin = await syncAdminClaimIfEligible(user);
        setIsAdmin(isUserAdmin);
      }

      // Check if user document exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        // Client initializes standard role ('client' or 'supplier'); server Admin SDK elevates to 'admin' via /api/admin/claim
        const rawRole = roleOverride || (localStorage.getItem('constrora_temp_role') as UserRole);
        const chosenRole: UserRole = rawRole === 'supplier' ? 'supplier' : 'client';

        const bizId = chosenRole === 'supplier' ? `biz_${user.uid.slice(0, 8)}` : undefined;

        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Constrora Member',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          phoneNumber: user.phoneNumber || undefined,
          role: chosenRole,
          onboardingCompleted: true,
          supplierOnboardingCompleted: chosenRole === 'supplier',
          supplierOnboardingStep: 6,
          clientOnboardingCompleted: chosenRole === 'client',
          activeProjectId: 'proj_osogbo_01',
          businessId: bizId,
          emailVerified: true, // Google accounts have verified email
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(userRef, sanitizeForFirestore(newProfile));

        if (chosenRole === 'supplier' && bizId) {
          const newBiz: Business = {
            businessId: bizId,
            ownerId: user.uid,
            businessName: user.displayName ? `${user.displayName} Supplies` : 'Supplier Depot',
            category: 'Equipment Rental',
            description: 'Certified supplier providing plant machinery and building materials.',
            phone: user.phoneNumber || '+234 800 000 0000',
            whatsapp: user.phoneNumber || '+234 800 000 0000',
            email: user.email || '',
            location: {
              address: 'Industrial Layout',
              city: 'Osogbo',
              state: 'Osun State',
              country: 'Nigeria',
              latitude: 7.7827,
              longitude: 4.5418,
            },
            verificationStatus: 'LISTED',
            rating: 5.0,
            reviewCount: 0,
            deliveryAvailable: true,
            photos: [
              'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80',
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'businesses', bizId), sanitizeForFirestore(newBiz));
        }

        setCurrentUser(newProfile);
      }
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    const trimmed = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      throw new Error('The email address format is invalid.');
    }
    try {
      await firebaseSendPasswordResetEmail(auth, trimmed);
    } catch (error: any) {
      const code = error?.code || '';
      // Neutral handling for non-existent users to prevent email enumeration
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        console.log('Reset email requested');
        return;
      }
      throw new Error(getReadableAuthError(error));
    }
    console.log('Reset email requested');
  };

  const sendVerificationEmail = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
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
      address?: string;
      city?: string;
      state?: string;
      description?: string;
    }
  ) => {
    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);

      // Email/password signups cannot assign admin role directly (must verify email first)
      const requestedRole = roleOverride || (localStorage.getItem('constrora_temp_role') as UserRole) || 'client';
      const userRole: UserRole = requestedRole === 'admin' ? 'client' : requestedRole;

      try {
        await sendEmailVerification(res.user);
      } catch (e) {
        console.warn('Initial sendEmailVerification error:', e);
      }

      const bizId = userRole === 'supplier' ? `biz_${res.user.uid.slice(0, 8)}` : undefined;

      const newProfile: UserProfile = {
        uid: res.user.uid,
        displayName: displayName || (userRole === 'supplier' ? extraDetails?.businessName || 'Constrora Supplier' : 'Constrora Client'),
        email,
        phoneNumber: extraDetails?.phoneNumber,
        role: userRole,
        onboardingCompleted: true,
        supplierOnboardingCompleted: userRole === 'supplier',
        supplierOnboardingStep: 6,
        clientOnboardingCompleted: userRole === 'client',
        activeProjectId: 'proj_osogbo_01',
        businessId: bizId,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const sanitizedProfile = sanitizeForFirestore(newProfile);
      await setDoc(doc(db, 'users', res.user.uid), sanitizedProfile);

      if (userRole === 'supplier' && bizId) {
        const fullLocationAddress = extraDetails?.address
          ? `${extraDetails.address}${extraDetails.city ? `, ${extraDetails.city}` : ''}${extraDetails.state ? `, ${extraDetails.state}` : ''}`
          : extraDetails?.location || 'Osogbo, Osun State';

        const newBiz: Business = {
          businessId: bizId,
          ownerId: res.user.uid,
          businessName: extraDetails?.businessName || displayName || 'Supplier Enterprise',
          category: (extraDetails?.businessCategory as any) || 'Equipment Rental',
          description: extraDetails?.description || `Certified supplier depot providing ${extraDetails?.businessCategory || 'construction equipment and materials'} in ${fullLocationAddress}.`,
          phone: extraDetails?.phoneNumber || '+234 800 000 0000',
          whatsapp: extraDetails?.phoneNumber || '+234 800 000 0000',
          email,
          location: {
            address: extraDetails?.address || extraDetails?.location || 'Depot Address, Osogbo',
            city: extraDetails?.city || 'Osogbo',
            state: extraDetails?.state || 'Osun State',
            country: 'Nigeria',
            latitude: 7.7827,
            longitude: 4.5418,
          },
          verificationStatus: 'LISTED',
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

      setCurrentUser(sanitizedProfile as UserProfile);
    } catch (error) {
      throw new Error(getReadableAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Clear all cached local session and application state
    localStorage.removeItem('constrora_user_session');
    localStorage.removeItem('constrora_onboarding_done');
    localStorage.removeItem('constrora_temp_role');
    localStorage.removeItem('constrora_supplier_onboarding_completed');
    localStorage.removeItem('constrora_supplier_onboarding_step');
    localStorage.removeItem('constrora_client_onboarding_completed');
    localStorage.removeItem('constrora_demo_active');
    localStorage.removeItem('constrora_saved_items');
    localStorage.removeItem('constrora_user_projects');
    localStorage.removeItem('constrora_active_project_id');
    sessionStorage.clear();

    setCurrentUser(null);
    setFirebaseUser(null);
    setIsAdmin(false);

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

    if (password) {
      await reauthenticateUser(password);
    }

    try {
      await deleteUser(userObj);
    } catch (err: unknown) {
      const errObj = err as { code?: string };
      if (errObj?.code === 'auth/requires-recent-login') {
        const reauthError = new Error('auth/requires-recent-login');
        (reauthError as unknown as { code: string }).code = 'auth/requires-recent-login';
        throw reauthError;
      }
      throw new Error(getReadableAuthError(err));
    }

    // Cleanup Firestore documents
    try {
      await deleteDoc(doc(db, 'users', uid));

      const bizId = currentUser?.businessId;
      if (bizId) {
        try {
          const listingsRef = collection(db, 'businesses', bizId, 'listings');
          const listingsSnap = await getDocs(listingsRef);
          for (const listDoc of listingsSnap.docs) {
            await deleteDoc(listDoc.ref);
          }
        } catch (e) {
          console.warn('Error deleting listings:', e);
        }

        try {
          await deleteDoc(doc(db, 'businesses', bizId));
        } catch (e) {
          console.warn('Error deleting business:', e);
        }
      }
    } catch (err) {
      console.warn('Error cleaning up Firestore data:', err);
    }

    await signOut();
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const cleanData = { ...data };

    // Disallow self-promotion to admin role through client updates
    if (cleanData.role === 'admin' && !isAdmin) {
      delete cleanData.role;
    }

    const updated = { ...currentUser, ...cleanData, updatedAt: new Date().toISOString() };
    const sanitizedLocal = sanitizeForFirestore(updated);
    setCurrentUser(sanitizedLocal as UserProfile);

    const uid = firebaseUser?.uid || auth.currentUser?.uid || currentUser.uid;
    if (uid) {
      try {
        const patchData = sanitizeForFirestore({
          ...cleanData,
          updatedAt: new Date().toISOString(),
        });
        await setDoc(doc(db, 'users', uid), patchData, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      }
    }
  };

  const getAdminToken = async (): Promise<string | null> => {
    const user = auth.currentUser || firebaseUser;
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  };

  const setSupplierOnboardingStep = async (step: number) => {
    await updateUserProfile({ supplierOnboardingStep: step });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        isAdmin,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        sendVerificationEmail,
        checkEmailVerification,
        signOut,
        reauthenticateUser,
        deleteAccount,
        updateUserProfile,
        getAdminToken,
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
