import { getDb } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Invoice Service - Handles all invoice-related operations
 */
export const invoiceService = {
    /**
     * Get all invoices with optional filtering
     */
    async getInvoices(options = {}) {
        const db = getDb();
        const {
            search = '',
            page = 1,
            limit = 20,
            status,
            customerId,
            sortBy = 'createdAt',
            sortDirection = 'desc'
        } = options;

        try {
            let query = db.collection('invoices');

            // Apply filters
            if (status) {
                query = query.where('status', '==', status);
            }
            if (customerId) {
                query = query.where('customerId', '==', customerId);
            }

            // Get all documents
            const snapshot = await query.get();
            let invoices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                invoices = invoices.filter(invoice =>
                    invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
                    invoice.customerName?.toLowerCase().includes(searchLower) ||
                    invoice.customerId?.toLowerCase().includes(searchLower)
                );
            }

            // Apply sorting
            invoices.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            // Calculate pagination
            const total = invoices.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedInvoices = invoices.slice(startIndex, endIndex);

            return {
                data: paginatedInvoices,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            };
        } catch (error) {
            console.error('Error getting invoices:', error);
            throw error;
        }
    },

    /**
     * Create a new invoice
     */
    async createInvoice(invoiceData) {
        const db = getDb();
        try {
            const docRef = await db.collection('invoices').add({
                ...invoiceData,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error;
        }
    },

    /**
     * Update invoice
     */
    async updateInvoice(id, invoiceData) {
        const db = getDb();
        try {
            await db.collection('invoices').doc(id).update({
                ...invoiceData,
                updatedAt: FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating invoice:', error);
            throw error;
        }
    },

    /**
     * Delete invoice
     */
    async deleteInvoice(id) {
        const db = getDb();
        try {
            await db.collection('invoices').doc(id).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting invoice:', error);
            throw error;
        }
    },

    /**
     * Get invoice by ID
     */
    async getInvoiceById(id) {
        const db = getDb();
        try {
            const doc = await db.collection('invoices').doc(id).get();
            if (!doc.exists) {
                throw new Error('Invoice not found');
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Error getting invoice:', error);
            throw error;
        }
    }
};
