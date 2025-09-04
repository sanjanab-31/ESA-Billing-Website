// // backend/src/server.js
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // import routes
// const invoiceRoutes = require("./routes/invoiceRoutes");
// const authFirebase = require("./middlewares/authFirebase");

// // public route
// app.get("/api/ping", (req, res) => res.json({ ok: true }));

// // protect invoice routes
// app.use("/api/invoices", authFirebase, invoiceRoutes);

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`API listening on ${PORT}`));



// --- TRY ---

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initializeApp } = require('./config/firebaseAdmin');
const connectDB = require('./config/db');

// Initialize Firebase Admin SDK & Connect to MongoDB
initializeApp();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// --- Import Routes ---
const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const productRoutes = require("./routes/productRoutes");
const reportRoutes = require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const authFirebase = require("./middlewares/authFirebase");

// --- Public Route ---
app.get("/api/ping", (req, res) => res.json({ ok: true, message: "Server is running" }));

// --- Protected API Routes ---
// The authFirebase middleware is now applied to each specific route that needs protection.
app.use("/api/auth", authFirebase, authRoutes);
app.use("/api/clients", authFirebase, clientRoutes);
app.use("/api/invoices", authFirebase, invoiceRoutes);
app.use("/api/payments", authFirebase, paymentRoutes);
app.use("/api/products", authFirebase, productRoutes);
app.use("/api/reports", authFirebase, reportRoutes);
app.use("/api/settings", authFirebase, settingsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));

