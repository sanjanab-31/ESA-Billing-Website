import { initializeFirebase, getDb } from './config/firebase.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Setup script to verify Firebase connection and database
 */
async function setupDatabase() {
    console.log('🚀 Starting database setup...\n');

    try {
        // Initialize Firebase
        console.log('1️⃣ Initializing Firebase Admin SDK...');
        const db = initializeFirebase();
        console.log('✅ Firebase initialized successfully\n');

        // Test database connection
        console.log('2️⃣ Testing database connection...');
        const collections = ['customers', 'invoices', 'payments', 'products', 'settings'];

        for (const collectionName of collections) {
            const snapshot = await db.collection(collectionName).limit(1).get();
            console.log(`   ✓ ${collectionName}: ${snapshot.size} documents found`);
        }
        console.log('✅ Database connection successful\n');

        // Check if settings collection needs initialization
        console.log('3️⃣ Checking settings...');
        const settingsSnapshot = await db.collection('settings').get();

        if (settingsSnapshot.empty) {
            console.log('   ⚠️  Settings collection is empty. Creating default settings...');

            const defaultSettings = {
                companyName: {
                    value: 'ESA Billing',
                    description: 'Company name for invoices'
                },
                taxRate: {
                    value: 18,
                    description: 'Default tax rate percentage'
                },
                currency: {
                    value: 'INR',
                    description: 'Default currency'
                },
                invoicePrefix: {
                    value: 'INV',
                    description: 'Invoice number prefix'
                }
            };

            for (const [key, data] of Object.entries(defaultSettings)) {
                await db.collection('settings').doc(key).set({
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log(`   ✓ Created setting: ${key}`);
            }
            console.log('✅ Default settings created\n');
        } else {
            console.log(`   ✓ Found ${settingsSnapshot.size} settings`);
            console.log('✅ Settings configured\n');
        }

        console.log('═══════════════════════════════════════');
        console.log('🎉 Database setup completed successfully!');
        console.log('═══════════════════════════════════════\n');
        console.log('Next steps:');
        console.log('1. Start the server: npm run dev');
        console.log('2. Update frontend to use backend API');
        console.log('3. Test the API endpoints\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Verify serviceAccountKey.json exists and is valid');
        console.error('2. Check FIREBASE_PROJECT_ID in .env');
        console.error('3. Ensure you have internet connection');
        console.error('4. Verify Firebase project permissions\n');
        process.exit(1);
    }
}

// Run setup
setupDatabase();
