/**
 * Script to create a super admin user for testing
 * Run with: node scripts/create-super-admin.js
 * 
 * This will create a user with:
 * - Email: admin@municipio.gob.ar
 * - Password: Admin123!
 * - Role: super_admin
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Missing Firebase credentials in .env.local');
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const auth = admin.auth();
const db = admin.firestore();

const ADMIN_EMAIL = 'admin@municipio.gob.ar';
const ADMIN_PASSWORD = 'Admin123!';

async function createSuperAdmin() {
  try {
    console.log('👤 Creating super admin user...');

    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log('⚠️  User already exists:', existingUser.uid);
      console.log('   Updating to super_admin role...');
      
      // Update to super_admin
      await auth.setCustomUserClaims(existingUser.uid, { role: 'super_admin' });
      await db.collection('users').doc(existingUser.uid).update({
        rol: 'super_admin',
        updated_at: new Date(),
      });
      
      console.log('✅ User updated to super_admin');
      return existingUser.uid;
    } catch (error) {
      // User doesn't exist, create new one
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: ADMIN_EMAIL,
      emailVerified: true,
      password: ADMIN_PASSWORD,
    });

    console.log('✅ Firebase Auth user created:', userRecord.uid);

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'super_admin',
    });

    // Get or create organization
    const orgsSnapshot = await db.collection('organizations').limit(1).get();
    let orgId;
    
    if (orgsSnapshot.empty) {
      const orgRef = await db.collection('organizations').add({
        name: 'Municipio de Prueba',
        type: 'municipio',
        plan: 'premium',
        status: 'active',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
      orgId = orgRef.id;
      console.log('✅ Created default organization:', orgId);
    } else {
      orgId = orgsSnapshot.docs[0].id;
      console.log('✅ Using existing organization:', orgId);
    }

    // Create user record in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: ADMIN_EMAIL,
      personnel_id: null,
      rol: 'super_admin',
      activo: true,
      organization_id: orgId,
      modulos_habilitados: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Firestore user record created');
    console.log('\n📋 Super Admin Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Organization ID: ${orgId}`);
    
    return userRecord.uid;
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('\n✅ Super admin created successfully!');
    console.log('   You can now login at: http://localhost:3000/login');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
