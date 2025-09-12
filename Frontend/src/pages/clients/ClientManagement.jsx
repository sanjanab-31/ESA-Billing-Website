import React, { useState, useRef, useEffect } from 'react';
// No changes to imports
import { Plus, Eye, Edit, MoreHorizontal, X, FileText, TrendingUp, AlertCircle, MapPin, Phone, Mail, Trash2, Search } from 'lucide-react';

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);
  
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

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
      // CHANGED: Robust ID generation. Finds the current max ID and adds 1.
      const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
      
      const newClient = {
        id: newId, // Use the new robust ID
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
  
  const handleDeleteClient = (client) => {
    setClientToDelete(client);
    setShowDeleteConfirmModal(true);
    setDropdownOpen(null);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      setClients(prev => prev.filter(client => client.id !== clientToDelete.id));
      setShowDeleteConfirmModal(false);
      setClientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setClientToDelete(null);
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
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-80 bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <main className="mt-8">
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  {/* CHANGED: Added Client ID column */}
                  <th className="px-4 py-3 text-left w-24">Client ID</th>
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
                    {/* CHANGED: Added cell for Client ID, formatted with leading zero */}
                    <td className="px-4 py-4 w-24 font-mono text-sm text-gray-700">
                      {String(client.id).padStart(2, '0')}
                    </td>
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
                              <button onClick={() => handleDeleteClient(client)} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-lg">
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

      {/* --- MODALS (No changes needed below this line) --- */}
      
      {showDeleteConfirmModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Client</h3>
              <div className="mt-2 px-4 text-sm text-gray-500">
                <p>Are you sure you want to delete <strong>{clientToDelete.name}</strong>? This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <button 
                onClick={cancelDelete} 
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Other modals (Edit, Details) are unchanged and omitted for brevity but should remain in your code */}
      {/* ... */}

    </div>
  );
};

export default ClientManagement;