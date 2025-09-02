const admin = require("firebase-admin");

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};
console.log("Loaded private key preview:", serviceAccount.private_key.substring(0, 50));
console.log("Ends with:", serviceAccount.private_key.slice(-30));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
