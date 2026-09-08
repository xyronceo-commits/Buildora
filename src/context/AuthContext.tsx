import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  reload,
  deleteUser,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, sanitizeForFirestore, OperationType } from '../lib/firebase';
import { UserProfile, UserRole, Business } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  setSupplierOnboardingStep: (step: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Persistent local session backup for offline/demo support
    const saved = localStorage.getItem('buildora_user_session');
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
            const tempRole = (localStorage.getItem('buildora_temp_role') as UserRole) || 'client';
            const tempStepStr = localStorage.getItem('buildora_supplier_onboarding_step');
            const tempStep = tempStepStr ? parseInt(tempStepStr, 10) : 1;

            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Buildora Member',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              phoneNumber: user.phoneNumber || undefined,
              role: isAdminEmail ? 'admin' : tempRole,
              onboardingCompleted: false,
              supplierOnboardingCompleted: localStorage.getItem('buildora_supplier_onboarding_completed') === 'true',
              supplierOnboardingStep: tempStep,
              clientOnboardingCompleted: localStorage.getItem('buildora_client_onboarding_completed') === 'true',
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
              setCurrentUser(profile);
              localStorage.setItem('buildora_user_session', JSON.stringify(profile));
              if (profile.role) {
                localStorage.setItem('buildora_temp_role', profile.role);
              }
              if (profile.supplierOnboardingStep !== undefined) {
                localStorage.setItem('buildora_supplier_onboarding_step', profile.supplierOnboardingStep.toString());
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
        if (!localStorage.getItem('buildora_demo_active')) {
          setCurrentUser(null);
          localStorage.removeItem('buildora_user_session');
        }
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const isAdminEmail = user.email?.toLowerCase() === 'buildsafe247@gmail.com';
        const tempRole = (localStorage.getItem('buildora_temp_role') as UserRole) || 'client';
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Buildora Member',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          phoneNumber: user.phoneNumber || undefined,
          role: isAdminEmail ? 'admin' : tempRole,
          onboardingCompleted: false,
          activeProjectId: 'proj_osogbo_01',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const sanitized = sanitizeForFirestore(newProfile);
        await setDoc(userRef, sanitized);
        setCurrentUser(sanitized as UserProfile);
        localStorage.setItem('buildora_user_session', JSON.stringify(sanitized));
      } else {
        const profile = snap.data() as UserProfile;
        setCurrentUser(profile);
        localStorage.setItem('buildora_user_session', JSON.stringify(profile));
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      handleFirestoreError(error, OperationType.WRITE, 'users');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'auth/email');
      throw error;
    } finally {
      setLoading(false);
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
      const userRole = roleOverride || (localStorage.getItem('buildora_temp_role') as UserRole) || 'client';
      const bizId = userRole === 'supplier' ? `biz_${res.user.uid.slice(0, 8)}` : undefined;

      const newProfile: UserProfile = {
        uid: res.user.uid,
        displayName: displayName || (userRole === 'supplier' ? extraDetails?.businessName || 'Buildora Supplier' : 'Buildora Client'),
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

      localStorage.removeItem('buildora_demo_active');
      localStorage.setItem('buildora_temp_role', userRole);
      if (userRole === 'supplier') {
        localStorage.setItem('buildora_supplier_onboarding_completed', 'true');
      } else {
        localStorage.setItem('buildora_client_onboarding_completed', 'true');
      }

      setCurrentUser(sanitizedProfile as UserProfile);
      localStorage.setItem('buildora_user_session', JSON.stringify(sanitizedProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('buildora_user_session');
    setCurrentUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Signout error:', e);
    }
  };

  const deleteAccount = async () => {
    const uid = firebaseUser?.uid || auth.currentUser?.uid || currentUser?.uid;
    const userObj = auth.currentUser || firebaseUser;

    // Delete Firestore user document first
    if (uid) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.warn('Error deleting Firestore user document:', err);
      }
    }

    // Delete Firebase Auth user if authenticated
    if (userObj) {
      try {
        await deleteUser(userObj);
      } catch (err: any) {
        console.warn('Error deleting Firebase Auth user:', err);
        if (err?.code === 'auth/requires-recent-login') {
          throw new Error('For security reasons, please sign out and sign in again before deleting your account.');
        }
        throw err;
      }
    }

    // Clear local storage and state
    localStorage.removeItem('buildora_user_session');
    localStorage.removeItem('buildora_temp_role');
    localStorage.removeItem('buildora_supplier_onboarding_completed');
    localStorage.removeItem('buildora_supplier_onboarding_step');
    localStorage.removeItem('buildora_client_onboarding_completed');
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
    const sanitizedLocal = sanitizeForFirestore(updated);
    setCurrentUser(sanitizedLocal as UserProfile);
    localStorage.setItem('buildora_user_session', JSON.stringify(sanitizedLocal));

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

  const setUserRole = async (role: UserRole) => {
    localStorage.setItem('buildora_temp_role', role);
    await updateUserProfile({ role });
  };

  const setSupplierOnboardingStep = async (step: number) => {
    localStorage.setItem('buildora_supplier_onboarding_step', step.toString());
    await updateUserProfile({ supplierOnboardingStep: step });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendVerificationEmail,
        checkEmailVerification,
        signOut,
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
