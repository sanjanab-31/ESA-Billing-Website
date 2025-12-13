import React, { useState, useEffect } from 'react';
import { Archive, Calendar, FileText, DollarSign, TrendingUp, Download } from 'lucide-react';
import { getArchivedFYs, getArchivedFYData, getCurrentFinancialYear } from '../../utils/financialYear';

const FYArchives = () => {
    const [archivedFYs, setArchivedFYs] = useState([]);
    const [selectedFY, setSelectedFY] = useState(null);
    const [archiveData, setArchiveData] = useState(null);
    const currentFY = getCurrentFinancialYear();

    useEffect(() => {
        loadArchivedFYs();
    }, []);

    const loadArchivedFYs = () => {
        const fys = getArchivedFYs();
        setArchivedFYs(fys);
    };

    const handleSelectFY = (fyLabel) => {
        setSelectedFY(fyLabel);
        const data = getArchivedFYData(fyLabel);
        setArchiveData(data);
    };

    const calculateStats = (data) => {
        if (!data || !data.invoices) return { totalInvoices: 0, totalRevenue: 0, paidInvoices: 0, unpaidInvoices: 0 };

        const totalInvoices = data.invoices.length;
        const totalRevenue = data.invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.amount || 0), 0);
        const paidInvoices = data.invoices.filter(inv => inv.status === 'Paid').length;
        const unpaidInvoices = totalInvoices - paidInvoices;

        return { totalInvoices, totalRevenue, paidInvoices, unpaidInvoices };
    };

    const stats = archiveData ? calculateStats(archiveData) : null;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Archive className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Financial Year Archives</h1>
                    </div>
                    <p className="text-gray-600">
                        View historical data from previous financial years. Current FY: {currentFY.fullLabel}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - FY List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Archived Years</h2>

                            {archivedFYs.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Archive className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No archived data yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {archivedFYs.map((fyLabel) => (
                                        <button
                                            key={fyLabel}
                                            onClick={() => handleSelectFY(fyLabel)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedFY === fyLabel
                                                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                                                    : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">FY {fyLabel}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {!selectedFY ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Archive className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Financial Year</h3>
                                <p className="text-gray-600">Choose a year from the sidebar to view archived data</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <FileText className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.totalInvoices || 0}</p>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <DollarSign className="w-8 h-8 text-green-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <TrendingUp className="w-8 h-8 text-emerald-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Paid Invoices</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.paidInvoices || 0}</p>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <FileText className="w-8 h-8 text-red-600" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">Unpaid Invoices</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.unpaidInvoices || 0}</p>
                                    </div>
                                </div>

                                {/* Invoices Table */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Invoices - FY {selectedFY}
                                            </h3>
                                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                <Download className="w-4 h-4" />
                                                Export Data
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {archiveData?.invoices?.map((invoice) => (
                                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                            {invoice.invoiceNumber}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {new Date(invoice.invoiceDate || invoice.date).toLocaleDateString('en-IN')}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {invoice.clientName || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                            ₹{(invoice.totalAmount || invoice.amount || 0).toLocaleString('en-IN')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                                    invoice.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-red-100 text-red-800'
                                                                }`}>
                                                                {invoice.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FYArchives;
