import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Download } from 'lucide-react';

const InvoiceManagement = () => {
  const [activeTab, setActiveTab] = useState('All Invoices');
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sample data - in real app, this would come from backend
  const sampleInvoices = [
    {
      id: 1,
      invoiceNo: 'INV-2024-001',
      date: '15/01/2024',
      client: 'TechnoFab Industries',
      amount: '₹1,25,000',
      dueDate: '14/02/2024',
      status: 'Paid'
    },
    {
      id: 2,
      invoiceNo: 'INV-2024-002',
      date: '16/01/2024',
      client: 'Digital Solutions Ltd',
      amount: '₹85,000',
      dueDate: '15/02/2024',
      status: 'Draft'
    },
    {
      id: 3,
      invoiceNo: 'INV-2024-003',
      date: '17/01/2024',
      client: 'Tech Innovators Pvt Ltd',
      amount: '₹2,50,000',
      dueDate: '16/02/2024',
      status: 'Overdue'
    }
  ];

  useEffect(() => {
    // Initialize with sample data - replace with API call
    setInvoices(sampleInvoices);
    setFilteredInvoices(sampleInvoices);
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, activeTab, invoices]);

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by tab
    if (activeTab !== 'All Invoices') {
      filtered = filtered.filter(invoice => {
        if (activeTab === 'Paid') return invoice.status === 'Paid';
        if (activeTab === 'Unpaid') return invoice.status === 'Unpaid';
        if (activeTab === 'Drafts') return invoice.status === 'Draft';
        if (activeTab === 'Overdue') return invoice.status === 'Overdue';
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.amount.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-500';
      case 'Draft': return 'bg-yellow-500';
      case 'Overdue': return 'bg-red-500';
      case 'Unpaid': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleCreateInvoice = () => {
    // Navigate to create invoice page
    console.log('Navigate to create invoice page');
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const handleEditInvoice = (invoice) => {
    // Navigate to edit invoice page
    console.log('Edit invoice:', invoice.invoiceNo);
  };

  const handleDownloadInvoice = (invoice) => {
    // Download invoice as PDF
    console.log('Download invoice:', invoice.invoiceNo);
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${invoice.invoiceNo}.pdf`;
    link.click();
  };

  const tabs = ['All Invoices', 'Paid', 'Unpaid', 'Drafts'];

  if (showDetails && selectedInvoice) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to List
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Invoice Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Invoice No</label>
                  <p className="text-gray-900">{selectedInvoice.invoiceNo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Date</label>
                  <p className="text-gray-900">{selectedInvoice.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Due Date</label>
                  <p className="text-gray-900">{selectedInvoice.dueDate}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Client Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Client Name</label>
                  <p className="text-gray-900">{selectedInvoice.client}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Amount</label>
                  <p className="text-gray-900 text-xl font-bold">{selectedInvoice.amount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-lg text-white text-sm ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => handleEditInvoice(selectedInvoice)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Invoice
            </button>
            <button
              onClick={() => handleDownloadInvoice(selectedInvoice)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900 font-segoe">Invoice Management</h1>
              <p className="text-gray-600 mt-1">Manage all your invoices in one place</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs and Actions */}
        <div className="flex justify-between items-center mb-6">
          {/* Tabs */}
          <div className="flex bg-gray-200 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search and Create Button */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <button
              onClick={handleCreateInvoice}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </button>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-100 px-6 py-4">
            <div className="grid grid-cols-7 gap-6">
              <div className="font-medium text-gray-900">INVOICE NO</div>
              <div className="font-medium text-gray-900">DATE</div>
              <div className="font-medium text-gray-900">CLIENT</div>
              <div className="font-medium text-gray-900">AMOUNT</div>
              <div className="font-medium text-gray-900">DUE DATE</div>
              <div className="font-medium text-gray-900">STATUS</div>
              <div className="font-medium text-gray-900">ACTIONS</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-7 gap-6 items-center">
                    <div className="text-gray-900 font-medium">{invoice.invoiceNo}</div>
                    <div className="text-gray-900">{invoice.date}</div>
                    <div className="text-gray-900">{invoice.client}</div>
                    <div className="text-gray-900 font-medium">{invoice.amount}</div>
                    <div className="text-gray-600">{invoice.dueDate}</div>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-lg text-white text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                        title="Edit Invoice"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(invoice)}
                        className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-500 mb-2">No invoices found</div>
                <p className="text-gray-400 text-sm">
                  {searchTerm ? 'Try adjusting your search terms' : 'Create your first invoice to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;