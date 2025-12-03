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
            // Apply filters
            if (status) {
                if (status === 'Overdue') {
                    query = query.where('status', '==', 'Unpaid');
                } else {
                    query = query.where('status', '==', status);
                }
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

            // Apply Overdue filter if requested
            if (status === 'Overdue') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                invoices = invoices.filter(invoice => {
                    if (!invoice.dueDate) return false;
                    const dueDate = new Date(invoice.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    return dueDate < today;
                });
            }

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
     * Get next invoice number
     */
    async getNextInvoiceNumber() {
        const db = getDb();
        try {
            // Calculate financial year
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth(); // 0-indexed

            let financialYearStart;
            if (currentMonth < 2) { // Jan, Feb
                financialYearStart = currentYear - 1;
            } else if (currentMonth === 2) { // March
                financialYearStart = currentYear - 1;
            } else { // April onwards
                financialYearStart = currentYear;
            }

            const financialYearEnd = financialYearStart + 1;
            const financialYearString = `${financialYearStart}-${financialYearEnd}`;

            // Get all invoices to find the max number for the current financial year
            // This is more robust than relying on createdAt sorting
            const snapshot = await db.collection('invoices').get();

            if (snapshot.empty) {
                return `INV 001/${financialYearString}`;
            }

            let maxNum = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.invoiceNumber) {
                    // Match INV followed by optional space, then digits, then /, then year range
                    const match = data.invoiceNumber.match(/INV\s*(\d+)\/(\d{4}-\d{4})$/);
                    if (match && match[2] === financialYearString) {
                        const num = parseInt(match[1], 10);
                        if (num > maxNum) maxNum = num;
                    }
                }
            });

            return `INV ${String(maxNum + 1).padStart(3, "0")}/${financialYearString}`;
        } catch (error) {
            console.error('Error getting next invoice number:', error);
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
