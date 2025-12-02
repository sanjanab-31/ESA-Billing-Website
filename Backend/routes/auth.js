import express from 'express';
import { authService } from '../services/authService.js';

const router = express.Router();

/**
 * POST /api/auth/verify
 * Verify Firebase ID token
 */
router.post('/verify', async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID token is required' });
        }

        const decodedToken = await authService.verifyToken(idToken);
        res.json({
            success: true,
            uid: decodedToken.uid,
            email: decodedToken.email
        });
    } catch (error) {
        console.error('Error in POST /api/auth/verify:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

/**
 * GET /api/auth/user/:uid
 * Get user by UID
 */
router.get('/user/:uid', async (req, res) => {
    try {
        const user = await authService.getUserByUid(req.params.uid);
        res.json(user);
    } catch (error) {
        console.error('Error in GET /api/auth/user/:uid:', error);
        res.status(404).json({ error: error.message });
    }
});

/**
 * POST /api/auth/user
 * Create a new user
 */
router.post('/user', async (req, res) => {
    try {
        const user = await authService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error in POST /api/auth/user:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/auth/user/:uid
 * Update user
 */
router.put('/user/:uid', async (req, res) => {
    try {
        await authService.updateUser(req.params.uid, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/auth/user/:uid:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/auth/user/:uid
 * Delete user
 */
router.delete('/user/:uid', async (req, res) => {
    try {
        await authService.deleteUser(req.params.uid);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/auth/user/:uid:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
