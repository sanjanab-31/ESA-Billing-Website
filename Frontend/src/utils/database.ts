import { onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseClient';
import type {
  User,
  Customer,
  Invoice,
  InvoiceItem,
  Payment,
  Report,
  Setting,
  CreateCustomerData,
  CreateInvoiceData,
  CreatePaymentData,
  PaginationOptions,
  PaginatedResponse,
  FilterOptions,
  SortOptions,
  (data: T[]) => void,
  options?: { limit?: number; orderBy?: string; direction?: 'asc' | 'desc' }
): () => void
} from '../types/database';
