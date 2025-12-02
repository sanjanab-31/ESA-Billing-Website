import express from 'express';
import { invoiceService } from '../services/invoiceService.js';

const router = express.Router();

/**
 * GET /api/invoices
 * Get all invoices with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const options = {
            search: req.query.search || '',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            status: req.query.status,
            customerId: req.query.customerId,
            sortBy: req.query.sortBy || 'createdAt',
            sortDirection: req.query.sortDirection || 'desc'
        };

        const result = await invoiceService.getInvoices(options);
        res.json(result);
    } catch (error) {
        console.error('Error in GET /api/invoices:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/invoices/:id
 * Get invoice by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const invoice = await invoiceService.getInvoiceById(req.params.id);
        res.json(invoice);
    } catch (error) {
        console.error('Error in GET /api/invoices/:id:', error);
        res.status(404).json({ error: error.message });
    }
});

/**
 * POST /api/invoices
 * Create a new invoice
 */
router.post('/', async (req, res) => {
    try {
        const id = await invoiceService.createInvoice(req.body);
        res.status(201).json({ success: true, id });
    } catch (error) {
        console.error('Error in POST /api/invoices:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/invoices/:id
 * Update invoice
 */
router.put('/:id', async (req, res) => {
    try {
        await invoiceService.updateInvoice(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/invoices/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/invoices/:id
 * Delete invoice
 */
router.delete('/:id', async (req, res) => {
    try {
        await invoiceService.deleteInvoice(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/invoices/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
