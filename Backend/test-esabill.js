import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabase() {
    try {
        const serviceAccount = JSON.parse(
            readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log('Testing database: esabill\n');

        // Method 1: Using firestore() with database ID
        const db = admin.firestore('esabill');
        console.log('✅ Got database reference');

        // Try to list collections
        console.log('\nAttempting to list collections...');
        const collections = await db.listCollections();
        console.log('✅ SUCCESS! Collections:', collections.map(c => c.id));

        // Try to access a collection
        console.log('\nAttempting to access customers collection...');
        const snapshot = await db.collection('customers').get();
        console.log('✅ SUCCESS! Documents:', snapshot.size);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nError code:', error.code);
        console.error('\nFull error:', error);
    }
}

testDatabase();
