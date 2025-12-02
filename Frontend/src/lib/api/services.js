import { apiClient } from '../api/client.js';

/**
 * Backend-based services
 * All Firebase operations are now handled by the backend API
 */

// Customer Service
export const customerService = {
    async getCustomers(options = {}) {
        return apiClient.getCustomers(options);
    },

    async createCustomer(customerData) {
        const result = await apiClient.createCustomer(customerData);
        return result.id;
    },

    async updateCustomer(id, customerData) {
        await apiClient.updateCustomer(id, customerData);
    },

    async deleteCustomer(id) {
        await apiClient.deleteCustomer(id);
    },

    async getCustomerById(id) {
        return apiClient.getCustomerById(id);
    }
};

// Invoice Service
export const invoiceService = {
    async getInvoices(options = {}) {
        return apiClient.getInvoices(options);
    },

    async createInvoice(invoiceData) {
        const result = await apiClient.createInvoice(invoiceData);
        return result.id;
    },

    async updateInvoice(id, invoiceData) {
        await apiClient.updateInvoice(id, invoiceData);
    },

    async deleteInvoice(id) {
        await apiClient.deleteInvoice(id);
    },

    async getInvoiceById(id) {
        return apiClient.getInvoiceById(id);
    }
};

// Payment Service
export const paymentService = {
    async getPaymentsByInvoice(invoiceId) {
        return apiClient.getPayments(invoiceId);
    },

    async getAllPayments() {
        return apiClient.getPayments();
    },

    async createPayment(paymentData) {
        const result = await apiClient.createPayment(paymentData);
        return result.id;
    },

    async updatePayment(id, paymentData) {
        await apiClient.updatePayment(id, paymentData);
    },

    async deletePayment(id) {
        await apiClient.deletePayment(id);
    }
};

// Product Service
export const productService = {
    async getProducts(options = {}) {
        return apiClient.getProducts(options);
    },

    async createProduct(productData) {
        const result = await apiClient.createProduct(productData);
        return result.id;
    },

    async updateProduct(id, productData) {
        await apiClient.updateProduct(id, productData);
    },

    async deleteProduct(id) {
        await apiClient.deleteProduct(id);
    },

    async getProductById(id) {
        return apiClient.getProductById(id);
    }
};

// Settings Service
export const settingsService = {
    async getSettings() {
        return apiClient.getSettings();
    },

    async updateSetting(key, value, description) {
        await apiClient.updateSetting(key, value, description);
    }
};

// Dashboard Service
export const dashboardService = {
    async getDashboardStats() {
        return apiClient.getDashboardStats();
    }
};

/**
 * Subscription placeholder
 * Real-time updates will need to be implemented differently
 * Options:
 * 1. WebSocket connection to backend
 * 2. Polling with setInterval
 * 3. Server-Sent Events (SSE)
 * 
 * For now, this returns a no-op unsubscribe function.
 * The hooks will refetch data on mount and when needed.
 */
export const subscribeToCollection = (collectionName, callback, options = {}) => {
    // Return a no-op unsubscribe function
    return () => { };
};
