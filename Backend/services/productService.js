import { getDb } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Product Service - Handles all product-related operations
 */
export const productService = {
    /**
     * Get all products with optional filtering
     */
    async getProducts(options = {}) {
        const db = getDb();
        const {
            search = '',
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortDirection = 'desc'
        } = options;

        try {
            const snapshot = await db.collection('products').get();
            let products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                products = products.filter(product =>
                    product.name?.toLowerCase().includes(searchLower) ||
                    product.description?.toLowerCase().includes(searchLower) ||
                    product.sku?.toLowerCase().includes(searchLower)
                );
            }

            // Apply sorting
            products.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            // Calculate pagination
            const total = products.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedProducts = products.slice(startIndex, endIndex);

            return {
                data: paginatedProducts,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            };
        } catch (error) {
            console.error('Error getting products:', error);
            throw error;
        }
    },

    /**
     * Create a new product
     */
    async createProduct(productData) {
        const db = getDb();
        try {
            const docRef = await db.collection('products').add({
                ...productData,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    /**
     * Update product
     */
    async updateProduct(id, productData) {
        const db = getDb();
        try {
            await db.collection('products').doc(id).update({
                ...productData,
                updatedAt: FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    /**
     * Delete product
     */
    async deleteProduct(id) {
        const db = getDb();
        try {
            await db.collection('products').doc(id).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    /**
     * Get product by ID
     */
    async getProductById(id) {
        const db = getDb();
        try {
            const doc = await db.collection('products').doc(id).get();
            if (!doc.exists) {
                throw new Error('Product not found');
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Error getting product:', error);
            throw error;
        }
    }
};
