import React, { useState, useEffect } from 'react';
import { Plus, Eye, X, QrCode, Calendar, Save, FileText } from 'lucide-react';

const CreateInvoice = () => {
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

  const [showPreview, setShowPreview] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState([]);

  const [calculations, setCalculations] = useState({
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    total: 0
  });

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

  const saveDraft = () => {
    const draftInvoice = {
      ...invoiceData,
      id: Date.now(),
      status: 'Draft',
      calculations
    };
    setSavedInvoices(prev => [...prev, draftInvoice]);
    alert('Invoice saved as draft!');
  };

  const generateQRCode = () => {
    // In a real app, this would generate an actual QR code
    const paymentData = `upi://pay?pa=merchant@upi&pn=Business&am=${calculations.total}&cu=INR&tn=Invoice%20${invoiceData.invoiceNumber}`;
    return paymentData;
  };

  const InvoicePreview = () => (
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
                <p className="text-gray-600">#{invoiceData.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Invoice Date: {invoiceData.invoiceDate}</p>
                <p className="text-gray-600">Due Date: {invoiceData.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Client Details */}
          {invoiceData.client && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <div className="text-gray-700">
                  <p className="font-medium">{invoiceData.client.name}</p>
                  <p>{invoiceData.client.address}</p>
                  <p>GST: {invoiceData.client.gst}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Invoice Details:</h3>
                <div className="text-gray-700">
                  {invoiceData.joNumber && <p>J.O Number: {invoiceData.joNumber}</p>}
                  {invoiceData.dcNumber && <p>D.C Number: {invoiceData.dcNumber}</p>}
                  {invoiceData.dcDate && <p>D.C Date: {invoiceData.dcDate}</p>}
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
                  {invoiceData.items.map((item, index) => (
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
                <span>₹{calculations.subtotal.toFixed(2)}</span>
              </div>
              {invoiceData.cgst > 0 && (
                <div className="flex justify-between">
                  <span>CGST ({invoiceData.cgst}%):</span>
                  <span>₹{calculations.cgstAmount.toFixed(2)}</span>
                </div>
              )}
              {invoiceData.sgst > 0 && (
                <div className="flex justify-between">
                  <span>SGST ({invoiceData.sgst}%):</span>
                  <span>₹{calculations.sgstAmount.toFixed(2)}</span>
                </div>
              )}
              {invoiceData.igst > 0 && (
                <div className="flex justify-between">
                  <span>IGST ({invoiceData.igst}%):</span>
                  <span>₹{calculations.igstAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>₹{calculations.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Scan to pay ₹{calculations.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Declaration */}
          <div className="text-sm text-gray-600 border-t pt-4">
            <p className="font-medium mb-2">Declaration:</p>
            <p>{invoiceData.declaration}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Create Invoice</h1>
              <p className="text-gray-600 mt-1">Create a new invoice for your client</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.history.back()}
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

      {showPreview && <InvoicePreview />}
    </div>
  );
};

export default CreateInvoice;