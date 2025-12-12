import { useState, useEffect, useCallback, useMemo } from "react";

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
  } catch { }
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
      if (sortDirection === "asc") {
        return av > bv ? 1 : -1;
      }
      return av < bv ? 1 : -1;
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

// Financial Year Helper
const isInCurrentFY = (dateInput) => {
  if (!dateInput) return false;

  // Handle Firestore timestamp or string
  let date;
  if (dateInput && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return false;

  // FY: April 1, 2025 to March 31, 2026
  const start = new Date("2025-04-01T00:00:00");
  const end = new Date("2026-03-31T23:59:59");

  return date >= start && date <= end;
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
  const refetch = useCallback(() => { }, []);
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

  return { customers: view, allCustomers: all, loading: false, error: null, pagination: pageInfo, addCustomer, editCustomer, removeCustomer, refetch };
};

// Invoices
export const useInvoices = (options = {}) => {
  const [all, setAll] = useState(() => load(K.invoices, []));

  // Filter all invoices by FY first
  const fyInvoices = useMemo(() => {
    return all.filter(inv => isInCurrentFY(inv.invoiceDate || inv.createdAt));
  }, [all]);

  const filtered = useMemo(() => {
    let res = fyInvoices;

    // Status Filtering
    if (options.status) {
      const status = options.status;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      res = res.filter(inv => {
        const s = (inv.status || "").toLowerCase();

        if (status === "Paid") return s === "paid";
        if (status === "Draft") return s === "draft";

        // Overdue: Not paid/draft AND due date passed
        if (status === "Overdue") {
          const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
          if (dueDate) dueDate.setHours(0, 0, 0, 0);
          return s !== "paid" && s !== "draft" && dueDate && today > dueDate;
        }

        // Unpaid: Not paid/draft AND NOT overdue (to keep tabs distinct)
        if (status === "Unpaid") {
          const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
          if (dueDate) dueDate.setHours(0, 0, 0, 0);
          const isOverdue = dueDate && today > dueDate;
          return s !== "paid" && s !== "draft" && !isOverdue;
        }

        return s === status.toLowerCase();
      });
    }

    // Customer Filtering
    if (options.customerId) {
      res = res.filter(inv => inv.clientId === options.customerId || (inv.client && inv.client.id === options.customerId));
    }

    return res;
  }, [all, options.status, options.customerId]);

  const { data, pagination } = applyListView(filtered, options);
  const [view, setView] = useState(data);
  const [pageInfo, setPageInfo] = useState(pagination);

  useEffect(() => {
    const res = applyListView(filtered, options);
    setView(res.data);
    setPageInfo(res.pagination);
  }, [filtered, options.search, options.page, options.limit, options.sortBy, options.sortDirection]);

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

  return { invoices: view, allInvoices: fyInvoices, loading: false, error: null, pagination: pageInfo, addInvoice, editInvoice, removeInvoice, refetch };
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
  const [payments, setPayments] = useState(() => {
    const raw = load(K.payments, []);
    return raw.filter(p => isInCurrentFY(p.paymentDate || p.createdAt));
  });

  const refetch = useCallback(() => {
    const raw = load(K.payments, []);
    setPayments(raw.filter(p => isInCurrentFY(p.paymentDate || p.createdAt)));
  }, []);

  useEffect(() => {
    // Initial load handled by useState lazy initializer, but if we want to sync on mount again:
    const raw = load(K.payments, []);
    setPayments(raw.filter(p => isInCurrentFY(p.paymentDate || p.createdAt)));
  }, []);

  return { payments, error: null, refetch };
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

  return { products: view, allProducts: all, loading: false, error: null, pagination: pageInfo, addProduct, editProduct, removeProduct, refetch };
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

