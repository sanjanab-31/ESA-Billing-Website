import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, X } from 'lucide-react';

// --- Mock Data for the Product Table ---
const initialProducts = [
    { id: 'PROD01', name: 'TechnoFab Industries', hsn: '3223', price: '₹1,25,000', revenue: '12,00,000' },
    { id: 'PROD02', name: 'QuantumCore Solutions', hsn: '3223', price: '₹2,50,000', revenue: '25,00,000' },
    { id: 'PROD03', name: 'AeroGlide Dynamics', hsn: '3232', price: '₹95,000', revenue: '8,70,000' },
    { id: 'PROD04', name: 'Nexus Robotics', hsn: '3223', price: '₹5,60,000', revenue: '48,00,000' },
    { id: 'PROD05', name: 'BioSynth Innovations', hsn: '3232', price: '₹1,10,000', revenue: '11,50,000' },
];

// --- Reusable Modal Wrapper for the Overlay Effect ---
const ModalWrapper = ({ children, onClose }) => (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
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

// --- Add/Edit Product Modal Component ---
const ProductFormModal = ({ onClose, onSave, productToEdit }) => {
    const [name, setName] = useState('');
    const [hsn, setHsn] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setHsn(productToEdit.hsn);
            const priceValue = productToEdit.price.replace(/[^0-9.-]+/g,"");
            setPrice(priceValue);
        } else {
            setName('');
            setHsn('');
            setPrice('');
        }
    }, [productToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...productToEdit, name, hsn, price });
    };
    
    const modalTitle = productToEdit ? "Edit Product" : "Add New Product";
    const submitButtonText = productToEdit ? "Save Changes" : "Add Product";

    return (
        <ModalWrapper onClose={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" title="Close"><X size={18} /></button>
            <div className="p-6">
                {/* FONT CHANGE: Modal title */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">{modalTitle}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        {/* FONT CHANGE: Label text size */}
                        <label htmlFor="productName" className="block text-sm text-gray-700 mb-1">Product Name *</label>
                        {/* FONT CHANGE: Input text size */}
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
                        {/* FONT CHANGE: Button text size and weight */}
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{submitButtonText}</button>
                    </div>
                </form>
            </div>
        </ModalWrapper>
    );
};

// --- View Product Modal ---
const ProductViewModal = ({ product, onClose }) => {
    if (!product) return null;
    return (
        <ModalWrapper onClose={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" title="Close"><X size={18} /></button>
            <div className="p-6">
                {/* FONT CHANGE: Modal title */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">Product Details</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">S.No:</span> <span className="font-medium text-gray-800">{product.displayId}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Product Name:</span> <span className="font-medium text-gray-800 text-right">{product.name}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">HSN Code:</span> <span className="font-medium text-gray-800">{product.hsn}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Price:</span> <span className="font-medium text-gray-800">{product.price}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Revenue:</span> <span className="font-medium text-gray-800">{product.revenue}</span></div>
                </div>
                 <div className="flex justify-end pt-6">
                    {/* FONT CHANGE: Button text size */}
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">Close</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-6 text-center">
                 {/* FONT CHANGE: Modal title */}
                <h2 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h2>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    {/* FONT CHANGE: Button text size and weight */}
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="button" onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
                </div>
            </div>
        </ModalWrapper>
    );
};

// --- Product Row Component ---
const ProductRow = ({ product, serialNumber, onView, onEdit, onDelete }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-4 w-24 text-sm text-gray-600">{serialNumber}</td>
        <td className="px-4 py-4 w-auto text-sm font-medium text-gray-900">{product.name}</td>
        <td className="px-4 py-4 w-40 text-sm text-gray-600 hidden md:table-cell">{product.hsn}</td>
        <td className="px-4 py-4 w-40 text-sm text-gray-600 hidden lg:table-cell">{product.price}</td>
        <td className="px-4 py-4 w-40 text-sm text-gray-600 hidden lg:table-cell">{product.revenue}</td>
        <td className="px-4 py-4 w-32">
            <div className="flex items-center gap-1">
                <button onClick={() => onView(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Details"><Eye size={16} className="text-gray-700" /></button>
                <button onClick={() => onEdit(product)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit Product"><Edit size={16} className="text-gray-700" /></button>
                <button onClick={() => onDelete(product.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete Product"><Trash2 size={16} className="text-gray-700" /></button>
            </div>
        </td>
    </tr>
);

// --- Main App Component ---
export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.hsn.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const closeModal = () => setModal({ isOpen: false, type: null, data: null });

  const handleSaveProduct = (productData) => {
    if (modal.type === 'edit') {
        setProducts(products.map(p => p.id === productData.id ? { ...p, ...productData, price: `₹${Number(productData.price).toLocaleString('en-IN')}` } : p));
    } else {
        const newProduct = {
            id: `PROD${Date.now()}`,
            name: productData.name,
            hsn: productData.hsn,
            price: `₹${Number(productData.price).toLocaleString('en-IN')}`,
            revenue: 'N/A',
        };
        setProducts([...products, newProduct]);
    }
    closeModal();
  };

  const handleDeleteProduct = (productId) => {
    setModal({ isOpen: true, type: 'delete', data: { id: productId } });
  };
  
  const confirmDelete = () => {
    if (modal.data && modal.data.id) {
        setProducts(products.filter(p => p.id !== modal.data.id));
    }
    closeModal();
  };

  return (
    <>
      {/* PADDING CHANGE: Updated main container to match other pages */}
      <div className="min-h-screen bg-white font-sans">
        <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div>
                  {/* FONT CHANGE: Page title */}
                  <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                  <p className="text-sm text-gray-500 mt-1">View all your products in one place</p>
              </div>
              <div className="flex items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
                  <div className="relative flex-1 lg:flex-none">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={16} className="text-gray-400" />
                      </div>
                      {/* FONT & STYLE CHANGE: Search input */}
                      <input type="text" placeholder="Search by HSN or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full lg:w-80 pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  {/* FONT CHANGE: Button text size and weight */}
                  <button onClick={() => setModal({ isOpen: true, type: 'add', data: null })} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      <Plus size={16} />
                      Add Product
                  </button>
              </div>
          </header>
          
          <main className="mt-8">
            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    {/* FONT & STYLE CHANGE: Table Header */}
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left w-24">S.No</th>
                            <th className="px-4 py-3 text-left w-auto">Product Name</th>
                            <th className="px-4 py-3 text-left w-40 hidden md:table-cell">HSN Code</th>
                            <th className="px-4 py-3 text-left w-40 hidden lg:table-cell">Price</th>
                            <th className="px-4 py-3 text-left w-40 hidden lg:table-cell">Total Revenue</th>
                            <th className="px-4 py-3 text-left w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product, index) => (
                                <ProductRow 
                                    key={product.id}
                                    product={product}
                                    serialNumber={String(index + 1).padStart(2, '0')}
                                    onView={(p) => setModal({ isOpen: true, type: 'view', data: { ...p, displayId: String(index + 1).padStart(2, '0') } })}
                                    onEdit={(p) => setModal({ isOpen: true, type: 'edit', data: p })}
                                    onDelete={handleDeleteProduct}
                                />
                            ))
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
            {modal.type === 'view' && <ProductViewModal product={modal.data} onClose={closeModal} />}
            {(modal.type === 'add' || modal.type === 'edit') && (
                <ProductFormModal
                    onClose={closeModal}
                    onSave={handleSaveProduct}
                    productToEdit={modal.type === 'edit' ? modal.data : null}
                />
            )}
            {modal.type === 'delete' && <DeleteConfirmationModal onClose={closeModal} onConfirm={confirmDelete} />}
        </>
      )}
    </>
  );
}