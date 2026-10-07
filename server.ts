import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json';

// Explicit project ID and database ID via environment variables with defaults
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || 'buildora-ed329';
export const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || 'ai-studio-buildora-e6d60954-84ab-4902-b369-54ba7da18316';

// Initialize Firebase Admin SDK safely with production Cloud Run fail-fast guard
if (!getApps().length) {
  try {
    initializeApp({
      projectId: FIREBASE_PROJECT_ID,
    });
  } catch (err: any) {
    const isCloudRunProd = process.env.NODE_ENV === 'production' && Boolean(process.env.K_SERVICE);
    if (isCloudRunProd) {
      console.error('[Firebase Admin Fatal]: Initialization failed in production Cloud Run:', err?.message);
      process.exit(1);
    } else {
      console.warn('[Firebase Admin Warning]: Initialization failed in preview/dev, serving app with fallback:', err?.message);
    }
  }
}

// Access Firestore via Admin SDK targeting explicit database ID
export const getDbAdmin = () => {
  if (FIRESTORE_DATABASE_ID && FIRESTORE_DATABASE_ID !== '(default)') {
    return getFirestore(FIRESTORE_DATABASE_ID);
  }
  return getFirestore();
};

const TARGET_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'buildsafe247@gmail.com').toLowerCase();

/**
 * Server-Side Admin Claim Bootstrap Function
 * Verifies email from decoded token and email_verified === true
 */
export async function grantAdminClaimIfEligible(tokenString: string): Promise<{ success: boolean; status: number; message: string; admin?: boolean }> {
  try {
    const authAdmin = getAuth();
    let decoded: DecodedIdToken;
    try {
      decoded = await authAdmin.verifyIdToken(tokenString);
    } catch {
      return { success: false, status: 401, message: 'Invalid or expired authentication token' };
    }

    if (
      decoded.email?.toLowerCase() === TARGET_ADMIN_EMAIL &&
      decoded.email_verified === true
    ) {
      await authAdmin.setCustomUserClaims(decoded.uid, { admin: true });

      const dbAdmin = getDbAdmin();
      const now = new Date().toISOString();

      await dbAdmin.collection('admins').doc(decoded.uid).set(
        {
          uid: decoded.uid,
          role: 'admin',
          email: TARGET_ADMIN_EMAIL,
          updatedAt: now,
        },
        { merge: true }
      );

      await dbAdmin.collection('users').doc(decoded.uid).set(
        {
          uid: decoded.uid,
          email: TARGET_ADMIN_EMAIL,
          role: 'admin',
          emailVerified: true,
          updatedAt: now,
        },
        { merge: true }
      );

      console.log('[Admin Authorization] Granted { admin: true } claim to designated administrator');
      return { success: true, status: 200, message: 'Admin claim granted successfully', admin: true };
    }

    return { success: false, status: 403, message: 'Account is not eligible for administrator authorization' };
  } catch (err: any) {
    console.warn('[Admin Claim Verification Error]:', err?.message);
    return { success: false, status: 500, message: 'Internal claim verification error' };
  }
}

/**
 * Extended Express Request with decoded admin token
 */
export interface AdminRequest extends Request {
  adminUser?: DecodedIdToken;
}

/**
 * Reusable Middleware: requireAdmin
 * 1. No token -> 401
 * 2. Invalid token -> 401
 * 3. decoded.admin !== true -> 403
 * 4. decoded.email !== ADMIN_EMAIL or email_verified !== true -> 403
 * 5. Otherwise authorized.
 */
