import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth, UserRecord } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase Admin SDK safely
if (!getApps().length) {
  try {
    initializeApp({
      projectId: firebaseConfig.projectId,
    });
  } catch (err) {
    console.warn('[Firebase Admin Init Warning]:', err);
  }
}

// Access Firestore via Admin SDK (bypasses Firestore client security rules)
const getDbAdmin = () => {
  if (firebaseConfig.firestoreDatabaseId) {
    return getFirestore(firebaseConfig.firestoreDatabaseId);
  }
  return getFirestore();
};

const TARGET_ADMIN_EMAIL = 'buildsafe247@gmail.com';

/**
 * Server-Side Admin Bootstrap Migration / Provisioning.
 * Uses Firebase Admin SDK to check if buildsafe247@gmail.com exists in Firebase Auth,
 * and if so, safely creates admins/{uid} and updates users/{uid} with role: "admin".
 */
export async function bootstrapAdminAccount(): Promise<{ success: boolean; message: string; uid?: string }> {
  try {
    const authAdmin = getAuth();
    let userRecord: UserRecord | null = null;
    try {
      userRecord = await authAdmin.getUserByEmail(TARGET_ADMIN_EMAIL);
    } catch (authErr: any) {
      if (authErr?.code === 'auth/user-not-found') {
        return { success: false, message: `Admin account ${TARGET_ADMIN_EMAIL} does not exist in Auth yet.` };
      }
      console.warn('[Admin Lookup Error]:', authErr);
      return { success: false, message: authErr?.message || 'Failed to lookup admin user' };
    }

    if (!userRecord || !userRecord.uid) {
      return { success: false, message: `Admin account ${TARGET_ADMIN_EMAIL} not found.` };
    }

    const uid = userRecord.uid;
    const dbAdmin = getDbAdmin();
    const now = new Date().toISOString();

    // 1. Create/update admins/{uid} document with Admin SDK privileges
    await dbAdmin.collection('admins').doc(uid).set(
      {
        role: 'admin',
        email: TARGET_ADMIN_EMAIL,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    // 2. Set role: "admin" in users/{uid} document
    await dbAdmin.collection('users').doc(uid).set(
      {
        uid,
        email: TARGET_ADMIN_EMAIL,
        role: 'admin',
        updatedAt: now,
      },
      { merge: true }
    );

    console.log(`[Server Admin Bootstrap] Successfully provisioned admin record for ${TARGET_ADMIN_EMAIL} (UID: ${uid})`);
    return { success: true, message: 'Admin account bootstrapped successfully', uid };
  } catch (error: any) {
    console.warn('[Server Admin Bootstrap Error]:', error);
    return { success: false, message: error?.message || 'Server bootstrap failed' };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Run initial server-side admin check on boot
  bootstrapAdminAccount().catch((err) => {
    console.warn('[Startup Admin Bootstrap Warning]:', err);
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Server-side admin bootstrap API endpoint
  app.post('/api/admin/bootstrap', async (_req, res) => {
    const result = await bootstrapAdminAccount();
    res.json(result);
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CONSTRORA Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
