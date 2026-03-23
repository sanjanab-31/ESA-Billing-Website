const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function to generate random data
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// Sample data arrays
const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Suresh', 'Kavita', 'Ramesh', 'Deepika', 'Arun', 'Meera', 'Kiran', 'Pooja', 'Sanjay', 'Nisha', 'Manoj', 'Ritu', 'Vijay', 'Swati'];
const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Gupta', 'Verma', 'Rao', 'Nair', 'Iyer', 'Joshi', 'Desai', 'Mehta', 'Shah', 'Agarwal', 'Chopra', 'Malhotra', 'Kapoor', 'Bose', 'Das'];
const companies = ['Tech Solutions', 'Industries', 'Enterprises', 'Corporation', 'Systems', 'Services', 'Technologies', 'Innovations', 'Consultants', 'Group'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];
const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Rajasthan'];
const productCategories = ['Software', 'Hardware', 'Consulting', 'Support', 'Training', 'Development', 'Maintenance', 'Integration'];
const hsnCodes = ['998314', '998315', '998316', '998317', '998318', '998319', '998320', '998321'];

// Generate GST number
const generateGSTIN = () => {
    const stateCode = getRandomNumber(10, 35).toString().padStart(2, '0');
    const pan = Array(10).fill(0).map(() => getRandomElement('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')).join('');
    const entity = getRandomNumber(1, 9);
    const checksum = getRandomElement('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    return `${stateCode}${pan}${entity}Z${checksum}`;
};

// Generate Clients
async function generateClients(count) {
    console.log(`Generating ${count} clients...`);
    const batch = db.batch();
    const clients = [];

    for (let i = 0; i < count; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const company = `${firstName} ${getRandomElement(companies)}`;
        const city = getRandomElement(cities);
        const state = getRandomElement(states);

        const clientData = {
            name: company,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            phone: `+91 ${getRandomNumber(70000, 99999)} ${getRandomNumber(10000, 99999)}`,
            address: `${getRandomNumber(1, 999)}, ${getRandomElement(['MG Road', 'Park Street', 'Main Road', 'Station Road'])}, ${city}, ${state} - ${getRandomNumber(400001, 600099)}`,
            company: company,
            taxId: generateGSTIN(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = db.collection('customers').doc();
        batch.set(docRef, clientData);
        clients.push({ id: docRef.id, ...clientData });

        // Commit in batches of 500 (Firestore limit)
        if ((i + 1) % 500 === 0) {
            await batch.commit();
            console.log(`  Committed ${i + 1} clients`);
        }
    }

    // Commit remaining
    if (count % 500 !== 0) {
        await batch.commit();
        console.log(`  Committed all ${count} clients`);
    }

    return clients;
}

// Generate Products
async function generateProducts(count) {
    console.log(`Generating ${count} products...`);
    const batch = db.batch();
    const products = [];

    for (let i = 0; i < count; i++) {
        const category = getRandomElement(productCategories);
        const productName = `${category} ${getRandomElement(['Pro', 'Plus', 'Premium', 'Standard', 'Basic', 'Enterprise'])} ${i + 1}`;

        const productData = {
            name: productName,
            hsn: getRandomElement(hsnCodes),
            price: getRandomNumber(1000, 100000),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            priceHistory: []
        };

        const docRef = db.collection('products').doc();
        batch.set(docRef, productData);
        products.push({ id: docRef.id, ...productData });

        // Commit in batches of 500
        if ((i + 1) % 500 === 0) {
            await batch.commit();
            console.log(`  Committed ${i + 1} products`);
        }
    }

    // Commit remaining
    if (count % 500 !== 0) {
        await batch.commit();
        console.log(`  Committed all ${count} products`);
    }

    return products;
}

// Generate Invoices
async function generateInvoices(count, clients, products) {
    console.log(`Generating ${count} invoices...`);
    const batch = db.batch();
    const startDate = new Date('2024-04-01'); // Financial year start
    const endDate = new Date('2025-03-31'); // Financial year end

    for (let i = 0; i < count; i++) {
        const client = getRandomElement(clients);
        const invoiceDate = getRandomDate(startDate, endDate);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + getRandomNumber(15, 45)); // 15-45 days payment term

        // Select 1-5 random products for this invoice
        const numProducts = getRandomNumber(1, 5);
        const selectedProducts = [];
        const usedProductIds = new Set();

        for (let j = 0; j < numProducts; j++) {
            let product;
            do {
                product = getRandomElement(products);
            } while (usedProductIds.has(product.id));

            usedProductIds.add(product.id);
            const quantity = getRandomNumber(1, 10);
            const price = product.price;

            selectedProducts.push({
                id: product.id,
                name: product.name,
                hsn: product.hsn,
                quantity: quantity,
                price: price,
                total: quantity * price
            });
        }

        // Calculate totals
        const subtotal = selectedProducts.reduce((sum, p) => sum + p.total, 0);
        const cgst = subtotal * 0.09; // 9% CGST
        const sgst = subtotal * 0.09; // 9% SGST
        const totalBeforeTDS = subtotal + cgst + sgst;
        const tdsAmount = totalBeforeTDS * 0.20; // 20% TDS
        const totalAmount = totalBeforeTDS;

        // Determine status based on date and random payment
        const today = new Date();
        const isPastDue = dueDate < today;
        const randomPaid = Math.random();

        let status, paidAmount = 0, received = 0;

        if (randomPaid < 0.6) { // 60% paid
            status = 'Paid';
            paidAmount = totalAmount - tdsAmount; // Amount after TDS deduction
            received = paidAmount;
        } else if (randomPaid < 0.8) { // 20% partial
            status = 'Partial';
            paidAmount = Math.floor((totalAmount - tdsAmount) * getRandomNumber(30, 70) / 100);
            received = paidAmount;
        } else if (isPastDue) { // Remaining unpaid, check if overdue
            status = 'Overdue';
        } else {
            status = 'Unpaid';
        }

        const invoiceData = {
            invoiceNumber: `INV-${(i + 1).toString().padStart(6, '0')}`,
            clientId: client.id,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                address: client.address,
                gstin: client.taxId
            },
            invoiceDate: admin.firestore.Timestamp.fromDate(invoiceDate),
            dueDate: admin.firestore.Timestamp.fromDate(dueDate),
            products: selectedProducts,
            subtotal: subtotal,
            cgst: cgst,
            sgst: sgst,
            igst: 0,
            total: totalAmount,
            totalAmount: totalAmount,
            amount: totalAmount,
            tdsAmount: tdsAmount,
            tdsPercentage: 20,
            paidAmount: paidAmount,
            received: received,
            status: status,
            notes: `Sample invoice generated for ${client.name}`,
            createdAt: admin.firestore.Timestamp.fromDate(invoiceDate),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = db.collection('invoices').doc();
        batch.set(docRef, invoiceData);

        // Create payment record if paid or partial
        if (status === 'Paid' || status === 'Partial') {
            const paymentDate = new Date(invoiceDate);
            paymentDate.setDate(paymentDate.getDate() + getRandomNumber(1, 30));

            const paymentData = {
                invoiceId: docRef.id,
                invoiceNumber: invoiceData.invoiceNumber,
                clientId: client.id,
                clientName: client.name,
                amount: paidAmount,
                tdsAmount: status === 'Paid' ? tdsAmount : 0, // TDS only on full payment
                method: getRandomElement(['UPI', 'Bank Transfer', 'Cash']),
                transactionId: `TXN${Date.now()}${getRandomNumber(1000, 9999)}`,
                paymentDate: admin.firestore.Timestamp.fromDate(paymentDate),
                notes: `Payment for ${invoiceData.invoiceNumber}`,
                createdAt: admin.firestore.Timestamp.fromDate(paymentDate),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            const paymentRef = db.collection('payments').doc();
            batch.set(paymentRef, paymentData);
        }

        // Commit in batches of 250 (invoices + payments)
        if ((i + 1) % 250 === 0) {
            await batch.commit();
            console.log(`  Committed ${i + 1} invoices`);
        }
    }

    // Commit remaining
    if (count % 250 !== 0) {
        await batch.commit();
        console.log(`  Committed all ${count} invoices`);
    }
}

// Main execution
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        const clients = await generateClients(1000);
        console.log('✅ Clients generated\n');

        const products = await generateProducts(2000);
        console.log('✅ Products generated\n');

        await generateInvoices(500, clients, products);
        console.log('✅ Invoices generated\n');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\nSummary:');
        console.log('  - 1000 Clients');
        console.log('  - 2000 Products');
        console.log('  - 500 Invoices (with 20% TDS)');
        console.log('  - ~300 Payment records (for paid/partial invoices)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeder
seedDatabase();
