import express from 'express';
import { customerService } from '../services/customerService.js';

const router = express.Router();

/**
 * GET /api/customers
 * Get all customers with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const options = {
            search: req.query.search || '',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            status: req.query.status,
            sortBy: req.query.sortBy || 'createdAt',
            sortDirection: req.query.sortDirection || 'desc'
        };

        const result = await customerService.getCustomers(options);
        res.json(result);
    } catch (error) {
        console.error('Error in GET /api/customers:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/customers/:id
 * Get customer by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const customer = await customerService.getCustomerById(req.params.id);
        res.json(customer);
    } catch (error) {
        console.error('Error in GET /api/customers/:id:', error);
        res.status(404).json({ error: error.message });
    }
});

/**
 * POST /api/customers
 * Create a new customer
 */
router.post('/', async (req, res) => {
    try {
        const id = await customerService.createCustomer(req.body);
        res.status(201).json({ success: true, id });
    } catch (error) {
        console.error('Error in POST /api/customers:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/customers/:id
 * Update customer
 */
router.put('/:id', async (req, res) => {
    try {
        await customerService.updateCustomer(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/customers/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/customers/:id
 * Delete customer
 */
router.delete('/:id', async (req, res) => {
    try {
        await customerService.deleteCustomer(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/customers/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
