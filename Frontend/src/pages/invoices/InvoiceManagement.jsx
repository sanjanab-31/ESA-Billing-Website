import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Download, X, QrCode, Save, FileText, ArrowLeft } from 'lucide-react';

const InvoiceManagementSystem = () => {
  const [currentPage, setCurrentPage] = useState('management'); // 'management' or 'create' or 'edit'
  const [activeTab, setActiveTab] = useState('All Invoices');
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Create Invoice State
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-2024-001',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    joNumber: '',
    dcNumber: '',
    dcDate: '',
    clientId: '',
    client: null,
    items: [],
    cgst: 9,
    sgst: 9,
    igst: 0,
    bankDetails: 'State Bank Of India',
    status: 'Draft',
    declaration: 'We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct.'
  });

  const [clients] = useState([
    { id: 1, name: 'TechnoFab Industries', address: '123 Industrial Area, Mumbai', gst: '27ABCDE1234F1Z5' },
    { id: 2, name: 'Digital Solutions Ltd', address: '456 Tech Park, Bangalore', gst: '29FGHIJ5678K2L6' },
    { id: 3, name: 'Tech Innovators Pvt Ltd', address: '789 Innovation Hub, Pune', gst: '27MNOPQ9012R3S7' }
  ]);

  const [calculations, setCalculations] = useState({
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    total: 0
  });

  // Sample data - in real app, this would come from backend
  const sampleInvoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      invoiceDate: '2024-01-15',
      client: { name: 'TechnoFab Industries', address: '123 Industrial Area, Mumbai', gst: '27ABCDE1234F1Z5' },
      amount: 125000,
      dueDate: '2024-02-14',
      status: 'Paid',
      items: [
        { id: 1, description: 'Web Development Service', hsnCode: '998314', quantity: 1, rate: 125000, amount: 125000 }
      ],
      cgst: 9,
      sgst: 9,
      igst: 0
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      invoiceDate: '2024-01-16',
      client: { name: 'Digital Solutions Ltd', address: '456 Tech Park, Bangalore', gst: '29FGHIJ5678K2L6' },
      amount: 85000,
      dueDate: '2024-02-15',
      status: 'Draft',
      items: [
        { id: 1, description: 'Mobile App Development', hsnCode: '998314', quantity: 1, rate: 85000, amount: 85000 }
      ],
      cgst: 9,
      sgst: 9,
      igst: 0
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      invoiceDate: '2024-01-17',
      client: { name: 'Tech Innovators Pvt Ltd', address: '789 Innovation Hub, Pune', gst: '27MNOPQ9012R3S7' },
      amount: 250000,
      dueDate: '2024-02-16',
      status: 'Overdue',
      items: [
        { id: 1, description: 'E-commerce Platform', hsnCode: '998314', quantity: 1, rate: 250000, amount: 250000 }
      ],
      cgst: 9,
      sgst: 9,
      igst: 0
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setInvoices(sampleInvoices);
    setFilteredInvoices(sampleInvoices);
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, activeTab, invoices]);

  // Calculate totals whenever items or tax rates change
  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const cgstAmount = (subtotal * invoiceData.cgst) / 100;
    const sgstAmount = (subtotal * invoiceData.sgst) / 100;
    const igstAmount = (subtotal * invoiceData.igst) / 100;
    const total = subtotal + cgstAmount + sgstAmount + igstAmount;

    setCalculations({
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      total
    });
  }, [invoiceData.items, invoiceData.cgst, invoiceData.sgst, invoiceData.igst]);

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
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.amount.toString().includes(searchTerm)
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

  // Invoice Creation Functions
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      hsnCode: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (itemId, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (itemId) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleClientSelect = (clientId) => {
    const selectedClient = clients.find(c => c.id === parseInt(clientId));
    setInvoiceData(prev => ({
      ...prev,
      clientId,
      client: selectedClient
    }));
  };

  const generateNextInvoiceNumber = () => {
    const maxNumber = invoices.reduce((max, invoice) => {
      const num = parseInt(invoice.invoiceNumber.split('-')[2]);
      return num > max ? num : max;
    }, 0);
    return `INV-2024-${String(maxNumber + 1).padStart(3, '0')}`;
  };

  const resetInvoiceForm = () => {
    setInvoiceData({
      invoiceNumber: generateNextInvoiceNumber(),
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      joNumber: '',
      dcNumber: '',
      dcDate: '',
      clientId: '',
      client: null,
      items: [],
      cgst: 9,
      sgst: 9,
      igst: 0,
      bankDetails: 'State Bank Of India',
      status: 'Draft',
      declaration: 'We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct.'
    });
  };

  const saveDraft = () => {
    const draftInvoice = {
      ...invoiceData,
      id: Date.now(),
      status: 'Draft',
      amount: calculations.total
    };
    setInvoices(prev => [...prev, draftInvoice]);
    alert('Invoice saved as draft!');
    resetInvoiceForm();
    setCurrentPage('management');
  };

  const saveInvoice = () => {
    const newInvoice = {
      ...invoiceData,
      id: Date.now(),
      status: 'Unpaid',
      amount: calculations.total
    };
    setInvoices(prev => [...prev, newInvoice]);
    alert('Invoice saved successfully!');
    resetInvoiceForm();
    setCurrentPage('management');
  };

  const updateInvoice = () => {
    const updatedInvoice = {
      ...invoiceData,
      amount: calculations.total
    };
    setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? updatedInvoice : inv));
    alert('Invoice updated successfully!');
    setEditingInvoice(null);
    resetInvoiceForm();
    setCurrentPage('management');
  };

  // Management Functions
  const handleCreateInvoice = () => {
    resetInvoiceForm();
    setEditingInvoice(null);
    setCurrentPage('create');
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleEditInvoice = (invoice) => {
    setInvoiceData(invoice);
    setEditingInvoice(invoice);
    setCurrentPage('edit');
  };

  const handleDownloadInvoice = (invoice) => {
    // Create a simple text representation for download
    const invoiceText = `
INVOICE: ${invoice.invoiceNumber}
Date: ${invoice.invoiceDate}
Client: ${invoice.client.name}
Address: ${invoice.client.address}
GST: ${invoice.client.gst}

Items:
${invoice.items.map(item => 
  `${item.description} - HSN: ${item.hsnCode} - Qty: ${item.quantity} - Rate: ₹${item.rate} - Amount: ₹${item.amount}`
).join('\n')}

Subtotal: ₹${invoice.amount}
Total: ₹${invoice.amount}
Status: ${invoice.status}
    `;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const InvoicePreview = ({ invoice = null, isCreateMode = false }) => {
    const previewData = invoice || invoiceData;
    const previewCalcs = invoice ? {
      subtotal: invoice.amount,
      cgstAmount: (invoice.amount * invoice.cgst) / 100,
      sgstAmount: (invoice.amount * invoice.sgst) / 100,
      igstAmount: (invoice.amount * invoice.igst) / 100,
      total: invoice.amount
    } : calculations;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Invoice Preview</h2>
            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Invoice Header */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-blue-600">INVOICE</h1>
                  <p className="text-gray-600">#{previewData.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Invoice Date: {previewData.invoiceDate}</p>
                  <p className="text-gray-600">Due Date: {previewData.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Client Details */}
            {previewData.client && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bill To:</h3>
                  <div className="text-gray-700">
                    <p className="font-medium">{previewData.client.name}</p>
                    <p>{previewData.client.address}</p>
                    <p>GST: {previewData.client.gst}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Invoice Details:</h3>
                  <div className="text-gray-700">
                    {previewData.joNumber && <p>J.O Number: {previewData.joNumber}</p>}
                    {previewData.dcNumber && <p>D.C Number: {previewData.dcNumber}</p>}
                    {previewData.dcDate && <p>D.C Date: {previewData.dcDate}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div>
              <h3 className="font-semibold mb-3">Items & Services</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">HSN</th>
                      <th className="px-4 py-3 text-left">Qty</th>
                      <th className="px-4 py-3 text-left">Rate (₹)</th>
                      <th className="px-4 py-3 text-left">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewData.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3">{item.hsnCode}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">₹{item.rate}</td>
                        <td className="px-4 py-3">₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{previewCalcs.subtotal.toFixed(2)}</span>
                </div>
                {previewData.cgst > 0 && (
                  <div className="flex justify-between">
                    <span>CGST ({previewData.cgst}%):</span>
                    <span>₹{previewCalcs.cgstAmount.toFixed(2)}</span>
                  </div>
                )}
                {previewData.sgst > 0 && (
                  <div className="flex justify-between">
                    <span>SGST ({previewData.sgst}%):</span>
                    <span>₹{previewCalcs.sgstAmount.toFixed(2)}</span>
                  </div>
                )}
                {previewData.igst > 0 && (
                  <div className="flex justify-between">
                    <span>IGST ({previewData.igst}%):</span>
                    <span>₹{previewCalcs.igstAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>₹{previewCalcs.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Scan to pay ₹{previewCalcs.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Declaration */}
            <div className="text-sm text-gray-600 border-t pt-4">
              <p className="font-medium mb-2">Declaration:</p>
              <p>{previewData.declaration}</p>
            </div>

            {/* Action Buttons */}
            {!invoice && (
              <div className="flex justify-end space-x-3 border-t pt-4">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([document.querySelector('.invoice-preview').innerHTML], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${previewData.invoiceNumber}.html`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Create Invoice Component
  const CreateInvoiceComponent = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => setCurrentPage('management')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {editingInvoice ? 'Edit existing invoice' : 'Create a new invoice for your client'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentPage('management')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={saveDraft}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              <button 
                onClick={() => setShowPreview(true)}
                className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button 
                onClick={editingInvoice ? updateInvoice : saveInvoice}
                className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                {editingInvoice ? 'Update Invoice' : 'Save Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Form */}
          <div className="col-span-2 space-y-6">
            {/* Invoice Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Invoice Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceData.invoiceDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">J.O Number</label>
                  <input
                    type="text"
                    value={invoiceData.joNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, joNumber: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">D.C Number</label>
                  <input
                    type="text"
                    value={invoiceData.dcNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dcNumber: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">D.C Date</label>
                  <input
                    type="date"
                    value={invoiceData.dcDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dcDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Client Information</h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Client</label>
                <select
                  value={invoiceData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items & Services */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-900">Items & Services</h3>
                <button
                  onClick={addItem}
                  className="flex items-center px-3 py-1.5 text-white bg-green-500 rounded-lg text-xs hover:bg-green-600"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Item
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-bold text-gray-900">
                      <th className="text-left p-2">#</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-left p-2">HSN Code</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Rate (₹)</th>
                      <th className="text-left p-2">Amount (₹)</th>
                      <th className="text-left p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2 text-sm">{index + 1}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Item description"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-100 border-0 rounded-lg"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="HSN"
                            value={item.hsnCode}
                            onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-gray-100 border-0 rounded-lg"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-xs bg-gray-100 border-0 rounded-lg"
                            min="0"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 text-xs bg-gray-100 border-0 rounded-lg"
                            min="0"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.amount}
                            readOnly
                            className="w-full px-3 py-2 text-xs bg-gray-200 border-0 rounded-lg"
                          />
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Calculation */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Tax Calculation</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CGST (%)</label>
                  <input
                    type="number"
                    value={invoiceData.cgst}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, cgst: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">SGST (%)</label>
                  <input
                    type="number"
                    value={invoiceData.sgst}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, sgst: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">IGST (%)</label>
                  <input
                    type="number"
                    value={invoiceData.igst}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, igst: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="border-t pt-4 bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{calculations.subtotal.toFixed(2)}</span>
                  </div>
                  {invoiceData.cgst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CGST ({invoiceData.cgst}%):</span>
                      <span>₹{calculations.cgstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoiceData.sgst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SGST ({invoiceData.sgst}%):</span>
                      <span>₹{calculations.sgstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoiceData.igst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IGST ({invoiceData.igst}%):</span>
                      <span>₹{calculations.igstAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span>₹{calculations.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-6">
            {/* QR Code Payment */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">QR Code Payment</h3>
              <div className="text-center">
                <div className="inline-block p-4 border-2 border-dashed border-gray-300 rounded-lg mb-3">
                  <QrCode className="w-16 h-16 mx-auto text-gray-400" />
                </div>
                <p className="text-xs text-gray-600">Scan to pay ₹{calculations.total.toFixed(2)}</p>
              </div>
            </div>

            {/* Payment & Additional Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Payment & Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bank Details</label>
                  <select
                    value={invoiceData.bankDetails}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, bankDetails: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                  >
                    <option>State Bank Of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Invoice Status</label>
                  <select
                    value={invoiceData.status}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
                  >
                    <option>Draft</option>
                    <option>Sent</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Declaration</label>
                  <textarea
                    value={invoiceData.declaration}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, declaration: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-gray-100 border-0 rounded-lg h-20 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Management Component
  const InvoiceManagementComponent = () => {
    const tabs = ['All Invoices', 'Paid', 'Unpaid', 'Drafts', 'Overdue'];

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-gray-900">Invoice Management</h1>
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
                      <div className="text-gray-900 font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-gray-900">{invoice.invoiceDate}</div>
                      <div className="text-gray-900">{invoice.client.name}</div>
                      <div className="text-gray-900 font-medium">₹{invoice.amount.toLocaleString()}</div>
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

  return (
    <div>
      {currentPage === 'management' && <InvoiceManagementComponent />}
      {(currentPage === 'create' || currentPage === 'edit') && <CreateInvoiceComponent />}
      {showPreview && <InvoicePreview invoice={selectedInvoice} />}
    </div>
  );
};

export default InvoiceManagementSystem;