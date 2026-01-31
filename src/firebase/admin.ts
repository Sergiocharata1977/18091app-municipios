// src/firebase/admin.ts
// Firebase Admin SDK configuration
// Modificado para usar inicialización perezosa (lazy) para evitar errores en tiempo de build

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Variable para almacenar la instancia de la app
let adminApp: admin.app.App | undefined;

/**
 * Inicializa o recupera la instancia de Firebase Admin de manera segura.
 * Lanza error solo en tiempo de ejecución si faltan credenciales, no en tiempo de importación/build.
 */
function getFirebaseAdminApp(): admin.app.App {
  // 1. Si ya tenemos la instancia local, retornarla
  if (adminApp) {
    return adminApp;
  }

  // 2. Si ya existe en el SDK global (inicializada por otro módulo), usarla
  if (admin.apps.length > 0 && admin.apps[0]) {
    adminApp = admin.apps[0];
    return adminApp;
  }

  // 3. Intentar inicializar
  try {
    // Intentar cargar desde archivo JSON primero (desarrollo local)
    // Nota: process.cwd() puede fallar en ciertos entornos de edge/build, envolvemos en try/catch si es necesario
    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      // Usar archivo JSON local
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8')
      );

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.project_id}.appspot.com`,
      }, 'admin-instance'); // Damos un nombre único para evitar colisiones con el default

      console.log('[Firebase Admin] Initialized with service-account.json');
    } else {
      // Usar variables de entorno (producción/Vercel)
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      // Checkeo de seguridad para no crashear en build si faltan vars
      // En build time (next build), es posible que estas vars no existan.
      // Si no existen, no inicializamos y dejamos que falle SOLO si alguien intenta USAR la DB.
      if (!projectId || !clientEmail || !privateKey) {
        // Si estamos en fase de build (CI), retornamos algo dummy o lanzamos error controlado
        // Pero para lazy loading, simplemente no asignamos adminApp y lanzamos error
        throw new Error('Missing Firebase Admin environment variables (project_id, client_email, private_key)');
      }

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      }, 'admin-instance');

      console.log('[Firebase Admin] Initialized with environment variables');
    }

    return adminApp;
  } catch (error) {
    // En tiempo de build, es normal que falle si no hay env vars.
    // Logueamos pero no "matamos" el proceso aquí. El error real saltará cuando se intente usar adminDb.
    console.warn('[Firebase Admin] Initialization deferred or failed:', error instanceof Error ? error.message : error);
    throw error;
  }
}

// Helper para crear Proxies
function createLazyProxy<T extends object>(getter: (app: admin.app.App) => T): T {
  return new Proxy({} as T, {
    get: (_target, prop) => {
      try {
        const app = getFirebaseAdminApp();
        const instance = getter(app);
        const value = (instance as any)[prop];
        
        if (typeof value === 'function') {
          return value.bind(instance);
        }
        return value;
      } catch (error) {
        console.error(`[Firebase Admin] Error accessing property '${String(prop)}'. Integration usually fails here if env vars are missing during build/runtime.`);
        throw error;
      }
    }
  });
}

// Exportar instancias LAZY (Proxies)
// Esto permite importar 'adminDb' sin disparar la inicialización ni leer env vars inmediatamente.
export const adminDb = createLazyProxy((app) => app.firestore());
export const adminAuth = createLazyProxy((app) => app.auth());
export const adminStorage = createLazyProxy((app) => app.storage());

// Exportar el objeto auth para compatibilidad con código existente
export const auth = {
  verifyIdToken: async (token: string) => {
    return await adminAuth.verifyIdToken(token);
  },
  getUser: async (uid: string) => {
    return await adminAuth.getUser(uid);
  },
  verifySessionCookie: async (cookie: string, checkRevoked: boolean = true) => {
    return await adminAuth.verifySessionCookie(cookie, checkRevoked);
  },
};
