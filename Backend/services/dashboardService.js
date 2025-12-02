import { getDb } from '../config/firebase.js';

/**
 * Dashboard Service - Handles dashboard statistics
 */
export const dashboardService = {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        const db = getDb();
        try {
            // Fetch all required collections
            const [customersSnap, invoicesSnap, paymentsSnap, productsSnap] = await Promise.all([
                db.collection('customers').get(),
                db.collection('invoices').get(),
                db.collection('payments').get(),
                db.collection('products').get()
            ]);

            const customers = customersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const invoices = invoicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Calculate statistics
            const totalCustomers = customers.length;
            const activeCustomers = customers.filter(c => c.status === 'active').length;

            const totalInvoices = invoices.length;
            const paidInvoices = invoices.filter(i => i.status === 'paid').length;
            const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
            const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

            const totalRevenue = invoices
                .filter(i => i.status === 'paid')
                .reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);

            const pendingAmount = invoices
                .filter(i => i.status === 'pending' || i.status === 'overdue')
                .reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);

            const totalPayments = payments.length;
            const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            // Recent invoices (last 5)
            const recentInvoices = invoices
                .sort((a, b) => {
                    const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt);
                    const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt);
                    return bDate - aDate;
                })
                .slice(0, 5);

            // Recent payments (last 5)
            const recentPayments = payments
                .sort((a, b) => {
                    const aDate = a.paymentDate?.toDate?.() || new Date(a.paymentDate);
                    const bDate = b.paymentDate?.toDate?.() || new Date(b.paymentDate);
                    return bDate - aDate;
                })
                .slice(0, 5);

            // Monthly revenue (last 6 months)
            const monthlyRevenue = calculateMonthlyRevenue(invoices);

            // Top customers by revenue
            const topCustomers = calculateTopCustomers(invoices, customers);

            return {
                totalCustomers,
                activeCustomers,
                totalInvoices,
                paidInvoices,
                pendingInvoices,
                overdueInvoices,
                totalRevenue,
                pendingAmount,
                totalPayments,
                totalPaid,
                recentInvoices,
                recentPayments,
                monthlyRevenue,
                topCustomers,
                totalProducts: products.length
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    }
};

/**
 * Helper function to calculate monthly revenue
 */
function calculateMonthlyRevenue(invoices) {
    const monthlyData = {};
    const now = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = { month: key, revenue: 0, count: 0 };
    }

    // Calculate revenue for each month
    invoices
        .filter(inv => inv.status === 'paid')
        .forEach(inv => {
            const date = inv.paidDate?.toDate?.() || new Date(inv.paidDate || inv.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (monthlyData[key]) {
                monthlyData[key].revenue += parseFloat(inv.total) || 0;
                monthlyData[key].count += 1;
            }
        });

    return Object.values(monthlyData);
}

/**
 * Helper function to calculate top customers
 */
function calculateTopCustomers(invoices, customers) {
    const customerRevenue = {};

    invoices
        .filter(inv => inv.status === 'paid')
        .forEach(inv => {
            const customerId = inv.customerId;
            if (!customerRevenue[customerId]) {
                customerRevenue[customerId] = 0;
            }
            customerRevenue[customerId] += parseFloat(inv.total) || 0;
        });

    return Object.entries(customerRevenue)
        .map(([customerId, revenue]) => {
            const customer = customers.find(c => c.id === customerId);
            return {
                customerId,
                customerName: customer?.name || 'Unknown',
                revenue
            };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}
