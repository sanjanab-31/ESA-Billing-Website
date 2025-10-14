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
} from "firebase/firestore";
import { db } from "../firebase/config.js";

// Collection references
const usersCollection = collection(db, "users");
const customersCollection = collection(db, "customers");
const invoicesCollection = collection(db, "invoices");
const paymentsCollection = collection(db, "payments");
const productsCollection = collection(db, "products");
const reportsCollection = collection(db, "reports");
const settingsCollection = collection(db, "settings");

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

// Collection subscription for real-time updates
export const subscribeToCollection = (collectionName, callback, options = {}) => {
  try {
    let q = collection(db, collectionName);
    
    if (options.where) {
      q = query(q, where(options.where.field, options.where.operator, options.where.value));
    }
    
    if (options.orderBy) {
      q = query(q, orderBy(options.orderBy, options.direction || 'asc'));
    }
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    return onSnapshot(q, callback, (error) => {
    });
  } catch (error) {
    return () => {};
  }
};

// Batch operations
export const batchWrite = async (operations) => {
  const batch = writeBatch(db);
  
  operations.forEach(operation => {
    const { type, collectionName, id, data } = operation;
    const docRef = doc(db, collectionName, id);
    
    switch (type) {
      case 'set':
        batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
        break;
      case 'update':
        batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
        break;
      case 'delete':
        batch.delete(docRef);
        break;
    }
  });
  
  await batch.commit();
};

// Export collection references and Firestore functions
export {
  usersCollection,
  customersCollection,
  invoicesCollection,
  paymentsCollection,
  productsCollection,
  reportsCollection,
  settingsCollection,
  db,
  query,
  where,
  orderBy,
  limit,
  getDocs
};
