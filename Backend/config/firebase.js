import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

let db = null;

/**
 * Initialize Firebase Admin SDK
 */
export const initializeFirebase = () => {
    try {
        // Read service account key
        const serviceAccount = JSON.parse(
            readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
        );

        // Initialize Firebase Admin
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });

        // Get Firestore instance for named database "esabill"
        // Note: For named databases, use admin.firestore() with settings
        const firestore = admin.firestore();
        firestore.settings({ databaseId: 'esabill' });
        db = firestore;

        console.log('✅ Firebase Admin initialized successfully');
        console.log('✅ Connected to database: esabill');
        return db;
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error);
        throw error;
    }
};

/**
 * Get Firestore database instance
 */
export const getDb = () => {
    if (!db) {
        throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return db;
};

/**
 * Get Firebase Admin instance
 */
export const getAdmin = () => admin;

export default { initializeFirebase, getDb, getAdmin };
