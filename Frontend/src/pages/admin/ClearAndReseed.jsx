import React, { useState } from 'react';
import { Trash2, RefreshCw, Database, AlertTriangle } from 'lucide-react';

const ClearAndReseed = () => {
    const [step, setStep] = useState('idle'); // idle, clearing, cleared, seeding, done
    const [message, setMessage] = useState('');

    const clearAllData = () => {
        setStep('clearing');
        setMessage('Clearing all data...');

        try {
            // Clear all localStorage data
            localStorage.removeItem('stub_customers');
            localStorage.removeItem('stub_products');
            localStorage.removeItem('stub_invoices');
            localStorage.removeItem('stub_payments');
            localStorage.removeItem('stub_settings');

            setStep('cleared');
            setMessage('✅ All data cleared successfully!');
        } catch (error) {
            setMessage(`❌ Error clearing data: ${error.message}`);
            setStep('idle');
        }
    };

    const handleReseed = () => {
        setStep('seeding');
        setMessage('Redirecting to seeding page...');

        setTimeout(() => {
            window.location.href = '/seed-data';
        }, 1000);
    };

    const handleClearAndReseed = () => {
        clearAllData();
        setTimeout(() => {
            handleReseed();
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Clear & Re-seed Database</h1>
                    <p className="text-gray-600">Remove all existing data and generate fresh sample data</p>
                </div>

                {/* Warning Box */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800 mb-1">Warning</h3>
                            <p className="text-sm text-yellow-700">
                                This will permanently delete ALL existing data including:
                            </p>
                            <ul className="text-sm text-yellow-700 mt-2 ml-4 list-disc">
                                <li>All Customers (1,000 entries)</li>
                                <li>All Products (2,000 entries)</li>
                                <li>All Invoices (500 entries)</li>
                                <li>All Payments (~300 entries)</li>
                                <li>All Settings</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${step === 'cleared' || step === 'done'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : step === 'clearing' || step === 'seeding'
                                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                                : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                    {/* Clear Only */}
                    <button
                        onClick={clearAllData}
                        disabled={step !== 'idle' && step !== 'cleared'}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${step !== 'idle' && step !== 'cleared'
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                    >
                        <Trash2 className="w-5 h-5" />
                        Clear All Data Only
                    </button>

                    {/* Clear and Re-seed */}
                    <button
                        onClick={handleClearAndReseed}
                        disabled={step !== 'idle'}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${step !== 'idle'
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        <RefreshCw className="w-5 h-5" />
                        Clear All & Re-seed
                    </button>

                    {/* Manual Re-seed (after clearing) */}
                    {step === 'cleared' && (
                        <button
                            onClick={handleReseed}
                            className="w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
                        >
                            <Database className="w-5 h-5" />
                            Go to Seeding Page
                        </button>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens when you re-seed?</h3>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>✓ 1,000 Clients with permanent S.No (01-1000)</li>
                        <li>✓ 2,000 Products with permanent S.No (01-2000)</li>
                        <li>✓ 500 Invoices with format: INV 001/2025-26</li>
                        <li>✓ ~300 Payment records</li>
                        <li>✓ Proper status distribution (60% Paid, 20% Partial, 20% Unpaid/Overdue)</li>
                        <li>✓ All data for FY 2025-2026</li>
                    </ul>
                </div>

                {/* Quick Console Commands */}
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Alternative: Browser Console</h3>
                    <p className="text-xs text-gray-600 mb-2">Press F12 and paste this in Console:</p>
                    <code className="block text-xs bg-gray-800 text-green-400 p-2 rounded font-mono overflow-x-auto">
                        localStorage.clear(); window.location.href = '/seed-data';
                    </code>
                </div>
            </div>
        </div>
    );
};

export default ClearAndReseed;
