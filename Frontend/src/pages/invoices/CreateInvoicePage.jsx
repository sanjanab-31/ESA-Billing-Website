
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInvoices, useCustomers, useProducts } from "../../hooks/useFirestore";
import CreateInvoiceComponent from "./CreateInvoiceComponent";
import InvoicePreview from "./InvoiceManagement.jsx";

// Import ClientAutocomplete and ProductAutocomplete if needed for preview or modal

export default function CreateInvoicePage() {
  const navigate = useNavigate();

  const { customers } = useCustomers();
  const { products, addProduct } = useProducts();
  const { addInvoice, allInvoices } = useInvoices();

  // Generate next invoice number based on allInvoices (copied from InvoiceManagement.jsx)
  const generateNextInvoiceNumber = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const financialYearStart = today.getMonth() >= 3 ? currentYear : currentYear - 1;
    const financialYearEnd = financialYearStart + 1;
    const financialYearString = `${financialYearStart}-${financialYearEnd.toString().slice(2)}`;

    // Use allInvoices instead of paginated invoices
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

  const getInitialInvoiceData = () => ({
    invoiceNumber: generateNextInvoiceNumber(),
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

  const [invoiceData, setInvoiceData] = useState(getInitialInvoiceData);
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    roundOffAmount: 0,
    total: 0,
  });

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

  const addItem = () => {
    const newItem = {
      id: Date.now(),
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

  const handleClientSelect = (clientId) => {
    if (clientId === null) {
      setInvoiceData((prev) => ({ ...prev, clientId: "", client: null }));
      return;
    }
    const selectedClient = (customers || []).find((c) => c.id === clientId);
    setInvoiceData((prev) => ({
      ...prev,
      clientId: clientId,
      client: selectedClient,
    }));
  };

  const handleAddNewProduct = async (productName, clientId) => {
    // For now, just return a mock product
    return {
      id: Date.now().toString(),
      name: productName,
      price: 0,
      hsn: "",
      category: "General",
      unit: "Nos",
      createdAt: new Date().toISOString(),
    };
  };

  const saveDraft = async () => {
    const draftInvoice = {
      ...invoiceData,
      status: "Draft",
      amount: calculations.total,
    };
    await addInvoice(draftInvoice);
    navigate("/invoices");
  };

  const saveInvoice = async () => {
    const newInvoice = {
      ...invoiceData,
      amount: calculations.total,
      status: invoiceData.status,
    };
    await addInvoice(newInvoice);
    navigate("/invoices");
  };

  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <CreateInvoiceComponent
        invoiceData={invoiceData}
        setInvoiceData={setInvoiceData}
        saveDraft={saveDraft}
        handlePreview={() => setShowPreview(true)}
        saveInvoice={saveInvoice}
        clients={customers || []}
        products={products || []}
        calculations={calculations}
        addItem={addItem}
        updateItem={updateItem}
        removeItem={removeItem}
        handleClientSelect={handleClientSelect}
        handleAddNewProduct={handleAddNewProduct}
      />
      {showPreview && (
        <InvoicePreview
          invoice={null}
          invoiceData={invoiceData}
          calculations={calculations}
          setShowPreview={setShowPreview}
        />
      )}
    </>
  );
}
