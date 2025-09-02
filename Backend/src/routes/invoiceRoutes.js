// backend/src/routes/invoiceRoutes.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // req.user.uid is available from Firebase token
  res.json({ invoices: [], user: req.user });
});

module.exports = router;
