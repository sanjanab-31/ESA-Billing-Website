import React, { useState } from 'react';
import { IndianRupee, CheckCircle2, AlertCircle, Clock, Search, Send, Check, Bell, Save } from 'lucide-react';

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
            case 'Paid':
                return <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Paid</span>;
            case 'Unpaid':
                return <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">Unpaid</span>;
            case 'Overdue':
                return <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">Overdue ({overdueDays}d)</span>;
            case 'Partial':
                return <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">Partial</span>;
            default:
                return null;
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

const OverduePaymentCard = ({ invoiceNo, client, amount, dueDate, overdueDays, onMarkPaid }) => (
    <div className="bg-red-50/50 border border-red-200/60 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle size={24} className="text-white" />
            </div>
            <div>
                <p className="font-bold text-gray-900">{invoiceNo}</p>
                <p className="text-sm text-gray-600">{client}</p>
                <p className="text-sm text-red-600 font-medium">Overdue by {overdueDays} days</p>
            </div>
        </div>
        <div className="w-full md:w-auto flex flex-col items-end md:flex-row md:items-center gap-3">
             <div className="text-right md:mr-6">
                <p className="text-xl font-bold text-gray-900">₹{amount.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Due: {dueDate}</p>
            </div>
            <div className="flex items-center gap-2">
                 <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
                    <Bell size={16} />
                    Remind
                </button>
                <button onClick={() => onMarkPaid(invoiceNo)} className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600">
                    <Check size={16} />
                    Mark Paid
                </button>
            </div>
        </div>
    </div>
);

const PendingPaymentCard = ({ invoice, onMarkPaid, editingPaymentId, setEditingPaymentId, onSavePayment }) => {
    const { invoiceNo, client, amount, received, dueDate, status } = invoice;
    const [paidAmount, setPaidAmount] = useState('');

    const isEditing = editingPaymentId === invoiceNo;
    const remainingAmount = amount - (received || 0);

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
                <div className={`w-11 h-11 ${status === 'Partial' ? 'bg-purple-500' : 'bg-yellow-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Clock size={24} className="text-white" />
                </div>
                <div>
                    <p className="font-bold text-gray-900">{invoiceNo}</p>
                    <p className="text-sm text-gray-600">{client}</p>
                    <p className="text-sm text-gray-500">Due: {dueDate}</p>
                </div>
            </div>
            <div className="w-full md:w-auto flex flex-col items-end md:flex-row md:items-center gap-3">
                 <div className="text-right md:mr-6">
                    <p className="text-xl font-bold text-gray-900">₹{remainingAmount.toLocaleString()}</p>
                    {status === 'Partial' && <p className="text-xs text-gray-500">out of ₹{amount.toLocaleString()}</p>}
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
                        <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                           <Save size={16} /> Save
                        </button>
                         <button onClick={handleCancel} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                         <button onClick={handleEnterAmountClick} className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700">
                            Enter Amount Paid
                        </button>
                        <button onClick={() => onMarkPaid(invoiceNo)} className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600">
                            <Check size={16} />
                            Mark Paid
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const PaidPaymentRow = ({ invoiceNo, client, amount, paymentDate, method, transactionId }) => (
    <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
        <td className="py-3 px-4 text-sm font-medium text-gray-900">{invoiceNo}</td>
        <td className="py-3 px-4 text-sm text-gray-800">{client}</td>
        <td className="py-3 px-4 text-sm font-medium text-green-600">{amount}</td>
        <td className="py-3 px-4 text-sm text-gray-600">{paymentDate}</td>
        <td className="py-3 px-4 text-sm text-gray-800">{method}</td>
        <td className="py-3 px-4 text-sm text-gray-800 font-mono">{transactionId}</td>
    </tr>
);


const PaymentsPage = () => {
    const [activeTab, setActiveTab] = useState('All Payments');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const tabs = ['All Payments', 'Overdue', 'Pending', 'Paid'];

    const [payments, setPayments] = useState([
        { invoiceNo: 'INV-2024-001', client: 'TechnoFab Industries', amount: 125000, received: 125000, dueDate: '14/02/2024', status: 'Paid', overdueDays: 0, paymentDate: '10/02/2024', method: 'UPI', transactionId: 'TXN123456789' },
        { invoiceNo: 'INV-2024-002', client: 'Kumar Enterprises', amount: 89500, received: 0, dueDate: '17/02/2024', status: 'Unpaid', overdueDays: 0 },
        { invoiceNo: 'INV-2024-003', client: 'Global Manufacturing', amount: 205000, received: 0, dueDate: '20/01/2024', status: 'Overdue', overdueDays: 12 },
        { invoiceNo: 'INV-2024-004', client: 'Metro Solutions Ltd', amount: 67800, received: 0, dueDate: '15/01/2024', status: 'Overdue', overdueDays: 17 },
        { invoiceNo: 'INV-2024-005', client: 'Sunshine Traders', amount: 156000, received: 100000, dueDate: '24/02/2024', status: 'Partial', overdueDays: 0 },
        { invoiceNo: 'INV-2024-006', client: 'Kumar Enterprises', amount: 75000, received: 75000, dueDate: '10/02/2024', status: 'Paid', overdueDays: 0, paymentDate: '10/02/2024', method: 'Cash', transactionId: '-' },
    ]);

    const handleMarkAsPaid = (invoiceNo) => {
        const today = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
        setPayments(payments.map(p => 
            p.invoiceNo === invoiceNo 
                ? { ...p, status: 'Paid', paymentDate: today, received: p.amount, overdueDays: 0 } 
                : p
        ));
    };

    const handleSavePayment = (invoiceNo, paidAmountStr) => {
        const paidAmount = parseFloat(paidAmountStr);
        if (isNaN(paidAmount) || paidAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        setPayments(payments.map(p => {
            if (p.invoiceNo === invoiceNo) {
                const newReceived = (p.received || 0) + paidAmount;
                const isFullyPaid = newReceived >= p.amount;
                return {
                    ...p,
                    status: isFullyPaid ? 'Paid' : 'Partial',
                    received: newReceived,
                    paymentDate: isFullyPaid ? new Date().toLocaleDateString('en-GB') : p.paymentDate,
                };
            }
            return p;
        }));
        setEditingPaymentId(null);
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || payment.client.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeTab === 'All Payments') return matchesSearch;
        if (activeTab === 'Overdue') return payment.status === 'Overdue' && matchesSearch;
        if (activeTab === 'Pending') return (payment.status === 'Unpaid' || payment.status === 'Partial') && matchesSearch;
        if (activeTab === 'Paid') return payment.status === 'Paid' && matchesSearch;

        return false;
    });

    const overdueCount = payments.filter(p => p.status === 'Overdue').length;

    const renderContent = () => {
        if (activeTab === 'Overdue') {
            return (
                <div className="bg-white border border-gray-200 rounded-xl">
                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                             <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><AlertCircle className="text-red-500" /> Overdue Payments</h2>
                            <p className="text-sm text-gray-500">Invoices past due date requiring immediate attention</p>
                        </div>
                        <button className="flex items-center gap-2 mt-4 md:mt-0 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600">
                            <Send size={16} />
                            Send All Reminders
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map(payment => <OverduePaymentCard key={payment.invoiceNo} {...payment} onMarkPaid={handleMarkAsPaid} />)
                        ) : (
                             <div className="text-center py-16 text-gray-500">
                                <p>No overdue payments found.</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeTab === 'Pending') {
            return (
                <div className="bg-white border border-gray-200 rounded-xl">
                    <div className="p-6">
                         <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Clock className="text-yellow-500" /> Pending Payments</h2>
                        <p className="text-sm text-gray-500">Invoices awaiting payment within due date</p>
                    </div>
                    <div className="p-6 space-y-4">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map(payment => (
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
                             <div className="text-center py-16 text-gray-500">
                                <p>No pending payments found.</p>
                            </div>
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
                     <table className="w-full min-w-[1000px]">
                        {/* FONT/STYLE CHANGE: Table header */}
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
                         <div className="text-center py-16 text-gray-500">
                            <p>No paid payments found.</p>
                        </div>
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
                    {/* FONT/STYLE CHANGE: Table header */}
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
                     <div className="text-center py-16 text-gray-500">
                        <p>No payments found for "{activeTab}"</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        // LAYOUT CHANGE: Applying consistent page structure
        <div className="min-h-screen bg-white font-sans">
            <div className="max-w-7xl mx-auto p-8">
                <header>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track payments, manage overdue invoices, and send reminders</p>
                </header>
                
                <main className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard title="Total Amount" amount="₹7,18,300" subtitle="All invoices" icon={IndianRupee} iconBgColor="bg-blue-500" />
                        <StatCard title="Amount Received" amount="₹3,00,000" subtitle="41.7% of total" icon={CheckCircle2} iconBgColor="bg-green-500" />
                        <StatCard title="Overdue Amount" amount="₹2,72,800" subtitle="Needs attention" icon={AlertCircle} iconBgColor="bg-red-500" />
                        <StatCard title="Pending Amount" amount="₹1,45,500" subtitle="Awaiting payment" icon={Clock} iconBgColor="bg-yellow-500" />
                    </div>

                     <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by invoice number or client..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                         <div className="bg-gray-100 rounded-lg p-1 flex items-center space-x-1 max-w-max overflow-x-auto">
                            {tabs.map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    // FONT CHANGE: Added font-medium
                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {tab}
                                    {tab === 'Overdue' && overdueCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{overdueCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {renderContent()}

                </main>
            </div>
        </div>
    );
};

export default PaymentsPage;