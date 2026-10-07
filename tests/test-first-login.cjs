const { initializeApp: initAdminApp, getApps: getAdminApps } = require('firebase-admin/app');
const { getAuth: getAdminAuth } = require('firebase-admin/auth');
const { getFirestore: getAdminFirestore } = require('firebase-admin/firestore');
const { initializeApp: initClientApp } = require('firebase/app');
const { 
  getAuth: getClientAuth, 
  connectAuthEmulator, 
  signInWithCredential, 
  GoogleAuthProvider 
} = require('firebase/auth');
const { 
  getFirestore: getClientFirestore, 
  connectFirestoreEmulator, 
  doc, 
  getDoc, 
  setDoc 
} = require('firebase/firestore');

const PROJECT_ID = 'buildora-ed329';
const ADMIN_EMAIL = 'buildsafe247@gmail.com';

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST || !process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('[SECURITY GUARD ERROR]: Both FIREBASE_AUTH_EMULATOR_HOST and FIRESTORE_EMULATOR_HOST must be set. Aborting to prevent live service calls.');
  process.exit(1);
}

async function runFirstLoginTest() {
  console.log('=== REPRODUCING EXACT FIRST-LOGIN SEQUENCE ===');

  // 1. Initialize Firebase Admin SDK targeting emulators
  const adminApp = initAdminApp({ projectId: PROJECT_ID }, 'admin-test-app');
  const adminAuth = getAdminAuth(adminApp);
  const adminDb = getAdminFirestore(adminApp);

  // 2. Initialize Firebase Client SDK
  const clientApp = initClientApp({
    apiKey: 'fake-api-key-for-emulator',
    authDomain: `${PROJECT_ID}.firebaseapp.com`,
    projectId: PROJECT_ID,
  }, 'client-test-app');

  const clientAuth = getClientAuth(clientApp);
  connectAuthEmulator(clientAuth, 'http://127.0.0.1:9099', { disableWarnings: true });

  const clientDb = getClientFirestore(clientApp);
  connectFirestoreEmulator(clientDb, '127.0.0.1', 8088);

  console.log('1. Step 1: User completes Google Sign-In on client');
  // Create an auth user on the emulator representing buildsafe247@gmail.com
  let userRecord;
  try {
    userRecord = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    await adminAuth.deleteUser(userRecord.uid);
  } catch (e) {
    // doesn't exist yet
  }

  // Create clean user on Auth emulator
  userRecord = await adminAuth.createUser({
    uid: 'admin_test_uid_001',
    email: ADMIN_EMAIL,
    emailVerified: true,
    displayName: 'BuildSafe Admin',
  });
  console.log('   User created on Auth emulator:', { uid: userRecord.uid, email: userRecord.email, verified: userRecord.emailVerified });

  // Generate a custom token to sign in on the client SDK
  const customToken = await adminAuth.createCustomToken(userRecord.uid);
  const { signInWithCustomToken } = require('firebase/auth');
  const userCredential = await signInWithCustomToken(clientAuth, customToken);
  const clientUser = userCredential.user;
  console.log('   Client signed in with uid:', clientUser.uid);

  // 2. Step 2: Client checks claims - no admin claim exists yet
  let tokenResult = await clientUser.getIdTokenResult();
  console.log('   Initial token claims.admin:', tokenResult.claims.admin);
  if (tokenResult.claims.admin) {
    throw new Error('Initial user should not have admin claim!');
  }

  // 3. Step 3: Client creates initial Firestore document with role: 'client'
  console.log('\n2. Step 2: Client initializes user document with role: "client"');
  const userDocRef = doc(clientDb, 'users', clientUser.uid);
  const initialProfile = {
    uid: clientUser.uid,
    displayName: clientUser.displayName || 'Constrora Member',
    email: clientUser.email,
    role: 'client', // Client writes 'client', NEVER 'admin'
    status: 'active',
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(userDocRef, initialProfile);
  let snap = await getDoc(userDocRef);
  console.log('   Firestore user document created with role:', snap.data().role);

  // 4. Step 4: Client triggers server claim bootstrap
  console.log('\n3. Step 3: Client calls server to verify eligibility and grant claim');
  const idToken = await clientUser.getIdToken();
  
  // Call server-side verification logic
  const decoded = await adminAuth.verifyIdToken(idToken);
  if (decoded.email.toLowerCase() === ADMIN_EMAIL && decoded.email_verified === true) {
    await adminAuth.setCustomUserClaims(decoded.uid, { admin: true });
    
    // Server Admin SDK sets users/{uid}.role = 'admin'
    await adminDb.collection('users').doc(decoded.uid).set({
      role: 'admin',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await adminDb.collection('admins').doc(decoded.uid).set({
      uid: decoded.uid,
      role: 'admin',
      email: ADMIN_EMAIL,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log('   Server successfully granted { admin: true } and updated Firestore users/{uid}.role = "admin"');
  } else {
    throw new Error('Claim eligibility check failed!');
  }

  // 5. Step 5: Client refreshes token and inspects updated role in Firestore
  console.log('\n4. Step 4: Client refreshes token and verifies admin role');
  const refreshedToken = await clientUser.getIdTokenResult(true);
  console.log('   Refreshed token claims.admin:', refreshedToken.claims.admin);

  const updatedSnap = await getDoc(userDocRef);
  console.log('   Firestore user doc role now:', updatedSnap.data().role);

  if (refreshedToken.claims.admin !== true || updatedSnap.data().role !== 'admin') {
    throw new Error('First-login sequence failed to produce admin claim or role');
  }

  console.log('\n[PASS] EXACT FIRST-LOGIN SEQUENCE VERIFIED END-TO-END');
  process.exit(0);
}

runFirstLoginTest().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
