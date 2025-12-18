import React, { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    Eye,
    FileText,
    Plus,
    Trash2,
    X // Added X icon
} from "lucide-react";
import { useInvoices, useCustomers, useProducts } from "../../hooks/useFirestore";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ConfirmationModal from "../../components/ConfirmationModal";
import ClientAutocomplete from "../../components/ClientAutocomplete";
import ProductAutocomplete from "../../components/ProductAutocomplete";
import InvoicePreview from "../../components/InvoicePreview";

const InvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { success, error: showError, warning } = useToast();

    const {
        invoices,
        allInvoices,
        addInvoice,
        editInvoice,
        loading: invoicesLoading,
    } = useInvoices();

    const { customers } = useCustomers();
    const { allProducts: products, addProduct } = useProducts();

    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Navigation Modal State
    const [showNavModal, setShowNavModal] = useState(false);
    const [navModalConfig, setNavModalConfig] = useState({
        title: "",
        message: "",
        confirmLabel: "",
        cancelLabel: "",
        onConfirm: () => { },
        onCancel: () => { }
    });

    // Cancel Invoice Modal State
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Product Confirmation State
    const [productConfirmModal, setProductConfirmModal] = useState({
        isOpen: false,
        products: [],
        pendingAction: null // 'saveDraft' | 'saveInvoice' | 'updateInvoice'
    });
    const [skippedProducts, setSkippedProducts] = useState([]); // Track skipped products in this session
    const [pendingActionArgs, setPendingActionArgs] = useState(null); // Args for the pending action (e.g., fromBlocker)

    const getInitialInvoiceData = () => ({
        invoiceNumber: "", // Will be generated
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        poNumber: "",
        poDate: "",
        dcNumber: "",
        dcDate: "",
        clientId: "",
        client: null,
        items: [],
        cgst: 9,
        sgst: 9,
        igst: 0,
        bankDetails: "State Bank Of India",
        status: "Unpaid",
        declaration:
            "We declare that this invoice shows the actual price of the goods Described and that all Particulars are true and correct.",
        isRoundOff: false,
        invoiceNotes: "",
    });

    const [invoiceData, setInvoiceData] = useState(getInitialInvoiceData());
    const [originalData, setOriginalData] = useState(null); // To track changes against

    const [calculations, setCalculations] = useState({
        subtotal: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        roundOffAmount: 0,
        total: 0,
    });

    // --- Invoice Number Generation ---
    const generateNextInvoiceNumber = () => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const financialYearStart =
            today.getMonth() >= 3 ? currentYear : currentYear - 1;
        const financialYearEnd = financialYearStart + 1;
        const financialYearString = `${financialYearStart}-${financialYearEnd
            .toString()
            .slice(2)}`;

        const invoicesInCurrentYear = (allInvoices || []).filter((inv) => {
            return inv.invoiceNumber && inv.invoiceNumber.endsWith(`/${financialYearString}`);
        });

        if (invoicesInCurrentYear.length === 0) {
            return `001/${financialYearString}`;
        }

        const maxNumber = invoicesInCurrentYear.reduce((max, invoice) => {
            const match = invoice.invoiceNumber.match(/(\d+)\/\d{4}-\d{2}$/);
            if (match && match[1]) {
                return Math.max(Number.parseInt(match[1], 10), max);
            }
            return max;
        }, 0);

        return `${String(maxNumber + 1).padStart(3, "0")}/${financialYearString}`;
    };

    // --- Load Data ---
    useEffect(() => {
        if (invoicesLoading) return;

        if (isEditMode) {
            if (!allInvoices || allInvoices.length === 0) return; // Wait for invoices

            const invoiceToEdit = allInvoices.find((inv) => inv.id === id);
            if (invoiceToEdit) {
                setInvoiceData(invoiceToEdit);
                setOriginalData(invoiceToEdit);
            } else {
                showError("Invoice not found");
                navigate("/invoices");
            }
        } else {
            // Create Mode
            if (allInvoices) {
                if (!invoiceData.invoiceNumber) {
                    const nextNum = generateNextInvoiceNumber();
                    setInvoiceData(prev => ({ ...prev, invoiceNumber: nextNum }));
                    // CRITICAL: Sync originalData with the generated number so it's not marked dirty
                    // Initialize with FULL structure + new number
                    const initialStruct = getInitialInvoiceData();
                    // Preserve the date already in invoiceData if possible, otherwise initialStruct's date is fine (same day)
                    setOriginalData({ ...initialStruct, invoiceNumber: nextNum });
                } else {
                    // If we already have one, ensure originalData is complete structure
                    // We use the CURRENT invoiceData for originalData if it's the first stable load.
                    // But if user modified it, we might be masking dirty state?
                    // No, this else block hits if allInvoices is loaded BUT invoiceNumber was ALREADY set.
                    // On first mount, invoiceNumber is "", so we hit the IF block.
                    // Re-renders shouldn't change originalData unless we want to reset.

                    // To be safe for "No details filled":
                    // If originalData is null, initialize it.
                    setOriginalData(prev => {
                        if (prev) return prev; // Don't overwrite if already set
                        return { ...getInitialInvoiceData(), invoiceNumber: invoiceData.invoiceNumber };
                    });
                }
            } else {
                // If invoices not loaded yet, we can't generate number properly or trust it.
                // Just init base.
                setOriginalData(getInitialInvoiceData());
            }
        }
        setLoading(false);
    }, [id, allInvoices, invoicesLoading, isEditMode, navigate]);

    // --- Calculations ---
    useEffect(() => {
        const itemsArray = invoiceData.items || invoiceData.products || [];
        const subtotal = itemsArray.reduce(
            (sum, item) => sum + (item.quantity || 0) * (item.rate || item.price || 0),
            0
        );
        const cgstAmount = (subtotal * invoiceData.cgst) / 100;
        const sgstAmount = (subtotal * invoiceData.sgst) / 100;
        const igstAmount = (subtotal * invoiceData.igst) / 100;
        let total = subtotal + cgstAmount + sgstAmount + igstAmount;
        let roundOffAmount = 0;
        if (invoiceData.isRoundOff) {
            const roundedTotal = Math.round(total);
            roundOffAmount = roundedTotal - total;
            total = roundedTotal;
        }
        setCalculations({
            subtotal,
            cgstAmount,
            sgstAmount,
            igstAmount,
            roundOffAmount,
            total,
        });
    }, [
        invoiceData.items,
        invoiceData.products,
        invoiceData.cgst,
        invoiceData.sgst,
        invoiceData.igst,
        invoiceData.isRoundOff,
    ]);

    // --- Dirty Check ---
    useEffect(() => {
        if (!originalData) return;
        // Simple compare - strictly, one should deep compare, but checks on key fields are usually enough
        // For now, let's assume if any setter was called (not feasible)
        // Let's rely on manual setting of dirty in handlers or deep compare simplified
        const isDirty = JSON.stringify(invoiceData) !== JSON.stringify(originalData);
        setHasUnsavedChanges(isDirty);
    }, [invoiceData, originalData]);


    // --- Handlers ---

    const handleClientSelect = (clientId) => {
        if (clientId === null) {
            setInvoiceData((prev) => ({ ...prev, clientId: "", client: null }));
            return;
        }
        const selectedClient = customers.find((c) => c.id === clientId);
        setInvoiceData((prev) => ({
            ...prev,
            clientId: clientId,
            client: selectedClient,
        }));
    };

    const addItem = () => {
        const newItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description: "",
            hsnCode: "",
            quantity: 1,
            rate: 0,
            amount: 0,
        };
        setInvoiceData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    };

    const updateItem = (itemId, field, value) => {
        setInvoiceData((prev) => ({
            ...prev,
            items: prev.items.map((item) => {
                if (item.id === itemId) {
                    const updatedItem = { ...item, [field]: value };
                    if (field === "quantity" || field === "rate") {
                        updatedItem.amount =
                            (Number.parseFloat(updatedItem.quantity) || 0) *
                            (Number.parseFloat(updatedItem.rate) || 0);
                    }
                    return updatedItem;
                }
                return item;
            }),
        }));
    };

    const removeItem = (itemId) => {
        setInvoiceData((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
        }));
    };

    const handleAddNewProduct = async (productName, clientId) => {
        // This is called by Autocomplete when user manually adds?
        // Actually Autocomplete uses onAddNewProduct just to pass the name back if we want to handle it.
        // But here we want to handle it at SAVE time.
        // Effectively, just return the mock object so UI updates.
        return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: productName,
            description: productName,
            hsnCode: "",
            rate: 0,
        };
    };

    // --- Product Confirmation Logic ---
    const checkForNewProducts = (actionType, args = null) => {
        const newProducts = [];
        const currentProductNames = (products || []).map(p => p.name.toLowerCase().trim());
        const skippedNames = skippedProducts.map(n => n.toLowerCase().trim());

        invoiceData.items.forEach(item => {
            const name = (item.description || item.name || "").trim();
            if (!name) return;
            const lowerName = name.toLowerCase();

            // Check if exists in DB
            const exists = currentProductNames.includes(lowerName);
            // Check if already skipped
            const isSkipped = skippedNames.includes(lowerName);

            if (!exists && !isSkipped) {
                // Check if already in our newProducts list (dedupe)
                if (!newProducts.find(p => p.description.toLowerCase() === lowerName)) {
                    newProducts.push({ description: name, ...item });
                }
            }
        });

        if (newProducts.length > 0) {
            setPendingActionArgs(args);
            setProductConfirmModal({
                isOpen: true,
                products: newProducts,
                pendingAction: actionType
            });
            return true; // Stop save, show modal
        }
        return false; // Proceed immediate
    };

    const handleProductConfirm = async () => {
        // Add all found new products to DB
        try {
            const newProds = productConfirmModal.products;
            for (const p of newProds) {
                await addProduct({
                    name: p.description,
                    description: p.description, // Use description as name if needed or separate
                    hsn: p.hsnCode || "",
                    price: Number(p.rate) || 0,
                    unit: "Nos", // detailed default
                    // Link to current client if needed, or generic
                });
            }
            success(`Added ${newProds.length} new product(s) to database.`, "Products Added");
        } catch (err) {
            showError("Failed to add some products: " + err.message);
        }

        // Close modal and proceed with pending action
        const action = productConfirmModal.pendingAction;
        const args = pendingActionArgs;

        setProductConfirmModal({ isOpen: false, products: [], pendingAction: null });
        setPendingActionArgs(null);

        // Resume action
        if (action === 'saveDraft') executeSaveDraft(args);
        if (action === 'saveInvoice') executeSaveInvoice();
        if (action === 'updateInvoice') executeUpdateInvoice(args);
    };

    const handleProductSkip = () => {
        // Add to skipped list
        const skipped = productConfirmModal.products.map(p => p.description);
        setSkippedProducts(prev => [...prev, ...skipped]);

        // Close and proceed
        const action = productConfirmModal.pendingAction;
        const args = pendingActionArgs;

        setProductConfirmModal({ isOpen: false, products: [], pendingAction: null });
        setPendingActionArgs(null);

        if (action === 'saveDraft') executeSaveDraft(args);
        if (action === 'saveInvoice') executeSaveInvoice();
        if (action === 'updateInvoice') executeUpdateInvoice(args);
    };

    const handleProductCancel = () => {
        // Just close, do not proceed
        setProductConfirmModal({ isOpen: false, products: [], pendingAction: null });
        setPendingActionArgs(null);
        // If from blocker, reset it?
        if (pendingActionArgs) {
            // args is boolean fromBlocker? No, strict check my calls
            // check calls below
        }
        if (blocker.state === "blocked") blocker.reset();
    };

    const validateInvoice = () => {
        const {
            invoiceNumber,
            invoiceDate,
            dueDate,
            poNumber,
            poDate,
            dcNumber,
            dcDate,
            clientId,
            items,
        } = invoiceData;
        const missingFields = [];
        if (!invoiceNumber) missingFields.push("Invoice Number");
        if (!invoiceDate) missingFields.push("Invoice Date");
        if (!dueDate) missingFields.push("Due Date");
        if (!poNumber) missingFields.push("P.O. Number");
        if (!poDate) missingFields.push("P.O. Date");
        if (!dcNumber) missingFields.push("D.C Number");
        if (!dcDate) missingFields.push("D.C Date");
        if (!clientId) missingFields.push("Client Information");
        if (items.length === 0) missingFields.push("At least one item");

        if (missingFields.length > 0) {
            showError(
                `Please fill in all required fields:\n- ${missingFields.join("\n- ")}`,
                "Validation Error"
            );
            return false;
        }
        return true;
    };

    // --- Navigation Blocking ---
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === "blocked") {
            if (isEditMode) {
                setNavModalConfig({
                    title: "Unsaved Changes",
                    message: "You have unsaved changes to this invoice. Do you want to save them?",
                    confirmLabel: "Save Changes",
                    cancelLabel: "Discard Changes",
                    onConfirm: async () => {
                        // Check products first
                        if (checkForNewProducts('updateInvoice', true)) return;
                        await executeUpdateInvoice(true);
                    },
                    onCancel: () => {
                        if (blocker.state === "blocked") blocker.proceed();
                    },
                    onClose: () => {
                        if (blocker.state === "blocked") blocker.reset();
                    }
                });
            } else {
                setNavModalConfig({
                    title: "Unsaved Changes",
                    message: "You have unsaved changes. Do you want to save this invoice as a Draft?",
                    confirmLabel: "Save as Draft",
                    cancelLabel: "Discard",
                    onConfirm: async () => {
                        if (checkForNewProducts('saveDraft', true)) return;
                        await executeSaveDraft(true);
                    },
                    onCancel: () => {
                        if (blocker.state === "blocked") blocker.proceed();
                    },
                    onClose: () => {
                        if (blocker.state === "blocked") blocker.reset();
                    }
                });
            }
            setShowNavModal(true);
        }
    }, [blocker.state, isEditMode, hasUnsavedChanges]); // Dependencies need to include stable functions or refs if possible

    const validateDraft = () => {
        const missing = [];
        if (!invoiceData.clientId) missing.push("Client Information");
        if ((invoiceData.items || []).length === 0) missing.push("At least one item");

        if (missing.length > 0) {
            showError(`Please fill the following to save a draft:\n- ${missing.join("\n- ")}`, "Validation Error");
            return false;
        }
        return true;
    };

    // Wrappers for buttons
    const saveDraft = async (fromBlocker = false) => {
        if (!validateDraft()) {
            if (fromBlocker && blocker.state === "blocked") blocker.reset();
            return;
        }
        if (checkForNewProducts('saveDraft', fromBlocker)) return;
        await executeSaveDraft(fromBlocker);
    };

    const executeSaveDraft = async (fromBlocker = false) => {
        const draftInvoice = {
            ...invoiceData,
            status: "Draft",
            amount: calculations.total,
        };

        let result;
        if (isEditMode) {
            result = await editInvoice(id, draftInvoice);
        } else {
            const { id: _unused, ...cleanDraft } = draftInvoice;
            result = await addInvoice(cleanDraft);
        }

        if (result.success) {
            success("Invoice saved as draft!", "Draft Saved");
            setHasUnsavedChanges(false);
            if (fromBlocker && blocker.state === "blocked") {
                blocker.proceed();
            } else {
                navigate("/invoices");
            }
        } else {
            showError("Error saving draft: " + result.error, "Error");
            if (fromBlocker && blocker.state === "blocked") blocker.reset();
        }
    };

    const saveInvoice = async () => {
        if (!validateInvoice()) return;
        if (checkForNewProducts('saveInvoice')) return;
        await executeSaveInvoice();
    };

    const executeSaveInvoice = async () => {
        const newInvoice = {
            ...invoiceData,
            amount: calculations.total,
            status: "Unpaid",
        };

        const result = await addInvoice(newInvoice);
        if (result.success) {
            success("Invoice saved successfully!", "Invoice Saved");
            setHasUnsavedChanges(false);
            navigate("/invoices");
        } else {
            showError("Error saving invoice: " + result.error, "Error");
        }
    };

    const updateInvoice = async (fromBlocker = false) => {
        if (!validateInvoice()) {
            if (fromBlocker && blocker.state === "blocked") blocker.reset();
            return;
        }
        if (checkForNewProducts('updateInvoice', fromBlocker)) return;
        await executeUpdateInvoice(fromBlocker);
    };

    const executeUpdateInvoice = async (fromBlocker = false) => {
        let newStatus = invoiceData.status;
        let amountPaidToSet = invoiceData.amountPaid;

        const currentStatusNormalized = (invoiceData.status || "").toLowerCase();

        // Specific logic for handling edits to Paid invoices
        if (currentStatusNormalized === "paid") {
            const originalAmount = originalData?.amount || 0;
            const newAmount = calculations.total;

            // If original was Paid, and amountPaid is missing (older data), it implies full amount was paid.
            const paidSoFar = invoiceData.amountPaid !== undefined ? invoiceData.amountPaid : originalAmount;

            // Check if total amount changed (e.g. products added/removed, prices changed)
            if (Math.abs(newAmount - originalAmount) > 0.01) {
                if (newAmount > paidSoFar) {
                    // Total increased beyond what was paid -> Mark as Unpaid (Partial)
                    newStatus = "Unpaid";
                } else {
                    // Total decreased or stayed within paid amount -> Remain Paid
                    newStatus = "Paid";
                }
                // Ensure we persist the payment amount, so it's treated as a partial payment
                amountPaidToSet = paidSoFar;
            }
        } else if (currentStatusNormalized === "draft") {
            newStatus = "Unpaid";
        }

        const updatedInvoice = {
            ...invoiceData,
            amount: calculations.total,
            status: newStatus
        };

        if (amountPaidToSet !== undefined) {
            updatedInvoice.amountPaid = amountPaidToSet;
        }

        const result = await editInvoice(id, updatedInvoice);
        if (result.success) {
            warning("Invoice updated successfully!", "Invoice Updated");
            setHasUnsavedChanges(false);
            if (fromBlocker && blocker.state === "blocked") {
                blocker.proceed();
            } else {
                navigate("/invoices");
            }
        } else {
            showError("Error updating invoice: " + result.error, "Error");
            if (fromBlocker && blocker.state === "blocked") blocker.reset();
        }
    };

    const handleCancelClick = () => {
        navigate("/invoices");
    };

    const canCancelInvoice = isEditMode &&
        (invoiceData.status === 'Paid' || invoiceData.status === 'paid' ||
            invoiceData.status === 'Unpaid' || invoiceData.status === 'unpaid' ||
            invoiceData.status === 'Overdue' || invoiceData.status === 'overdue');

    const handleMarkAsCanceled = async () => {
        if (!isEditMode) return;
        const result = await editInvoice(id, { ...invoiceData, status: "Canceled" });
        if (result.success) {
            warning("Invoice marked as canceled", "Invoice Canceled");
            setHasUnsavedChanges(false);
            navigate("/invoices");
        } else {
            showError("Error canceling invoice: " + result.error, "Error");
        }
        setShowCancelConfirm(false);
    };

    return (
        <div className="min-h-screen text-slate-800 font-mazzard">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                        <button
                            onClick={handleCancelClick}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEditMode ? "Edit Invoice" : "Create Invoice"}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {isEditMode
                                    ? "Update details for an existing invoice"
                                    : "Create a new invoice for your client"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-medium">
                        <button
                            onClick={handleCancelClick}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        {/* Only show "Save Draft" for new invoices or drafts */}
                        {(!isEditMode || invoiceData.status === "Draft") && (
                            <button
                                onClick={saveDraft}
                                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Draft
                            </button>
                        )}

                        <button
                            onClick={() => setShowPreview(true)}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                        </button>
                        <button
                            onClick={isEditMode ? updateInvoice : saveInvoice}
                            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            {isEditMode ? "Update Invoice" : "Save Invoice"}
                        </button>
                    </div>
                </div>

                <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Content - Same as before */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Invoice Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        Invoice Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={invoiceData.invoiceNumber}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                invoiceNumber: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        Invoice Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={invoiceData.invoiceDate}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                invoiceDate: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        P.O. Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={invoiceData.poNumber}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                poNumber: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        P.O. Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={invoiceData.poDate}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                poDate: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        D.C Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={invoiceData.dcNumber}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                dcNumber: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        D.C Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={invoiceData.dcDate}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                dcDate: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">
                                        Due Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={invoiceData.dueDate}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                dueDate: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Client Information <span className="text-red-500">*</span>
                            </h3>
                            <ClientAutocomplete
                                clients={customers || []}
                                selectedClient={invoiceData.client}
                                onSelect={handleClientSelect}
                            />
                        </div>

                        <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Items & Services <span className="text-red-500">*</span>
                                </h3>
                                <button
                                    onClick={addItem}
                                    className="flex items-center px-3 py-1.5 text-white bg-blue-600 rounded-lg text-xs font-medium hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Add Item
                                </button>
                            </div>
                            <div>
                                <table className="w-full">
                                    <thead className="text-xs uppercase font-semibold text-gray-500">
                                        <tr>
                                            <th className="p-2 text-left w-[5%]">S.No</th>
                                            <th className="p-2 text-left w-[35%]">Description</th>
                                            <th className="p-2 text-left w-[10%]">HSN</th>
                                            <th className="p-2 text-left w-[10%]">Qty</th>
                                            <th className="p-2 text-left w-[10%]">Rate (₹)</th>
                                            <th className="p-2 text-left w-[12%]">Amount (₹)</th>
                                            <th className="p-2 text-left w-[5%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(invoiceData.items || []).map((item, index) => (
                                            <tr key={item.id} className="border-t">
                                                <td className="p-4 text-sm align-top">{index + 1}</td>
                                                <td className="p-2">
                                                    <ProductAutocomplete
                                                        products={products || []}
                                                        value={item.description || ''}
                                                        onSelect={(product) => {
                                                            updateItem(item.id, "description", product.name);
                                                            updateItem(item.id, "hsnCode", product.hsn);
                                                            updateItem(item.id, "rate", product.price);
                                                        }}
                                                        onChange={(val) =>
                                                            updateItem(item.id, "description", val)
                                                        }
                                                        onAddNewProduct={handleAddNewProduct}
                                                        clientId={invoiceData.clientId}
                                                    />
                                                </td>
                                                <td className="p-2 align-top">
                                                    <input
                                                        type="text"
                                                        placeholder="HSN"
                                                        value={item.hsnCode || ''}
                                                        onChange={(e) =>
                                                            updateItem(item.id, "hsnCode", e.target.value)
                                                        }
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                                    />
                                                </td>
                                                <td className="p-2 align-top">
                                                    <input
                                                        type="number"
                                                        value={item.quantity || 0}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.id,
                                                                "quantity",
                                                                Number.parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="p-2 align-top">
                                                    <input
                                                        type="number"
                                                        value={item.rate || 0}
                                                        onFocus={(e) => e.target.select()}
                                                        onChange={(e) =>
                                                            updateItem(
                                                                item.id,
                                                                "rate",
                                                                Number.parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="p-2 align-top">
                                                    <input
                                                        type="text"
                                                        value={(item.amount || 0).toLocaleString()}
                                                        readOnly
                                                        className="w-full px-3 py-2 text-sm bg-gray-200 border-0 rounded-lg text-gray-600"
                                                    />
                                                </td>
                                                <td className="p-2 align-top">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                                                    >
                                                        <Trash2 className="w-4 h-7" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm text-gray-700 mb-1">
                                    Invoice Notes (Optional)
                                </label>
                                <textarea
                                    placeholder="e.g., For labour charges only"
                                    value={invoiceData.invoiceNotes}
                                    onChange={(e) =>
                                        setInvoiceData((prev) => ({
                                            ...prev,
                                            invoiceNotes: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg resize-none h-16 focus:outline-none focus:ring-0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Tax Calculation */}
                        <div className="p-6 bg-white rounded-xl border border-gray-200">
                            <h3 className="mb-4 text-lg font-bold text-gray-900">
                                Tax & Calculation
                            </h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label htmlFor="cgstInput" className="block mb-1 text-sm text-gray-700">
                                        CGST (%)
                                    </label>
                                    <input
                                        id="cgstInput"
                                        type="number"
                                        value={invoiceData.cgst}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                cgst: Number.parseFloat(e.target.value) || 0,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="sgstInput" className="block mb-1 text-sm text-gray-700">
                                        SGST (%)
                                    </label>
                                    <input
                                        id="sgstInput"
                                        type="number"
                                        value={invoiceData.sgst}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                sgst: Number.parseFloat(e.target.value) || 0,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="igstInput" className="block mb-1 text-sm text-gray-700">
                                        IGST (%)
                                    </label>
                                    <input
                                        id="igstInput"
                                        type="number"
                                        value={invoiceData.igst}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                igst: Number.parseFloat(e.target.value) || 0,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-0"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm font-medium text-gray-700 select-none">
                                    Enable Round Off
                                </span>
                                <button
                                    type="button"
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${invoiceData.isRoundOff ? "bg-blue-600" : "bg-gray-200"
                                        }`}
                                    onClick={() =>
                                        setInvoiceData((prev) => ({
                                            ...prev,
                                            isRoundOff: !prev.isRoundOff,
                                        }))
                                    }
                                >
                                    <span className="sr-only">Enable Round Off</span>
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${invoiceData.isRoundOff ? "translate-x-5" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 mt-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-semibold text-slate-900">
                                            ₹
                                            {calculations.subtotal.toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                    {invoiceData.cgst > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">
                                                CGST ({invoiceData.cgst}%):
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                ₹
                                                {calculations.cgstAmount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {invoiceData.sgst > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">
                                                SGST ({invoiceData.sgst}%):
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                ₹
                                                {calculations.sgstAmount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {invoiceData.igst > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">
                                                IGST ({invoiceData.igst}%):
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                ₹
                                                {calculations.igstAmount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {invoiceData.isRoundOff && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Round Off:</span>
                                            <span className="font-semibold text-slate-900">
                                                ₹
                                                {calculations.roundOffAmount.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    <div className="pt-4 mt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                                            <span>Total Amount:</span>
                                            <span>
                                                ₹
                                                {calculations.total.toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment & Notes */}
                        <div className="p-6 bg-white rounded-xl border border-gray-200">
                            <h3 className="mb-4 text-lg font-bold text-gray-900">
                                Payment & Notes
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-1 text-sm text-gray-700">
                                        Bank Details
                                    </label>
                                    <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-0">
                                        State Bank Of India
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-sm text-gray-700">
                                        Declaration
                                    </label>
                                    <textarea
                                        value={invoiceData.declaration}
                                        onChange={(e) =>
                                            setInvoiceData((prev) => ({
                                                ...prev,
                                                declaration: e.target.value,
                                            }))
                                        }
                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-0 rounded-lg resize-none h-20 focus:outline-none focus:ring-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        {canCancelInvoice && (
                            <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                                <h3 className="mb-2 text-lg font-bold text-red-800">
                                    Danger Zone
                                </h3>
                                <p className="text-sm text-red-600 mb-4">
                                    Canceling an invoice is irreversible. The invoice will be marked as canceled and cannot be edited.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowCancelConfirm(true)}
                                    className="flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel Invoice
                                </button>
                            </div>
                        )}

                    </div>
                </main>
            </div>

            {/* Navigation Confirmation Modal */}
            <ConfirmationModal
                isOpen={showNavModal}
                onClose={() => setShowNavModal(false)}
                onConfirm={navModalConfig.onConfirm}
                onCancel={navModalConfig.onCancel}
                title={navModalConfig.title}
                message={navModalConfig.message}
                confirmLabel={navModalConfig.confirmLabel}
                cancelLabel={navModalConfig.cancelLabel}
                confirmClass="bg-blue-600 hover:bg-blue-700"
            />

            {/* Product Confirmation Modal */}
            <ConfirmationModal
                isOpen={productConfirmModal.isOpen}
                onClose={handleProductCancel}
                title="New Products Detected"
                message={
                    <span>
                        The following items are not in your product database:
                        <ul className="list-disc list-inside my-2 font-medium">
                            {productConfirmModal.products.map((p, i) => (
                                <li key={i}>{p.description}</li>
                            ))}
                        </ul>
                        Do you want to add them to your products list for future use?
                    </span>
                }
                confirmLabel="Yes, Add Products"
                cancelLabel="No, Skip"
                onConfirm={handleProductConfirm}
                onCancel={handleProductSkip}
                confirmClass="bg-green-600 hover:bg-green-700"
            />

            {/* Cancel Invoice Confirmation Modal */}
            <ConfirmationModal
                isOpen={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onConfirm={handleMarkAsCanceled}
                title="Cancel Invoice?"
                message={`Are you sure you want to cancel invoice ${invoiceData.invoiceNumber}? This action cannot be undone.`}
                confirmLabel="Yes, Cancel Invoice"
                cancelLabel="No, Keep Invoice"
                confirmClass="bg-red-600 hover:bg-red-700"
            />

            {/* Preview */}
            {showPreview && (
                <InvoicePreview
                    invoiceData={invoiceData}
                    calculations={calculations}
                    setShowPreview={setShowPreview}
                />
            )}
        </div>
    );
};

export default InvoiceForm;
