// Main Firebase/Firestore exports
export { auth, db, storage, app } from './firebase/config.js';
export { authService } from './auth/authService.js';
export { 
  customerService,
  invoiceService, 
  paymentService,
  productService,
  settingsService,
  dashboardService
} from './firestore/services.js';
export {
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  batchWrite,
  customersCollection,
  invoicesCollection,
  paymentsCollection,
  reportsCollection,
  settingsCollection,
  usersCollection
} from './firestore/database.js';
