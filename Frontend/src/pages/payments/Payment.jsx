import React, { useState, useMemo, useEffect, useContext, useCallback, memo } from "react";
import {
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Send,
  Check,
  Bell,
  Save,
  X,
  Edit,
  Eye,
} from "lucide-react";
import { useInvoices, useAllPayments } from "../../hooks/useFirestore";
import { paymentService, invoiceService } from "../../lib/firestore/services";
import { AuthContext } from "../../context/AuthContext";

// CHANGE: Updated modal to handle transaction ID
const PaymentMethodModal = ({ isOpen, onClose, onConfirm }) => {
  const [method, setMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Require transaction ID for UPI and Bank Transfer
    if (
      (method === "UPI" || method === "Bank Transfer") &&
      !transactionId.trim()
    ) {
      alert("Please enter a Transaction ID for this payment method.");
      return;
    }
    onConfirm(method, transactionId);
  };

  // Clear transaction ID when switching to Cash
  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    if (newMethod === "Cash") {
      setTransactionId("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center">
          <h3 className="heading-section">Confirm Payment</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <p className="body-text text-gray-600 mt-2">
          Select the method used for this payment.
        </p>

        {/* Payment method options */}
        <div className="mt-4 space-y-2">
          <label
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === "UPI"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300"
              }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="UPI"
              checked={method === "UPI"}
              onChange={() => handleMethodChange("UPI")}
              className="form-radio text-blue-600"
            />
            <span className="heading-subsection">UPI</span>
          </label>
          <label
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === "Bank Transfer"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300"
              }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Bank Transfer"
              checked={method === "Bank Transfer"}
              onChange={() => handleMethodChange("Bank Transfer")}
              className="form-radio text-blue-600"
            />
            <span className="heading-subsection">Bank Transfer</span>
          </label>
          <label
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === "Cash"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300"
              }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Cash"
              checked={method === "Cash"}
              onChange={() => handleMethodChange("Cash")}
              className="form-radio text-blue-600"
            />
            <span className="heading-subsection">Cash</span>
          </label>
        </div>

        {/* Transaction ID input */}
        {(method === "UPI" || method === "Bank Transfer") && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter Transaction ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 w-full"
          >
            Confirm and Mark as Paid
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Payment Modal for updating method and status
const EditPaymentModal = ({ isOpen, onClose, onSave, payment }) => {
  const [method, setMethod] = useState(payment?.method || "UPI");
  const [status, setStatus] = useState(payment?.status || "Paid");
  const [transactionId, setTransactionId] = useState(payment?.transactionId || "");

  useEffect(() => {
    if (payment) {
      setMethod(payment.method || "UPI");
      setStatus(payment.status || "Paid");
      setTransactionId(payment.transactionId || "");
    }
  }, [payment]);

  if (!isOpen || !payment) return null;

  const handleSave = () => {
    onSave({
      ...payment,
      method,
      status,
      transactionId,
    });
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    if (newMethod === "Cash") {
      setTransactionId("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center">
          <h3 className="heading-section">Edit Payment</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <p className="body-text text-gray-600 mt-2">
          Update payment method and status for invoice {payment.invoiceNo}.
        </p>

        {/* Status options */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <div className="space-y-2">
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${status === "Paid" ? "border-green-500 bg-green-50" : "border-gray-300"
              }`}>
              <input
                type="radio"
                name="status"
                value="Paid"
                checked={status === "Paid"}
                onChange={() => setStatus("Paid")}
                className="form-radio text-green-600"
              />
              <span className="heading-subsection">Paid</span>
            </label>
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${status === "Unpaid" ? "border-yellow-500 bg-yellow-50" : "border-gray-300"
              }`}>
              <input
                type="radio"
                name="status"
                value="Unpaid"
                checked={status === "Unpaid"}
                onChange={() => setStatus("Unpaid")}
                className="form-radio text-yellow-600"
              />
              <span className="heading-subsection">Unpaid</span>
            </label>
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${status === "Partial" ? "border-purple-500 bg-purple-50" : "border-gray-300"
              }`}>
              <input
                type="radio"
                name="status"
                value="Partial"
                checked={status === "Partial"}
                onChange={() => setStatus("Partial")}
                className="form-radio text-purple-600"
              />
              <span className="heading-subsection">Partial</span>
            </label>
          </div>
        </div>

        {/* Payment method options */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="space-y-2">
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === "UPI" ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="UPI"
                checked={method === "UPI"}
                onChange={() => handleMethodChange("UPI")}
                className="form-radio text-blue-600"
              />
              <span className="heading-subsection">UPI</span>
            </label>
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === "Bank Transfer" ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="Bank Transfer"
                checked={method === "Bank Transfer"}
                onChange={() => handleMethodChange("Bank Transfer")}
                className="form-radio text-blue-600"
              />
              <span className="heading-subsection">Bank Transfer</span>
            </label>
            <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === "Cash" ? "border-blue-500 bg-blue-50" : "border-gray-300"
              }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="Cash"
                checked={method === "Cash"}
                onChange={() => handleMethodChange("Cash")}
                className="form-radio text-blue-600"
              />
              <span className="heading-subsection">Cash</span>
            </label>
          </div>
        </div>

        {/* Transaction ID input */}
        {(method === "UPI" || method === "Bank Transfer") && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction ID
            </label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter Transaction ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, subtitle, icon: Icon, iconBgColor }) => (
  <div className="bg-white p-3 lg:p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center">
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xl font-bold text-gray-900">{amount}</p>
      <p className="text-xs mt-0.5 text-gray-500">{subtitle}</p>
    </div>
    <div
      className={`w-8 h-8 flex items-center justify-center ${iconBgColor} rounded-full`}
    >
      <Icon size={16} className="text-white" />
    </div>
  </div>
);

// PERFORMANCE: Memoized PaymentRow to prevent unnecessary re-renders
const PaymentRow = memo(({
  invoiceNo,
  client,
  amount,
  received,
  dueDate,
  status,
  overdueDays,
  onEdit,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "Paid":
        return (
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
            Paid
          </span>
        );
      case "Unpaid":
        return (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
            Unpaid
          </span>
        );
      case "Overdue":
        return (
          <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
            Overdue ({overdueDays}d)
          </span>
        );
      case "Partial":
        return (
          <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
            Partial
          </span>
        );
      default:
        return null;
    }
  };

  const isOverdue = status === "Overdue";

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4 text-sm font-medium text-gray-900">
        {invoiceNo}
      </td>
      <td className="py-3 px-4 text-sm text-gray-800">{client}</td>
      <td className="py-3 px-4 text-sm">
        <p className="font-medium text-gray-900">{amount}</p>
        {received && (
          <p className="text-xs text-gray-500">Received: {received}</p>
        )}
      </td>
      <td
        className={`py-3 px-4 text-sm ${isOverdue ? "text-red-500" : "text-gray-600"
          }`}
      >
        {dueDate}
      </td>
      <td className="py-3 px-4">{getStatusBadge()}</td>
      <td className="py-3 px-4">
        <button
          onClick={() => onEdit({ invoiceNo, client, amount, received, dueDate, status, overdueDays })}
          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
          title="Edit Payment"
        >
          <Edit size={16} />
        </button>
      </td>
    </tr>
  );
});

PaymentRow.displayName = 'PaymentRow';

// PERFORMANCE: Memoized PendingPaymentCard to prevent unnecessary re-renders
const PendingPaymentCard = memo(({
  invoice,
  onMarkPaid,
  editingPaymentId,
  setEditingPaymentId,
  onSavePayment,
}) => {
  const { invoiceNo, client, amount, received, dueDate, status } = invoice;
  const [paidAmount, setPaidAmount] = useState("");
  const isEditing = editingPaymentId === invoiceNo;

  // Calculate remaining amount more accurately
  const currentPaidAmount = parseFloat(received || 0) || 0;
  const invoiceAmount = parseFloat(amount || 0) || 0;
  const remainingAmount = invoiceAmount - currentPaidAmount;

  const iconBgColor =
    status === "Overdue"
      ? "bg-red-500"
      : status === "Partial"
        ? "bg-purple-500"
        : "bg-yellow-500";
  const Icon = status === "Overdue" ? AlertCircle : Clock;

  const handleEnterAmountClick = () => {
    setEditingPaymentId(invoiceNo);
    setPaidAmount("");
  };
  const handleCancel = () => {
    setEditingPaymentId(null);
    setPaidAmount("");
  };
  const handleSave = () => {
    onSavePayment(invoiceNo, paidAmount);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`w-11 h-11 ${iconBgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900">{invoiceNo}</p>
          <p className="text-sm text-gray-600">{client}</p>
          <p
            className={`text-sm ${status === "Overdue"
              ? "text-red-600 font-medium"
              : "text-gray-500"
              }`}
          >
            Due: {dueDate}
          </p>
        </div>
      </div>
      <div className="w-full md:w-auto flex flex-col items-end md:flex-row md:items-center gap-3">
        <div className="text-right md:mr-6">
          <p className="text-xl font-bold text-gray-900">
            ₹{remainingAmount.toLocaleString()}
          </p>
          {currentPaidAmount > 0 ? (
            <p className="text-xs text-gray-500">
              Paid: ₹{currentPaidAmount.toLocaleString()} | Total: ₹{invoiceAmount.toLocaleString()}
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Total: ₹{invoiceAmount.toLocaleString()}
            </p>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="Amount"
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-28"
            />
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnterAmountClick}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Enter Amount Paid
            </button>
            <button
              onClick={() => onMarkPaid(invoiceNo)}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600"
            >
              <Check size={16} /> Mark Paid
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

PendingPaymentCard.displayName = 'PendingPaymentCard';

// PERFORMANCE: Memoized PaidPaymentRow to prevent unnecessary re-renders
const PaidPaymentRow = memo(({
  invoiceNo,
  client,
  amount,
  paymentDate,
  method,
  transactionId,
  onEdit,
}) => (
  <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
    <td className="py-3 px-4 text-sm font-medium text-gray-900">{invoiceNo}</td>
    <td className="py-3 px-4 text-sm text-gray-800">{client}</td>
    <td className="py-3 px-4 text-sm font-medium text-green-600">{amount}</td>
    <td className="py-3 px-4 text-sm text-gray-600">{paymentDate}</td>
    <td className="py-3 px-4 text-sm text-gray-800">{method}</td>
    <td className="py-3 px-4 text-sm text-gray-800 font-mono">
      {transactionId || "-"}
    </td>
    <td className="py-3 px-4">
      <button
        onClick={() => onEdit({ invoiceNo, client, amount, paymentDate, method, transactionId, status: "Paid" })}
        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
        title="Edit Payment"
      >
        <Edit size={16} />
      </button>
    </td>
  </tr>
));

PaidPaymentRow.displayName = 'PaidPaymentRow';

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState("All Payments");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [paymentToMarkPaid, setPaymentToMarkPaid] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const tabs = ["All Payments", "Overdue", "Pending", "Paid"];

  // Get authentication context
  const { user } = useContext(AuthContext);

  // Use Firestore hooks
  const {
    invoices: allInvoices = [],
    error: invoicesError,
  } = useInvoices();

  const { payments: allPayments = [], error: paymentsError } = useAllPayments();

  // Handle errors gracefully
  if (invoicesError || paymentsError) {
  }

  // Memoized status calculation function matching InvoiceManagement.jsx
  const getDynamicInvoiceStatus = useCallback((invoice) => {
    if (invoice.status === "Paid" || invoice.status === "paid") return "Paid";
    if (invoice.status === "Draft" || invoice.status === "draft")
      return "Draft";

    const today = new Date();
    const dueDate = new Date(invoice.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (invoice.dueDate && today > dueDate) return "Overdue";
    return "Unpaid"; // This handles "sent", "unpaid", and any other status as "Unpaid"
  }, []);

  // Memoized calculation of paymentsState from invoices and payments
  const paymentsState = useMemo(() => {
    return (allInvoices || []).map((inv) => {
      const invoiceNo = inv.invoiceNumber || inv.displayId || inv.id;
      const client =
        inv.client?.name ||
        inv.customerName ||
        inv.customer ||
        "Unknown Client";
      const amount = inv.total || inv.amount || 0;

      // Calculate received amount from payments
      const safePayments = Array.isArray(allPayments) ? allPayments : [];
      const invoicePayments = safePayments.filter(
        (payment) => payment.invoiceId === inv.id
      );
      const received = invoicePayments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      const paymentDate = inv.paymentDate || null;
      const method = inv.paymentMethod || null;
      const transactionId = inv.transactionId || null;
      const dueDate = inv.dueDate || "-";
      const status = getDynamicInvoiceStatus(inv);

      return {
        invoiceNo,
        client,
        amount,
        received,
        dueDate,
        status,
        paymentDate,
        method,
        transactionId,
        id: inv.id,
      };
    });
  }, [allInvoices, allPayments, getDynamicInvoiceStatus]);

  const parseDateDDMMYYYY = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  };

  const getDynamicStatus = (payment) => {
    if (payment.status === "Paid") return payment;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = parseDateDDMMYYYY(payment.dueDate);
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0)
      return { ...payment, status: "Overdue", overdueDays: diffDays };
    return { ...payment, overdueDays: 0 };
  };

  const handleMarkAsPaid = (invoiceNo) => setPaymentToMarkPaid(invoiceNo);

  const handleEditPayment = (payment) => setEditingPayment(payment);

  const handleSaveEditedPayment = async (updatedPayment) => {
    try {
      const today = new Date().toLocaleDateString("en-GB");

      // Find the invoice to update
      const invoiceToUpdate = allInvoices.find(
        (inv) => inv.invoiceNumber === updatedPayment.invoiceNo
      );

      if (invoiceToUpdate) {
        const invoiceAmount = parseFloat(invoiceToUpdate.total || invoiceToUpdate.amount || invoiceToUpdate.totalAmount) || 0;

        // Determine paid amount based on status
        let paidAmount;
        if (updatedPayment.status === "Paid") {
          paidAmount = invoiceAmount; // Full amount if paid
        } else if (updatedPayment.status === "Partial") {
          // Keep existing paid amount or calculate based on some logic
          paidAmount = parseFloat(invoiceToUpdate.paidAmount || 0) || 0;
        } else {
          paidAmount = 0; // No amount paid if unpaid
        }

        // Update invoice with new payment details
        const updateData = {
          status: updatedPayment.status,
          paidAmount: paidAmount,
          paymentMethod: updatedPayment.method,
          transactionId: updatedPayment.transactionId,
        };

        // Only set paymentDate if invoice is fully paid
        if (updatedPayment.status === "Paid") {
          updateData.paymentDate = today;
        }

        await invoiceService.updateInvoice(invoiceToUpdate.id, updateData);

        alert("Payment updated successfully!");
        setEditingPayment(null);
      }
    } catch (error) {
      alert("Error updating payment: " + error.message);
    }
  };

  // Function now accepts transactionId and updates Firestore
  const confirmMarkAsPaid = async (method, transactionId) => {
    try {
      const today = new Date().toLocaleDateString("en-GB");

      // Find the invoice to mark as paid
      const invoiceToUpdate = allInvoices.find(
        (inv) => inv.invoiceNumber === paymentToMarkPaid
      );
      if (invoiceToUpdate) {
        const invoiceAmount = parseFloat(invoiceToUpdate.total || invoiceToUpdate.amount || invoiceToUpdate.totalAmount) || 0;

        // Update invoice status to paid with full amount
        await invoiceService.updateInvoice(invoiceToUpdate.id, {
          status: "Paid",
          paidAmount: invoiceAmount, // Set paid amount to full invoice amount
          paymentMethod: method,
          transactionId: transactionId,
          paymentDate: today,
        });

        // Create a payment record
        await paymentService.createPayment({
          invoiceId: invoiceToUpdate.id,
          amount: invoiceAmount,
          method: method,
          transactionId: transactionId,
          paymentDate: today,
          status: "completed",
        });

        alert("Payment recorded successfully!");
      }
    } catch (error) {
      alert("Error recording payment: " + error.message);
    } finally {
      setPaymentToMarkPaid(null);
    }
  };

  const handleSavePayment = async (invoiceNo, paidAmountStr) => {
    const paidAmount = parseFloat(paidAmountStr);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const today = new Date().toLocaleDateString("en-GB");

      // Find the invoice to update
      const invoiceToUpdate = allInvoices.find(
        (inv) => inv.invoiceNumber === invoiceNo
      );

      if (!invoiceToUpdate) {
        alert("Invoice not found.");
        return;
      }

      const invoiceAmount = parseFloat(invoiceToUpdate.total || invoiceToUpdate.amount || invoiceToUpdate.totalAmount) || 0;
      const currentPaidAmount = parseFloat(invoiceToUpdate.paidAmount || 0) || 0;
      const newTotalPaidAmount = currentPaidAmount + paidAmount;

      // Determine new status based on payment amount
      let newStatus;
      if (newTotalPaidAmount >= invoiceAmount) {
        newStatus = "Paid"; // Fully paid
      } else if (newTotalPaidAmount > 0) {
        newStatus = "Partial"; // Partially paid
      } else {
        newStatus = "Unpaid"; // Not paid
      }

      // Update invoice with new payment information
      const updateData = {
        paidAmount: newTotalPaidAmount,
        status: newStatus,
      };

      // Only set paymentDate if invoice is fully paid
      if (newStatus === "Paid") {
        updateData.paymentDate = today;
      }

      await invoiceService.updateInvoice(invoiceToUpdate.id, updateData);

      // Create a payment record for this partial payment
      await paymentService.createPayment({
        invoiceId: invoiceToUpdate.id,
        amount: paidAmount,
        method: "Partial Payment", // We can enhance this later with a method selection
        transactionId: `PARTIAL-${Date.now()}`, // Generate a unique ID for partial payments
        paymentDate: today,
        status: "completed",
      });

      alert(`Payment of ₹${paidAmount.toLocaleString('en-IN')} recorded successfully!`);
      setEditingPaymentId(null);

    } catch (error) {
      alert("Error recording payment: " + error.message);
    }
  };

  const paymentsWithDynamicStatus = useMemo(() => {
    return paymentsState.map(getDynamicStatus);
  }, [paymentsState]);

  // PERFORMANCE: Filter and sort payments with secondary sorting for stability
  const filteredPayments = useMemo(() => {
    const filtered = paymentsWithDynamicStatus.filter((payment) => {
      const matchesSearch =
        payment.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.client.toLowerCase().includes(searchTerm.toLowerCase());
      if (activeTab === "All Payments") return matchesSearch;
      if (activeTab === "Overdue")
        return payment.status === "Overdue" && matchesSearch;
      if (activeTab === "Pending")
        return (
          (payment.status === "Unpaid" || payment.status === "Partial") &&
          matchesSearch
        );
      if (activeTab === "Paid") return payment.status === "Paid" && matchesSearch;
      return false;
    });

    // Sort with secondary sorting for stable ordering
    return [...filtered].sort((a, b) => {
      // Primary sort by invoice number (descending - newest first)
      const invoiceCompare = (b.invoiceNo || '').localeCompare(a.invoiceNo || '');
      if (invoiceCompare !== 0) return invoiceCompare;

      // Secondary sort by due date for stability
      const aDate = a.dueDate || '';
      const bDate = b.dueDate || '';
      return bDate.localeCompare(aDate);
    });
  }, [paymentsWithDynamicStatus, searchTerm, activeTab]);

  const overdueCount = paymentsWithDynamicStatus.filter(
    (p) => p.status === "Overdue"
  ).length;


  const renderContent = () => {
    if (activeTab === "Overdue" || activeTab === "Pending") {
      const isOverdueTab = activeTab === "Overdue";
      return (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="p-6">
            <h2
              className={`text-lg font-bold text-gray-900 flex items-center gap-2`}
            >
              {isOverdueTab ? (
                <AlertCircle className="text-red-500" />
              ) : (
                <Clock className="text-yellow-500" />
              )}
              {isOverdueTab ? "Overdue Payments" : "Pending Payments"}
            </h2>
            <p className="text-sm text-gray-500">
              {isOverdueTab
                ? "Invoices past due date requiring immediate attention"
                : "Invoices awaiting payment within due date"}
            </p>
          </div>
          <div className="p-6 space-y-4">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <PendingPaymentCard
                  key={payment.invoiceNo}
                  invoice={payment}
                  onMarkPaid={handleMarkAsPaid}
                  editingPaymentId={editingPaymentId}
                  setEditingPaymentId={setEditingPaymentId}
                  onSavePayment={handleSavePayment}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {isOverdueTab ? "overdue" : "pending"} payments
                </h3>
                <p className="text-sm text-gray-600">
                  There are no {isOverdueTab ? "overdue" : "pending"} payments at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === "Paid") {
      return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900">
              Completed Payments
            </h2>
            <p className="text-sm text-gray-500">
              Successfully received payments
            </p>
          </div>
          {/* CHANGE: Added Transaction ID to the table header */}
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <PaidPaymentRow
                  key={payment.invoiceNo}
                  {...payment}
                  amount={`₹${payment.amount.toLocaleString()}`}
                  onEdit={handleEditPayment}
                />
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No paid payments
              </h3>
              <p className="text-sm text-gray-600">
                No completed payments found in the selected period.
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-900">Payment Tracker</h2>
          <p className="text-sm text-gray-500">
            Monitor all payment statuses and due dates
          </p>
        </div>
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">Invoice No</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <PaymentRow
                key={payment.invoiceNo}
                {...payment}
                amount={`₹${payment.amount.toLocaleString()}`}
                received={
                  payment.received
                    ? `₹${payment.received.toLocaleString()}`
                    : null
                }
                onEdit={handleEditPayment}
              />
            ))}
          </tbody>
        </table>
        {filteredPayments.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No payments found
            </h3>
            <p className="text-sm text-gray-600">
              {searchTerm
                ? `No payments match "${searchTerm}"`
                : `No payments found for "${activeTab}"`}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Show error state
  if (invoicesError || !user) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="max-w-full mx-auto px-8 pb-8 pt-32">
          <div className="text-center py-20">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load payments</h3>
            <p className="text-sm text-gray-600 mb-4">{invoicesError || "Please sign in to view payment data"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 font-sans">
      <PaymentMethodModal
        isOpen={!!paymentToMarkPaid}
        onClose={() => setPaymentToMarkPaid(null)}
        onConfirm={confirmMarkAsPaid}
      />
      <EditPaymentModal
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        onSave={handleSaveEditedPayment}
        payment={editingPayment}
      />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-28">
        <header className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Payment Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track payments, manage overdue invoices, and send reminders
          </p>
        </header>
        <main className="mt-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {(() => {
              const totalAmount = paymentsState.reduce(
                (s, p) => s + (p.amount || 0),
                0
              );
              const amountReceived = paymentsState.reduce(
                (s, p) => s + (p.received || 0),
                0
              );
              const overdueAmount = paymentsState
                .filter((p) => p.status === "Overdue")
                .reduce((s, p) => s + (p.amount - (p.received || 0)), 0);
              const pendingAmount = paymentsState
                .filter((p) => p.status === "Unpaid" || p.status === "Partial")
                .reduce((s, p) => s + (p.amount - (p.received || 0)), 0);
              return (
                <>
                  <StatCard
                    title="Total Amount"
                    amount={`₹${totalAmount.toLocaleString()}`}
                    subtitle="All invoices"
                    icon={IndianRupee}
                    iconBgColor="bg-blue-500"
                  />
                  <StatCard
                    title="Amount Received"
                    amount={`₹${amountReceived.toLocaleString()}`}
                    subtitle={`${totalAmount > 0
                      ? Math.round((amountReceived / totalAmount) * 100)
                      : 0
                      }% of total`}
                    icon={CheckCircle2}
                    iconBgColor="bg-green-500"
                  />
                  <StatCard
                    title="Overdue Amount"
                    amount={`₹${overdueAmount.toLocaleString()}`}
                    subtitle="Needs attention"
                    icon={AlertCircle}
                    iconBgColor="bg-red-500"
                  />
                  <StatCard
                    title="Pending Amount"
                    amount={`₹${pendingAmount.toLocaleString()}`}
                    subtitle="Awaiting payment"
                    icon={Clock}
                    iconBgColor="bg-yellow-500"
                  />
                </>
              );
            })()}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by invoice number or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
              <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 w-full md:w-auto overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === tab
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {tab}
                    {tab === "Overdue" && overdueCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {overdueCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default PaymentsPage;
