import React, { useState, useMemo, useEffect, useContext } from "react";
import { Plus, Search, Eye, Edit, Trash2, X } from "lucide-react";
import { useProducts } from "../../hooks/useFirestore";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

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

// --- ProductFormModal for adding/editing products ---
const ProductFormModal = ({ onClose, onSave, productToEdit }) => {
  const [name, setName] = useState("");
  const [hsn, setHsn] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setHsn(productToEdit.hsn);
      const priceValue = productToEdit.price.replace(/[^0-9.-]+/g, "");
      setPrice(priceValue);
    } else {
      // Reset form for adding new product
      setName("");
      setHsn("");
      setPrice("");
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
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        title="Close"
      >
        <X size={18} />
      </button>
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{modalTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="productName"
              className="block text-sm text-gray-700 mb-1"
            >
              Product Name *
            </label>
            <input
              id="productName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="hsnCode"
                className="block text-sm text-gray-700 mb-1"
              >
                HSN Code *
              </label>
              <input
                id="hsnCode"
                type="text"
                value={hsn}
                onChange={(e) => setHsn(e.target.value)}
                placeholder="e.g., 8479"
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm text-gray-700 mb-1"
              >
                Price (₹) *
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-gray-100 border-0 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  );
};

// --- ProductViewModal for viewing product details ---
const ProductViewModal = ({ product, onClose }) => {
  if (!product) return null;
  return (
    <ModalWrapper onClose={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        title="Close"
      >
        <X size={18} />
      </button>
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Product Details
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">S.No:</span>{" "}
            <span className="font-medium text-gray-800">
              {product.displayId}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Product Name:</span>{" "}
            <span className="font-medium text-gray-800 text-right">
              {product.name}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">HSN Code:</span>{" "}
            <span className="font-medium text-gray-800">{product.hsn}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600">Price:</span>{" "}
            <span className="font-medium text-gray-800">{product.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Revenue:</span>{" "}
            <span className="font-medium text-gray-800">{product.revenue}</span>
          </div>
        </div>
        <div className="flex justify-end pt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

const DeleteConfirmationModal = ({ onClose, onConfirm, productName }) => {
  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Confirm Deletion
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{productName}</strong>? This
          action cannot be undone.
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// --- CHANGED: ProductRow now accepts and displays the client's name ---
const ProductRow = ({
  product,
  serialNumber,
  onView,
  onEdit,
  onDelete,
}) => (
  <tr className="text-sm transition-colors hover:bg-gray-50">
    <td className="px-6 py-4 font-medium text-gray-900">{serialNumber}</td>
    <td className="px-6 py-4">
      <div className="font-medium text-gray-900">{product.name}</div>
    </td>
    <td className="px-6 py-4 text-gray-700">{product.hsn}</td>
    <td className="px-6 py-4 font-medium text-gray-900">{product.price}</td>
    <td className="px-6 py-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onView(product)}
          className="p-1 text-gray-600 transition-colors hover:text-blue-600"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(product)}
          className="p-1 text-gray-600 transition-colors hover:text-green-600"
          title="Edit Product"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-1 text-gray-600 transition-colors hover:text-red-600"
          title="Delete Product"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

// --- Main App Component ---
export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({ isOpen: false, type: null, data: null });

  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToast();

  // Use Firestore hook
  const {
    products,
    loading,
    error,
    addProduct,
    editProduct,
    removeProduct
  } = useProducts({ search: searchTerm });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.hsn.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const closeModal = () => setModal({ isOpen: false, type: null, data: null });

  // handle save (add or edit) using Firestore
  const handleSaveProduct = async (productData) => {
    if (modal.type === "edit" && productData?.id) {
      const result = await editProduct(productData.id, {
        name: productData.name,
        hsn: productData.hsn,
        price: parseFloat(productData.price),
      });

      if (result.success) {
        success(`Product "${productData.name}" updated successfully!`);
        closeModal();
      } else {
        showError(`Failed to update product: ${result.error}`);
      }
    } else {
      const result = await addProduct({
        name: productData.name,
        hsn: productData.hsn,
        price: parseFloat(productData.price),
      });

      if (result.success) {
        success(`Product "${productData.name}" added successfully!`);
        closeModal();
      } else {
        showError(`Failed to add product: ${result.error}`);
      }
    }
  };

  const handleDeleteProduct = (product) =>
    setModal({ isOpen: true, type: "delete", data: product });

  const confirmDelete = async () => {
    if (modal.data && modal.data.id) {
      const result = await removeProduct(modal.data.id);
      if (result.success) {
        success(`Product "${modal.data.name}" deleted successfully!`);
        closeModal();
      } else {
        showError(`Failed to delete product: ${result.error}`);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen text-slate-800 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                View all your products in one place
              </p>
              {/* debug overlay removed */}
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by HSN or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 bg-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() =>
                  setModal({ isOpen: true, type: "add", data: null })
                }
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>
          </header>

          <main className="mt-6 flex flex-col gap-6">
            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full min-w-[600px]">
                <thead className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">S.No</th>
                    <th className="px-6 py-3 text-left">Product Name</th>
                    <th className="px-6 py-3 text-left">HSN Code</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {error ? (
                    <tr>
                      <td colSpan="5" className="text-center text-sm text-gray-500 py-12">
                        <div className="text-red-600">
                          <p>Error loading products: {error}</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => {
                      return (
                        <ProductRow
                          key={product.id}
                          product={{
                            ...product,
                            price: `₹${Number(product.price).toLocaleString('en-IN')}`,
                            revenue: 'N/A'
                          }}
                          serialNumber={String(index + 1).padStart(2, '0')}
                          onView={(p) =>
                            setModal({
                              isOpen: true,
                              type: "view",
                              data: {
                                ...p,
                                displayId: String(index + 1).padStart(2, "0"),
                              },
                            })
                          }
                          onEdit={(p) =>
                            setModal({ isOpen: true, type: "edit", data: p })
                          }
                          onDelete={handleDeleteProduct}
                        />
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-sm text-gray-500 py-12"
                      >
                        No products found.{" "}
                        {searchTerm && "Try adjusting your search criteria."}
                      </td>
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
          {modal.type === "view" && (
            <ProductViewModal
              product={modal.data}
              onClose={closeModal}
            />
          )}
          {(modal.type === "add" || modal.type === "edit") && (
            <ProductFormModal
              onClose={closeModal}
              onSave={handleSaveProduct}
              productToEdit={modal.type === "edit" ? modal.data : null}
            />
          )}
          {modal.type === "delete" && (
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
