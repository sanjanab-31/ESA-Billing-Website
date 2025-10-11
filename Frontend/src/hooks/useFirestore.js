import { useState, useEffect, useCallback } from 'react';
import {
  getDashboardStats,
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getInvoices,
  createInvoice,
  updateInvoice,
  getPaymentsByInvoice,
  createPayment,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSettings,
  updateSetting,
  subscribeToCollection
} from '../utils/database';

// Simple in-memory caches to keep data between navigations and provide instant UI
let customersCache = null;
let productsCache = null;
let invoicesCache = null;
let paymentsCache = {}; // keyed by invoiceId

// Dashboard Hook with real-time updates
export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Set up real-time listeners for collections that affect dashboard stats
    const unsubscribeInvoices = subscribeToCollection('invoices', (invoices) => {
      // Recalculate stats when invoices change
      fetchStats();
    });
    
    const unsubscribeCustomers = subscribeToCollection('customers', (customers) => {
      // Recalculate stats when customers change
      fetchStats();
    });
    
    const unsubscribePayments = subscribeToCollection('payments', (payments) => {
      // Recalculate stats when payments change
      fetchStats();
    });

    return () => {
      unsubscribeInvoices();
      unsubscribeCustomers();
      unsubscribePayments();
    };
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// Customer Management Hook
export const useCustomers = (options = {}) => {
  const { search = '', page = 1, limit = 20, status, sortBy, sortDirection } = options;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchCustomers = useCallback(async () => {
    try {
      // Only show loading if we don't have cached data
      if (!customersCache) setLoading(true);
      const result = await getCustomers({ search, page, limit, status, sortBy, sortDirection });
      setCustomers(result.data);
      customersCache = result.data;
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, status, sortBy, sortDirection]);

  const addCustomer = useCallback(async (data) => {
    // Optimistic update: add to local state immediately, rollback on failure
    let previous = null;
    const tempId = `temp-${Date.now()}`;
    const optimisticCustomer = { id: tempId, ...data };
    try {
      setCustomers(prev => {
        previous = prev;
        return [optimisticCustomer, ...prev];
      });

      const id = await createCustomer(data);

      // Replace temporary id with real id
      setCustomers(prev => prev.map(c => c.id === tempId ? { id, ...c } : c));

      return { success: true, id };
    } catch (err) {
      // rollback
      if (previous) setCustomers(previous);
      return { success: false, error: err.message };
    }
  }, [fetchCustomers]);

  const editCustomer = useCallback(async (id, data) => {
    // Optimistic update: update local state immediately, rollback on failure
    let previous = null;
    try {
      setCustomers(prev => {
        previous = prev;
        return prev.map(c => c.id === id ? { ...c, ...data } : c);
      });

      await updateCustomer(id, data);

      return { success: true };
    } catch (err) {
      // rollback
      if (previous) setCustomers(previous);
      return { success: false, error: err.message };
    }
  }, [fetchCustomers]);

  const removeCustomer = useCallback(async (id) => {
    // Optimistic update: remove from local state immediately, rollback on failure
    let previous = null;
    try {
      setCustomers(prev => {
        previous = prev;
        return prev.filter(c => c.id !== id);
      });

      await deleteCustomer(id);

      return { success: true };
    } catch (err) {
      // rollback
      if (previous) setCustomers(previous);
      return { success: false, error: err.message };
    }
  }, [fetchCustomers]);

  useEffect(() => {
    // load cached data instantly if available
    if (customersCache) {
      setCustomers(customersCache);
      setLoading(false);
    }
    fetchCustomers();

    // subscribe for realtime updates
    const unsub = subscribeToCollection('customers', (docs) => {
      // docs is a QuerySnapshot - map to data if provided by subscribeToCollection implementation
      try {
        const data = docs.docs ? docs.docs.map(d => ({ id: d.id, ...d.data() })) : docs;
        customersCache = data;
        setCustomers(data);
      } catch (e) {
        // fallback: ignore
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, [fetchCustomers]);

  return { 
    customers, 
    loading, 
    error, 
    pagination,
    addCustomer, 
    editCustomer, 
    removeCustomer, 
    refetch: fetchCustomers 
  };
};

// Invoice Management Hook
export const useInvoices = (options = {}) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const { search: invoiceSearch = '', page: invoicePage = 1, limit: invoiceLimit = 20, status: invoiceStatus, customerId } = options;

  const fetchInvoices = useCallback(async () => {
    try {
      if (!invoicesCache) setLoading(true);
      const result = await getInvoices({ search: invoiceSearch, page: invoicePage, limit: invoiceLimit, status: invoiceStatus, customerId });
      setInvoices(result.data);
      invoicesCache = result.data;
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [invoiceSearch, invoicePage, invoiceLimit, invoiceStatus, customerId]);

  const addInvoice = useCallback(async (data) => {
    // Optimistic update for invoices
    let previous = null;
    const tempId = `temp-inv-${Date.now()}`;
    const optimisticInvoice = { id: tempId, ...data };
    try {
      setInvoices(prev => {
        previous = prev;
        return [optimisticInvoice, ...prev];
      });

      const id = await createInvoice(data);

      // replace temp id
      setInvoices(prev => prev.map(inv => inv.id === tempId ? { id, ...inv } : inv));
      invoicesCache = invoicesCache ? [ { id, ...data }, ...invoicesCache ] : null;

      return { success: true, id };
    } catch (err) {
      if (previous) setInvoices(previous);
      return { success: false, error: err.message };
    }
  }, [fetchInvoices]);

  const editInvoice = useCallback(async (id, data) => {
    // Optimistic update for invoice edit
    let previous = null;
    try {
      setInvoices(prev => {
        previous = prev;
        return prev.map(inv => inv.id === id ? { ...inv, ...data } : inv);
      });

      await updateInvoice(id, data);
      // update cache if present
      if (invoicesCache) invoicesCache = invoicesCache.map(inv => inv.id === id ? { ...inv, ...data } : inv);

      return { success: true };
    } catch (err) {
      if (previous) setInvoices(previous);
      return { success: false, error: err.message };
    }
  }, [fetchInvoices]);

  const removeInvoice = useCallback(async (id) => {
    // Optimistic remove from state
    let previous = null;
    try {
      setInvoices(prev => {
        previous = prev;
        return prev.filter(inv => inv.id !== id);
      });

      // call backend delete
      if (typeof deleteInvoice === 'function') {
        await deleteInvoice(id);
      } else {
        // If deleteInvoice not available, fallback to updating status to 'deleted'
        await updateInvoice(id, { status: 'deleted' });
      }

      // update cache
      if (invoicesCache) invoicesCache = invoicesCache.filter(inv => inv.id !== id);

      return { success: true };
    } catch (err) {
      if (previous) setInvoices(previous);
      return { success: false, error: err.message };
    }
  }, [fetchInvoices]);

  useEffect(() => {
    if (invoicesCache) {
      setInvoices(invoicesCache);
      setLoading(false);
    }
    fetchInvoices();

    const unsub = subscribeToCollection('invoices', (docs) => {
      try {
        const data = docs.docs ? docs.docs.map(d => ({ id: d.id, ...d.data() })) : docs;
        invoicesCache = data;
        setInvoices(data);
      } catch (e) {}
    });

    return () => { if (unsub) unsub(); };
  }, [fetchInvoices]);

  return { 
    invoices, 
    loading, 
    error, 
    pagination,
    addInvoice, 
    editInvoice, 
    removeInvoice,
    refetch: fetchInvoices 
  };
};

// Payment Management Hook
export const usePayments = (invoiceId) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    if (!invoiceId) return;
    
    try {
      if (!paymentsCache[invoiceId]) setLoading(true);
      const data = await getPaymentsByInvoice(invoiceId);
      setPayments(data);
      paymentsCache[invoiceId] = data;
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  const addPayment = useCallback(async (data) => {
    try {
      const id = await createPayment(data);
      await fetchPayments(); // Refresh the list
      return { success: true, id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchPayments]);

  useEffect(() => {
    if (invoiceId && paymentsCache[invoiceId]) {
      setPayments(paymentsCache[invoiceId]);
      setLoading(false);
    }
    fetchPayments();

    // subscribe to payments for this invoice
    if (invoiceId) {
      const unsub = subscribeToCollection('payments', (docs) => {
        try {
          const data = docs.docs ? docs.docs.map(d => ({ id: d.id, ...d.data() })) : docs;
          paymentsCache[invoiceId] = data.filter(p => p.invoiceId === invoiceId);
          setPayments(paymentsCache[invoiceId]);
        } catch (e) {}
      }, { where: { field: 'invoiceId', operator: '==', value: invoiceId } });

      return () => { if (unsub) unsub(); };
    }
  }, [fetchPayments]);

  return { 
    payments, 
    loading, 
    error, 
    addPayment, 
    refetch: fetchPayments 
  };
};

// Global payments hook (all payments) for dashboards and payments page
export const useAllPayments = () => {
  const [payments, setPayments] = useState(paymentsCache || []);
  const [loading, setLoading] = useState(!paymentsCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    // set cached
    if (paymentsCache) {
      setPayments(paymentsCache);
      setLoading(false);
    }

    const unsub = subscribeToCollection('payments', (docs) => {
      try {
        const data = docs.docs ? docs.docs.map(d => ({ id: d.id, ...d.data() })) : docs;
        paymentsCache = data;
        setPayments(data);
      } catch (e) {
        setError(e.message || 'Error parsing payments');
      }
    });

    return () => { if (unsub) unsub(); };
  }, []);

  return { payments, loading, error };
};

// Product Management Hook
export const useProducts = (options = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const { search: productSearch = '', page: productPage = 1, limit: productLimit = 20, sortBy: productSortBy, sortDirection: productSortDirection } = options;

  const fetchProducts = useCallback(async () => {
    try {
      if (!productsCache) setLoading(true);
      const result = await getProducts({ search: productSearch, page: productPage, limit: productLimit, sortBy: productSortBy, sortDirection: productSortDirection });
      setProducts(result.data);
      productsCache = result.data;
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productSearch, productPage, productLimit, productSortBy, productSortDirection]);

  const addProduct = useCallback(async (data) => {
    // Optimistic update for products
    let previous = null;
    const tempId = `temp-prod-${Date.now()}`;
    const optimisticProduct = { id: tempId, ...data };
    try {
      setProducts(prev => {
        previous = prev;
        return [optimisticProduct, ...prev];
      });

      const id = await createProduct(data);

      setProducts(prev => prev.map(p => p.id === tempId ? { id, ...p } : p));

      return { success: true, id };
    } catch (err) {
      if (previous) setProducts(previous);
      return { success: false, error: err.message };
    }
  }, [fetchProducts]);

  const editProduct = useCallback(async (id, data) => {
    let previous = null;
    try {
      setProducts(prev => {
        previous = prev;
        return prev.map(p => p.id === id ? { ...p, ...data } : p);
      });

      await updateProduct(id, data);
      return { success: true };
    } catch (err) {
      if (previous) setProducts(previous);
      return { success: false, error: err.message };
    }
  }, [fetchProducts]);

  const removeProduct = useCallback(async (id) => {
    let previous = null;
    try {
      setProducts(prev => {
        previous = prev;
        return prev.filter(p => p.id !== id);
      });

      await deleteProduct(id);
      return { success: true };
    } catch (err) {
      if (previous) setProducts(previous);
      return { success: false, error: err.message };
    }
  }, [fetchProducts]);

  useEffect(() => {
    if (productsCache) {
      setProducts(productsCache);
      setLoading(false);
    }
    fetchProducts();

    const unsub = subscribeToCollection('products', (docs) => {
      try {
        const data = docs.docs ? docs.docs.map(d => ({ id: d.id, ...d.data() })) : docs;
        productsCache = data;
        setProducts(data);
      } catch (e) {}
    });

    return () => { if (unsub) unsub(); };
  }, [fetchProducts]);

  return { 
    products, 
    loading, 
    error, 
    pagination,
    addProduct, 
    editProduct, 
    removeProduct, 
    refetch: fetchProducts 
  };
};

// Settings Hook
export const useSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (key, value, description) => {
    try {
      await updateSetting(key, value, description);
      await fetchSettings(); // Refresh the settings
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { 
    settings, 
    loading, 
    error, 
    updateSettings, 
    refetch: fetchSettings 
  };
};
