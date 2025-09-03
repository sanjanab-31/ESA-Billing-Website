const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Placeholder route
router.get('/', clientController.getClients);

module.exports = router;
