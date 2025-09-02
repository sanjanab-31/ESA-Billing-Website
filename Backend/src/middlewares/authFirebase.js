// backend/src/middlewares/authFirebase.js
const admin = require("../config/firebaseAdmin");

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer (.*)$/);
  if (!match) return res.status(401).json({ error: "No token provided" });

  const idToken = match[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded; // decoded.uid, email, etc.
    next();
  } catch (err) {
    console.error("Firebase token verification failed", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};
