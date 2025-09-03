const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Placeholder route
router.get('/', paymentController.getPayments);

module.exports = router;
