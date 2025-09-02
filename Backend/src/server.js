// backend/src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// import routes
const invoiceRoutes = require("./routes/invoiceRoutes");
const authFirebase = require("./middlewares/authFirebase");

// public route
app.get("/api/ping", (req, res) => res.json({ ok: true }));

// protect invoice routes
app.use("/api/invoices", authFirebase, invoiceRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
