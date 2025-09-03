require("dotenv").config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Invoice = require('./models/invoiceModel');
const Client = require('./models/clientModel');
const Product = require('./models/productModel');

const seedData = async () => {
    await connectDB();

    console.log('Clearing old data...');
    await Invoice.deleteMany({});
    await Client.deleteMany({});
    await Product.deleteMany({});

    console.log('Creating clients and products...');
    
    // NOTE: Replace 'test_user_id' with a real Firebase UID for testing
    const userId = 'test_user_id'; 

    const clients = await Client.create([
        { name: 'TechnoFab Industries', email: 'contact@technofab.com', gstin: '29ABCDE1234F1Z5', userId },
        { name: 'Kumar Enterprises', email: 'sales@kumar.com', gstin: '27FGHIJ6789K1L2', userId },
        { name: 'Global Manufacturing', email: 'info@globalmfg.com', gstin: '33MNOPQ1234R5S6', userId },
        { name: 'Metro Solutions Ltd', email: 'support@metrosolutions.net', gstin: '36TUVWX5678Y9Z0', userId },
        { name: 'Sunshine Traders', email: 'accounts@sunshine.co.in', gstin: '24KLMNO9012P3Q4', userId },
    ]);

    const products = await Product.create([
        { name: 'Manufacturing Equipment', hsnCode: '8479', userId },
        { name: 'Industrial Components', hsnCode: '8708', userId },
        { name: 'Automotive Parts', hsnCode: '8714', userId },
        { name: 'Electrical Equipment', hsnCode: '8536', userId },
        { name: 'Testing Instruments', hsnCode: '9027', userId },
    ]);

    console.log('Generating invoices across different months...');
    const invoices = [];
    const now = new Date();

    for (let i = 0; i < 150; i++) {
        const client = clients[i % clients.length];
        const product = products[i % products.length];
        const monthOffset = Math.floor(Math.random() * 12); // Invoices from the last 12 months
        const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, Math.floor(Math.random() * 28) + 1);

        const quantity = Math.floor(Math.random() * 10) + 1;
        const price = Math.floor(Math.random() * 5000) + 500;
        const totalAmount = quantity * price;
        const gstAmount = totalAmount * 0.18; // 18% GST

        invoices.push({
            client: client._id,
            products: [{ productId: product._id, quantity, price }],
            totalAmount,
            gstAmount,
            status: Math.random() > 0.2 ? 'Paid' : 'Outstanding',
            createdAt: date,
            userId
        });
    }

    await Invoice.insertMany(invoices);
    console.log('Database seeded successfully!');
    mongoose.connection.close();
};

seedData().catch(err => {
    console.error('Seeding failed:', err);
    mongoose.connection.close();
});
