const fs = require('fs');
const { execSync, spawn } = require('child_process');
const path = require('path');

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');
let privateKey = '';

for (const line of lines) {
    if (line.trim().startsWith('FIREBASE_PRIVATE_KEY=')) {
        // Extract value, handling quotes if present
        let val = line.trim().substring('FIREBASE_PRIVATE_KEY='.length);
        // Remove surrounding quotes if they exist
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        privateKey = val;
        break;
    }
}

if (!privateKey) {
    console.error("❌ FIREBASE_PRIVATE_KEY not found in .env.local");
    process.exit(1);
}

console.log("✅ Found private key in .env.local");
console.log("🔄 Removing existing key from Vercel Production...");

try {
    // Try to remove it first to avoid "already exists" prompts
    execSync('npx vercel env rm FIREBASE_PRIVATE_KEY production -y', { stdio: 'inherit' });
} catch (error) {
    console.log("   (Key might not have existed, continuing...)");
}

// Unescape newlines if they are literals (e.g. "\\n" -> "\n")
// This ensures we have the raw key content
if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

// Base64 encode the key to safest transport
const base64Key = Buffer.from(privateKey).toString('base64');

console.log("Cc🚀 Uploading Base64 encoded key to Vercel Production...");

// Use spawn to pipe the value securely to stdin
const child = spawn('npx', ['vercel', 'env', 'add', 'FIREBASE_PRIVATE_KEY', 'production'], {
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
});

child.stdin.write(base64Key);
child.stdin.end();

child.on('close', (code) => {
    if (code === 0) {
        console.log("✅ Successfully updated FIREBASE_PRIVATE_KEY in Vercel!");
        console.log("⚠️  IMPORTANT: You must REDEPLOY for changes to take effect.");
    } else {
        console.error("❌ Failed to update key.");
    }
});
