import axios from 'axios';

// API base URL - use environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * API Client for communicating with the backend
 * All Firebase operations are now handled server-side
 */
class ApiClient {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor to include auth token
        this.client.interceptors.request.use(
            async (config) => {
                // Get Firebase auth token if user is logged in
                const { auth } = await import('../firebase/config.js');
                const user = auth.currentUser;

                if (user) {
                    const token = await user.getIdToken();
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response.data,
            (error) => {
                console.error('API Error:', error.response?.data || error.message);
                throw new Error(error.response?.data?.error || error.message);
            }
        );
    }

    // Customer endpoints
    async getCustomers(options = {}) {
        return this.client.get('/customers', { params: options });
    }

    async getCustomerById(id) {
        return this.client.get(`/customers/${id}`);
    }

    async createCustomer(data) {
        return this.client.post('/customers', data);
    }

    async updateCustomer(id, data) {
        return this.client.put(`/customers/${id}`, data);
    }

    async deleteCustomer(id) {
        return this.client.delete(`/customers/${id}`);
    }

    // Invoice endpoints
    async getInvoices(options = {}) {
        return this.client.get('/invoices', { params: options });
    }

    async getNextInvoiceNumber() {
        return this.client.get('/invoices/next-number');
    }

    async getInvoiceById(id) {
        return this.client.get(`/invoices/${id}`);
    }

    async createInvoice(data) {
        return this.client.post('/invoices', data);
    }

    async updateInvoice(id, data) {
        return this.client.put(`/invoices/${id}`, data);
    }

    async deleteInvoice(id) {
        return this.client.delete(`/invoices/${id}`);
    }

    // Payment endpoints
    async getPayments(invoiceId = null) {
        const params = invoiceId ? { invoiceId } : {};
        return this.client.get('/payments', { params });
    }

    async createPayment(data) {
        return this.client.post('/payments', data);
    }

    async updatePayment(id, data) {
        return this.client.put(`/payments/${id}`, data);
    }

    async deletePayment(id) {
        return this.client.delete(`/payments/${id}`);
    }

    // Product endpoints
    async getProducts(options = {}) {
        return this.client.get('/products', { params: options });
    }

    async getProductById(id) {
        return this.client.get(`/products/${id}`);
    }

    async createProduct(data) {
        return this.client.post('/products', data);
    }

    async updateProduct(id, data) {
        return this.client.put(`/products/${id}`, data);
    }

    async deleteProduct(id) {
        return this.client.delete(`/products/${id}`);
    }

    // Settings endpoints
    async getSettings() {
        return this.client.get('/settings');
    }

    async updateSetting(key, value, description) {
        return this.client.put(`/settings/${key}`, { value, description });
    }

    // Dashboard endpoints
    async getDashboardStats() {
        return this.client.get('/dashboard/stats');
    }

    // Auth endpoints
    async verifyToken(idToken) {
        return this.client.post('/auth/verify', { idToken });
    }

    async getUserByUid(uid) {
        return this.client.get(`/auth/user/${uid}`);
    }

    async createUser(userData) {
        return this.client.post('/auth/user', userData);
    }

    async updateUser(uid, userData) {
        return this.client.put(`/auth/user/${uid}`, userData);
    }

    async deleteUser(uid) {
        return this.client.delete(`/auth/user/${uid}`);
    }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
