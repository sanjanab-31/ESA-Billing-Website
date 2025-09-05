import React, { useState, useRef, useEffect } from 'react';
import { Plus, Eye, Edit, MoreHorizontal, X, FileText, TrendingUp, AlertCircle, MapPin, Phone, Mail, Trash2 } from 'lucide-react';

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'Sunshine Traders',
      email: 'accounts@sunshine.co.in',
      gstin: '33ABCXY7890Z1A2',
      phone: '+91 54321 09876',
      totalInvoices: 10,
      totalRevenue: '₹1,25,000',
      outstanding: '₹0',
      address: '123 Business Street, Mumbai, Maharashtra',
      amountPaid: '₹1,25,000',
      firstInvoice: 'Jan 2023',
      lastInvoice: '15/12/2023',
      avgInvoice: '₹12,500',
      paymentRate: '100%',
      revenueData: [
        { month: 'Sep', value: 30000, label: '₹30,000' },
        { month: 'Oct', value: 25000, label: '₹25,000' },
        { month: 'Nov', value: 40000, label: '₹40,000' },
        { month: 'Dec', value: 30000, label: '₹30,000' }
      ]
    },
    {
      id: 2,
      name: 'TechnoFab Industries',
      email: 'accounts@technofab.com',
      gstin: '29ABCDE1234F1Z5',
      phone: '+91 98765 43210',
      totalInvoices: 15,
      totalRevenue: '₹2,85,000',
      outstanding: '₹25,000',
      address: '123, Industrial Area, Bangalore, Karnataka -560001',
      amountPaid: '₹2,85,000',
      firstInvoice: 'Dec 2023',
      lastInvoice: '20/01/2024',
      avgInvoice: '₹19,000',
      paymentRate: '91%',
      revenueData: [
        { month: 'Oct', value: 35000, label: '₹35,000' },
        { month: 'Nov', value: 42000, label: '₹42,000' },
        { month: 'Dec', value: 38000, label: '₹38,000' },
        { month: 'Jan', value: 45000, label: '₹45,000' }
      ]
    },
    {
      id: 3,
      name: 'Global Imports',
      email: 'info@globalimports.co.in',
      gstin: '19FGHIJ5678K2L3',
      phone: '+91 87654 32109',
      totalInvoices: 8,
      totalRevenue: '₹3,75,000',
      outstanding: '₹0',
      address: '789 Import Plaza, Delhi',
      amountPaid: '₹3,75,000',
      firstInvoice: 'Mar 2023',
      lastInvoice: '18/01/2024',
      avgInvoice: '₹46,875',
      paymentRate: '100%',
      revenueData: [
        { month: 'Oct', value: 80000, label: '₹80,000' },
        { month: 'Nov', value: 95000, label: '₹95,000' },
        { month: 'Dec', value: 110000, label: '₹1,10,000' },
        { month: 'Jan', value: 90000, label: '₹90,000' }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    name: '', gstin: '', phone: '', email: '', address: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '', gstin: '', phone: '', email: '', address: ''
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClient = () => {
    if (formData.name && formData.gstin && formData.address) {
      const newClient = {
        id: clients.length + 1,
        name: formData.name,
        email: formData.email,
        gstin: formData.gstin,
        phone: formData.phone,
        totalInvoices: 0,
        totalRevenue: '₹0',
        outstanding: '₹0',
        address: formData.address,
        amountPaid: '₹0',
        firstInvoice: '-',
        lastInvoice: '-',
        avgInvoice: '₹0',
        paymentRate: '0%',
        revenueData: []
      };
      
      setClients(prev => [...prev, newClient]);
      setFormData({ name: '', gstin: '', phone: '', email: '', address: '' });
      setShowAddModal(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', gstin: '', phone: '', email: '', address: '' });
    setShowAddModal(false);
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedClient(null);
    setShowDetailsModal(false);
  };

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setEditFormData({
      name: client.name,
      gstin: client.gstin,
      phone: client.phone,
      email: client.email,
      address: client.address
    });
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  const handleUpdateClient = () => {
    if (editFormData.name && editFormData.gstin && editFormData.address) {
      setClients(prev => prev.map(client => 
        client.id === selectedClient.id 
          ? { ...client, ...editFormData }
          : client
      ));
      setShowEditModal(false);
      setSelectedClient(null);
      setEditFormData({ name: '', gstin: '', phone: '', email: '', address: '' });
    }
  };

  const handleDeleteClient = (clientId) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
    setDropdownOpen(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setSelectedClient(null);
    setEditFormData({ name: '', gstin: '', phone: '', email: '', address: '' });
  };

  const toggleDropdown = (clientId) => {
    setDropdownOpen(dropdownOpen === clientId ? null : clientId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    // CHANGED: Set background to white and removed outer padding
    <div className="min-h-screen bg-white font-sans">
      {/* CHANGED: Added a single container to manage padding and width */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Client Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your client relationships and track business performance
            </p>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            <div className="relative flex-1 lg:flex-none">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-80 px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" 
            >
              <Plus size={16} />
              Add Client
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mt-8">
          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-80">Client Name</th>
                  <th className="px-4 py-3 text-left w-36">GST Number</th>
                  <th className="px-4 py-3 text-left w-36">Phone Number</th>
                  <th className="px-4 py-3 text-center w-28">Total Invoices</th>
                  <th className="px-4 py-3 text-left w-28">Total Revenue</th>
                  <th className="px-4 py-3 text-left w-28">Outstanding</th>
                  <th className="px-4 py-3 text-left w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 w-80">
                      <div className="text-sm font-medium text-gray-900 mb-1">{client.name}</div>
                      <div className="text-xs text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-4 py-4 w-36 font-mono text-sm text-gray-700">{client.gstin}</td>
                    <td className="px-4 py-4 w-36 text-sm text-gray-700">{client.phone}</td>
                    <td className="px-4 py-4 w-28 text-center text-sm text-gray-700">{client.totalInvoices}</td>
                    <td className="px-4 py-4 w-28 text-sm text-gray-700">{client.totalRevenue}</td>
                    <td className={`px-4 py-4 w-28 text-sm font-medium ${client.outstanding === '₹0' ? 'text-gray-500' : 'text-red-500'}`}>{client.outstanding}</td>
                    <td className="px-4 py-4 w-32">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleViewClient(client)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details">
                          <Eye size={16} className="text-gray-700" />
                        </button>
                        <button onClick={() => handleEditClient(client)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit Client">
                          <Edit size={16} className="text-gray-700" />
                        </button>
                        <div className="relative" ref={dropdownOpen === client.id ? dropdownRef : null}>
                          <button onClick={() => toggleDropdown(client.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More Actions">
                            <MoreHorizontal size={16} className="text-gray-700" />
                          </button>
                          {dropdownOpen === client.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button onClick={() => handleDeleteClient(client.id)} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg">
                                <Trash2 size={14} />
                                Delete Client
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No clients found matching your search criteria.</p>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS (No layout changes needed for modals) --- */}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative">
            <button onClick={handleCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" title="Close"><X size={18} /></button>
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Client</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Client Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter Client name" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">GSTIN *</label>
                    <input type="text" name="gstin" value={formData.gstin} onChange={handleInputChange} placeholder="e.g., 27ABCDE1234F1Z5" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Contact</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 900XX 58XXX" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contact@example.com" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Address *</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter full address" rows={3} className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={handleCancel} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleAddClient} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Add Client</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative">
            <button onClick={handleCancelEdit} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" title="Close"><X size={18} /></button>
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Client</h2>
                <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Client Name *</label>
                    <input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">GSTIN *</label>
                    <input type="text" name="gstin" value={editFormData.gstin} onChange={handleEditInputChange} className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Contact</label>
                    <input type="text" name="phone" value={editFormData.phone} onChange={handleEditInputChange} className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">E-mail</label>
                    <input type="email" name="email" value={editFormData.email} onChange={handleEditInputChange} className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Address *</label>
                  <textarea name="address" value={editFormData.address} onChange={handleEditInputChange} rows={3} className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={handleCancelEdit} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleUpdateClient} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Update Client</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden my-8">
            <div className="bg-blue-50 px-4 py-4 flex items-center gap-3 relative">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">{selectedClient.name}</h2>
              <button onClick={handleCloseDetails} className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors" title="Close">
                <X size={16} className="text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-gray-900">{selectedClient.totalInvoices}</div>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><FileText size={16} className="text-blue-600" /></div>
                  </div>
                  <div className="text-xs text-gray-500">Total Invoices</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-gray-900">{selectedClient.totalRevenue}</div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><span className="text-green-600 font-bold text-lg">₹</span></div>
                  </div>
                  <div className="text-xs text-gray-500">Total Revenue</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-gray-900">{selectedClient.outstanding}</div>
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><span className="text-red-600 font-bold text-lg">₹</span></div>
                  </div>
                  <div className="text-xs text-gray-500">Outstanding</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-gray-900">{selectedClient.amountPaid}</div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><TrendingUp size={16} className="text-green-600" /></div>
                  </div>
                  <div className="text-xs text-gray-500">Amount Paid</div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-3"><FileText size={16} className="text-gray-400 flex-shrink-0"/><div><div className="font-medium">{selectedClient.name}</div><div className="text-xs text-gray-500">GSTIN: {selectedClient.gstin}</div></div></div>
                  <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400 flex-shrink-0"/><span>{selectedClient.phone}</span></div>
                  <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400 flex-shrink-0"/><span>{selectedClient.email}</span></div>
                  <div className="flex items-start gap-3"><MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5"/><span>{selectedClient.address}</span></div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Business Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">First Invoice:</span><span className="font-medium text-gray-900">{selectedClient.firstInvoice}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Last Invoice:</span><span className="font-medium text-gray-900">{selectedClient.lastInvoice}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Avg Invoice:</span><span className="font-medium text-gray-900">{selectedClient.avgInvoice}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Payment Rate:</span><span className="font-medium text-green-600">{selectedClient.paymentRate}</span></div>
                </div>
              </div>
              {selectedClient.revenueData && selectedClient.revenueData.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Revenue Contribution (Last 4 Months)</h3>
                  <div className="flex justify-center items-end gap-6 h-48 px-4">
                    {(() => {
                      const maxValue = Math.max(...selectedClient.revenueData.map(d => d.value));
                      return selectedClient.revenueData.map((data) => (
                        <div key={data.month} className="flex flex-col items-center flex-1">
                          <div className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors" style={{ height: `${Math.max((data.value / maxValue) * 120, 20)}px` }} title={data.label}></div>
                          <div className="text-xs font-medium text-gray-800 mt-2">{data.month}</div>
                          <div className="text-xs text-gray-500">{data.label}</div>
                        </div>
                      ))
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;