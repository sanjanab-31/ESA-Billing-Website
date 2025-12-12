import React, { useState } from 'react';
import { seedDatabase } from '../../utils/seedData';
import { Database, CheckCircle, XCircle, Loader } from 'lucide-react';

const DataSeeder = () => {
    const [isSeeding, setIsSeeding] = useState(false);
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);

    const handleSeed = async () => {
        if (!window.confirm('This will add 1000 clients, 2000 products, and 500 invoices to your database. Continue?')) {
            return;
        }

        setIsSeeding(true);
        setProgress({ message: 'Starting...' });
        setResult(null);

        const onProgress = (update) => {
            setProgress(update);
        };

        const seedResult = await seedDatabase(onProgress);
        setResult(seedResult);
        setIsSeeding(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Seeder</h1>
                    <p className="text-gray-600">Generate sample data for testing</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4">What will be generated:</h2>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span><strong>1,000 Clients</strong> with realistic Indian data</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span><strong>2,000 Products</strong> across 8 categories</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span><strong>500 Invoices</strong> with 20% TDS on each</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span><strong>~300 Payment Records</strong> (for paid/partial invoices)</span>
                        </li>
                    </ul>
                </div>

                {progress && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            {isSeeding && <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                    {progress.message || 'Processing...'}
                                </p>
                                {progress.type === 'clients' && (
                                    <p className="text-xs text-blue-700 mt-1">
                                        Clients: {progress.current} / {progress.total}
                                    </p>
                                )}
                                {progress.type === 'products' && (
                                    <p className="text-xs text-blue-700 mt-1">
                                        Products: {progress.current} / {progress.total}
                                    </p>
                                )}
                                {progress.type === 'invoices' && (
                                    <p className="text-xs text-blue-700 mt-1">
                                        Invoices: {progress.current} / {progress.total}
                                    </p>
                                )}
                                {progress.type === 'complete' && (
                                    <p className="text-xs text-blue-700 mt-1">
                                        ✅ {progress.stage}: {progress.count} created
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className={`rounded-lg p-4 mb-6 ${result.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        <div className="flex items-start gap-3">
                            {result.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${result.success ? 'text-green-900' : 'text-red-900'
                                    }`}>
                                    {result.success ? '🎉 Database seeding completed successfully!' : '❌ Error seeding database'}
                                </p>
                                {result.success && (
                                    <div className="text-xs text-green-700 mt-2 space-y-1">
                                        <p>✓ {result.clients} Clients created</p>
                                        <p>✓ {result.products} Products created</p>
                                        <p>✓ {result.invoices} Invoices created (with 20% TDS)</p>
                                    </div>
                                )}
                                {result.error && (
                                    <p className="text-xs text-red-700 mt-1">{result.error}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${isSeeding
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isSeeding ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader className="w-5 h-5 animate-spin" />
                                Seeding Database...
                            </span>
                        ) : (
                            'Start Seeding'
                        )}
                    </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                        <strong>⚠️ Warning:</strong> This process may take 10-15 minutes to complete due to rate limiting.
                        Please keep this tab open and don't refresh the page.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DataSeeder;
