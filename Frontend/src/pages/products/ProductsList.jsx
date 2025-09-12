import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, X } from 'lucide-react';

// --- MOCK DATA: Start of Changes ---

// NOTE: In a real application, this client data would be fetched from an API or passed via props.
// It is included here to make the component functional for demonstration.
const availableClients = [
    { id: 1, name: 'Sunshine Traders' },
    { id: 2, name: 'TechnoFab Industries' },
    { id: 3, name: 'Global Imports' },
];

// CHANGED: Products now have a 'clientId' and more descriptive names.
const initialProducts = [
    { id: 'PROD01', name: 'Industrial Gearbox T-100', hsn: '8483', price: '₹1,25,000', revenue: '12,00,000', clientId: 2 },
    { id: 'PROD02', name: 'Quantum Processor Q-Chip', hsn: '8542', price: '₹2,50,000', revenue: '25,00,000', clientId: 1 },
    { id: 'PROD03', name: 'AeroGlide Wing Assembly', hsn: '8803', price: '₹95,000', revenue: '8,70,000', clientId: 3 },
    { id: 'PROD04', name: 'Nexus Robotic Arm v2', hsn: '8479', price: '₹5,60,000', revenue: '48,00,000', clientId: 2 },
    { id: 'PROD05', name: 'BioSynth Protein Sequencer', hsn: '9027', price: '₹1,10,000', revenue: '11,50,000', clientId: 1 },
];
// --- MOCK DATA: End of Changes ---

const ModalWrapper = ({ children, onClose }) => (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 modal-backdrop flex justify-center items-center z-50 p-4"
        onClick={onClose}
    >
        <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    </div>
);

