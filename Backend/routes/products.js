import express from 'express';
import { productService } from '../services/productService.js';

const router = express.Router();

/**
 * GET /api/products
 * Get all products with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const options = {
            search: req.query.search || '',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20,
            sortBy: req.query.sortBy || 'createdAt',
            sortDirection: req.query.sortDirection || 'desc'
        };

        const result = await productService.getProducts(options);
        res.json(result);
    } catch (error) {
        console.error('Error in GET /api/products:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json(product);
    } catch (error) {
        console.error('Error in GET /api/products/:id:', error);
        res.status(404).json({ error: error.message });
    }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', async (req, res) => {
    try {
        const id = await productService.createProduct(req.body);
        res.status(201).json({ success: true, id });
    } catch (error) {
        console.error('Error in POST /api/products:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/products/:id
 * Update product
 */
router.put('/:id', async (req, res) => {
    try {
        await productService.updateProduct(req.params.id, req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/products/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/products/:id
 * Delete product
 */
router.delete('/:id', async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/products/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
