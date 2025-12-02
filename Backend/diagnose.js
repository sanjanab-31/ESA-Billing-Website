import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Firebase Diagnostic Tool\n');
console.log('═══════════════════════════════════════\n');

try {
    // Read and validate service account
    console.log('1️⃣ Checking service account key...');
    const serviceAccount = JSON.parse(
        readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    );
    console.log('   ✅ Service account loaded');
    console.log('   📋 Project ID from key:', serviceAccount.project_id);
    console.log('   📋 Client email:', serviceAccount.client_email);

    // Check .env configuration
    console.log('\n2️⃣ Checking .env configuration...');
    console.log('   📋 FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);

    if (serviceAccount.project_id !== process.env.FIREBASE_PROJECT_ID) {
        console.log('   ⚠️  WARNING: Project IDs don\'t match!');
        console.log('   Service account:', serviceAccount.project_id);
        console.log('   .env file:', process.env.FIREBASE_PROJECT_ID);
    } else {
        console.log('   ✅ Project IDs match');
    }

    // Initialize Firebase
    console.log('\n3️⃣ Initializing Firebase Admin...');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('   ✅ Firebase Admin initialized');

    // Try to access Firestore
    console.log('\n4️⃣ Testing Firestore access...');
    const db = admin.firestore();
    console.log('   ✅ Firestore instance created');

    // Try to list collections
    console.log('\n5️⃣ Attempting to list collections...');
    const collections = await db.listCollections();
    console.log('   ✅ Successfully accessed Firestore!');
    console.log('   📋 Found', collections.length, 'collections:');
    collections.forEach(col => {
        console.log('      -', col.id);
    });

    if (collections.length === 0) {
        console.log('\n   ℹ️  No collections found (database is empty - this is normal for new setup)');
    }

    // Try to read a collection
    console.log('\n6️⃣ Testing collection access...');
    const testSnapshot = await db.collection('customers').limit(1).get();
    console.log('   ✅ Can query collections');
    console.log('   📋 Documents in "customers":', testSnapshot.size);

    console.log('\n═══════════════════════════════════════');
    console.log('✅ ALL CHECKS PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('\nYour Firebase setup is working correctly!');
    console.log('You can now run: npm run setup-db');

    process.exit(0);

} catch (error) {
    console.log('\n═══════════════════════════════════════');
    console.log('❌ ERROR DETECTED');
    console.log('═══════════════════════════════════════\n');

    console.log('Error message:', error.message);
    console.log('Error code:', error.code);

    if (error.code === 5 || error.message.includes('NOT_FOUND')) {
        console.log('\n🔴 DIAGNOSIS: Firestore Database Not Enabled');
        console.log('\nThis error means Firestore is not enabled in your Firebase project.');
        console.log('\n📋 TO FIX THIS:');
        console.log('1. Go to: https://console.firebase.google.com/project/' + process.env.FIREBASE_PROJECT_ID + '/firestore');
        console.log('2. Click "Create database" if you see that button');
        console.log('3. Choose "Start in test mode"');
        console.log('4. Select a location (e.g., asia-south1)');
        console.log('5. Click "Enable"');
        console.log('6. Wait 30-60 seconds for provisioning');
        console.log('7. Run this diagnostic again');
        console.log('\n💡 TIP: Make sure you\'re enabling "Firestore Database" not "Realtime Database"');
    } else if (error.code === 7 || error.message.includes('PERMISSION_DENIED')) {
        console.log('\n🔴 DIAGNOSIS: Permission Denied');
        console.log('\nYour service account doesn\'t have permission to access Firestore.');
        console.log('\n📋 TO FIX THIS:');
        console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
        console.log('2. Generate a new private key');
        console.log('3. Replace serviceAccountKey.json with the new file');
    } else {
        console.log('\n🔴 DIAGNOSIS: Unknown Error');
        console.log('\nFull error details:');
        console.log(error);
    }

    process.exit(1);
}