// --- CHANGED: ProductFormModal now accepts clients and handles client selection ---
const ProductFormModal = ({ onClose, onSave, productToEdit, clients }) => {
    const [name, setName] = useState('');
    const [hsn, setHsn] = useState('');
    const [price, setPrice] = useState('');
    const [selectedClientId, setSelectedClientId] = useState(''); // State for the dropdown

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setHsn(productToEdit.hsn);
            const priceValue = productToEdit.price.replace(/[^0-9.-]+/g,"");
            setPrice(priceValue);
            setSelectedClientId(productToEdit.clientId || ''); // Set client on edit
        } else {
            // Reset form for adding new product
            setName('');
            setHsn('');
            setPrice('');
            setSelectedClientId('');
        }
    }, [productToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...productToEdit, name, hsn, price, clientId: selectedClientId }); // Pass clientId on save
    };
    
    const modalTitle = productToEdit ? "Edit Product" : "Add New Product";
    const submitButtonText = productToEdit ? "Save Changes" : "Add Product";

    return (
        <ModalWrapper onClose={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" title="Close"><X size={18} /></button>
            <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{modalTitle}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* CHANGED: Added Client Selector Dropdown */}
                    <div>
                        <label htmlFor="client" className="block text-sm text-gray-700 mb-1">Client *</label>
                        <select 
                            id="client" 
                            value={selectedClientId} 
                            onChange={(e) => setSelectedClientId(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                            required
                        >
                            <option value="" disabled>Select a client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="productName" className="block text-sm text-gray-700 mb-1">Product Name *</label>
                        <input id="productName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="hsnCode" className="block text-sm text-gray-700 mb-1">HSN Code *</label>
                            <input id="hsnCode" type="text" value={hsn} onChange={(e) => setHsn(e.target.value)} placeholder="e.g., 8479" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm text-gray-700 mb-1">Price (₹) *</label>
                            <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{submitButtonText}</button>
                    </div>
                </form>
            </div>
        </ModalWrapper>
    );
};

// --- CHANGED: ProductViewModal now displays the client's name ---
const ProductViewModal = ({ product, onClose, clientName }) => {
    if (!product) return null;
    return (
        <ModalWrapper onClose={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" title="Close"><X size={18} /></button>
            <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Product Details</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">S.No:</span> <span className="font-medium text-gray-800">{product.displayId}</span></div>
                    {/* Added Client Name display */}
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Client:</span> <span className="font-medium text-gray-800 text-right">{clientName}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Product Name:</span> <span className="font-medium text-gray-800 text-right">{product.name}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">HSN Code:</span> <span className="font-medium text-gray-800">{product.hsn}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Price:</span> <span className="font-medium text-gray-800">{product.price}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Revenue:</span> <span className="font-medium text-gray-800">{product.revenue}</span></div>
                </div>
                 <div className="flex justify-end pt-6">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">Close</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

const DeleteConfirmationModal = ({ onClose, onConfirm, productName }) => {
    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6 text-center">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h2>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete <strong>{productName}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-4">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// --- CHANGED: ProductRow now accepts and displays the client's name ---
const ProductRow = ({ product, serialNumber, clientName, onView, onEdit, onDelete }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-4 w-24 text-sm text-gray-600">{serialNumber}</td>
        <td className="px-4 py-4 w-auto">
             {/* Display Product Name and Client Name */}
            <div className="text-sm font-medium text-gray-900">{product.name}</div>
            <div className="text-xs text-blue-600 md:hidden">{clientName}</div>
        </td>
        {/* Added Client Name column, hidden on small screens */}
        <td className="px-4 py-4 w-60 text-sm text-gray-600 hidden md:table-cell">{clientName}</td>
        <td className="px-4 py-4 w-40 text-sm text-gray-600 hidden md:table-cell">{product.hsn}</td>
        <td className="px-4 py-4 w-40 text-sm text-gray-600 hidden lg:table-cell">{product.price}</td>
        <td className="px-4 py-4 w-32">
            <div className="flex items-center gap-1">
                <button onClick={() => onView(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details"><Eye size={16} className="text-gray-700" /></button>
                <button onClick={() => onEdit(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit Product"><Edit size={16} className="text-gray-700" /></button>
                <button onClick={() => onDelete(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete Product"><Trash2 size={16} className="text-gray-700" /></button>
            </div>
        </td>
    </tr>
);

export default function ProductManagement() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });
  // CHANGED: Client data is now part of the state
  const [clients, setClients] = useState(availableClients);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.hsn.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const closeModal = () => setModal({ isOpen: false, type: null, data: null });

  // CHANGED: handleSaveProduct now also saves the clientId
  const handleSaveProduct = (productData) => {
    if (modal.type === 'edit') {
        setProducts(products.map(p => p.id === productData.id ? { 
            ...p, 
            name: productData.name,
            hsn: productData.hsn,
            price: `₹${Number(productData.price).toLocaleString('en-IN')}`,
            clientId: productData.clientId,
        } : p));
    } else {
        const newProduct = {
            id: `PROD${Date.now()}`,
            name: productData.name,
            hsn: productData.hsn,
            price: `₹${Number(productData.price).toLocaleString('en-IN')}`,
            revenue: '₹0', // New products have 0 revenue initially
            clientId: productData.clientId,
        };
        setProducts([...products, newProduct]);
    }
    closeModal();
  };

  const handleDeleteProduct = (product) => {
    setModal({ isOpen: true, type: 'delete', data: product });
  };
  
  const confirmDelete = () => {
    if (modal.data && modal.data.id) {
        setProducts(products.filter(p => p.id !== modal.data.id));
    }
    closeModal();
  };

  return (
    <>
      <div className="min-h-screen bg-white font-sans">
        <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div>
                  <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                  <p className="text-sm text-gray-500 mt-1">View all your products in one place</p>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                  <div className="relative flex-1 lg:flex-none">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by HSN or Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full lg:w-80 bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                  </div>
                  <button onClick={() => setModal({ isOpen: true, type: 'add', data: null })} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Plus size={16} />
                      Add Product
                  </button>
              </div>
          </header>
          
          <main className="mt-8">
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                        <tr>
                            {/* CHANGED: Table headers updated */}
                            <th className="px-4 py-3 text-left w-24">S.No</th>
                            <th className="px-4 py-3 text-left w-auto">Product Name</th>
                            <th className="px-4 py-3 text-left w-60 hidden md:table-cell">Client Name</th>
                            <th className="px-4 py-3 text-left w-40 hidden md:table-cell">HSN Code</th>
                            <th className="px-4 py-3 text-left w-40 hidden lg:table-cell">Price</th>
                            <th className="px-4 py-3 text-left w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product, index) => {
                                // CHANGED: Find the client name corresponding to the product's clientId
                                const client = clients.find(c => c.id === product.clientId);
                                const clientName = client ? client.name : 'Unknown Client';
                                return (
                                    <ProductRow 
                                        key={product.id}
                                        product={product}
                                        serialNumber={String(index + 1).padStart(2, '0')}
                                        clientName={clientName} // Pass client name to the row
                                        onView={(p) => setModal({ isOpen: true, type: 'view', data: { ...p, displayId: String(index + 1).padStart(2, '0') } })}
                                        onEdit={(p) => setModal({ isOpen: true, type: 'edit', data: p })}
                                        onDelete={handleDeleteProduct}
                                    />
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-sm text-gray-500 py-12">No products found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </main>
        </div>
      </div>
      
      {/* --- MODAL RENDERING --- */}
      {modal.isOpen && (
        <>
            {modal.type === 'view' && (
                <ProductViewModal 
                    product={modal.data} 
                    onClose={closeModal} 
                    // Pass the client name to the view modal
                    clientName={clients.find(c => c.id === modal.data.clientId)?.name || 'Unknown Client'}
                />
            )}
            {(modal.type === 'add' || modal.type === 'edit') && (
                <ProductFormModal
                    onClose={closeModal}
                    onSave={handleSaveProduct}
                    productToEdit={modal.type === 'edit' ? modal.data : null}
                    clients={clients} // Pass clients list to the form modal
                />
            )}
            {modal.type === 'delete' && (
              <DeleteConfirmationModal 
                onClose={closeModal} 
                onConfirm={confirmDelete} 
                productName={modal.data?.name} 
              />
            )}
        </>
      )}
    </>
  );
}