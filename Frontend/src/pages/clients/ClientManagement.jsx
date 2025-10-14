import React, { useState, useRef, useEffect, useContext, useMemo, useCallback } from "react";
import {
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  X,
  FileText,
  TrendingUp,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Trash2,
  Search,
} from "lucide-react";
import { useCustomers, useInvoices } from "../../hooks/useFirestore";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRef = useRef(null);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Get authentication context
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToast();

  // Use Firestore hooks
  const { customers, error, addCustomer, editCustomer, removeCustomer } =
    useCustomers({ search: searchTerm });
  
  // Fetch all invoices for calculating client statistics
  const { invoices } = useInvoices();

  // Memoized function to calculate amount paid for a client
  const calculateAmountPaid = useCallback((clientId) => {
    if (!invoices || invoices.length === 0) {
      return 0;
    }

    const clientInvoices = invoices.filter(invoice => 
      invoice.customerId === clientId || invoice.clientId === clientId
    );
    
    return clientInvoices.reduce((sum, invoice) => {
      const invoiceAmount = parseFloat(invoice.totalAmount || invoice.amount || invoice.total) || 0;
      
      // Check if invoice is marked as paid by status
      const isPaidByStatus = invoice.status === 'Paid' || invoice.status === 'paid';
      
      // Only count as paid if invoice status is 'Paid'
      if (isPaidByStatus) {
        return sum + invoiceAmount;
      }
      
      // If not paid, contribute 0 to amount paid
      return sum + 0;
    }, 0);
  }, [invoices]);

  // Memoized function to calculate client statistics
  const calculateClientStats = useCallback((clientId) => {
    if (!invoices || invoices.length === 0) {
      return {
        totalInvoices: 0,
        totalRevenue: 0,
        outstanding: 0,
      };
    }

    // Check both customerId and clientId fields since there might be inconsistency
    const clientInvoices = invoices.filter(invoice => 
      invoice.customerId === clientId || invoice.clientId === clientId
    );
    
    const totalInvoices = clientInvoices.length;
    const totalRevenue = clientInvoices.reduce((sum, invoice) => {
      const invoiceAmount = parseFloat(invoice.totalAmount || invoice.amount || invoice.total) || 0;
      
      // Check if invoice is marked as paid by status
      const isPaidByStatus = invoice.status === 'Paid' || invoice.status === 'paid';
      
      // Only add to revenue if invoice is paid
      if (isPaidByStatus) {
        return sum + invoiceAmount;
      }
      
      // If not paid, contribute 0 to revenue
      return sum + 0;
    }, 0);
    
    const outstanding = clientInvoices.reduce((sum, invoice) => {
      const invoiceAmount = parseFloat(invoice.totalAmount || invoice.amount || invoice.total) || 0;
      const paidAmount = parseFloat(invoice.paidAmount || 0) || 0;
      
      // Check if invoice is marked as paid by status
      const isPaidByStatus = invoice.status === 'Paid' || invoice.status === 'paid';
      
      // If invoice is marked as paid by status, outstanding is 0
      if (isPaidByStatus) {
        return sum + 0;
      }
      
      // Otherwise, calculate unpaid amount
      const unpaidAmount = invoiceAmount - paidAmount;
      return sum + Math.max(0, unpaidAmount); // Ensure we don't go negative
    }, 0);

    return {
      totalInvoices,
      totalRevenue,
      outstanding,
    };
  }, [invoices]);

  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    phone: "",
    email: "",
    address: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    gstin: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClient = async () => {
    if (formData.name && formData.email) {
      const result = await addCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        company: formData.gstin, // Using GSTIN as company identifier
        taxId: formData.gstin,
      });

      if (result.success) {
        success(`Client "${formData.name}" added successfully!`);
        setFormData({ name: "", gstin: "", phone: "", email: "", address: "" });
        setShowAddModal(false);
      } else {
        showError(`Failed to add client: ${result.error}`);
      }
    } else {
      showError("Please fill in required fields (Name and Email)");
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", gstin: "", phone: "", email: "", address: "" });
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
      address: client.address,
    });
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  const handleUpdateClient = async () => {
    if (editFormData.name && editFormData.email && selectedClient) {
      const result = await editCustomer(selectedClient.id, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address,
        company: editFormData.gstin,
        taxId: editFormData.gstin,
      });

      if (result.success) {
        success(`Client "${editFormData.name}" updated successfully!`);
        setShowEditModal(false);
        setSelectedClient(null);
        setEditFormData({
          name: "",
          gstin: "",
          phone: "",
          email: "",
          address: "",
        });
      } else {
        showError(`Failed to update client: ${result.error}`);
      }
    } else {
      showError("Please fill in required fields (Name and Email)");
    }
  };

  const handleDeleteClient = (client) => {
    setClientToDelete(client);
    setShowDeleteConfirmModal(true);
    setDropdownOpen(null);
  };

  // CHANGED: New function to perform the actual deletion
  const confirmDelete = async () => {
    if (clientToDelete) {
      const result = await removeCustomer(clientToDelete.id);
      if (result.success) {
        success(`Client "${clientToDelete.name}" deleted successfully!`);
        setShowDeleteConfirmModal(false);
        setClientToDelete(null);
      } else {
        showError(`Failed to delete client: ${result.error}`);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setClientToDelete(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setSelectedClient(null);
    setEditFormData({ name: "", gstin: "", phone: "", email: "", address: "" });
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Client Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your client relationships and track business performance
            </p>
            {/* debug overlay removed */}
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <main className="mt-6 flex flex-col gap-6">
          <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full">
              <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Client Name</th>
                  <th className="px-6 py-3 text-left">GST Number</th>
                  <th className="px-6 py-3 text-left">Phone Number</th>
                  <th className="px-6 py-3 text-left">Total Invoices</th>
                  <th className="px-6 py-3 text-left">Total Revenue</th>
                  <th className="px-6 py-3 text-left">Outstanding</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {error ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="text-red-600">
                        <p>Error loading clients: {error}</p>
                        <button
                          onClick={() => window.location.reload()}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : customers.length > 0 ? (
                  customers.map((client) => {
                    const stats = calculateClientStats(client.id);
                    return (
                      <tr
                        key={client.id}
                        className="text-sm transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {client.name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {client.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {client.taxId || client.company || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {client.phone || "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {stats.totalInvoices}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          `₹${stats.totalRevenue.toLocaleString('en-IN')}`
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          <span className={stats.outstanding > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                            ₹{stats.outstanding.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewClient(client)}
                              className="p-1 text-gray-600 transition-colors hover:text-blue-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditClient(client)}
                              className="p-1 text-gray-600 transition-colors hover:text-green-600"
                              title="Edit Client"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client)}
                              className="p-1 text-gray-600 transition-colors hover:text-red-600"
                              title="Delete Client"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No clients found.{" "}
                      {searchTerm && "Try adjusting your search criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* --- MODALS (No changes needed below this line) --- */}

      {showDeleteConfirmModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-auto p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Delete Client
              </h3>
              <div className="mt-2 px-4 text-sm text-gray-500">
                <p>
                  Are you sure you want to delete{" "}
                  <strong>{clientToDelete.name}</strong>? This action cannot be
                  undone.
                </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative">
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              title="Close"
            >
              <X size={18} />
            </button>
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Add New Client
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter Client name"
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      GSTIN *
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={formData.gstin}
                      onChange={handleInputChange}
                      placeholder="e.g., 27ABCDE1234F1Z5"
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Contact
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 900XX 58XXX"
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="contact@example.com"
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative">
            <button
              onClick={handleCancelEdit}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              title="Close"
            >
              <X size={18} />
            </button>
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Edit Client
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      GSTIN *
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      value={editFormData.gstin}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Contact
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateClient}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Update Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-auto relative overflow-hidden my-8">
            <div className="bg-blue-50 px-6 py-4 flex items-center gap-3 relative">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                {selectedClient.name}
              </h2>
              <button
                onClick={handleCloseDetails}
                className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                title="Close"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Statistics Cards */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-gray-900">
                          {calculateClientStats(selectedClient.id).totalInvoices}
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">Total Invoices</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-gray-900">
                          `₹${calculateClientStats(selectedClient.id).totalRevenue.toLocaleString('en-IN')}`
                        </div>
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-green-600 font-bold text-lg">
                            ₹
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">Total Revenue</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-gray-900">
                          <span className={calculateClientStats(selectedClient.id).outstanding > 0 ? "text-red-600" : "text-green-600"}>
                            ₹{calculateClientStats(selectedClient.id).outstanding.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-red-600 font-bold text-lg">₹</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">Outstanding</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-gray-900">
                          `₹${calculateAmountPaid(selectedClient.id).toLocaleString('en-IN')}`
                        </div>
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp size={16} className="text-green-600" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">Amount Paid</div>
                    </div>
                  </div>
                </div>
                {/* Right Column - Contact Info and Business Statistics */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center gap-3">
                        <FileText
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />
                        <div>
                          <div className="font-medium">{selectedClient.name}</div>
                          <div className="text-xs text-gray-500">
                            GSTIN: {selectedClient.gstin}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-gray-400 flex-shrink-0" />
                        <span>{selectedClient.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-gray-400 flex-shrink-0" />
                        <span>{selectedClient.email}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={16}
                          className="text-gray-400 flex-shrink-0 mt-0.5"
                        />
                        <span>{selectedClient.address}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">
                      Business Statistics
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">First Invoice:</span>
                        <span className="font-medium text-gray-900">
                          {selectedClient.firstInvoice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Invoice:</span>
                        <span className="font-medium text-gray-900">
                          {selectedClient.lastInvoice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Invoice:</span>
                        <span className="font-medium text-gray-900">
                          {selectedClient.avgInvoice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Rate:</span>
                        <span className="font-medium text-green-600">
                          {selectedClient.paymentRate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Revenue Chart - Full Width */}
              {selectedClient.revenueData &&
                selectedClient.revenueData.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">
                      Revenue Contribution (Last 4 Months)
                    </h3>
                    <div className="flex justify-center items-end gap-6 h-48 px-4">
                      {(() => {
                        const maxValue = Math.max(
                          ...selectedClient.revenueData.map((d) => d.value)
                        );
                        return selectedClient.revenueData.map((data) => (
                          <div
                            key={data.month}
                            className="flex flex-col items-center flex-1"
                          >
                            <div
                              className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors"
                              style={{
                                height: `${Math.max(
                                  (data.value / maxValue) * 120,
                                  20
                                )}px`,
                              }}
                              title={data.label}
                            ></div>
                            <div className="text-xs font-medium text-gray-800 mt-2">
                              {data.month}
                            </div>
                            <div className="text-xs text-gray-500">
                              {data.label}
                            </div>
                          </div>
                        ));
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
