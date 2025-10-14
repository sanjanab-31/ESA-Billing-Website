import {
  customersCollection,
  invoicesCollection,
  paymentsCollection,
  productsCollection,
  settingsCollection,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  db
} from "./database.js";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";

// Customer Management Functions
const customerService = {
  // Get all customers with optional filtering
  getCustomers: async (options = {}) => {
    try {
      const { search = "", page = 1, limit: limitCount = 20, status, sortBy, sortDirection } = options;
      
      let q = customersCollection;
      
      // Apply filters
      if (status) {
        q = query(q, where("status", "==", status));
      }
      
      if (sortBy) {
        q = query(q, orderBy(sortBy, sortDirection || "asc"));
      }
      
      q = query(q, limit(limitCount));
      
      const snapshot = await getDocs(q);
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Apply search filter
      const filteredCustomers = search 
        ? customers.filter(customer => 
            customer.name?.toLowerCase().includes(search.toLowerCase()) ||
            customer.email?.toLowerCase().includes(search.toLowerCase())
          )
        : customers;
      
      return {
        data: filteredCustomers,
        total: filteredCustomers.length,
        page,
        limit: limitCount,
        totalPages: Math.ceil(filteredCustomers.length / limitCount)
      };
    } catch (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
  },

  // Create a new customer
  createCustomer: async (customerData) => {
    try {
      const id = await createDocument(customersCollection, customerData);
      return id;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      await updateDocument("customers", id, customerData);
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    try {
      await deleteDocument("customers", id);
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  },

  // Get customer by ID
  getCustomerById: async (id) => {
    try {
      return await getDocument("customers", id);
    } catch (error) {
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }
  }
};

// Invoice Management Functions
const invoiceService = {
  // Get all invoices with optional filtering
  getInvoices: async (options = {}) => {
    try {
      const { search = "", page = 1, limit: limitCount = 20, status, customerId } = options;
      
      let q = invoicesCollection;
      
      // Apply filters
      if (status) {
        q = query(q, where("status", "==", status));
      }
      
      if (customerId) {
        q = query(q, where("customerId", "==", customerId));
      }
      
      q = query(q, orderBy("createdAt", "desc"), limit(limitCount));
      
      const snapshot = await getDocs(q);
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Apply search filter
      const filteredInvoices = search 
        ? invoices.filter(invoice => 
            invoice.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
            invoice.customer?.name?.toLowerCase().includes(search.toLowerCase())
          )
        : invoices;
      
      return {
        data: filteredInvoices,
        total: filteredInvoices.length,
        page,
        limit: limitCount,
        totalPages: Math.ceil(filteredInvoices.length / limitCount)
      };
    } catch (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`);
    }
  },

  // Create a new invoice
  createInvoice: async (invoiceData) => {
    try {
      const id = await createDocument(invoicesCollection, invoiceData);
      return id;
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  },

  // Update invoice
  updateInvoice: async (id, invoiceData) => {
    try {
      await updateDocument("invoices", id, invoiceData);
    } catch (error) {
      throw new Error(`Failed to update invoice: ${error.message}`);
    }
  },

  // Delete invoice
  deleteInvoice: async (id) => {
    try {
      await deleteDocument("invoices", id);
    } catch (error) {
      throw new Error(`Failed to delete invoice: ${error.message}`);
    }
  },

  // Get invoice by ID
  getInvoiceById: async (id) => {
    try {
      return await getDocument("invoices", id);
    } catch (error) {
      throw new Error(`Failed to fetch invoice: ${error.message}`);
    }
  }
};

// Payment Management Functions
const paymentService = {
  // Get payments by invoice ID
  getPaymentsByInvoice: async (invoiceId) => {
    try {
      const q = query(paymentsCollection, where("invoiceId", "==", invoiceId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  },

  // Get all payments
  getAllPayments: async () => {
    try {
      const q = query(paymentsCollection, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  },

  // Create a new payment
  createPayment: async (paymentData) => {
    try {
      const id = await createDocument(paymentsCollection, paymentData);
      return id;
    } catch (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  },

  // Update payment
  updatePayment: async (id, paymentData) => {
    try {
      await updateDocument("payments", id, paymentData);
    } catch (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }
  },

  // Delete payment
  deletePayment: async (id) => {
    try {
      await deleteDocument("payments", id);
    } catch (error) {
      throw new Error(`Failed to delete payment: ${error.message}`);
    }
  }
};

// Product Management Functions
const productService = {
  // Get all products with optional filtering
  getProducts: async (options = {}) => {
    try {
      const { search = "", page = 1, limit: limitCount = 20, sortBy, sortDirection } = options;
      
      let q = productsCollection;
      
      if (sortBy) {
        q = query(q, orderBy(sortBy, sortDirection || "asc"));
      }
      
      q = query(q, limit(limitCount));
      
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Apply search filter
      const filteredProducts = search 
        ? products.filter(product => 
            product.name?.toLowerCase().includes(search.toLowerCase()) ||
            product.description?.toLowerCase().includes(search.toLowerCase())
          )
        : products;
      
      return {
        data: filteredProducts,
        total: filteredProducts.length,
        page,
        limit: limitCount,
        totalPages: Math.ceil(filteredProducts.length / limitCount)
      };
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // Create a new product
  createProduct: async (productData) => {
    try {
      const id = await createDocument(productsCollection, productData);
      return id;
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      await updateDocument("products", id, productData);
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      await deleteDocument("products", id);
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      return await getDocument("products", id);
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }
};

// Settings Management Functions
const settingsService = {
  // Get all settings
  getSettings: async () => {
    try {
      const snapshot = await getDocs(settingsCollection);
      const settings = {};
      snapshot.docs.forEach(doc => {
        settings[doc.id] = doc.data();
      });
      return settings;
    } catch (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }
  },

  // Update setting
  updateSetting: async (key, value, description) => {
    try {
      // Check if document exists first
      const docRef = doc(db, "settings", key);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Document exists, update it
        await updateDocument("settings", key, { value, description });
      } else {
        // Document doesn't exist, create it
        await createDocument(settingsCollection, { 
          id: key,
          value, 
          description,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      throw new Error(`Failed to update setting: ${error.message}`);
    }
  }
};

// Dashboard Statistics
const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      // Get all collections data with retry logic
      const [customersSnapshot, invoicesSnapshot, paymentsSnapshot] = await Promise.all([
        getDocs(customersCollection).catch(err => {
          return { docs: [] };
        }),
        getDocs(invoicesCollection).catch(err => {
          return { docs: [] };
        }),
        getDocs(paymentsCollection).catch(err => {
          return { docs: [] };
        })
      ]);

      const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const invoices = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate statistics with proper status handling
      const totalInvoices = invoices.length;
      
      // Calculate paid invoices (both by status and by paidAmount)
      const paidInvoices = invoices.filter(inv => {
        const isPaidByStatus = inv.status === 'Paid' || inv.status === 'paid';
        const invoiceAmount = parseFloat(inv.total || inv.amount || inv.totalAmount || 0);
        const paidAmount = parseFloat(inv.paidAmount || 0);
        return isPaidByStatus || paidAmount >= invoiceAmount;
      }).length;
      
      // Calculate overdue invoices first (unpaid and past due date)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const overdueInvoices = invoices.filter(inv => {
        const isDraft = inv.status === 'Draft' || inv.status === 'draft';
        const isPaidByStatus = inv.status === 'Paid' || inv.status === 'paid';
        const invoiceAmount = parseFloat(inv.total || inv.amount || inv.totalAmount || 0);
        const paidAmount = parseFloat(inv.paidAmount || 0);
        const isPaidByAmount = paidAmount >= invoiceAmount;
        
        if (isDraft || isPaidByStatus || isPaidByAmount) return false;
        
        if (inv.dueDate) {
          const dueDate = new Date(inv.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return today > dueDate;
        }
        return false;
      }).length;
      
      // Calculate unpaid invoices (not paid and not draft, excluding overdue)
      const unpaidInvoices = invoices.filter(inv => {
        const isDraft = inv.status === 'Draft' || inv.status === 'draft';
        const isPaidByStatus = inv.status === 'Paid' || inv.status === 'paid';
        const invoiceAmount = parseFloat(inv.total || inv.amount || inv.totalAmount || 0);
        const paidAmount = parseFloat(inv.paidAmount || 0);
        const isPaidByAmount = paidAmount >= invoiceAmount;
        
        if (isDraft || isPaidByStatus || isPaidByAmount) return false;
        
        // Check if it's overdue
        if (inv.dueDate) {
          const dueDate = new Date(inv.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (today > dueDate) return false; // Exclude overdue from unpaid
        }
        
        return true;
      }).length;
      
      // Calculate draft invoices
      const draftInvoices = invoices.filter(inv => 
        inv.status === 'Draft' || inv.status === 'draft'
      ).length;
      
      // Calculate total revenue (only from paid invoices)
      const totalRevenue = invoices
        .filter(inv => {
          const isPaidByStatus = inv.status === 'Paid' || inv.status === 'paid';
          const invoiceAmount = parseFloat(inv.total || inv.amount || inv.totalAmount || 0);
          const paidAmount = parseFloat(inv.paidAmount || 0);
          return isPaidByStatus || paidAmount >= invoiceAmount;
        })
        .reduce((sum, inv) => sum + (parseFloat(inv.total || inv.amount || inv.totalAmount || 0)), 0);
      const totalCustomers = customers.length;
      const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

      return {
        totalRevenue,
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        draftInvoices,
        totalCustomers,
        totalPayments,
        paymentRate
      };
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }
  }
};

// Export all services and utilities
export {
  customerService,
  invoiceService,
  paymentService,
  productService,
  settingsService,
  dashboardService,
  subscribeToCollection
};
