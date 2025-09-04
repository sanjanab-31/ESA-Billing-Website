const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Placeholder route
router.get('/', settingsController.getSettings);

module.exports = router;