export const requireAdmin = async (req: AdminRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No authorization token provided' });
    return;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Empty token' });
    return;
  }

  try {
    const authAdmin = getAuth();
    const decoded = await authAdmin.verifyIdToken(token, true);

    if (decoded.admin !== true) {
      res.status(403).json({ error: 'Forbidden: Insufficient administrative privileges' });
      return;
    }

    if (
      decoded.email?.toLowerCase() !== TARGET_ADMIN_EMAIL ||
      decoded.email_verified !== true
    ) {
      res.status(403).json({ error: 'Forbidden: Unauthorized administrator' });
      return;
    }

    req.adminUser = decoded;
    next();
  } catch (err: any) {
    if (err?.code === 'auth/id-token-revoked') {
      res.status(401).json({ error: 'Unauthorized: Authentication token has been revoked' });
      return;
    }
    if (err?.code === 'auth/user-disabled') {
      res.status(401).json({ error: 'Unauthorized: User account has been disabled' });
      return;
    }
    res.status(401).json({ error: 'Unauthorized: Invalid token verification' });
    return;
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Helmet with disabled CSP to allow styles/popups and correct COOP for Firebase popup auth
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  );

  // Body parser with 10mb limit
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiter applied ONLY to /api routes; never applies to static assets
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });
  app.use('/api', apiLimiter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', adminConfigured: Boolean(TARGET_ADMIN_EMAIL) });
  });

  // 1. Sync endpoint for setting custom claim { admin: true }
  // Only sets claim if token is valid, email === ADMIN_EMAIL, and email_verified === true
  app.post('/api/admin/claim', async (req: Request, res: Response) => {
    // Reject unexpected payload fields
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      res.status(400).json({ error: 'Unexpected body payload: /api/admin/claim does not accept body parameters' });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      res.status(401).json({ success: false, message: 'Token is empty' });
      return;
    }

    const result = await grantAdminClaimIfEligible(token);
    if (!result.success) {
      res.status(result.status || 403).json(result);
      return;
    }
    res.json(result);
  });

  // 2. Protected Admin Dashboard API Routes
  // Overview Statistics (Real database data using count aggregation)
  app.get('/api/admin/stats', requireAdmin, async (_req: AdminRequest, res: Response) => {
    try {
      const dbAdmin = getDbAdmin();

      const [
        totalUsersSnap,
        clientsSnap,
        suppliersSnap,
        adminsSnap,
        businessesSnap,
        pendingSnap,
        verifiedSnap,
        quoteRequestsSnap,
        listingsSnap,
      ] = await Promise.all([
        dbAdmin.collection('users').count().get(),
        dbAdmin.collection('users').where('role', '==', 'client').count().get(),
        dbAdmin.collection('users').where('role', '==', 'supplier').count().get(),
        dbAdmin.collection('users').where('role', '==', 'admin').count().get(),
        dbAdmin.collection('businesses').count().get(),
        dbAdmin.collection('businesses').where('verificationStatus', '==', 'VERIFICATION_PENDING').count().get(),
        dbAdmin.collection('businesses').where('verificationStatus', '==', 'VERIFIED').count().get(),
        dbAdmin.collection('quoteRequests').count().get(),
        dbAdmin.collectionGroup('listings').count().get(),
      ]);

      const totalUsers = totalUsersSnap.data().count;
      const clientCount = clientsSnap.data().count;
      const supplierCount = suppliersSnap.data().count;
      const adminCount = adminsSnap.data().count;
      const totalBusinesses = businessesSnap.data().count;
      let pendingBusinesses = pendingSnap.data().count;
      let verifiedBusinesses = verifiedSnap.data().count;
      const totalListings = listingsSnap.data().count;
      const totalQuoteRequests = quoteRequestsSnap.data().count;

      // Count legacy verified businesses with isVerified === true if verificationStatus was not set to VERIFIED
      try {
        const legacyVerifiedSnap = await dbAdmin.collection('businesses').where('isVerified', '==', true).get();
        const legacyOnlyCount = legacyVerifiedSnap.docs.filter((d) => d.data().verificationStatus !== 'VERIFIED').length;
        verifiedBusinesses += legacyOnlyCount;
      } catch {
        // ignore error
      }

      // Unassigned users = total - clients - suppliers - count(role == 'admin') (Exact math, no -1 hack)
      const unassignedCount = Math.max(0, totalUsers - clientCount - supplierCount - adminCount);

      res.json({
        totalUsers,
        clientCount,
        supplierCount,
        unassignedCount,
        totalBusinesses,
        pendingBusinesses,
        verifiedBusinesses,
        totalListings,
        totalQuoteRequests,
      });
    } catch (err: any) {
      console.error('[Admin Stats API Error]:', err);
      res.status(500).json({ error: 'Failed to retrieve platform statistics' });
    }
  });

  // User Management: List real users
  app.get('/api/admin/users', requireAdmin, async (_req: AdminRequest, res: Response) => {
    try {
      const dbAdmin = getDbAdmin();
      const usersSnap = await dbAdmin.collection('users').get();
      const users = usersSnap.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          email: data.email || '',
          displayName: data.displayName || 'Constrora User',
          role: data.role || 'client',
          emailVerified: Boolean(data.emailVerified),
          status: data.status || 'active',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          phoneNumber: data.phoneNumber || '',
        };
      });

      res.json({ users });
    } catch (err: any) {
      console.error('[Admin Users API Error]:', err);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  });

  // User Management: Update account status
  app.post('/api/admin/users/:userId/status', requireAdmin, async (req: AdminRequest, res: Response) => {
    try {
      const userId = String(req.params.userId);

      const bodyKeys = Object.keys(req.body || {});
      if (bodyKeys.length !== 1 || bodyKeys[0] !== 'status') {
        res.status(400).json({ error: 'Unexpected fields in request body: only "status" is permitted' });
        return;
      }

      const { status } = req.body;
      if (!status || !['active', 'suspended'].includes(status)) {
        res.status(400).json({ error: 'Invalid status value. Must be active or suspended' });
        return;
      }

      // Refuse to change status of admin account (determined by Auth user identity, never Firestore role)
      if (userId === req.adminUser?.uid) {
        res.status(403).json({ error: 'Refused: Cannot modify status of the administrator account' });
        return;
      }

      const authAdmin = getAuth();
      try {
        const targetAuthUser = await authAdmin.getUser(userId);
        if (
          targetAuthUser.email?.toLowerCase() === TARGET_ADMIN_EMAIL ||
          targetAuthUser.customClaims?.admin === true
        ) {
          res.status(403).json({ error: 'Refused: Cannot modify status of the administrator account' });
          return;
        }

        const shouldDisable = status === 'suspended' || status === 'disabled';
        await authAdmin.updateUser(userId, { disabled: shouldDisable });
        if (shouldDisable) {
          await authAdmin.revokeRefreshTokens(userId);
        }
      } catch (authErr: any) {
        if (authErr?.code === 'auth/user-not-found') {
          // User not found in Firebase Auth; allowed to proceed with Firestore update
        } else {
          console.error('[Admin Status Auth Error - Failing Closed]:', authErr?.message);
          res.status(500).json({ error: 'Failed to verify or apply authorization status in Authentication service. Operation aborted to fail closed.' });
          return;
        }
      }

      const dbAdmin = getDbAdmin();
      await dbAdmin.collection('users').doc(userId).set(
        {
          status,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      res.json({ success: true, userId, status });
    } catch (err: any) {
      console.error('[Admin Update User Status Error]:', err);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Supplier & Listings Management: List all listings with business context
  app.get('/api/admin/listings', requireAdmin, async (_req: AdminRequest, res: Response) => {
    try {
      const dbAdmin = getDbAdmin();
      const businessesSnap = await dbAdmin.collection('businesses').get();

      const allListings: any[] = [];

      for (const bDoc of businessesSnap.docs) {
        const bData = bDoc.data();
        const listingsSnap = await bDoc.ref.collection('listings').get();

        listingsSnap.forEach((lDoc) => {
          const lData = lDoc.data();
          allListings.push({
            listingId: lDoc.id,
            businessId: bDoc.id,
            businessName: bData.businessName || 'Unnamed Supplier',
            supplierVerificationStatus: bData.verificationStatus || (bData.isVerified ? 'VERIFIED' : 'LISTED'),
            title: lData.title || 'Untitled Listing',
            category: lData.category || 'General',
            type: lData.type || 'equipment',
            rate: lData.rate || 0,
            rateUnit: lData.rateUnit || 'day',
            status: lData.status || 'AVAILABLE',
            photos: lData.photos || [],
            location: lData.location || bData.location || { city: 'Osogbo', state: 'Osun State' },
            createdAt: lData.createdAt || bData.createdAt || new Date().toISOString(),
          });
        });
      }

      res.json({ listings: allListings });
    } catch (err: any) {
      console.error('[Admin Listings API Error]:', err);
      res.status(500).json({ error: 'Failed to retrieve listings' });
    }
  });

  // Update listing availability or status
  app.post('/api/admin/listings/:businessId/:listingId/status', requireAdmin, async (req: AdminRequest, res: Response) => {
    try {
      const businessId = String(req.params.businessId);
      const listingId = String(req.params.listingId);

      const bodyKeys = Object.keys(req.body || {});
      if (bodyKeys.length !== 1 || bodyKeys[0] !== 'status') {
        res.status(400).json({ error: 'Unexpected fields in request body: only "status" is permitted' });
        return;
      }

      const { status } = req.body;
      const allowedListingStatuses = ['AVAILABLE', 'DISABLED'];
      if (!status || !allowedListingStatuses.includes(status)) {
        res.status(400).json({ error: 'Status is required and must be AVAILABLE or DISABLED' });
        return;
      }

      const dbAdmin = getDbAdmin();
      await dbAdmin
        .collection('businesses')
        .doc(businessId)
        .collection('listings')
        .doc(listingId)
        .set(
          {
            status,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );

      res.json({ success: true, listingId, status });
    } catch (err: any) {
      console.error('[Admin Listing Status Update Error]:', err);
      res.status(500).json({ error: 'Failed to update listing status' });
    }
  });

  // Delete an inappropriate listing
  app.delete('/api/admin/listings/:businessId/:listingId', requireAdmin, async (req: AdminRequest, res: Response) => {
    try {
      if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        res.status(400).json({ error: 'Unexpected body payload in DELETE request' });
        return;
      }

      const businessId = String(req.params.businessId);
      const listingId = String(req.params.listingId);
      const dbAdmin = getDbAdmin();

      await dbAdmin
        .collection('businesses')
        .doc(businessId)
        .collection('listings')
        .doc(listingId)
        .delete();

      res.json({ success: true, message: 'Listing removed successfully' });
    } catch (err: any) {
      console.error('[Admin Listing Delete Error]:', err);
      res.status(500).json({ error: 'Failed to delete listing' });
    }
  });

  // Business verification action
  app.post('/api/admin/businesses/:businessId/verify', requireAdmin, async (req: AdminRequest, res: Response) => {
    try {
      const businessId = String(req.params.businessId);

      const bodyKeys = Object.keys(req.body || {});
      if (bodyKeys.length !== 1 || bodyKeys[0] !== 'status') {
        res.status(400).json({ error: 'Unexpected fields in request body: only "status" is permitted' });
        return;
      }

      const { status } = req.body;
      if (!status || !['VERIFIED', 'REJECTED'].includes(status)) {
        res.status(400).json({ error: 'Invalid verification status. Must be VERIFIED or REJECTED' });
        return;
      }

      const dbAdmin = getDbAdmin();
      await dbAdmin.collection('businesses').doc(businessId).set(
        {
          verificationStatus: status,
          isVerified: status === 'VERIFIED',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      res.json({ success: true, businessId, status });
    } catch (err: any) {
      console.error('[Admin Business Verify Error]:', err);
      res.status(500).json({ error: 'Failed to update business verification status' });
    }
  });

  // Catch-all 404 for unmatched /api routes - MUST return JSON 404, never index.html
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
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
    app.use(express.static(distPath, { index: false }));
    app.get(/.*/, (_req, res) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CONSTRORA Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
