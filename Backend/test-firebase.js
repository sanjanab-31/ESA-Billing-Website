import { initializeFirebase } from './config/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables:');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('- FIREBASE_SERVICE_ACCOUNT_PATH:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
console.log('- PORT:', process.env.PORT);

console.log('\nInitializing Firebase...');
try {
    const db = initializeFirebase();
    console.log('✅ Firebase initialized');

    console.log('\nTesting database access...');
    const testRef = db.collection('customers').limit(1);
    const snapshot = await testRef.get();
    console.log('✅ Database accessible! Found', snapshot.size, 'documents');

    process.exit(0);
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
}
