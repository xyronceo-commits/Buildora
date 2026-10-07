const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('[SECURITY GUARD ERROR]: FIRESTORE_EMULATOR_HOST must be set. Aborting to prevent live database operations.');
  process.exit(1);
}

const PROJECT_ID = 'buildora-ed329';
const rules = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf8');

async function run() {
  console.log('=== INITIALIZING FIRESTORE RULES TEST ENVIRONMENT ===');
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: rules,
    }
  });

  const unauthenticatedContext = testEnv.unauthenticatedContext();
  const clientContext = testEnv.authenticatedContext('client_123', {
    email: 'client@constrora.test',
    email_verified: true
  });
  const otherClientContext = testEnv.authenticatedContext('client_456', {
    email: 'other_client@constrora.test',
    email_verified: true
  });
  const supplierContext = testEnv.authenticatedContext('supplier_123', {
    email: 'supplier@constrora.test',
    email_verified: true
  });
  const otherSupplierContext = testEnv.authenticatedContext('supplier_456', {
    email: 'other_supplier@constrora.test',
    email_verified: true
  });
  const adminContext = testEnv.authenticatedContext('admin_uid_789', {
    email: 'buildsafe247@gmail.com',
    email_verified: true,
    admin: true
  });

  console.log('\n--- SETUP SEED DATA ---');
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    await adminDb.collection('users').doc('client_123').set({
      uid: 'client_123',
      email: 'client@constrora.test',
      role: 'client',
      status: 'active',
      displayName: 'Normal Client'
    });
    await adminDb.collection('users').doc('client_456').set({
      uid: 'client_456',
      email: 'other_client@constrora.test',
      role: 'client',
      status: 'active',
      displayName: 'Other Client'
    });
    await adminDb.collection('businesses').doc('biz_supplier_1').set({
      businessId: 'biz_supplier_1',
      ownerId: 'supplier_123',
      businessName: 'Supplier One Depot',
      verificationStatus: 'LISTED'
    });
    await adminDb.collection('businesses').doc('biz_supplier_2').set({
      businessId: 'biz_supplier_2',
      ownerId: 'supplier_456',
      businessName: 'Supplier Two Depot',
      verificationStatus: 'LISTED'
    });
    await adminDb.collection('businesses').doc('biz_supplier_2').collection('listings').doc('listing_2').set({
      listingId: 'listing_2',
      businessId: 'biz_supplier_2',
      title: 'Excavator 30T',
      status: 'AVAILABLE'
    });
    await adminDb.collection('quoteRequests').doc('quote_456').set({
      id: 'quote_456',
      userId: 'client_456',
      supplierOwnerId: 'supplier_456',
      title: 'Cement Supply'
    });
  });

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
    } catch (err) {
      console.log(`[FAIL] ${name}: ${err.message}`);
    }
  }

  console.log('\n--- 1. ANONYMOUS ACCESS TESTS ---');
  await test('Anonymous: read other users doc is DENIED', async () => {
    const db = unauthenticatedContext.firestore();
    await assertFails(db.collection('users').doc('client_123').get());
  });

  await test('Anonymous: read public businesses collection is ALLOWED', async () => {
    const db = unauthenticatedContext.firestore();
    await assertSucceeds(db.collection('businesses').doc('biz_supplier_1').get());
  });

  console.log('\n--- 2. CLIENT ACCESS & ROLE INTEGRITY TESTS ---');
  await test('Client: read own user doc is ALLOWED', async () => {
    const db = clientContext.firestore();
    await assertSucceeds(db.collection('users').doc('client_123').get());
  });

  await test('Client: read other users doc is DENIED', async () => {
    const db = clientContext.firestore();
    await assertFails(db.collection('users').doc('client_456').get());
  });

  await test('Client: update own displayName is ALLOWED', async () => {
    const db = clientContext.firestore();
    await assertSucceeds(db.collection('users').doc('client_123').update({
      displayName: 'Updated Name'
    }));
  });

  await test('Client: update own role is DENIED', async () => {
    const db = clientContext.firestore();
    await assertFails(db.collection('users').doc('client_123').update({
      role: 'admin'
    }));
  });

  await test('Client: update own status is DENIED', async () => {
    const db = clientContext.firestore();
    await assertFails(db.collection('users').doc('client_123').update({
      status: 'suspended'
    }));
  });

  await test('Client: update own admin/isAdmin field is DENIED', async () => {
    const db = clientContext.firestore();
    await assertFails(db.collection('users').doc('client_123').update({
      admin: true
    }));
  });

  await test('Client: update own emailVerified field is DENIED', async () => {
    const db = clientContext.firestore();
    await assertFails(db.collection('users').doc('client_123').update({
      emailVerified: true
    }));
  });

  await test('Client: CREATE new user doc with role admin is DENIED', async () => {
    const freshClient = testEnv.authenticatedContext('fresh_user_1', { email: 'fresh1@test.com' });
    const db = freshClient.firestore();
    await assertFails(db.collection('users').doc('fresh_user_1').set({
      uid: 'fresh_user_1',
      role: 'admin',
      status: 'active'
    }));
  });

  await test('Client: CREATE new user doc with status suspended is DENIED', async () => {
    const freshClient = testEnv.authenticatedContext('fresh_user_2', { email: 'fresh2@test.com' });
    const db = freshClient.firestore();
    await assertFails(db.collection('users').doc('fresh_user_2').set({
      uid: 'fresh_user_2',
      role: 'client',
      status: 'suspended'
    }));
  });

  await test('Client: CREATE new user doc with role client and status active is ALLOWED', async () => {
    const freshClient = testEnv.authenticatedContext('fresh_user_3', { email: 'fresh3@test.com' });
    const db = freshClient.firestore();
    await assertSucceeds(db.collection('users').doc('fresh_user_3').set({
      uid: 'fresh_user_3',
      role: 'client',
      status: 'active'
    }));
  });

  console.log('\n--- 3. SUPPLIER PERMISSIONS & ISOLATION TESTS ---');
  await test('Supplier: create listing under own business is ALLOWED', async () => {
    const db = supplierContext.firestore();
    await assertSucceeds(db.collection('businesses').doc('biz_supplier_1').collection('listings').doc('listing_1').set({
      listingId: 'listing_1',
      businessId: 'biz_supplier_1',
      title: 'Scaffolding 50m',
      status: 'AVAILABLE'
    }));
  });

  await test('Supplier: edit or delete ANOTHER suppliers listing is DENIED', async () => {
    const db = supplierContext.firestore();
    await assertFails(db.collection('businesses').doc('biz_supplier_2').collection('listings').doc('listing_2').update({
      title: 'Hacked Title'
    }));
    await assertFails(db.collection('businesses').doc('biz_supplier_2').collection('listings').doc('listing_2').delete());
  });

  await test('Supplier: update own business verificationStatus is DENIED', async () => {
    const db = supplierContext.firestore();
    await assertFails(db.collection('businesses').doc('biz_supplier_1').update({
      verificationStatus: 'VERIFIED'
    }));
  });

  console.log('\n--- 4. QUOTE REQUESTS ACCESS CONTROL ---');
  await test('Client: read quoteRequests belonging to someone else is DENIED', async () => {
    const db = clientContext.firestore();
    await assertFails(db.collection('quoteRequests').doc('quote_456').get());
  });

  await test('Client: read own quoteRequest is ALLOWED', async () => {
    const db = otherClientContext.firestore();
    await assertSucceeds(db.collection('quoteRequests').doc('quote_456').get());
  });

  console.log('\n--- 5. DESIGNATED ADMIN PERMISSIONS ---');
  await test('Admin: read any user doc is ALLOWED', async () => {
    const db = adminContext.firestore();
    await assertSucceeds(db.collection('users').doc('client_123').get());
    await assertSucceeds(db.collection('users').doc('client_456').get());
  });

  await test('Admin: read any quoteRequest is ALLOWED', async () => {
    const db = adminContext.firestore();
    await assertSucceeds(db.collection('quoteRequests').doc('quote_456').get());
  });

  await test('Admin: edit any listing is ALLOWED', async () => {
    const db = adminContext.firestore();
    await assertSucceeds(db.collection('businesses').doc('biz_supplier_2').collection('listings').doc('listing_2').update({
      status: 'UNAVAILABLE'
    }));
  });

  await test('Admin: update business verificationStatus is ALLOWED', async () => {
    const db = adminContext.firestore();
    await assertSucceeds(db.collection('businesses').doc('biz_supplier_1').update({
      verificationStatus: 'VERIFIED',
      isVerified: true
    }));
  });

  await test('Admin: read and write admins collection is ALLOWED', async () => {
    const db = adminContext.firestore();
    await assertSucceeds(db.collection('admins').doc('admin_uid_789').set({
      role: 'admin',
      email: 'buildsafe247@gmail.com'
    }));
  });

  await testEnv.cleanup();
  console.log('\n=== ALL FIRESTORE RULES TESTS COMPLETED ===');
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
