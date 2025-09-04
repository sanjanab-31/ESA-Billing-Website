const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Placeholder route
router.get('/', invoiceController.getInvoices);

module.exports = router;
