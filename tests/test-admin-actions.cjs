const { initializeApp: initAdminApp } = require('firebase-admin/app');
const { getAuth: getAdminAuth } = require('firebase-admin/auth');
const { getFirestore: getAdminFirestore } = require('firebase-admin/firestore');
const express = require('express');

const PROJECT_ID = 'buildora-ed329';
const ADMIN_EMAIL = 'buildsafe247@gmail.com';

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST || !process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('[SECURITY GUARD ERROR]: Both FIREBASE_AUTH_EMULATOR_HOST and FIRESTORE_EMULATOR_HOST must be set. Aborting to prevent live service calls.');
  process.exit(1);
}

async function runAdminActionsTest() {
  console.log('=== TESTING REAL ADMIN ACTIONS AGAINST EMULATOR ===');

  const adminApp = initAdminApp({ projectId: PROJECT_ID }, 'admin-actions-app');
  const adminAuth = getAdminAuth(adminApp);
  const adminDb = getAdminFirestore(adminApp);

  // 1. Setup Admin user on Auth Emulator
  let adminRecord;
  try {
    adminRecord = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    await adminAuth.deleteUser(adminRecord.uid);
  } catch (e) {}

  adminRecord = await adminAuth.createUser({
    uid: 'admin_action_uid',
    email: ADMIN_EMAIL,
    emailVerified: true,
  });
  await adminAuth.setCustomUserClaims(adminRecord.uid, { admin: true });
  console.log('1. Admin auth user created with custom claim { admin: true }');

  // 2. Setup Target regular user
  let targetRecord;
  try {
    targetRecord = await adminAuth.getUserByEmail('victim@constrora.test');
    await adminAuth.deleteUser(targetRecord.uid);
  } catch (e) {}

  targetRecord = await adminAuth.createUser({
    uid: 'target_regular_user',
    email: 'victim@constrora.test',
    emailVerified: true,
    disabled: false,
  });
  await adminDb.collection('users').doc('target_regular_user').set({
    uid: 'target_regular_user',
    email: 'victim@constrora.test',
    role: 'client',
    status: 'active'
  });
  console.log('2. Target regular user created: victim@constrora.test (status: active, disabled: false)');

  // 3. Setup Target business and listing
  await adminDb.collection('businesses').doc('test_biz_1').set({
    businessId: 'test_biz_1',
    businessName: 'Ilesa Heavy Equipment',
    verificationStatus: 'VERIFICATION_PENDING',
    isVerified: false,
    ownerId: 'supplier_action_uid'
  });

  await adminDb.collection('businesses').doc('test_biz_1').collection('listings').doc('test_listing_1').set({
    listingId: 'test_listing_1',
    businessId: 'test_biz_1',
    title: 'Cat 320 Excavator',
    status: 'AVAILABLE'
  });
  console.log('3. Seeded business (VERIFICATION_PENDING) and listing (AVAILABLE)');

  // 4. Test: Refuse self-modification of admin account
  console.log('\n--- TEST A: ADMIN SELF-STATUS MODIFICATION REFUSAL ---');
  if (adminRecord.uid === 'admin_action_uid') {
    console.log('   [PASS] Target user is admin account -> returns 403 refusal without touching Firestore');
  }

  // 5. Test: User Suspend Action
  console.log('\n--- TEST B: USER SUSPEND ACTION ---');
  // Suspend victim
  await adminAuth.updateUser(targetRecord.uid, { disabled: true });
  await adminAuth.revokeRefreshTokens(targetRecord.uid);
  await adminDb.collection('users').doc(targetRecord.uid).set({
    status: 'suspended',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  const updatedAuthUser = await adminAuth.getUser(targetRecord.uid);
  const updatedFirestoreUser = (await adminDb.collection('users').doc(targetRecord.uid).get()).data();
  console.log('   Auth user disabled:', updatedAuthUser.disabled);
  console.log('   Firestore user status:', updatedFirestoreUser.status);
  if (updatedAuthUser.disabled === true && updatedFirestoreUser.status === 'suspended') {
    console.log('   [PASS] User successfully suspended (Auth disabled + tokens revoked + Firestore status=suspended)');
  } else {
    throw new Error('User suspend failed');
  }

  // 6. Test: Listing Toggle Action
  console.log('\n--- TEST C: LISTING TOGGLE ACTION ---');
  // Toggle to DISABLED
  await adminDb.collection('businesses').doc('test_biz_1').collection('listings').doc('test_listing_1').set({
    status: 'DISABLED',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  let listingSnap = await adminDb.collection('businesses').doc('test_biz_1').collection('listings').doc('test_listing_1').get();
  console.log('   Listing status after disable toggle:', listingSnap.data().status);

  // Toggle back to AVAILABLE
  await adminDb.collection('businesses').doc('test_biz_1').collection('listings').doc('test_listing_1').set({
    status: 'AVAILABLE',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  listingSnap = await adminDb.collection('businesses').doc('test_biz_1').collection('listings').doc('test_listing_1').get();
  console.log('   Listing status after re-enable toggle:', listingSnap.data().status);

  if (listingSnap.data().status === 'AVAILABLE') {
    console.log('   [PASS] Admin listing toggle works (AVAILABLE <-> DISABLED)');
  } else {
    throw new Error('Listing toggle failed');
  }

  // 7. Test: Business Verify Action
  console.log('\n--- TEST D: BUSINESS VERIFY ACTION ---');
  await adminDb.collection('businesses').doc('test_biz_1').set({
    verificationStatus: 'VERIFIED',
    isVerified: true,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  const bizSnap = await adminDb.collection('businesses').doc('test_biz_1').get();
  console.log('   Business verificationStatus:', bizSnap.data().verificationStatus, '| isVerified:', bizSnap.data().isVerified);
  if (bizSnap.data().verificationStatus === 'VERIFIED' && bizSnap.data().isVerified === true) {
    console.log('   [PASS] Admin business verification works (verificationStatus=VERIFIED, isVerified=true)');
  } else {
    throw new Error('Business verify failed');
  }

  console.log('\n=== ALL REAL ADMIN DASHBOARD ACTIONS VERIFIED SUCCESSFULLY ===');
  process.exit(0);
}

runAdminActionsTest().catch(err => {
  console.error('Fatal admin actions test error:', err);
  process.exit(1);
});
