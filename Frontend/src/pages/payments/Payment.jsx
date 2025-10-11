import React, { useState, useMemo, useEffect, useContext } from 'react';
import { IndianRupee, CheckCircle2, AlertCircle, Clock, Search, Send, Check, Bell, Save, X } from 'lucide-react';
import { useInvoices, useAllPayments } from '../../hooks/useFirestore';
import { createPayment, updateInvoice } from '../../utils/database';
import { AuthContext } from '../../context/AuthContext';
import { LoadingSpinner, SkeletonCard, ErrorState, EmptyState } from '../../components/LoadingSpinner';

// CHANGE: Updated modal to handle transaction ID
const PaymentMethodModal = ({ isOpen, onClose, onConfirm }) => {
    const [method, setMethod] = useState('UPI');
    const [transactionId, setTransactionId] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Require transaction ID for UPI and Bank Transfer
        if ((method === 'UPI' || method === 'Bank Transfer') && !transactionId.trim()) {
            alert('Please enter a Transaction ID for this payment method.');
            return;
        }
        onConfirm(method, transactionId);
    };
    
    // Clear transaction ID when switching to Cash
    const handleMethodChange = (newMethod) => {
        setMethod(newMethod);
        if (newMethod === 'Cash') {
            setTransactionId('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Confirm Payment</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>
                <p className="text-sm text-gray-600 mt-2">Select the method used for this payment.</p>
                
                {/* Payment method options */}
                <div className="mt-4 space-y-2">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === 'UPI' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <input type="radio" name="paymentMethod" value="UPI" checked={method === 'UPI'} onChange={() => handleMethodChange('UPI')} className="form-radio text-blue-600" />
                        <span className="font-medium">UPI</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === 'Bank Transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <input type="radio" name="paymentMethod" value="Bank Transfer" checked={method === 'Bank Transfer'} onChange={() => handleMethodChange('Bank Transfer')} className="form-radio text-blue-600" />
                        <span className="font-medium">Bank Transfer</span>
                    </label>
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${method === 'Cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <input type="radio" name="paymentMethod" value="Cash" checked={method === 'Cash'} onChange={() => handleMethodChange('Cash')} className="form-radio text-blue-600" />
                        <span className="font-medium">Cash</span>
                    </label>
                </div>

                {/* Transaction ID input */}
                {(method === 'UPI' || method === 'Bank Transfer') && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
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

const StatCard = ({ title, amount, subtitle, icon: Icon, iconBgColor }) => (
    <div className="bg-white p-5 border border-gray-200 rounded-xl flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{amount}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 flex items-center justify-center ${iconBgColor} rounded-full`}>
            <Icon size={20} className="text-white"/>
        </div>
    </div>
);

const PaymentRow = ({ invoiceNo, client, amount, received, dueDate, status, overdueDays }) => {
    const getStatusBadge = () => {
        switch (status) {
            case 'Paid': return <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Paid</span>;
            case 'Unpaid': return <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">Unpaid</span>;
            case 'Overdue': return <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">Overdue ({overdueDays}d)</span>;
            case 'Partial': return <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">Partial</span>;
            default: return null;
        }
    };
    
    const isOverdue = status === 'Overdue';

    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-sm font-medium text-gray-900">{invoiceNo}</td>
            <td className="py-3 px-4 text-sm text-gray-800">{client}</td>
            <td className="py-3 px-4 text-sm">
                <p className="font-medium text-gray-900">{amount}</p>
                {received && <p className="text-xs text-gray-500">Received: {received}</p>}
            </td>
            <td className={`py-3 px-4 text-sm ${isOverdue ? 'text-red-500' : 'text-gray-600'}`}>{dueDate}</td>
            <td className="py-3 px-4">{getStatusBadge()}</td>
        </tr>
    );
};

const PendingPaymentCard = ({ invoice, onMarkPaid, editingPaymentId, setEditingPaymentId, onSavePayment }) => {
    const { invoiceNo, client, amount, received, dueDate, status } = invoice;
    const [paidAmount, setPaidAmount] = useState('');
    const isEditing = editingPaymentId === invoiceNo;
    const remainingAmount = amount - (received || 0);
    const iconBgColor = status === 'Overdue' ? 'bg-red-500' : (status === 'Partial' ? 'bg-purple-500' : 'bg-yellow-500');
    const Icon = status === 'Overdue' ? AlertCircle : Clock;

    const handleEnterAmountClick = () => {
        setEditingPaymentId(invoiceNo);
        setPaidAmount('');
    };
    const handleCancel = () => {
        setEditingPaymentId(null);
        setPaidAmount('');
    };
    const handleSave = () => {
        onSavePayment(invoiceNo, paidAmount);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className={`w-11 h-11 ${iconBgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} className="text-white" />
                </div>
                <div>
                    <p className="font-bold text-gray-900">{invoiceNo}</p>
                    <p className="text-sm text-gray-600">{client}</p>
                    <p className={`text-sm ${status === 'Overdue' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>Due: {dueDate}</p>
                </div>
            </div>
            <div className="w-full md:w-auto flex flex-col items-end md:flex-row md:items-center gap-3">
                 <div className="text-right md:mr-6">
                    <p className="text-xl font-bold text-gray-900">₹{remainingAmount.toLocaleString()}</p>
                    {status === 'Partial' && <p className="text-xs text-gray-500">out of ₹{amount.toLocaleString()}</p>}
                </div>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="Amount" className="px-3 py-1.5 border border-gray-300 rounded-md text-sm w-28" />
                        <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"><Save size={16} /> Save</button>
                        <button onClick={handleCancel} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">Cancel</button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button onClick={handleEnterAmountClick} className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700">Enter Amount Paid</button>
                        <button onClick={() => onMarkPaid(invoiceNo)} className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600"><Check size={16} /> Mark Paid</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// CHANGE: Re-added transactionId prop and column
const PaidPaymentRow = ({ invoiceNo, client, amount, paymentDate, method, transactionId }) => (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
        <td className="py-3 px-4 text-sm font-medium text-gray-900">{invoiceNo}</td>
        <td className="py-3 px-4 text-sm text-gray-800">{client}</td>
        <td className="py-3 px-4 text-sm font-medium text-green-600">{amount}</td>
        <td className="py-3 px-4 text-sm text-gray-600">{paymentDate}</td>
        <td className="py-3 px-4 text-sm text-gray-800">{method}</td>
        <td className="py-3 px-4 text-sm text-gray-800 font-mono">{transactionId || '-'}</td>
    </tr>
);


const PaymentsPage = () => {
    const [activeTab, setActiveTab] = useState('All Payments');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [paymentToMarkPaid, setPaymentToMarkPaid] = useState(null);
    const tabs = ['All Payments', 'Overdue', 'Pending', 'Paid'];

    // Get authentication context
    const { user, loading: authLoading } = useContext(AuthContext);

    // Use Firestore hooks
    const { 
        invoices: allInvoices = [], 
        loading: invoicesLoading, 
        error: invoicesError,
        editInvoice: updateInvoice
    } = useInvoices();

    const { payments: allPayments = [] } = useAllPayments();

    // Map invoices -> payment rows
    const [paymentsState, setPaymentsState] = useState([]);

    // Debug logging
    useEffect(() => {
        console.log('PaymentsPage Debug:', {
            user: user ? { uid: user.uid, email: user.email } : null,
            authLoading,
            invoices: allInvoices?.length || 0,
            invoicesLoading,
            invoicesError
        });
    }, [user, authLoading, allInvoices, invoicesLoading, invoicesError]);

    // Build paymentsState from invoices and payments when data changes
    useEffect(() => {
        const computed = (allInvoices || []).map(inv => {
            const invoiceNo = inv.invoiceNumber || inv.displayId || inv.id;
            const client = inv.client?.name || inv.customerName || inv.customer || 'Unknown Client';
            const amount = inv.total || inv.amount || 0;
            
            // Calculate received amount from payments
            const invoicePayments = (allPayments || []).filter(payment => payment.invoiceId === inv.id);
            const received = invoicePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            
            const paymentDate = inv.paymentDate || null;
            const method = inv.paymentMethod || null;
            const transactionId = inv.transactionId || null;
            const dueDate = inv.dueDate || '-';
            const status = inv.status === 'paid' ? 'Paid' : (inv.status === 'sent' ? 'Unpaid' : inv.status);
            return { invoiceNo, client, amount, received, dueDate, status, paymentDate, method, transactionId, id: inv.id };
        });
        setPaymentsState(computed);
    }, [allInvoices, allPayments]);

    const parseDateDDMMYYYY = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return new Date(year, month - 1, day);
    };

    const getDynamicStatus = (payment) => {
        if (payment.status === 'Paid') return payment;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = parseDateDDMMYYYY(payment.dueDate);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) return { ...payment, status: 'Overdue', overdueDays: diffDays };
        return { ...payment, overdueDays: 0 };
    };

    const handleMarkAsPaid = (invoiceNo) => setPaymentToMarkPaid(invoiceNo);

    // Function now accepts transactionId and updates Firestore
    const confirmMarkAsPaid = async (method, transactionId) => {
        try {
            const today = new Date().toLocaleDateString('en-GB');
            
            // Find the invoice to mark as paid
            const invoiceToUpdate = allInvoices.find(inv => inv.invoiceNumber === paymentToMarkPaid);
            if (invoiceToUpdate) {
                // Update invoice status to paid
                await updateInvoice(invoiceToUpdate.id, { 
                    status: 'paid',
                    paymentMethod: method,
                    transactionId: transactionId,
                    paymentDate: today
                });
                
                // Create a payment record
                await createPayment({
                    invoiceId: invoiceToUpdate.id,
                    amount: invoiceToUpdate.total || invoiceToUpdate.amount,
                    method: method,
                    transactionId: transactionId,
                    paymentDate: today,
                    status: 'completed'
                });
                
                alert('Payment recorded successfully!');
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            alert('Error recording payment: ' + error.message);
        } finally {
            setPaymentToMarkPaid(null);
        }
    };

    const handleSavePayment = (invoiceNo, paidAmountStr) => {
        const paidAmount = parseFloat(paidAmountStr);
        if (isNaN(paidAmount) || paidAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        // This logic needs to be updated to interact with Firestore
        // For now, it's a placeholder
        alert(`Amount ${paidAmount} saved for ${invoiceNo}. (Placeholder)`);
        setEditingPaymentId(null);
    };

    const paymentsWithDynamicStatus = paymentsState.map(getDynamicStatus);
    const filteredPayments = paymentsWithDynamicStatus.filter(payment => {
        const matchesSearch = payment.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || payment.client.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 'All Payments') return matchesSearch;
        if (activeTab === 'Overdue') return payment.status === 'Overdue' && matchesSearch;
        if (activeTab === 'Pending') return (payment.status === 'Unpaid' || payment.status === 'Partial') && matchesSearch;
        if (activeTab === 'Paid') return payment.status === 'Paid' && matchesSearch;
        return false;
    });

    const overdueCount = paymentsWithDynamicStatus.filter(p => p.status === 'Overdue').length;

    // CSV Export
    const exportCSV = () => {
        const rows = [
            ['Invoice No','Client','Amount','Received','Due Date','Status','Payment Date','Method','Transaction ID']
        ];
        paymentsState.forEach(p => rows.push([p.invoiceNo, p.client, p.amount, p.received, p.dueDate, p.status, p.paymentDate || '', p.method || '', p.transactionId || '']));
        const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payments_export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderContent = () => {
        if (activeTab === 'Overdue' || activeTab === 'Pending') {
            const isOverdueTab = activeTab === 'Overdue';
            return (
                <div className="bg-white border border-gray-200 rounded-xl">
                    <div className="p-6">
                         <h2 className={`text-lg font-bold text-gray-900 flex items-center gap-2`}>
                            {isOverdueTab ? <AlertCircle className="text-red-500" /> : <Clock className="text-yellow-500" />}
                            {isOverdueTab ? 'Overdue Payments' : 'Pending Payments'}
                         </h2>
                        <p className="text-sm text-gray-500">
                            {isOverdueTab ? 'Invoices past due date requiring immediate attention' : 'Invoices awaiting payment within due date'}
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map(payment => (
                                <PendingPaymentCard key={payment.invoiceNo} invoice={payment} onMarkPaid={handleMarkAsPaid} editingPaymentId={editingPaymentId} setEditingPaymentId={setEditingPaymentId} onSavePayment={handleSavePayment} />
                            ))
                        ) : (
                            <EmptyState 
                                icon={<AlertCircle className="h-16 w-16" />}
                                title={`No ${isOverdueTab ? 'overdue' : 'pending'} payments`}
                                message={`There are no ${isOverdueTab ? 'overdue' : 'pending'} payments at the moment.`}
                                className="py-16"
                            />
                        )}
                    </div>
                </div>
            );
        }

        if(activeTab === 'Paid') {
            return (
                <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                     <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-900">Completed Payments</h2>
                        <p className="text-sm text-gray-500">Successfully received payments</p>
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
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.map(payment => <PaidPaymentRow key={payment.invoiceNo} {...payment} amount={`₹${payment.amount.toLocaleString()}`} />)}
                        </tbody>
                    </table>
                     {filteredPayments.length === 0 && (
                         <EmptyState 
                             icon={<CheckCircle2 className="h-16 w-16" />}
                             title="No paid payments"
                             message="No completed payments found in the selected period."
                             className="py-16"
                         />
                    )}
                </div>
            );
        }
        
        return (
             <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                 <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900">Payment Tracker</h2>
                    <p className="text-sm text-gray-500">Monitor all payment statuses and due dates</p>
                </div>
                 <table className="w-full min-w-[1000px]">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4">Invoice No</th>
                            <th className="py-3 px-4">Client</th>
                            <th className="py-3 px-4">Amount</th>
                            <th className="py-3 px-4">Due Date</th>
                            <th className="py-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map(payment => <PaymentRow key={payment.invoiceNo} {...payment} amount={`₹${payment.amount.toLocaleString()}`} received={payment.received ? `₹${payment.received.toLocaleString()}` : null} />)}
                    </tbody>
                </table>
                 {filteredPayments.length === 0 && (
                     <EmptyState 
                         icon={<Search className="h-16 w-16" />}
                         title="No payments found"
                         message={searchTerm ? `No payments match "${searchTerm}"` : `No payments found for "${activeTab}"`}
                         className="py-16"
                     />
                 )}
            </div>
        );
    }

    // Show loading state
    if (invoicesLoading || authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                        <p className="text-sm text-gray-500 mt-1">Track payments, manage overdue invoices, and send reminders</p>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <LoadingSpinner size="lg" text="Loading payment data..." />
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (invoicesError || authLoading === false && !user) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
                    <ErrorState 
                        title="Unable to load payments"
                        message={invoicesError || "Please sign in to view payment data"}
                        onRetry={() => window.location.reload()}
                        className="min-h-96"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <PaymentMethodModal isOpen={!!paymentToMarkPaid} onClose={() => setPaymentToMarkPaid(null)} onConfirm={confirmMarkAsPaid} />
            <div className="max-w-7xl mx-auto px-8 pb-8 pt-32">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track payments, manage overdue invoices, and send reminders</p>
                </header>
                <main className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {(() => {
                            const totalAmount = paymentsState.reduce((s, p) => s + (p.amount || 0), 0);
                            const amountReceived = paymentsState.reduce((s, p) => s + (p.received || 0), 0);
                            const overdueAmount = paymentsState.filter(p => p.status === 'Overdue').reduce((s, p) => s + (p.amount - (p.received || 0)), 0);
                            const pendingAmount = paymentsState.filter(p => p.status === 'Unpaid' || p.status === 'Partial').reduce((s, p) => s + (p.amount - (p.received || 0)), 0);
                            return (
                                <>
                                    <StatCard title="Total Amount" amount={`₹${totalAmount.toLocaleString()}`} subtitle="All invoices" icon={IndianRupee} iconBgColor="bg-blue-500" />
                                    <StatCard title="Amount Received" amount={`₹${amountReceived.toLocaleString()}`} subtitle={`${totalAmount > 0 ? Math.round((amountReceived / totalAmount) * 100) : 0}% of total`} icon={CheckCircle2} iconBgColor="bg-green-500" />
                                    <StatCard title="Overdue Amount" amount={`₹${overdueAmount.toLocaleString()}`} subtitle="Needs attention" icon={AlertCircle} iconBgColor="bg-red-500" />
                                    <StatCard title="Pending Amount" amount={`₹${pendingAmount.toLocaleString()}`} subtitle="Awaiting payment" icon={Clock} iconBgColor="bg-yellow-500" />
                                </>
                            );
                        })()}
                    </div>
                     <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Search by invoice number or client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                                 <div className="flex items-center gap-4">
                                     <div className="bg-white rounded-md">
                                          <button onClick={exportCSV} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Export CSV</button>
                                     </div>
                                     <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max overflow-x-auto">
                            {tabs.map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}>
                                    {tab}
                                    {tab === 'Overdue' && overdueCount > 0 && (<span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{overdueCount}</span>)}
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