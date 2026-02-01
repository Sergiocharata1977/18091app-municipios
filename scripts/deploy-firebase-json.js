const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing required environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) in .env.local');
    process.exit(1);
}

// Unescape newlines if strictly necessary (reconstruct the valid key)
// If the key in .env.local is already "valid" in terms of copy-paste, it likely has literal "\n" strings that need to become real newlines for the JSON object
if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

// Construct the service account object
// This mimics the structure of the standard service-account.json file
const serviceAccount = {
    type: "service_account",
    project_id: projectId,
    private_key_id: "generated-from-env", // Placeholder, not strictly checked by Admin SDK usually
    private_key: privateKey,
    client_email: clientEmail,
    client_id: "generated-from-env",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
};

console.log('✅ Constructed Service Account JSON object.');

// Encode to Base64
const jsonString = JSON.stringify(serviceAccount);
const base64String = Buffer.from(jsonString).toString('base64');

console.log('✅ Encoded to Base64 (Length: ' + base64String.length + ')');

// Upload to Vercel
console.log("🚀 Uploading FIREBASE_SERVICE_ACCOUNT_JSON to Vercel Production...");

const child = spawn('npx', ['vercel', 'env', 'add', 'FIREBASE_SERVICE_ACCOUNT_JSON', 'production'], {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
});

child.stdin.write(base64String);
child.stdin.end();

child.on('close', (code) => {
    if (code === 0) {
        console.log("✅ Structurally sound credentials uploaded successfully!");
        console.log("⚠️  IMPORTANT: You must REDEPLOY for changes to take effect.");
    } else {
        console.error("❌ Failed to upload environment variable.");
        process.exit(code);
    }
});
