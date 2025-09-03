// const admin = require("firebase-admin");

// const serviceAccount = {
//   project_id: process.env.FIREBASE_PROJECT_ID,
//   client_email: process.env.FIREBASE_CLIENT_EMAIL,
//   private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
// };
// console.log("Loaded private key preview:", serviceAccount.private_key.substring(0, 50));
// console.log("Ends with:", serviceAccount.private_key.slice(-30));

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;



// --- TRY ---

const admin = require("firebase-admin");

const initializeApp = () => {
  // This method is secure and recommended for production environments like Vercel, Heroku, etc.
  if (process.env.FIREBASE_PROJECT_ID) {
    try {
      const serviceAccount = {
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      // Optional: Debug logs for verification. Consider removing these in production.
      console.log("Initializing Firebase with environment variables...");
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase Admin SDK initialized successfully.');

    } catch (error) {
       console.error("Firebase Admin initialization from env failed:", error);
    }
  } 
  // This method is useful for local development if you have the JSON file.
  else {
    try {
      console.log("Initializing Firebase with serviceAccountKey.json...");
      const serviceAccount = require('./serviceAccountKey.json');
      admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
       console.error('Firebase Admin initialization error: Make sure serviceAccountKey.json exists or environment variables are set.', error.message);
    }
  }
};

module.exports = { initializeApp, admin };

