import express from 'express';
import { paymentService } from '../services/paymentService.js';

const router = express.Router();

/**
 * GET /api/payments
 * Get all payments or by invoice ID
 */
router.get('/', async (req, res) => {
    try {
        const { invoiceId } = req.query;

        let payments;
        if (invoiceId) {
            payments = await paymentService.getPaymentsByInvoice(invoiceId);
        } else {
            payments = await paymentService.getAllPayments();
        }

        res.json(payments);
    } catch (error) {
        console.error('Error in GET /api/payments:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/payments
 * Create a new payment
 */
router.post('/', async (req, res) => {
    try {
        const id = await paymentService.createPayment(req.body);
        res.status(201).json({ success: true, id });
    } catch (error) {
        console.error('Error in POST /api/payments:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/payments/:id
 * Update payment
 */
router.put('/:id', async (req, res) => {
    try {
        await paymentService.updatePayment(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/payments/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/payments/:id
 * Delete payment
 */
router.delete('/:id', async (req, res) => {
    try {
        await paymentService.deletePayment(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/payments/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
