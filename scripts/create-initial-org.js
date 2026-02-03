/**
 * Script to create initial organization in Firestore
 * Run with: node scripts/create-initial-org.js
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

const db = admin.firestore();

async function createInitialOrganization() {
  try {
    console.log('🏛️  Creating initial organization...');

    const orgData = {
      name: 'Municipio de Prueba',
      type: 'municipio',
      plan: 'premium',
      status: 'active',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('organizations').add(orgData);
    
    console.log('✅ Organization created successfully!');
    console.log(`   ID: ${docRef.id}`);
    console.log(`   Name: ${orgData.name}`);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating organization:', error);
    throw error;
  }
}

// Run the script
createInitialOrganization()
  .then((orgId) => {
    console.log('\n📋 Next steps:');
    console.log(`   1. Update API routes to use organization_id: "${orgId}"`);
    console.log(`   2. Create a super admin user`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
