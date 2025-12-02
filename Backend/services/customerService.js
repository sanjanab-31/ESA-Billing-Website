import { getDb } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Customer Service - Handles all customer-related operations
 */
export const customerService = {
    /**
     * Get all customers with optional filtering
     */
    async getCustomers(options = {}) {
        const db = getDb();
        const {
            search = '',
            page = 1,
            limit = 20,
            status,
            sortBy = 'createdAt',
            sortDirection = 'desc'
        } = options;

        try {
            let query = db.collection('customers');

            // Apply status filter
            if (status) {
                query = query.where('status', '==', status);
            }

            // Get all documents for search and sorting
            const snapshot = await query.get();
            let customers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Apply search filter
            if (search) {
                const searchLower = search.toLowerCase();
                customers = customers.filter(customer =>
                    customer.name?.toLowerCase().includes(searchLower) ||
                    customer.email?.toLowerCase().includes(searchLower) ||
                    customer.phone?.includes(search) ||
                    customer.gstNumber?.toLowerCase().includes(searchLower)
                );
            }

            // Apply sorting
            customers.sort((a, b) => {
                const aVal = a[sortBy];
                const bVal = b[sortBy];

                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            // Calculate pagination
            const total = customers.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedCustomers = customers.slice(startIndex, endIndex);

            return {
                data: paginatedCustomers,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            };
        } catch (error) {
            console.error('Error getting customers:', error);
            throw error;
        }
    },

    /**
     * Create a new customer
     */
    async createCustomer(customerData) {
        const db = getDb();
        try {
            const docRef = await db.collection('customers').add({
                ...customerData,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    },

    /**
     * Update customer
     */
    async updateCustomer(id, customerData) {
        const db = getDb();
        try {
            await db.collection('customers').doc(id).update({
                ...customerData,
                updatedAt: FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    },

    /**
     * Delete customer
     */
    async deleteCustomer(id) {
        const db = getDb();
        try {
            await db.collection('customers').doc(id).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    },

    /**
     * Get customer by ID
     */
    async getCustomerById(id) {
        const db = getDb();
        try {
            const doc = await db.collection('customers').doc(id).get();
            if (!doc.exists) {
                throw new Error('Customer not found');
            }
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('Error getting customer:', error);
            throw error;
        }
    }
};
