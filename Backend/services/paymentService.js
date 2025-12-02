import { getDb } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Payment Service - Handles all payment-related operations
 */
export const paymentService = {
    /**
     * Get payments by invoice ID
     */
    async getPaymentsByInvoice(invoiceId) {
        const db = getDb();
        try {
            const snapshot = await db.collection('payments')
                .where('invoiceId', '==', invoiceId)
                .orderBy('paymentDate', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting payments:', error);
            throw error;
        }
    },

    /**
     * Get all payments
     */
    async getAllPayments() {
        const db = getDb();
        try {
            const snapshot = await db.collection('payments')
                .orderBy('paymentDate', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting all payments:', error);
            throw error;
        }
    },

    /**
     * Create a new payment
     */
    async createPayment(paymentData) {
        const db = getDb();
        try {
            const docRef = await db.collection('payments').add({
                ...paymentData,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    /**
     * Update payment
     */
    async updatePayment(id, paymentData) {
        const db = getDb();
        try {
            await db.collection('payments').doc(id).update({
                ...paymentData,
                updatedAt: FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating payment:', error);
            throw error;
        }
    },

    /**
     * Delete payment
     */
    async deletePayment(id) {
        const db = getDb();
        try {
            await db.collection('payments').doc(id).delete();
            return { success: true };
        } catch (error) {
            console.error('Error deleting payment:', error);
            throw error;
        }
    }
};
