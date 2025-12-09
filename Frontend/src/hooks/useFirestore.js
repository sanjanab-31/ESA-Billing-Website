import { useState, useEffect, useCallback } from "react";

// LocalStorage helpers
const load = (key, def) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// Shared list view helper (filter/search/paginate basic)
const applyListView = (items, { search = "", page = 1, limit = 20, sortBy, sortDirection = "asc" }) => {
  let data = Array.isArray(items) ? [...items] : [];
  if (search) {
    const s = search.toLowerCase();
    data = data.filter((it) => JSON.stringify(it).toLowerCase().includes(s));
  }
  if (sortBy) {
    data.sort((a, b) => {
      const av = a?.[sortBy];
      const bv = b?.[sortBy];
      if (av === bv) return 0;
      if (av == null) return sortDirection === "asc" ? -1 : 1;
      if (bv == null) return sortDirection === "asc" ? 1 : -1;
      return sortDirection === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / (limit || 20)));
  const start = (Math.max(1, page) - 1) * (limit || 20);
  const end = start + (limit || 20);
  const pageData = data.slice(start, end);
  return {
    data: pageData,
    pagination: { total, page, limit, totalPages },
  };
};

// Keys
const K = {
  customers: "stub_customers",
  products: "stub_products",
  invoices: "stub_invoices",
  payments: "stub_payments",
  settings: "stub_settings",
};

// Dashboard (no DB). Keep minimal safe structure
export const useDashboard = () => {
  const [stats] = useState({});
  const refetch = useCallback(() => {}, []);
  return { stats, error: null, refetch };
};

// Customers
export const useCustomers = (options = {}) => {
  const [all, setAll] = useState(() => load(K.customers, []));
  const { data, pagination } = applyListView(all, options);
  const [view, setView] = useState(data);
  const [pageInfo, setPageInfo] = useState(pagination);

  useEffect(() => {
    const res = applyListView(all, options);
    setView(res.data);
    setPageInfo(res.pagination);
  }, [all, options.search, options.page, options.limit, options.sortBy, options.sortDirection, options.status]);

  const addCustomer = useCallback(async (payload) => {
    const id = `local-cust-${Date.now()}`;
    const next = [{ id, ...payload }, ...all];
    setAll(next);
    save(K.customers, next);
    return { success: true, id };
  }, [all]);

  const editCustomer = useCallback(async (id, patch) => {
    const next = all.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setAll(next);
    save(K.customers, next);
    return { success: true };
  }, [all]);

  const removeCustomer = useCallback(async (id) => {
    const next = all.filter((c) => c.id !== id);
    setAll(next);
    save(K.customers, next);
    return { success: true };
  }, [all]);

  const refetch = useCallback(() => {
    const latest = load(K.customers, []);
    setAll(latest);
  }, []);

  return { customers: view, loading: false, error: null, pagination: pageInfo, addCustomer, editCustomer, removeCustomer, refetch };
};

// Invoices
export const useInvoices = (options = {}) => {
  const [all, setAll] = useState(() => load(K.invoices, []));
  const { data, pagination } = applyListView(all, options);
  const [view, setView] = useState(data);
  const [pageInfo, setPageInfo] = useState(pagination);

  useEffect(() => {
    const res = applyListView(all, options);
    setView(res.data);
    setPageInfo(res.pagination);
  }, [all, options.search, options.page, options.limit, options.sortBy, options.sortDirection, options.status, options.customerId]);

  const addInvoice = useCallback(async (payload) => {
    const id = `local-inv-${Date.now()}`;
    const next = [{ id, ...payload }, ...all];
    setAll(next);
    save(K.invoices, next);
    return { success: true, id };
  }, [all]);

  const editInvoice = useCallback(async (id, patch) => {
    const next = all.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setAll(next);
    save(K.invoices, next);
    return { success: true };
  }, [all]);

  const removeInvoice = useCallback(async (id) => {
    const next = all.filter((i) => i.id !== id);
    setAll(next);
    save(K.invoices, next);
    return { success: true };
  }, [all]);

  const refetch = useCallback(() => {
    const latest = load(K.invoices, []);
    setAll(latest);
  }, []);

  return { invoices: view, loading: false, error: null, pagination: pageInfo, addInvoice, editInvoice, removeInvoice, refetch };
};

// Payments
export const usePayments = (invoiceId) => {
  const [all, setAll] = useState(() => load(K.payments, []));
  const [payments, setPayments] = useState(() => (invoiceId ? all.filter((p) => p.invoiceId === invoiceId) : all));

  useEffect(() => {
    const latest = load(K.payments, []);
    setAll(latest);
    setPayments(invoiceId ? latest.filter((p) => p.invoiceId === invoiceId) : latest);
  }, [invoiceId]);

  const addPayment = useCallback(async (payload) => {
    const id = `local-pay-${Date.now()}`;
    const item = { id, ...payload };
    const next = [item, ...all];
    setAll(next);
    save(K.payments, next);
    if (!invoiceId || payload.invoiceId === invoiceId) {
      setPayments((prev) => [item, ...prev]);
    }
    return { success: true, id };
  }, [all, invoiceId]);

  const refetch = useCallback(() => {
    const latest = load(K.payments, []);
    setAll(latest);
    setPayments(invoiceId ? latest.filter((p) => p.invoiceId === invoiceId) : latest);
  }, [invoiceId]);

  return { payments, error: null, addPayment, refetch };
};

export const useAllPayments = () => {
  const [payments, setPayments] = useState(() => load(K.payments, []));
  useEffect(() => {
    setPayments(load(K.payments, []));
  }, []);
  return { payments, error: null };
};

// Products
export const useProducts = (options = {}) => {
  const [all, setAll] = useState(() => load(K.products, []));
  const { data, pagination } = applyListView(all, options);
  const [view, setView] = useState(data);
  const [pageInfo, setPageInfo] = useState(pagination);

  useEffect(() => {
    const res = applyListView(all, options);
    setView(res.data);
    setPageInfo(res.pagination);
  }, [all, options.search, options.page, options.limit, options.sortBy, options.sortDirection]);

  const addProduct = useCallback(async (payload) => {
    const id = `local-prod-${Date.now()}`;
    const next = [{ id, ...payload }, ...all];
    setAll(next);
    save(K.products, next);
    return { success: true, id };
  }, [all]);

  const editProduct = useCallback(async (id, patch) => {
    const next = all.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setAll(next);
    save(K.products, next);
    return { success: true };
  }, [all]);

  const removeProduct = useCallback(async (id) => {
    const next = all.filter((p) => p.id !== id);
    setAll(next);
    save(K.products, next);
    return { success: true };
  }, [all]);

  const refetch = useCallback(() => {
    const latest = load(K.products, []);
    setAll(latest);
  }, []);

  return { products: view, loading: false, error: null, pagination: pageInfo, addProduct, editProduct, removeProduct, refetch };
};

// Settings
export const useSettings = () => {
  const [settings, setSettings] = useState(() => load(K.settings, {}));
  const updateSettings = useCallback(async (key, value, description) => {
    const next = { ...settings, [key]: { value, description } };
    setSettings(next);
    save(K.settings, next);
    return { success: true };
  }, [settings]);
  const refetch = useCallback(() => {
    setSettings(load(K.settings, {}));
  }, []);
  return { settings, error: null, updateSettings, refetch };
};
/*
import { useState, useEffect, useCallback, useRef } from "react";
// Firestore imports removed - database functionality disabled
// import {
//   dashboardService,
//   customerService,
//   invoiceService,
//   paymentService,
//   productService,
//   settingsService,
//   subscribeToCollection,
// } from "../lib/firestore/services";

// Helper to compare options
const areOptionsEqual = (opt1, opt2) => {
  return JSON.stringify(opt1) === JSON.stringify(opt2);
};

// Enhanced caches to store data keyed by options
// Structure: { data: any, options: object, pagination: object }
let customersCache = null;
let productsCache = null;
let invoicesCache = null;
let paymentsCache = {}; // Keyed by invoiceId, or 'all' for useAllPayments
let settingsCache = null;
let dashboardStatsCache = null;

// Dashboard Hook with real-time updates and instant cache loading
export const useDashboard = () => {
  // CHANGED: Initialize with cached data for instant display
  const [stats, setStats] = useState(dashboardStatsCache);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await dashboardService.getDashboardStats();
      setStats(data);
      dashboardStatsCache = data; // ADDED: Update cache
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    // Only fetch if no cached stats, otherwise fetch in background
    if (!stats) fetchStats();

    // Set up real-time listeners for collections that affect dashboard stats
    const unsubscribeInvoices = subscribeToCollection(
      "invoices",
      () => {
        // Recalculate stats when invoices change
        fetchStats();
      }
    );

    const unsubscribeCustomers = subscribeToCollection(
      "customers",
      () => {
        // Recalculate stats when customers change
        fetchStats();
      }
    );

    const unsubscribePayments = subscribeToCollection(
      "payments",
      () => {
        // Recalculate stats when payments change
        fetchStats();
      }
    );

    return () => {
      unsubscribeInvoices();
      unsubscribeCustomers();
      unsubscribePayments();
    };
  }, [fetchStats, stats]); // Added stats to dependency array to prevent re-fetching if already cached

  return { stats, error, refetch: fetchStats };
};


// Customer Management Hook
export const useCustomers = (options = {}) => {
  const {
    search = "",
    page = 1,
    limit = 20,
    status,
    sortBy,
    sortDirection,
  } = options;

  const currentOptions = { search, page, limit, status, sortBy, sortDirection };
  // Check if cache matches current options
  const hasValidCache = customersCache && areOptionsEqual(customersCache.options, currentOptions);

  const [customers, setCustomers] = useState(hasValidCache ? customersCache.data : []);
  const [loading, setLoading] = useState(!hasValidCache);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(hasValidCache ? customersCache.pagination : null);

  const fetchCustomers = useCallback(async (forceLoading = false) => {
    if (forceLoading) setLoading(true);

    try {
      const result = await customerService.getCustomers({
        search,
        page,
        limit,
        status,
        sortBy,
        sortDirection,
      });

      setCustomers(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });

      // Update cache
      customersCache = {
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        options: currentOptions
      };

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, status, sortBy, sortDirection]);

  // CRUD operations...
  const addCustomer = useCallback(async (data) => {
    let previous = null;
    const tempId = `temp-${Date.now()}`;
    const optimisticCustomer = { id: tempId, ...data };
    try {
      setCustomers((prev) => {
        previous = prev;
        return [optimisticCustomer, ...prev];
      });
      const id = await customerService.createCustomer(data);
      setCustomers((prev) => prev.map((c) => (c.id === tempId ? { id, ...c } : c)));
      return { success: true, id };
    } catch (err) {
      if (previous) setCustomers(previous);
      return { success: false, error: err.message };
    }
  }, []);

  const editCustomer = useCallback(async (id, data) => {
    let previous = null;
    try {
      setCustomers((prev) => {
        previous = prev;
        return prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      });
      await customerService.updateCustomer(id, data);
      return { success: true };
    } catch (err) {
      if (previous) setCustomers(previous);
      return { success: false, error: err.message };
    }
  }, []);

  const removeCustomer = useCallback(async (id) => {
    let previous = null;
    try {
      setCustomers((prev) => {
        previous = prev;
        return prev.filter((c) => c.id !== id);
      });
      await customerService.deleteCustomer(id);
      return { success: true };
    } catch (err) {
      if (previous) setCustomers(previous);
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    // Only fetch if we didn't have valid cache, or if we want to refresh in background
    // If we had valid cache, we already set state, so just fetch in background without loading spinner
    fetchCustomers(!hasValidCache);

    const unsub = subscribeToCollection("customers", (docs) => {
      // Real-time updates logic could be improved to respect pagination/filtering
      // For now, simple update if data changes
      try {
        // This is a simplified update, ideally we should re-run the full query or merge
        // But re-running fetchCustomers is safer to keep consistency
        fetchCustomers(false);
      } catch (e) { }
    });

    return () => {
      if (unsub) unsub();
    };
  }, [fetchCustomers, hasValidCache]); // hasValidCache is derived from options which are in dependency of fetchCustomers

  return { customers, loading, error, pagination, addCustomer, editCustomer, removeCustomer, refetch: () => fetchCustomers(true) };
};

// Invoice Management Hook
export const useInvoices = (options = {}) => {
  const {
    search: invoiceSearch = "",
    page: invoicePage = 1,
    limit: invoiceLimit = 20,
    status: invoiceStatus,
    customerId,
    sortBy,
    sortDirection,
  } = options;

  const currentOptions = { invoiceSearch, invoicePage, invoiceLimit, invoiceStatus, customerId, sortBy, sortDirection };
  const hasValidCache = invoicesCache && areOptionsEqual(invoicesCache.options, currentOptions);

  const [invoices, setInvoices] = useState(hasValidCache ? invoicesCache.data : []);
  const [loading, setLoading] = useState(!hasValidCache);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(hasValidCache ? invoicesCache.pagination : null);

  const fetchInvoices = useCallback(async (forceLoading = false) => {
    if (forceLoading) setLoading(true);
    try {
      const result = await invoiceService.getInvoices({
        search: invoiceSearch,
        page: invoicePage,
        limit: invoiceLimit,
        status: invoiceStatus,
        customerId,
        sortBy,
        sortDirection,
      });

      setInvoices(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });

      invoicesCache = {
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        options: currentOptions
      };

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [invoiceSearch, invoicePage, invoiceLimit, invoiceStatus, customerId, sortBy, sortDirection]);

  // CRUD operations...
  const addInvoice = useCallback(async (data) => {
    let previous = null;
    const tempId = `temp-inv-${Date.now()}`;
    const optimisticInvoice = { id: tempId, ...data };
    try {
      setInvoices((prev) => {
        previous = prev;
        return [optimisticInvoice, ...prev];
      });
      const id = await invoiceService.createInvoice(data);
      setInvoices((prev) => prev.map((inv) => (inv.id === tempId ? { id, ...inv } : inv)));
      return { success: true, id };
    } catch (err) {
      if (previous) setInvoices(previous);
      return { success: false, error: err.message };
    }
  }, []);

  const editInvoice = useCallback(async (id, data) => {
    let previous = null;
    try {
      setInvoices((prev) => {
        previous = prev;
        return prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv));
      });
      await invoiceService.updateInvoice(id, data);
      return { success: true };
    } catch (err) {
      if (previous) setInvoices(previous);
      return { success: false, error: err.message };
    }
  }, []);

  const removeInvoice = useCallback(async (id) => {
    let previous = null;
    try {
      setInvoices((prev) => {
        previous = prev;
        return prev.filter((inv) => inv.id !== id);
      });
      await invoiceService.deleteInvoice(id);
      return { success: true };
    } catch (err) {
      if (previous) setInvoices(previous);
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchInvoices(!hasValidCache);

    const subscriptionOptions = {};
    if (sortBy) {
      subscriptionOptions.orderBy = sortBy;
      subscriptionOptions.direction = sortDirection || 'asc';
    }

    const unsub = subscribeToCollection("invoices", (docs) => {
      // For real-time updates, we should ideally re-fetch or carefully merge
      // Re-fetching ensures consistency with filters/pagination
      fetchInvoices(false);
    }, subscriptionOptions);

    return () => {
      if (unsub) unsub();
    };
  }, [fetchInvoices, hasValidCache]);

  return { invoices, loading, error, pagination, addInvoice, editInvoice, removeInvoice, refetch: () => fetchInvoices(true) };
};

// Payment Management Hook
export const usePayments = (invoiceId) => {
  const hasValidCache = invoiceId && paymentsCache[invoiceId];
  const [payments, setPayments] = useState(hasValidCache ? paymentsCache[invoiceId] : []);
  const [error, setError] = useState(null);

  const fetchPayments = useCallback(async () => {
    if (!invoiceId) return;

    try {
      const data = await paymentService.getPaymentsByInvoice(invoiceId);
      setPayments(data);
      paymentsCache[invoiceId] = data;
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
    }
  }, [invoiceId]);

  const addPayment = useCallback(
    async (data) => {
      try {
        const id = await paymentService.createPayment(data);
        await fetchPayments(); // Refresh the list
        return { success: true, id };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [fetchPayments]
  );

  useEffect(() => {
    fetchPayments();

    // subscribe to payments for this invoice
    if (invoiceId) {
      const unsub = subscribeToCollection(
        "payments",
        () => {
          fetchPayments();
        },
        { where: { field: "invoiceId", operator: "==", value: invoiceId } }
      );

      return () => {
        if (unsub) unsub();
      };
    }
  }, [fetchPayments, invoiceId]);

  return {
    payments,
    error,
    addPayment,
    refetch: fetchPayments,
  };
};

// Global payments hook (all payments) for dashboards and payments page
export const useAllPayments = () => {
  const [payments, setPayments] = useState(paymentsCache['all'] || []);
  const [error, setError] = useState(null);

  useEffect(() => {
    // set cached
    if (paymentsCache['all']) {
      setPayments(paymentsCache['all']);
    }

    const unsub = subscribeToCollection("payments", (docs) => {
      try {
        const data = docs.docs
          ? docs.docs.map((d) => ({ id: d.id, ...d.data() }))
          : docs;
        paymentsCache['all'] = data;
        setPayments(data);
      } catch (e) {
        setError(e.message || "Error parsing payments");
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return { payments, error };
};

// Product Management Hook
export const useProducts = (options = {}) => {
  const {
    search: productSearch = "",
    page: productPage = 1,
    limit: productLimit = 20,
    sortBy: productSortBy,
    sortDirection: productSortDirection,
  } = options;

  const currentOptions = { productSearch, productPage, productLimit, productSortBy, productSortDirection };
  const hasValidCache = productsCache && areOptionsEqual(productsCache.options, currentOptions);

  const [products, setProducts] = useState(hasValidCache ? productsCache.data : []);
  const [loading, setLoading] = useState(!hasValidCache);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(hasValidCache ? productsCache.pagination : null);

  const fetchProducts = useCallback(async (forceLoading = false) => {
    if (forceLoading) setLoading(true);
    try {
      const result = await productService.getProducts({
        search: productSearch,
        page: productPage,
        limit: productLimit,
        sortBy: productSortBy,
        sortDirection: productSortDirection,
      });
      setProducts(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });

      productsCache = {
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
        options: currentOptions
      };

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productSearch, productPage, productLimit, productSortBy, productSortDirection]);

  // CRUD operations...
  const addProduct = useCallback(async (data) => {
    let previous = null;
    const tempId = `temp-prod-${Date.now()}`;
    const optimisticProduct = { id: tempId, ...data };
    try {
      setProducts((prev) => {
        previous = prev;
        return [optimisticProduct, ...prev];
      });
      const id = await productService.createProduct(data);
      setProducts((prev) => prev.map((p) => (p.id === tempId ? { id, ...p } : p)));
      return { success: true, id };
    } catch (err) {
      if (previous) setProducts(previous);
      return { success: false, error: err.message };
    }
  }, []);

  const editProduct = useCallback(async (id, data) => {
    let previous = null;
    try {
      setProducts((prev) => {
        previous = prev;
        return prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      });
      await productService.updateProduct(id, data);
      return { success: true };
    } catch (err) {
      if (previous) setProducts(previous);
      return { success: false, error: err.message };
    }
  }, []);

  const removeProduct = useCallback(async (id) => {
    let previous = null;
    try {
      setProducts((prev) => {
        previous = prev;
        return prev.filter((p) => p.id !== id);
      });
      await productService.deleteProduct(id);
      return { success: true };
    } catch (err) {
      if (previous) setProducts(previous);
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchProducts(!hasValidCache);
    const unsub = subscribeToCollection("products", () => fetchProducts(false));
    return () => { if (unsub) unsub(); };
  }, [fetchProducts, hasValidCache]);

  return { products, loading, error, pagination, addProduct, editProduct, removeProduct, refetch: () => fetchProducts(true) };
};

// Settings Hook
export const useSettings = () => {
  const [settings, setSettings] = useState(settingsCache || {});
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
      settingsCache = data;
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
    }
  }, []);

  const updateSettings = useCallback(
    async (key, value, description) => {
      try {
        await settingsService.updateSetting(key, value, description);
        await fetchSettings(); // Refresh the settings
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [fetchSettings]
  );

  useEffect(() => {
    if (!settingsCache) fetchSettings();

    // Subscribe to real-time updates for settings
    const unsubscribeSettings = subscribeToCollection("settings", (docs) => {
      try {
        const settingsData = {};
        if (docs.docs) {
          docs.docs.forEach(doc => {
            settingsData[doc.id] = doc.data();
          });
        } else {
          // Handle case where docs is already processed data
          Object.keys(docs).forEach(key => {
            settingsData[key] = docs[key];
          });
        }
        settingsCache = settingsData;
        setSettings(settingsData);
      } catch (e) {
      }
    });

    return () => {
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, [fetchSettings, settingsCache]);

  return {
    settings,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
};

*/
