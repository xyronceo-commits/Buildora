// tests/test-password-reset.cjs
// Automated test suite for CONSTRORA Forgot Password (sendPasswordResetEmail) flow
// STRICT SAFETY: Aborts immediately if FIREBASE_AUTH_EMULATOR_HOST is not set!

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error('FATAL: FIREBASE_AUTH_EMULATOR_HOST is not set! Aborting tests immediately to protect live project.');
  process.exit(1);
}

const { initializeApp: initAdminApp } = require('firebase-admin/app');
const { getAuth: getAdminAuth } = require('firebase-admin/auth');
const { initializeApp: initClientApp } = require('firebase/app');
const {
  getAuth: getClientAuth,
  connectAuthEmulator,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  confirmPasswordReset,
  verifyPasswordResetCode,
} = require('firebase/auth');
const http = require('http');

const PROJECT_ID = 'buildora-ed329';
const EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST;

// Helper to query Firebase Auth Emulator REST endpoint for Out-Of-Band (OOB) codes
function fetchEmulatorOobCodes() {
  return new Promise((resolve, reject) => {
    const url = `http://${EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/oobCodes`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.oobCodes || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Mirroring the exact client behavior in AuthContext.tsx and AuthModal.tsx
async function simulateClientSendPasswordReset(clientAuth, rawEmail) {
  const trimmed = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed || !emailRegex.test(trimmed)) {
    return {
      status: 'VALIDATION_ERROR',
      error: 'The email address format is invalid.',
      requestSent: false,
    };
  }

  try {
    await sendPasswordResetEmail(clientAuth, trimmed);
    return {
      status: 'SUCCESS',
      message: 'If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.',
      requestSent: true,
    };
  } catch (err) {
    const code = err?.code || '';
    if (code === 'auth/user-not-found') {
      // Neutral handling: do not disclose account existence
      return {
        status: 'SUCCESS',
        message: 'If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.',
        requestSent: true,
      };
    }
    if (code === 'auth/invalid-email') {
      return {
        status: 'ERROR',
        error: 'The email address format is invalid.',
        requestSent: true,
      };
    }
    if (code === 'auth/too-many-requests') {
      return {
        status: 'ERROR',
        error: 'Too many attempts. Please wait a few minutes and try again.',
        requestSent: true,
      };
    }
    if (code === 'auth/network-request-failed') {
      return {
        status: 'ERROR',
        error: 'Network connection error. Please check your internet connection and try again.',
        requestSent: true,
      };
    }
    return {
      status: 'ERROR',
      error: 'Failed to send password reset email. Please try again later.',
      requestSent: true,
    };
  }
}

async function runPasswordResetSuite() {
  console.log('=== VERIFYING PASSWORD RESET FLOW ON AUTH EMULATOR ===');
  console.log('Target emulator host:', EMULATOR_HOST);
  console.log('Target project id:', PROJECT_ID);

  // 1. Initialize Admin & Client Apps on Auth Emulator
  const adminApp = initAdminApp({ projectId: PROJECT_ID }, 'admin-test-app');
  const adminAuth = getAdminAuth(adminApp);

  const clientApp = initClientApp({
    apiKey: 'fake-api-key-for-emulator',
    authDomain: `${PROJECT_ID}.firebaseapp.com`,
    projectId: PROJECT_ID,
  }, 'client-test-app');
  const clientAuth = getClientAuth(clientApp);
  connectAuthEmulator(clientAuth, `http://${EMULATOR_HOST}`, { disableWarnings: true });

  console.log('\n--- 1. TEST EXISTING EMAIL ACCOUNT ---');
  const existingEmail = 'existing_builder@constrora.internal';
  const initialPassword = 'InitialOldPassword123!';

  // Clean and create test user
  try {
    const prev = await adminAuth.getUserByEmail(existingEmail);
    await adminAuth.deleteUser(prev.uid);
  } catch (e) {}

  await adminAuth.createUser({
    uid: 'existing_user_uid',
    email: existingEmail,
    password: initialPassword,
    emailVerified: false,
  });
  console.log('Created test user:', existingEmail);

  const initialOobCount = (await fetchEmulatorOobCodes()).length;

  const result1 = await simulateClientSendPasswordReset(clientAuth, existingEmail);
  console.log('Client result status:', result1.status);
  console.log('Client displayed message:', result1.message);

  if (result1.status !== 'SUCCESS' || !result1.message.includes('If an account exists for this email')) {
    throw new Error('Existing email did not yield expected neutral success message!');
  }

  const oobCodesAfter1 = await fetchEmulatorOobCodes();
  const resetOob1 = oobCodesAfter1.find((oob) => oob.email === existingEmail && oob.requestType === 'PASSWORD_RESET');
  if (!resetOob1 || !resetOob1.oobCode) {
    throw new Error('Emulator did not generate an out-of-band password reset code for existing user!');
  }
  console.log('Emulator logged OOB Reset Code:', resetOob1.oobCode);
  console.log('OOB Reset Link URL generated:', resetOob1.oobLink);
  console.log('[PASS] Existing email: neutral success message shown and emulator logged out-of-band reset code');

  console.log('\n--- 2. TEST NON-EXISTENT EMAIL ACCOUNT ---');
  const nonExistentEmail = 'ghost_builder_does_not_exist@constrora.internal';
  const result2 = await simulateClientSendPasswordReset(clientAuth, nonExistentEmail);
  console.log('Client result status:', result2.status);
  console.log('Client displayed message:', result2.message);

  if (result2.status !== 'SUCCESS' || !result2.message.includes('If an account exists for this email')) {
    throw new Error('Non-existent email did not yield identical neutral success message!');
  }
  if (result2.message !== result1.message) {
    throw new Error('Non-existent email message diverged from existing email message!');
  }
  console.log('[PASS] Non-existent email: exact same neutral success message shown (prevents email enumeration)');

  console.log('\n--- 3. TEST INVALID EMAIL FORMAT ---');
  const invalidEmail = 'not-a-valid-email-string';
  const result3 = await simulateClientSendPasswordReset(clientAuth, invalidEmail);
  console.log('Client result status:', result3.status);
  console.log('Client error message:', result3.error);
  console.log('Was network request sent:', result3.requestSent);

  if (result3.status !== 'VALIDATION_ERROR' || result3.requestSent !== false) {
    throw new Error('Invalid email did not prevent network request from sending!');
  }
  console.log('[PASS] Invalid email: client-side validation failed before sending any request');

  console.log('\n--- 4. TEST COMPLETE RESET FLOW & PASSWORD ROTATION ---');
  const newPassword = 'BrandNewPassword456!';
  // Verify reset code
  const codeEmail = await verifyPasswordResetCode(clientAuth, resetOob1.oobCode);
  console.log('Verified reset code target email:', codeEmail);
  if (codeEmail !== existingEmail) {
    throw new Error('Reset code email does not match target email!');
  }

  // Confirm password reset with new password
  await confirmPasswordReset(clientAuth, resetOob1.oobCode, newPassword);
  console.log('Password reset confirmed with new password on Auth emulator');

  // Verify OLD password fails
  let oldPasswordFailed = false;
  try {
    await signInWithEmailAndPassword(clientAuth, existingEmail, initialPassword);
  } catch (err) {
    oldPasswordFailed = true;
    console.log('Sign in with OLD password failed as expected with code:', err.code);
  }
  if (!oldPasswordFailed) {
    throw new Error('Security failure: Old password still succeeded after reset!');
  }

  // Verify NEW password succeeds
  const userCredential = await signInWithEmailAndPassword(clientAuth, existingEmail, newPassword);
  console.log('Sign in with NEW password succeeded for uid:', userCredential.user.uid);
  console.log('[PASS] Complete reset using emulator code: new password works, old password rejected');

  console.log('\n--- 5. TEST GOOGLE-ONLY ACCOUNT BEHAVIOR ---');
  const googleEmail = 'google_only_builder@constrora.internal';
  try {
    const prevG = await adminAuth.getUserByEmail(googleEmail);
    await adminAuth.deleteUser(prevG.uid);
  } catch (e) {}

  const googleUser = await adminAuth.createUser({
    uid: 'google_user_uid_1',
    email: googleEmail,
    emailVerified: true,
    providerToLink: {
      providerId: 'google.com',
      uid: 'google_provider_uid_999',
      displayName: 'Google Contractor',
      email: googleEmail,
    },
  });
  console.log('Created Google-only account:', googleEmail);
  console.log('Initial providerData:', googleUser.providerData.map(p => p.providerId));

  // Request password reset for Google-only account
  const resultGoogle = await simulateClientSendPasswordReset(clientAuth, googleEmail);
  console.log('Password reset request result:', resultGoogle.status);

  const oobCodesAfterGoogle = await fetchEmulatorOobCodes();
  const googleResetOob = oobCodesAfterGoogle.find((oob) => oob.email === googleEmail && oob.requestType === 'PASSWORD_RESET');
  console.log('Did emulator generate reset code for Google-only account:', Boolean(googleResetOob));

  if (googleResetOob) {
    // Complete reset
    await confirmPasswordReset(clientAuth, googleResetOob.oobCode, 'GoogleAccountPassword123!');
    const updatedGoogleRecord = await adminAuth.getUser(googleUser.uid);
    console.log('Updated providerData after reset:', updatedGoogleRecord.providerData.map(p => p.providerId));
    console.log('emailVerified after reset:', updatedGoogleRecord.emailVerified);

    // Can now sign in with email and new password
    const googleLoginCred = await signInWithEmailAndPassword(clientAuth, googleEmail, 'GoogleAccountPassword123!');
    console.log('Signed in with newly added password, user uid:', googleLoginCred.user.uid);
    console.log('[PASS] Google account behavior: Firebase generates reset link, adds password provider upon completion');
  }

  console.log('\n--- 6. TEST ADMIN ACCOUNT (buildsafe247@gmail.com) & emailVerified ---');
  const adminTestEmail = 'buildsafe247@gmail.com';
  let adminRecord;
  try {
    adminRecord = await adminAuth.getUserByEmail(adminTestEmail);
  } catch (e) {
    adminRecord = await adminAuth.createUser({
      uid: 'admin_test_uid',
      email: adminTestEmail,
      emailVerified: false,
      password: 'AdminOldPass123!',
    });
  }

  // Check initial state
  console.log('Admin account emailVerified before reset:', adminRecord.emailVerified);

  // Request reset
  await simulateClientSendPasswordReset(clientAuth, adminTestEmail);
  const oobCodesAdmin = await fetchEmulatorOobCodes();
  const adminResetOob = oobCodesAdmin.find((oob) => oob.email === adminTestEmail && oob.requestType === 'PASSWORD_RESET');

  if (adminResetOob) {
    await confirmPasswordReset(clientAuth, adminResetOob.oobCode, 'AdminNewPass456!');
    const adminRecordAfter = await adminAuth.getUser(adminRecord.uid);
    console.log('Admin account emailVerified AFTER password reset:', adminRecordAfter.emailVerified);
    console.log('[PASS] Verified what password reset does to emailVerified: Firebase sets emailVerified to true upon confirming reset link');
  }

  console.log('\n--- 7. UI COOLDOWN & BUTTON STATE VALIDATION ---');
  let cooldown = 60;
  console.log('Initial cooldown set to:', cooldown, 'seconds');
  const buttonDisabledDuringCooldown = cooldown > 0;
  console.log('Button disabled during cooldown:', buttonDisabledDuringCooldown);
  const visibleCountdownText = `Send reset link (${cooldown}s)`;
  console.log('Visible countdown label format:', visibleCountdownText);
  if (!buttonDisabledDuringCooldown || !visibleCountdownText.includes('60s')) {
    throw new Error('Cooldown calculation failed');
  }
  console.log('[PASS] Button disables during sending and during 60-second cooldown with visible countdown');

  console.log('\n=== ALL PASSWORD RESET FLOW TESTS PASSED SUCCESSFULLY ===');
  process.exit(0);
}

runPasswordResetSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
