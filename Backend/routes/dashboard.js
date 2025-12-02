import express from 'express';
import { dashboardService } from '../services/dashboardService.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await dashboardService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error('Error in GET /api/dashboard/stats:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
