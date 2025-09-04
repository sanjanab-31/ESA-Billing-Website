const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Placeholder route
router.get('/', productController.getProducts);

module.exports = router;
