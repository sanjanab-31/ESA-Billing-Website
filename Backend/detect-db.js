import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Detecting Firestore Databases\n');
console.log('═══════════════════════════════════════\n');

try {
    const serviceAccount = JSON.parse(
        readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log('✅ Firebase Admin initialized\n');

    // Try default database
    console.log('1️⃣ Trying default database "(default)"...');
    try {
        const defaultDb = admin.firestore();
        const collections = await defaultDb.listCollections();
        console.log('   ✅ SUCCESS! Default database is accessible');
        console.log('   📋 Collections found:', collections.length);
        if (collections.length > 0) {
            console.log('   📋 Collection names:');
            collections.forEach(col => console.log('      -', col.id));
        }
    } catch (error) {
        console.log('   ❌ Default database not accessible');
        console.log('   Error:', error.message);
    }

    // Try named database "esabilling"
    console.log('\n2️⃣ Trying named database "esabilling"...');
    try {
        const namedDb = admin.app().firestore('esabilling');
        const collections = await namedDb.listCollections();
        console.log('   ✅ SUCCESS! Named database "esabilling" is accessible');
        console.log('   📋 Collections found:', collections.length);
        if (collections.length > 0) {
            console.log('   📋 Collection names:');
            collections.forEach(col => console.log('      -', col.id));
        }

        console.log('\n💡 SOLUTION FOUND!');
        console.log('Your database is named "esabilling", not the default database.');
        console.log('\nUpdate your Backend/config/firebase.js to use:');
        console.log('   db = admin.app().firestore("esabilling");');
    } catch (error) {
        console.log('   ❌ Named database "esabilling" not accessible');
        console.log('   Error:', error.message);
    }

    // Check if it's a Realtime Database instead
    console.log('\n3️⃣ Checking if Realtime Database exists...');
    try {
        const rtdb = admin.database();
        console.log('   ℹ️  Realtime Database is configured');
        console.log('   ⚠️  NOTE: This backend uses Firestore, not Realtime Database');
    } catch (error) {
        console.log('   ℹ️  Realtime Database not configured (this is fine)');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📋 SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('\nPlease check the results above to see which database is accessible.');
    console.log('\nIf neither database works, please verify in Firebase Console:');
    console.log('1. Go to: https://console.firebase.google.com/project/' + serviceAccount.project_id + '/firestore');
    console.log('2. Check if you see the Firestore interface');
    console.log('3. Look for a database selector dropdown at the top');
    console.log('4. Note the database name shown');

} catch (error) {
    console.log('\n❌ Error:', error.message);
    console.log('\nFull error:');
    console.log(error);
}
