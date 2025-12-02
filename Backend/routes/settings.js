import express from 'express';
import { settingsService } from '../services/settingsService.js';

const router = express.Router();

/**
 * GET /api/settings
 * Get all settings
 */
router.get('/', async (req, res) => {
    try {
        const settings = await settingsService.getSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error in GET /api/settings:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/settings/:key
 * Update a setting
 */
router.put('/:key', async (req, res) => {
    try {
        const { value, description } = req.body;
        await settingsService.updateSetting(req.params.key, value, description);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/settings/:key:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
