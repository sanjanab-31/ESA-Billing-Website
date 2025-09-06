import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Download, X, Save, FileText, ArrowLeft, Trash2, Printer } from 'lucide-react';

// CHANGE: Added backdrop blur for a better visual effect
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientAutocomplete = ({ clients, selectedClient, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (selectedClient) {
      setSearchTerm(selectedClient.name);
    } else {
      setSearchTerm('');
    }
  }, [selectedClient]);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredSuggestions = clients.filter(client =>
        client.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
      onSelect(null);
    }
  };

  const handleSelectSuggestion = (client) => {
    onSelect(client.id.toString());
    setSearchTerm(client.name);
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm text-gray-700 mb-1">Select Client</label>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        placeholder="Type to search for a client..."
        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"
      />
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map(client => (
            <li
              key={client.id}
              onClick={() => handleSelectSuggestion(client)}
              className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              {client.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// IMPROVED: Better PDF generation and print functionality without navigating away
const InvoicePreview = ({ invoice, invoiceData, calculations, setShowPreview }) => {
  const previewRef = useRef();
  const previewData = invoice || invoiceData;
  
  const previewCalcs = invoice ? {
    subtotal: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: (invoice.items.reduce((sum, item) => sum + item.amount, 0) * (invoice.cgst || 0)) / 100,
    sgstAmount: (invoice.items.reduce((sum, item) => sum + item.amount, 0) * (invoice.sgst || 0)) / 100,
    igstAmount: (invoice.items.reduce((sum, item) => sum + item.amount, 0) * (invoice.igst || 0)) / 100,
    total: invoice.amount || 0
  } : calculations;

  // NEW: Generate PDF using browser's print to PDF
  const handleDownloadPdf = () => {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const invoiceHTML = generatePrintableHTML();
    
    iframe.contentDocument.write(invoiceHTML);
    iframe.contentDocument.close();
    
    // Wait for content to load, then trigger print dialog
    iframe.onload = () => {
      const printWindow = iframe.contentWindow;
      printWindow.focus();
      
      // Use browser's print to PDF functionality
      printWindow.print();
      
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
  };

  // NEW: Print functionality without opening a new window
  const handlePrint = () => {
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const invoiceHTML = generatePrintableHTML();
    
    iframe.contentDocument.write(invoiceHTML);
    iframe.contentDocument.close();
    
    // Wait for content to load, then trigger print dialog
    iframe.onload = () => {
      const printWindow = iframe.contentWindow;
      printWindow.focus();
      printWindow.print();
      
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
  };

  // NEW: Generate clean HTML for printing/PDF with all details
  const generatePrintableHTML = () => {
    const bankDetailsMap = {
      'State Bank Of India': 'A/C No: 42455711572\nIFSC Code: SBIN0015017\nBranch: Malumichampatti',
      'HDFC Bank': 'A/C No: 98765432109\nIFSC: HDFC0005678\nBranch: Corporate Branch, Delhi',
      'ICICI Bank': 'A/C No: 56789012345\nIFSC: ICIC0009012\nBranch: Business Branch, Bangalore',
      'Axis Bank': 'A/C No: 34567890123\nIFSC: UTIB0003456\nBranch: Commercial Branch, Chennai'
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${previewData.invoiceNumber || ''}</title>
          <style>
            @media print {
              @page { 
                margin: 0.5in; 
                size: A4;
              }
              body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.4;
              color: #333;
              background: white;
            }
            
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            
            .company-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            
            .company-info {
              flex: 2;
            }
            
            .company-contact {
              flex: 1;
              text-align: right;
            }
            
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .company-tagline {
              font-size: 14px;
              margin-bottom: 5px;
            }
            
            .company-address {
              font-size: 14px;
              margin-bottom: 5px;
            }
            
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            
            .invoice-title {
              font-size: 28px;
              font-weight: bold;
            }
            
            .invoice-details {
              text-align: right;
              font-size: 14px;
            }
            
            .client-info {
              margin-bottom: 20px;
            }
            
            .client-info table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .client-info td {
              padding: 5px;
              vertical-align: top;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            .items-table th, .items-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: center;
            }
            
            .items-table th {
              background-color: #f0f0f0;
            }
            
            .totals-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            
            .bank-details {
              flex: 1;
              padding: 10px;
              border: 1px solid #000;
            }
            
            .calculations {
              flex: 1;
              padding: 10px;
            }
            
            .calculation-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            
            .declaration {
              margin-top: 20px;
              padding: 10px;
              border-top: 1px solid #000;
              font-size: 14px;
            }
            
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            
            .signature {
              margin-top: 50px;
              text-align: right;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Company Header -->
            <div class="company-header">
              <div class="company-info">
                <div class="company-name">ESA ENGINEERING WORKS</div>
                <div class="company-tagline">All Kinds of Lathe and Milling Works</div>
                <div class="company-tagline">Specialist in : Press Tools, Die Casting Tools, Precision Components</div>
                <div class="company-address">1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE - 641 050.</div>
                <div class="company-address">E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS</div>
              </div>
              <div class="company-contact">
                <div>☎ 98432 94464</div>
                <div>☎ 96984 87096</div>
              </div>
            </div>

            <!-- Invoice Header -->
            <div class="invoice-header">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-details">
                <div>NO: ${previewData.invoiceNumber || '001/2025-2026'}</div>
                <div>DATE: ${previewData.invoiceDate || '06-09-2025'}</div>
              </div>
            </div>

            <!-- Client Information -->
            <div class="client-info">
              <table>
                <tr>
                  <td style="width: 50px;">To,</td>
                  <td>M/s. ${previewData.client ? previewData.client.name : ''}</td>
                  <td style="text-align: right;">J.O. No: ${previewData.joNumber || ''}</td>
                </tr>
                <tr>
                  <td></td>
                  <td>${previewData.client ? previewData.client.address : ''}</td>
                  <td style="text-align: right;">D.C. No: ${previewData.dcNumber || ''}</td>
                </tr>
                <tr>
                  <td></td>
                  <td>GSTIN: ${previewData.client ? previewData.client.gst : ''}</td>
                  <td style="text-align: right;">D.C. Date: ${previewData.dcDate || ''}</td>
                </tr>
              </table>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 40px;">S.No.</th>
                  <th>PARTICULARS</th>
                  <th style="width: 80px;">HSN CODE</th>
                  <th style="width: 60px;">QTY.</th>
                  <th style="width: 100px;">RATE</th>
                  <th style="width: 120px;">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${previewData.items.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.description}</td>
                    <td>${item.hsnCode}</td>
                    <td>${item.quantity}</td>
                    <td>${item.rate.toLocaleString('en-IN')}</td>
                    <td>${item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
                ${Array(Math.max(0, 15 - previewData.items.length)).fill('<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td></tr>').join('')}
              </tbody>
            </table>

            <!-- Totals and Bank Details -->
            <div class="totals-section">
              <div class="bank-details">
                <strong>Bank Details :</strong><br>
                <strong>Bank Name : ${previewData.bankDetails || 'State Bank Of India'}</strong><br>
                <pre>${bankDetailsMap[previewData.bankDetails] || 'A/C No: 42455711572\nIFSC Code: SBIN0015017\nBranch: Malumichampatti'}</pre>
              </div>
              <div class="calculations">
                <div class="calculation-row">
                  <span>SUB TOTAL</span>
                  <span>₹${previewCalcs.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                ${previewData.cgst > 0 ? `
                <div class="calculation-row">
                  <span>CGST ${previewData.cgst}%</span>
                  <span>₹${previewCalcs.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
                ${previewData.sgst > 0 ? `
                <div class="calculation-row">
                  <span>SGST ${previewData.sgst}%</span>
                  <span>₹${previewCalcs.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
                ${previewData.igst > 0 ? `
                <div class="calculation-row">
                  <span>IGST ${previewData.igst}%</span>
                  <span>₹${previewCalcs.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                ` : ''}
                <div class="calculation-row">
                  <span>ROUND OFF</span>
                  <span>₹0.00</span>
                </div>
                <div class="calculation-row" style="font-weight: bold; border-top: 1px solid #000; padding-top: 5px;">
                  <span>NET TOTAL</span>
                  <span>₹${previewCalcs.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <!-- Declaration -->
            <div class="declaration">
              <p><strong>Declaration</strong></p>
              <p>${previewData.declaration || 'We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct.'}</p>
            </div>

            <!-- Signature -->
            <div class="signature">
              <div>For ESA Engineering Works</div>
              <div style="margin-top: 40px;">Authorized Signatory</div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>This is a Computer generated bill</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">Invoice Preview</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
            <button 
              onClick={() => setShowPreview(false)} 
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto">
          <div ref={previewRef} className="p-8 space-y-8 text-sm text-gray-800 bg-white">
            {/* Company Header */}
            <div className="border-b-2 border-black pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">ESA ENGINEERING WORKS</h1>
                  <p className="text-sm">All Kinds of Lathe and Milling Works</p>
                  <p className="text-sm">Specialist in : Press Tools, Die Casting Tools, Precision Components</p>
                  <p className="text-sm">1/100, Chettipalayam Road, E.B. Compound, Malumichampatti, CBE - 641 050.</p>
                  <p className="text-sm">E-Mail : esaengineeringworks@gmail.com | GSTIN : 33AMWPB2116Q1ZS</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">☎ 98432 94464</p>
                  <p className="text-sm">☎ 96984 87096</p>
                </div>
              </div>
            </div>

            {/* Invoice Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <div className="text-right text-sm">
                <p>NO: {previewData.invoiceNumber || '001/2025-2026'}</p>
                <p>DATE: {previewData.invoiceDate || '06-09-2025'}</p>
              </div>
            </div>

            {/* Client Details */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="col-span-2">
                <p><strong>To,</strong> M/s. {previewData.client ? previewData.client.name : ''}</p>
                <p className="ml-5">{previewData.client ? previewData.client.address : ''}</p>
                <p className="ml-5">GSTIN: {previewData.client ? previewData.client.gst : ''}</p>
              </div>
              <div className="text-right">
                <p>J.O. No: {previewData.joNumber || ''}</p>
                <p>D.C. No: {previewData.dcNumber || ''}</p>
                <p>D.C. Date: {previewData.dcDate || ''}</p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <table className="w-full border border-black">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-black p-2 text-center">S.No.</th>
                    <th className="border border-black p-2 text-center">PARTICULARS</th>
                    <th className="border border-black p-2 text-center">HSN CODE</th>
                    <th className="border border-black p-2 text-center">QTY.</th>
                    <th className="border border-black p-2 text-center">RATE</th>
                    <th className="border border-black p-2 text-center">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-black p-2 text-center">{index + 1}</td>
                      <td className="border border-black p-2">{item.description}</td>
                      <td className="border border-black p-2 text-center">{item.hsnCode}</td>
                      <td className="border border-black p-2 text-center">{item.quantity}</td>
                      <td className="border border-black p-2 text-right">{item.rate.toLocaleString()}</td>
                      <td className="border border-black p-2 text-right">{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {Array(Math.max(0, 15 - previewData.items.length)).fill(0).map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="border border-black p-2">&nbsp;</td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                      <td className="border border-black p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals and Bank Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-black p-4">
                <p className="font-bold">Bank Details :</p>
                <p className="font-bold">Bank Name : {previewData.bankDetails || 'State Bank Of India'}</p>
                <pre className="text-sm whitespace-pre-line mt-2">
                  {previewData.bankDetails === 'State Bank Of India' && (
                    <>A/C No: 42455711572\nIFSC Code: SBIN0015017\nBranch: Malumichampatti</>
                  )}
                  {previewData.bankDetails === 'HDFC Bank' && (
                    <>A/C No: 98765432109\nIFSC: HDFC0005678\nBranch: Corporate Branch, Delhi</>
                  )}
                  {previewData.bankDetails === 'ICICI Bank' && (
                    <>A/C No: 56789012345\nIFSC: ICIC0009012\nBranch: Business Branch, Bangalore</>
                  )}
                  {previewData.bankDetails === 'Axis Bank' && (
                    <>A/C No: 34567890123\nIFSC: UTIB0003456\nBranch: Commercial Branch, Chennai</>
                  )}
                </pre>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>SUB TOTAL</span>
                  <span>₹{previewCalcs.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {previewData.cgst > 0 && (
                  <div className="flex justify-between">
                    <span>CGST {previewData.cgst}%</span>
                    <span>₹{previewCalcs.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {previewData.sgst > 0 && (
                  <div className="flex justify-between">
                    <span>SGST {previewData.sgst}%</span>
                    <span>₹{previewCalcs.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {previewData.igst > 0 && (
                  <div className="flex justify-between">
                    <span>IGST {previewData.igst}%</span>
                    <span>₹{previewCalcs.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ROUND OFF</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between border-t border-black pt-2 font-bold">
                  <span>NET TOTAL</span>
                  <span>₹{previewCalcs.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="border-t border-black pt-4">
              <p className="font-bold">Declaration</p>
              <p className="text-sm">{previewData.declaration}</p>
            </div>

            {/* Signature */}
            <div className="text-right mt-8">
              <p>For ESA Engineering Works</p>
              <p className="mt-16 font-bold">Authorized Signatory</p>
            </div>

            {/* Footer */}
            <div className="border-t border-black pt-4 text-center text-xs">
              <p>This is a Computer generated bill</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rest of the components remain the same as in the previous response...
// Only the InvoicePreview component has been modified to match the new design

const CreateInvoiceComponent = ({
  editingInvoice, invoiceData, clients, calculations, setCurrentPage,
  saveDraft, setShowPreview, updateInvoice, saveInvoice, setInvoiceData,
  handleClientSelect, addItem, updateItem, removeItem,
}) => (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={() => setCurrentPage('management')} className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {editingInvoice ? 'Update details for an existing invoice' : 'Create a new invoice for your client'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-sm font-medium">
          <button onClick={() => setCurrentPage('management')} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={saveDraft} className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Save className="w-4 h-4 mr-2" />Save Draft
          </button>
          <button onClick={() => setShowPreview(true)} className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Eye className="w-4 h-4 mr-2" />Preview
          </button>
          <button onClick={editingInvoice ? updateInvoice : saveInvoice} className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
            <FileText className="w-4 h-4 mr-2" />
            {editingInvoice ? 'Update Invoice' : 'Save Invoice'}
          </button>
        </div>
      </div>
      <main className="mt-8 grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Invoice Number <span className="text-red-500">*</span></label>
                <input type="text" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Invoice Date <span className="text-red-500">*</span></label>
                <input type="date" value={invoiceData.invoiceDate} onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Due Date</label>
                <input type="date" value={invoiceData.dueDate} onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">J.O Number <span className="text-red-500">*</span></label>
                <input type="text" value={invoiceData.joNumber} onChange={(e) => setInvoiceData(prev => ({ ...prev, joNumber: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">D.C Number <span className="text-red-500">*</span></label>
                <input type="text" value={invoiceData.dcNumber} onChange={(e) => setInvoiceData(prev => ({ ...prev, dcNumber: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">D.C Date <span className="text-red-500">*</span></label>
                <input type="date" value={invoiceData.dcDate} onChange={(e) => setInvoiceData(prev => ({ ...prev, dcDate: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Client Information <span className="text-red-500">*</span></h3>
             <ClientAutocomplete clients={clients} selectedClient={invoiceData.client} onSelect={handleClientSelect} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Items & Services <span className="text-red-500">*</span></h3>
              <button onClick={addItem} className="flex items-center px-3 py-1.5 text-white bg-blue-600 rounded-lg text-xs font-medium hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="p-2 text-left w-10">#</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left w-32">HSN</th>
                    <th className="p-2 text-left w-24">Qty</th>
                    <th className="p-2 text-left w-32">Rate (₹)</th>
                    <th className="p-2 text-left w-32">Amount (₹)</th>
                    <th className="p-2 text-left w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2 text-sm">{index + 1}</td>
                      <td className="p-2"><input type="text" placeholder="Item description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg"/></td>
                      <td className="p-2"><input type="text" placeholder="HSN" value={item.hsnCode} onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" /></td>
                      <td className="p-2"><input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" min="0" /></td>
                      <td className="p-2"><input type="number" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" min="0" /></td>
                      <td className="p-2"><input type="text" value={item.amount.toLocaleString()} readOnly className="w-full px-3 py-2 text-sm bg-gray-200 border-0 rounded-lg text-gray-600" /></td>
                      <td className="p-2"><button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700" > <X className="w-4 h-4" /> </button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="space-y-8">
            <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Tax Calculation</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block mb-1 text-sm text-gray-700">CGST (%)</label>
                        <input type="number" value={invoiceData.cgst} onChange={(e) => setInvoiceData(prev => ({ ...prev, cgst: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" min="0" max="100"/>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-gray-700">SGST (%)</label>
                        <input type="number" value={invoiceData.sgst} onChange={(e) => setInvoiceData(prev => ({ ...prev, sgst: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" min="0" max="100"/>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm text-gray-700">IGST (%)</label>
                        <input type="number" value={invoiceData.igst} onChange={(e) => setInvoiceData(prev => ({ ...prev, igst: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" min="0" max="100"/>
                    </div>
                </div>
                <div className="p-4 pt-4 bg-gray-50 rounded-lg border-t">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal:</span><span className="font-medium">₹{calculations.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                        {invoiceData.cgst > 0 && (<div className="flex justify-between text-sm"><span className="text-gray-600">CGST ({invoiceData.cgst}%):</span><span>₹{calculations.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>)}
                        {invoiceData.sgst > 0 && (<div className="flex justify-between text-sm"><span className="text-gray-600">SGST ({invoiceData.sgst}%):</span><span>₹{calculations.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>)}
                        {invoiceData.igst > 0 && (<div className="flex justify-between text-sm"><span className="text-gray-600">IGST ({invoiceData.igst}%):</span><span>₹{calculations.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>)}
                        <div className="flex justify-between pt-2 font-bold text-base border-t"><span>Total Amount:</span><span>₹{calculations.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                    </div>
                </div>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Status</h3>
              <div>
                <label className="block mb-1 text-sm text-gray-700">Set Invoice Status</label>
                <select value={invoiceData.status} onChange={(e) => setInvoiceData(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg">
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Payment & Notes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm text-gray-700">Bank Details</label>
                  <select value={invoiceData.bankDetails} onChange={(e) => setInvoiceData(prev => ({ ...prev, bankDetails: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg" ><option>State Bank Of India</option><option>HDFC Bank</option><option>ICICI Bank</option><option>Axis Bank</option></select>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-gray-700">Declaration</label>
                  <textarea value={invoiceData.declaration} onChange={(e) => setInvoiceData(prev => ({ ...prev, declaration: e.target.value }))} className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg resize-none h-20" />
                </div>
              </div>
            </div>
          </div>
      </main>
    </div>
  </div>
);

const InvoiceManagementComponent = ({
  activeTab, searchTerm, filteredInvoices, setActiveTab, setSearchTerm,
  handleCreateInvoice, getStatusColor, handleViewInvoice, handleEditInvoice,
  handleDownloadInvoice, promptDelete, getDynamicStatus
}) => {
  const tabs = ['All Invoices', 'Paid', 'Unpaid', 'Drafts', 'Overdue'];

  return (
    <div className="min-h-screen bg-white">
      <div className="px-8 pt-32 pb-8 mx-auto max-w-7xl">
        <header>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
              <p className="mt-1 text-sm text-gray-600">Manage all your invoices in one place</p>
            </div>
          </div>
        </header>
        <main className="mt-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex p-1 bg-gray-100 rounded-xl">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-80 bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
               <button onClick={handleCreateInvoice} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </button>
            </div>
          </div>
          <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                  <tr>
                      <th className="px-6 py-3 text-left">Invoice No</th>
                      <th className="px-6 py-3 text-left">Date</th>
                      <th className="px-6 py-3 text-left">Client</th>
                      <th className="px-6 py-3 text-left">Amount</th>
                      <th className="px-6 py-3 text-left">Due Date</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => {
                  const dynamicStatus = getDynamicStatus(invoice);
                  return (
                    <tr key={invoice.id} className="text-sm transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-gray-700">{invoice.invoiceDate}</td>
                      <td className="px-6 py-4 text-gray-700">{invoice.client.name}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">₹{invoice.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-700">{invoice.dueDate}</td>
                      <td className="px-6 py-4"><span className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${getStatusColor(dynamicStatus)}`}>{dynamicStatus}</span></td>
                      <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                              <button onClick={() => handleViewInvoice(invoice)} className="p-1 text-gray-600 transition-colors hover:text-blue-600" title="View Details"><Eye className="w-4 h-4" /></button>
                              <button onClick={() => handleEditInvoice(invoice)} className="p-1 text-gray-600 transition-colors hover:text-green-600" title="Edit Invoice"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDownloadInvoice(invoice)} className="p-1 text-gray-600 transition-colors hover:text-purple-600" title="Download"><Download className="w-4 h-4" /></button>
                              <button onClick={() => promptDelete(invoice.id)} className="p-1 text-gray-600 transition-colors hover:text-red-600" title="Delete Invoice"><Trash2 className="w-4 h-4" /></button>
                          </div>
                      </td>
                    </tr>
                  )
                  })
                ) : (
                  <tr><td colSpan="7" className="px-6 py-12 text-center"><div className="mb-2 text-gray-500">No invoices found</div><p className="text-sm text-gray-400">{searchTerm ? 'Try adjusting your search terms' : 'Create your first invoice to get started'}</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

const InvoiceManagementSystem = () => {
  // Check for 'action=create' in the URL query parameters
  const [currentPage, setCurrentPage] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('action') === 'create' ? 'create' : 'management';
  });
  const [activeTab, setActiveTab] = useState('All Invoices');
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', joNumber: '', dcNumber: '', dcDate: '', clientId: '', client: null, items: [], cgst: 9, sgst: 9, igst: 0, bankDetails: 'State Bank Of India', status: 'Unpaid', declaration: 'We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct.'
  });

  const [clients] = useState([
    { id: 1, name: 'TechnoFab Industries', address: '123 Industrial Area, Mumbai', gst: '27ABCDE1234F1Z5' },
    { id: 2, name: 'Digital Solutions Ltd', address: '456 Tech Park, Bangalore', gst: '29FGHIJ5678K2L6' },
    { id: 3, name: 'Tech Innovators Pvt Ltd', address: '789 Innovation Hub, Pune', gst: '27MNOPQ9012R3S7' }
  ]);

  const [calculations, setCalculations] = useState({ subtotal: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, total: 0 });

  const sampleInvoices = [
    { id: 1, invoiceNumber: 'INV-2025-001', invoiceDate: '2025-08-15', client: { id: 1, name: 'TechnoFab Industries', address: '123 Industrial Area, Mumbai', gst: '27ABCDE1234F1Z5' }, amount: 147500, dueDate: '2025-09-14', status: 'Paid', items: [ { id: 1, description: 'Web Development Service', hsnCode: '998314', quantity: 1, rate: 125000, amount: 125000 } ], cgst: 9, sgst: 9, igst: 0 },
    { id: 2, invoiceNumber: 'INV-2025-002', invoiceDate: '2025-08-16', client: { id: 2, name: 'Digital Solutions Ltd', address: '456 Tech Park, Bangalore', gst: '29FGHIJ5678K2L6' }, amount: 100300, dueDate: '2025-09-15', status: 'Draft', items: [ { id: 1, description: 'Mobile App Development', hsnCode: '998314', quantity: 1, rate: 85000, amount: 85000 } ], cgst: 9, sgst: 9, igst: 0 },
    { id: 3, invoiceNumber: 'INV-2025-003', invoiceDate: '2025-07-17', client: { id: 3, name: 'Tech Innovators Pvt Ltd', address: '789 Innovation Hub, Pune', gst: '27MNOPQ9012R3S7' }, amount: 295000, dueDate: '2025-08-16', status: 'Unpaid', items: [ { id: 1, description: 'E-commerce Platform', hsnCode: '998314', quantity: 1, rate: 250000, amount: 250000 } ], cgst: 9, sgst: 9, igst: 0 }
  ];

  useEffect(() => { setInvoices(sampleInvoices); }, []);

  const getDynamicStatus = (invoice) => {
    if (invoice.status === 'Paid' || invoice.status === 'Draft') {
      return invoice.status;
    }
    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (invoice.dueDate && today > dueDate) {
      return 'Overdue';
    }
    
    return 'Unpaid';
  };

  useEffect(() => {
    let filtered = [...invoices];
    if (activeTab !== 'All Invoices') {
      filtered = filtered.filter(invoice => {
        const dynamicStatus = getDynamicStatus(invoice);
        if (activeTab === 'Paid') return dynamicStatus === 'Paid';
        if (activeTab === 'Unpaid') return dynamicStatus === 'Unpaid';
        if (activeTab === 'Drafts') return dynamicStatus === 'Draft';
        if (activeTab === 'Overdue') return dynamicStatus === 'Overdue';
        return true;
      });
    }
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.amount.toString().includes(searchTerm)
      );
    }
    setFilteredInvoices(filtered);
  }, [searchTerm, activeTab, invoices]);

  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const cgstAmount = (subtotal * invoiceData.cgst) / 100;
    const sgstAmount = (subtotal * invoiceData.sgst) / 100;
    const igstAmount = (subtotal * invoiceData.igst) / 100;
    const total = subtotal + cgstAmount + sgstAmount + igstAmount;
    setCalculations({ subtotal, cgstAmount, sgstAmount, igstAmount, total });
  }, [invoiceData.items, invoiceData.cgst, invoiceData.sgst, invoiceData.igst]);

  const getStatusColor = (status) => {
    switch (status) { case 'Paid': return 'bg-green-500'; case 'Draft': return 'bg-yellow-500'; case 'Overdue': return 'bg-red-500'; case 'Unpaid': return 'bg-orange-500'; default: return 'bg-gray-500'; }
  };

  const addItem = () => {
    const newItem = { id: Date.now(), description: '', hsnCode: '', quantity: 1, rate: 0, amount: 0 };
    setInvoiceData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (itemId, field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = (parseFloat(updatedItem.quantity) || 0) * (parseFloat(updatedItem.rate) || 0);
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (itemId) => { setInvoiceData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) })); };
  
  const handleClientSelect = (clientId) => { 
    if (clientId === null) {
      setInvoiceData(prev => ({ ...prev, clientId: '', client: null }));
      return;
    }
    const selectedClient = clients.find(c => c.id === parseInt(clientId)); 
    setInvoiceData(prev => ({ ...prev, clientId: clientId, client: selectedClient })); 
  };

  const generateNextInvoiceNumber = () => { if (invoices.length === 0) return `INV-2025-001`; const maxNumber = invoices.reduce((max, invoice) => { const num = parseInt(invoice.invoiceNumber.split('-')[2]); return num > max ? num : max; }, 0); return `INV-2025-${String(maxNumber + 1).padStart(3, '0')}`; };
  
  const resetInvoiceForm = () => { 
    setInvoiceData({ invoiceNumber: generateNextInvoiceNumber(), invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', joNumber: '', dcNumber: '', dcDate: '', clientId: '', client: null, items: [], cgst: 9, sgst: 9, igst: 0, bankDetails: 'State Bank Of India', status: 'Unpaid', declaration: 'We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct.' }); 
  };

  const validateInvoice = () => {
    const { invoiceNumber, invoiceDate, joNumber, dcNumber, dcDate, clientId, items } = invoiceData;
    const missingFields = [];
    if (!invoiceNumber) missingFields.push("Invoice Number");
    if (!invoiceDate) missingFields.push("Invoice Date");
    if (!joNumber) missingFields.push("J.O Number");
    if (!dcNumber) missingFields.push("D.C Number");
    if (!dcDate) missingFields.push("D.C Date");
    if (!clientId) missingFields.push("Client Information");
    if (items.length === 0) missingFields.push("At least one item");

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n- ${missingFields.join('\n- ')}`);
      return false;
    }
    return true;
  };
  
  const saveDraft = () => { const draftInvoice = { ...invoiceData, id: editingInvoice ? editingInvoice.id : Date.now(), status: 'Draft', amount: calculations.total }; if (editingInvoice) { setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? draftInvoice : inv)); } else { setInvoices(prev => [...prev, draftInvoice]); } alert('Invoice saved as draft!'); resetInvoiceForm(); setEditingInvoice(null); setCurrentPage('management'); };
  
  const saveInvoice = () => { 
    if (!validateInvoice()) return;
    const newInvoice = { ...invoiceData, id: Date.now(), amount: calculations.total }; 
    setInvoices(prev => [...prev, newInvoice]); 
    alert('Invoice saved successfully!'); 
    resetInvoiceForm(); 
    setCurrentPage('management'); 
  };
  
  const updateInvoice = () => { 
    if (!validateInvoice()) return;
    const updatedInvoice = { ...invoiceData, amount: calculations.total }; setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? updatedInvoice : inv)); alert('Invoice updated successfully!'); setEditingInvoice(null); resetInvoiceForm(); setCurrentPage('management'); 
  };
  
  const handleCreateInvoice = () => { resetInvoiceForm(); setEditingInvoice(null); setCurrentPage('create'); };
  
  const handleViewInvoice = (invoice) => { setSelectedInvoice(invoice); setShowPreview(true); };
  
  const handleEditInvoice = (invoice) => { const invoiceToEdit = JSON.parse(JSON.stringify(invoice)); setInvoiceData(invoiceToEdit); setEditingInvoice(invoiceToEdit); setCurrentPage('edit'); };

  const handleDownloadInvoice = (invoice) => { 
      setSelectedInvoice(invoice);
      setShowPreview(true);
  };
  
  const promptDelete = (invoiceId) => {
    setInvoiceToDelete(invoiceId);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceToDelete));
      alert('Invoice deleted successfully!');
      setInvoiceToDelete(null);
    }
  };

  return (
    <div>
      <ConfirmationModal
        isOpen={!!invoiceToDelete}
        onClose={() => setInvoiceToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
      />
      {currentPage === 'management' && (
        <InvoiceManagementComponent 
          activeTab={activeTab} searchTerm={searchTerm} filteredInvoices={filteredInvoices} 
          setActiveTab={setActiveTab} setSearchTerm={setSearchTerm} handleCreateInvoice={handleCreateInvoice} 
          getStatusColor={getStatusColor} handleViewInvoice={handleViewInvoice} handleEditInvoice={handleEditInvoice} 
          handleDownloadInvoice={handleDownloadInvoice} promptDelete={promptDelete} getDynamicStatus={getDynamicStatus}
        />
      )}
      {(currentPage === 'create' || currentPage === 'edit') && (
        <CreateInvoiceComponent 
          editingInvoice={editingInvoice} invoiceData={invoiceData} clients={clients} calculations={calculations} 
          setCurrentPage={setCurrentPage} saveDraft={saveDraft} setShowPreview={setShowPreview} 
          updateInvoice={updateInvoice} saveInvoice={saveInvoice} setInvoiceData={setInvoiceData} 
          handleClientSelect={handleClientSelect} addItem={addItem} updateItem={updateItem} removeItem={removeItem} 
        />
      )}
      {showPreview && (
        <InvoicePreview 
          invoice={selectedInvoice} 
          invoiceData={currentPage !== 'management' ? invoiceData : null} 
          calculations={calculations} 
          setShowPreview={setShowPreview} 
        />
      )}
    </div>
  );
};

export default InvoiceManagementSystem