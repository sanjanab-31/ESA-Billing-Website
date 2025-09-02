// backend/src/config/firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json"); // path to downloaded JSON

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
