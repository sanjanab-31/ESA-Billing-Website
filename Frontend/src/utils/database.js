import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseClient';

// Collection references
const usersCollection = collection(db, 'users');
const customersCollection = collection(db, 'customers');
const invoicesCollection = collection(db, 'invoices');
const paymentsCollection = collection(db, 'payments');
const reportsCollection = collection(db, 'reports');
const settingsCollection = collection(db, 'settings');

// Generic CRUD operations
export const createDocument = async (collectionRef, data) => {
  const docRef = await addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateDocument = async (collectionName, id, data) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName, id) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Customer operations
export const createCustomer = async (data) => {
  return createDocument(customersCollection, {
    ...data,
    isActive: true,
  });
};

export const getCustomer = async (id) => {
  return getDocument('customers', id);
};

export const getCustomers = async (options = { page: 1, limit: 20 }) => {
  try {
    console.log('getCustomers called with options:', options);
    let q = query(customersCollection);

    // Apply filters
    if (options.search) {
      q = query(q, where('name', '>=', options.search), where('name', '<=', options.search + '\uf8ff'));
    }

    if (options.status) {
      q = query(q, where('isActive', '==', options.status === 'active'));
    }

    // Apply sorting - use a field that definitely exists
    const sortField = options.sortBy || 'name'; // Changed from 'createdAt' to 'name'
    const sortDirection = options.sortDirection || 'asc';
    q = query(q, orderBy(sortField, sortDirection));

    // Apply pagination
    q = query(q, limit(options.limit));

    console.log('Executing Firestore query...');
    const querySnapshot = await getDocs(q);
    console.log('Query executed successfully, got', querySnapshot.size, 'documents');
    
    const customers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count for pagination
    const totalSnapshot = await getDocs(query(customersCollection));
    const total = totalSnapshot.size;

    console.log('getCustomers result:', { customers: customers.length, total });

    return {
      data: customers,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const updateCustomer = async (id, data) => {
  return updateDocument('customers', id, data);
};

export const deleteCustomer = async (id) => {
  return deleteDocument('customers', id);
};

// Invoice operations
export const createInvoice = async (data) => {
  return createDocument(invoicesCollection, {
    ...data,
    status: 'draft',
  });
};

export const getInvoice = async (id) => {
  return getDocument('invoices', id);
};

export const getInvoices = async (options = { page: 1, limit: 20 }) => {
  try {
    let q = query(invoicesCollection);

    // Apply filters
    if (options.search) {
      q = query(q, where('invoiceNumber', '>=', options.search), where('invoiceNumber', '<=', options.search + '\uf8ff'));
    }

    if (options.status) {
      q = query(q, where('status', '==', options.status));
    }

    if (options.customerId) {
      q = query(q, where('customerId', '==', options.customerId));
    }

    // Apply sorting
    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortDirection || 'desc';
    q = query(q, orderBy(sortField, sortDirection));

    // Apply pagination
    q = query(q, limit(options.limit));

    const querySnapshot = await getDocs(q);
    const invoices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count for pagination
    const totalSnapshot = await getDocs(query(invoicesCollection));
    const total = totalSnapshot.size;

    return {
      data: invoices,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const updateInvoice = async (id, data) => {
  return updateDocument('invoices', id, data);
};

export const updateInvoiceStatus = async (id, status) => {
  return updateDocument('invoices', id, { status });
};

export const deleteInvoice = async (id) => {
  return deleteDocument('invoices', id);
};

// Payment operations
export const createPayment = async (data) => {
  return createDocument(paymentsCollection, data);
};

export const getPayment = async (id) => {
  return getDocument('payments', id);
};

export const getPaymentsByInvoice = async (invoiceId) => {
  try {
    const q = query(paymentsCollection, where('invoiceId', '==', invoiceId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

// Real-time listeners
export const subscribeToCollection = (collectionName, callback, options = {}) => {
  let q = query(collection(db, collectionName));

  if (options.where) {
    q = query(q, where(options.where.field, options.where.operator, options.where.value));
  }

  if (options.orderBy) {
    q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
  }

  if (options.limit) {
    q = query(q, limit(options.limit));
  }

  return onSnapshot(q, callback);
};

// Batch operations
export const batchUpdateInvoices = async (updates) => {
  const batch = writeBatch(db);

  updates.forEach(({ id, data }) => {
    const invoiceRef = doc(invoicesCollection, id);
    batch.update(invoiceRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

// Analytics helpers
export const getRevenueByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      invoicesCollection,
      where('status', '==', 'paid'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate))
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce((total, doc) => {
      return total + (doc.data().total || 0);
    }, 0);
  } catch (error) {
    console.error('Error calculating revenue:', error);
    return 0;
  }
};

export const getOutstandingAmount = async () => {
  try {
    const q = query(invoicesCollection, where('status', 'in', ['sent', 'overdue']));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce((total, doc) => {
      return total + (doc.data().total || 0);
    }, 0);
  } catch (error) {
    console.error('Error calculating outstanding amount:', error);
    return 0;
  }
};

// Dashboard analytics functions
export const getDashboardStats = async () => {
  try {
    const [invoicesSnapshot, customersSnapshot, paymentsSnapshot] = await Promise.all([
      getDocs(invoicesCollection),
      getDocs(customersCollection),
      getDocs(paymentsCollection)
    ]);

    const invoices = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const unpaidInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').length;
    const draftInvoices = invoices.filter(inv => inv.status === 'draft').length;

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;

    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalRevenue,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      draftInvoices,
      totalCustomers,
      activeCustomers,
      totalPayments,
      paymentRate: totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Product management functions
export const createProduct = async (data) => {
  return createDocument(collection(db, 'products'), {
    ...data,
    isActive: true,
  });
};

export const getProducts = async (options = { page: 1, limit: 20 }) => {
  try {
    console.log('getProducts called with options:', options);
    let q = query(collection(db, 'products'));

    if (options.search) {
      q = query(q, where('name', '>=', options.search), where('name', '<=', options.search + '\uf8ff'));
    }

    // Use 'name' field for sorting instead of 'createdAt'
    q = query(q, orderBy('name', 'asc'), limit(options.limit));

    console.log('Executing Firestore products query...');
    const querySnapshot = await getDocs(q);
    console.log('Products query executed successfully, got', querySnapshot.size, 'documents');
    
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalSnapshot = await getDocs(query(collection(db, 'products')));
    const total = totalSnapshot.size;

    console.log('getProducts result:', { products: products.length, total });

    return {
      data: products,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const updateProduct = async (id, data) => {
  return updateDocument('products', id, data);
};

export const deleteProduct = async (id) => {
  return deleteDocument('products', id);
};

// Settings functions
export const getSettings = async () => {
  const querySnapshot = await getDocs(settingsCollection);
  const settings = {};
  querySnapshot.docs.forEach(doc => {
    settings[doc.data().key] = doc.data().value;
  });
  return settings;
};

export const updateSetting = async (key, value, description) => {
  const existingDoc = await getDocs(query(settingsCollection, where('key', '==', key)));
  
  if (existingDoc.empty) {
    return createDocument(settingsCollection, { key, value, description });
  } else {
    const docId = existingDoc.docs[0].id;
    return updateDocument('settings', docId, { value, description });
  }
};
