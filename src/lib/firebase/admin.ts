/**
 * Firebase Admin SDK Initialization
 *
 * This module initializes and exports Firebase Admin SDK instances
 * using the singleton pattern to prevent multiple initializations.
 */

import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

// Singleton instance
let adminApp: App | null = null;

/**
 * Initialize Firebase Admin SDK with service account credentials
 * Uses singleton pattern to prevent multiple initializations
 */
export function initializeFirebaseAdmin(): App {
  // Return existing instance if already initialized
  if (adminApp) {
    return adminApp;
  }

  try {
    // Check if Firebase Admin is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      console.log('✅ Firebase Admin SDK already initialized');
      return adminApp;
    }

    // In development, try to use service account file first
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath && process.env.NODE_ENV !== 'production') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const path = require('path');

        // Resolve the path relative to project root
        const absolutePath = path.resolve(process.cwd(), serviceAccountPath);
        const serviceAccountJson = fs.readFileSync(absolutePath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountJson);

        adminApp = initializeApp({
          credential: cert(serviceAccount),
          storageBucket:
            process.env.FIREBASE_STORAGE_BUCKET ||
            `${serviceAccount.project_id}.appspot.com`,
        });

        console.log(
          '✅ Firebase Admin SDK initialized successfully (using service account file)'
        );
        console.log(`   Project ID: ${serviceAccount.project_id}`);
        console.log(`   File: ${absolutePath}`);
        return adminApp;
      } catch (fileError) {
        console.warn(
          '⚠️ Could not load service account file, falling back to environment variables'
        );
        console.warn(
          `   Error: ${fileError instanceof Error ? fileError.message : String(fileError)}`
        );
      }
    }

    // Fallback to environment variables (for production or if file not found)
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKey) {
      // Debug logs for production (masking sensitive values)
      console.error('[Firebase Admin] Credential Check Failed:');
      console.error(`- FIREBASE_PROJECT_ID: ${projectId ? 'Set' : 'MISSING'}`);
      console.error(
        `- FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'Set' : 'MISSING'}`
      );
      console.error(`- FIREBASE_PRIVATE_KEY: ${privateKey ? 'Set' : 'MISSING'}`);

      throw new Error(
        'Missing required Firebase Admin SDK credentials. ' +
          'Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set, ' +
          'or set FIREBASE_SERVICE_ACCOUNT_PATH to point to your service account JSON file.'
      );
    }

    // Initialize Firebase Admin with environment variables
    let formattedPrivateKey = privateKey;

    // Handle Base64 encoded private key (robust for environment variables)
    // If it doesn't look like a clear text PEM key, try to decode it
    if (!formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        try {
            const decoded = Buffer.from(formattedPrivateKey, 'base64').toString('utf8');
            if (decoded.includes('-----BEGIN PRIVATE KEY-----')) {
                formattedPrivateKey = decoded;
            }
        } catch (e) {
            // Not base64 or decode failed, continue with original value
        }
    }

    try {
      // Try to parse as JSON string first (common in some env setups)
      if (
        formattedPrivateKey.startsWith('"') ||
        formattedPrivateKey.startsWith("'")
      ) {
        formattedPrivateKey = JSON.parse(formattedPrivateKey);
      }
    } catch {
      // If JSON parse fails, just continue with raw string cleanup
    }

    // Replace escaped newlines with real newlines
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');

    // Ensure headers are correct if they were messed up
    if (!formattedPrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // If it looks like a key content but missing headers, might need to add them
      // But usually the issue is just formatting.
      // Let's rely on the replace above for now, as adding headers blindly is risky.
    }

    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
      }),
      storageBucket: storageBucket || `${projectId}.appspot.com`,
    });

    console.log(
      '✅ Firebase Admin SDK initialized successfully (using environment variables)'
    );
    return adminApp;
  } catch (error) {
    // If we are in build time and vars are missing, don't crash the whole process
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn(
        '⚠️ Skipping Firebase Admin initialization during build phase (missing credentials)'
      );
      return null as any;
    }
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Get Firebase Admin Auth instance
 * Initializes Firebase Admin if not already initialized
 */
export function getAdminAuth(): Auth {
  initializeFirebaseAdmin();
  return getAuth();
}

/**
 * Get Firebase Admin Firestore instance
 * Initializes Firebase Admin if not already initialized
 */
export function getAdminFirestore(): Firestore {
  initializeFirebaseAdmin();
  return getFirestore();
}

/**
 * Get Firebase Admin Storage instance
 * Initializes Firebase Admin if not already initialized
 */
export function getAdminStorage(): Storage {
  initializeFirebaseAdmin();
  return getStorage();
}

/**
 * Check if Firebase Admin SDK is properly initialized
 */
export function isFirebaseAdminInitialized(): boolean {
  return adminApp !== null || getApps().length > 0;
}
