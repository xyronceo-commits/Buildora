const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Firebase Authentication user-created Cloud Function trigger.
 * 
 * Runs with Firebase Admin SDK privileges when a new Auth user is created.
 * Normalizes email to lowercase and provisions the admins/{uid} document
 * and sets role: "admin" ONLY for buildsafe247@gmail.com.
 */
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const rawEmail = user.email || '';
  const normalizedEmail = rawEmail.trim().toLowerCase();

  const TARGET_ADMIN_EMAIL = 'buildsafe247@gmail.com';

  if (normalizedEmail === TARGET_ADMIN_EMAIL) {
    const db = admin.firestore();
    const now = new Date().toISOString();

    // 1. Create/update admins/{uid} record
    await db.collection('admins').doc(uid).set({
      role: 'admin',
      email: TARGET_ADMIN_EMAIL,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    // 2. Set role: "admin" in users/{uid}
    await db.collection('users').doc(uid).set({
      uid: uid,
      email: TARGET_ADMIN_EMAIL,
      role: 'admin',
      updatedAt: now,
    }, { merge: true });

    console.log(`[Cloud Function] Successfully bootstrapped admin record for ${TARGET_ADMIN_EMAIL} (${uid})`);
  }
});
