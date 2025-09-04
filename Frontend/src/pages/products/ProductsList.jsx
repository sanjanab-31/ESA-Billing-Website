import React, { useState, useMemo, useEffect } from 'react';

// --- SVG Icon Components ---
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-blue-600 cursor-pointer transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-green-600 cursor-pointer transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-600 cursor-pointer transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Mock Data for the Product Table ---
const initialProducts = [
    { id: '01', name: 'TechnoFab Industries', hsn: '3223', price: '₹1,25,000', revenue: '12,00,000' },
    { id: '02', name: 'QuantumCore Solutions', hsn: '3223', price: '₹2,50,000', revenue: '25,00,000' },
    { id: '03', name: 'AeroGlide Dynamics', hsn: '3232', price: '₹95,000', revenue: '8,70,000' },
    { id: '04', name: 'Nexus Robotics', hsn: '3223', price: '₹5,60,000', revenue: '48,00,000' },
    { id: '05', name: 'BioSynth Innovations', hsn: '3232', price: '₹1,10,000', revenue: '11,50,000' },
    { id: '06', name: 'StellarWeave Textiles', hsn: '3232', price: '₹75,000', revenue: '9,20,000' },
    { id: '07', name: 'HydroPure Systems', hsn: '3222', price: '₹3,15,000', revenue: '33,00,000' },
    { id: '08', name: 'TerraForm Builders', hsn: '2323', price: '₹8,50,000', revenue: '95,00,000' },
    { id: '09', name: 'ChronoGuard Security', hsn: '2323', price: '₹45,000', revenue: '5,50,000' },
];

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
        }
    }, [productToEdit]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !hsn.trim() || !price.toString().trim()) {
            console.error('Please fill all required fields.');
            return;
        }
        onSave({ ...productToEdit, name, hsn, price });
    };
    
    const modalTitle = productToEdit ? "Edit Product" : "Add New Product";
    const submitButtonText = productToEdit ? "Save Changes" : "Add Product";

    return (
        // --- THIS IS THE MODIFIED LINE ---
        <div className="absolute inset-x-0 top-0 flex justify-center items-start pt-16 z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon /></button>
                <h2 className="text-xl font-bold text-gray-900 mb-6">{modalTitle}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                        <input id="productName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" className="w-full bg-gray-100 border-none rounded-md py-2 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label htmlFor="hsnCode" className="block text-sm font-medium text-gray-700 mb-1">HSN Code *</label>
                            <input id="hsnCode" type="text" value={hsn} onChange={(e) => setHsn(e.target.value)} placeholder="e.g., 8479" className="w-full bg-gray-100 border-none rounded-md py-2 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                            <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="w-full bg-gray-100 border-none rounded-md py-2 px-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</button>
                        <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">{submitButtonText}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- View Product Modal ---
const ProductViewModal = ({ product, onClose }) => {
    if (!product) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><XIcon /></button>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Product Details</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-600">S.No:</span> <span>{product.id}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-600">Product Name:</span> <span className="text-right">{product.name}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-600">HSN Code:</span> <span>{product.hsn}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="font-semibold text-gray-600">Price:</span> <span>{product.price}</span></div>
                    <div className="flex justify-between"><span className="font-semibold text-gray-600">Total Revenue:</span> <span>{product.revenue}</span></div>
                </div>
                 <div className="flex justify-end pt-6">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">Close</button>
                </div>
            </div>
        </div>
    );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative text-center">
                 <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
                 <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                 <div className="flex justify-center gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Product Row Component ---
const ProductRow = ({ product, onView, onEdit, onDelete }) => (
    <div className="flex items-center px-4 py-4 border-b border-gray-200 last:border-b-0 text-sm text-gray-800">
        <div className="w-24 shrink-0 text-gray-600">{product.id}</div>
        <div className="flex-1 min-w-0 pr-4">{product.name}</div>
        <div className="w-40 shrink-0 text-gray-600 hidden md:block">{product.hsn}</div>
        <div className="w-40 shrink-0 text-gray-600 hidden lg:block">{product.price}</div>
        <div className="w-40 shrink-0 text-gray-600 hidden lg:block">{product.revenue}</div>
        <div className="w-32 shrink-0 flex justify-start items-center gap-6">
            <button onClick={() => onView(product)} aria-label="View Product"><EyeIcon /></button>
            <button onClick={() => onEdit(product)} aria-label="Edit Product"><PencilIcon /></button>
            <button onClick={() => onDelete(product.id)} aria-label="Delete Product"><TrashIcon /></button>
        </div>
    </div>
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
            id: String(products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1).padStart(2, '0'),
            name: productData.name,
            hsn: productData.hsn,
            price: `₹${Number(productData.price).toLocaleString('en-IN')}`,
            revenue: '0',
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
      <div className="bg-gray-50 font-sans min-h-screen p-4 pt-10">
        {/* --- THIS IS THE MODIFIED LINE --- */}
        <div className="w-full max-w-7xl mx-auto space-y-6 relative">
          <header>
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-500 mt-1">View all your products in one place</p>
          </header>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:max-w-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                  <input type="text" placeholder="Search by HSN code or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
              </div>
              <button onClick={() => setModal({ isOpen: true, type: 'add', data: null })} className="flex w-full sm:w-auto items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <PlusIcon />
                  Add Product
              </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="hidden sm:flex items-center px-4 py-3 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="w-24 shrink-0">S.No</div>
                  <div className="flex-1 min-w-0 pr-4">Product Name</div>
                  <div className="w-40 shrink-0 hidden md:block">HSN Code</div>
                  <div className="w-40 shrink-0 hidden lg:block">Price</div>
                  <div className="w-40 shrink-0 hidden lg:block">Total Revenue</div>
                  <div className="w-32 shrink-0">Actions</div>
              </div>
              <div className="divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductRow 
                        key={product.id} 
                        product={product}
                        onView={(p) => setModal({ isOpen: true, type: 'view', data: p })}
                        onEdit={(p) => setModal({ isOpen: true, type: 'edit', data: p })}
                        onDelete={handleDeleteProduct}
                      />
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-10">No products found.</p>
                  )}
              </div>
          </div>
          
          {/* Note: Modals are now rendered inside the relative parent */}
          {modal.isOpen && modal.type === 'view' && (
            <ProductViewModal product={modal.data} onClose={closeModal} />
          )}
          {modal.isOpen && (modal.type === 'add' || modal.type === 'edit') && (
            <ProductFormModal
                onClose={closeModal}
                onSave={handleSaveProduct}
                productToEdit={modal.type === 'edit' ? modal.data : null}
            />
          )}
          {modal.isOpen && modal.type === 'delete' && (
            <DeleteConfirmationModal
                onClose={closeModal}
                onConfirm={confirmDelete}
            />
          )}
        </div>
      </div>
    </>
  );
}