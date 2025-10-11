// Database Types for ESA Billing Website

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  company?: string;
  taxId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: Customer;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discount?: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  paymentDate: Date;
  reference?: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'revenue' | 'outstanding' | 'customer_summary' | 'payment_summary' | 'custom';
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any; // Flexible data structure for different report types
  generatedAt: Date;
  generatedBy: string;
}

export interface Setting {
  id: string;
  key: string;
  value: any;
  description?: string;
  updatedAt: Date;
  updatedBy: string;
}

// Form types for creating/updating entities
export interface CreateCustomerData {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  company?: string;
  taxId?: string;
  notes?: string;
}

export interface CreateInvoiceData {
  customerId: string;
  items: Omit<InvoiceItem, 'id' | 'total' | 'taxAmount'>[];
  discount?: number;
  dueDate: Date;
  notes?: string;
  terms?: string;
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  paymentMethod: Payment['paymentMethod'];
  paymentDate: Date;
  reference?: string;
  notes?: string;
}

// Utility types
export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
