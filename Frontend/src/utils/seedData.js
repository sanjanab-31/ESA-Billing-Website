// Helper functions
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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const pan = Array(10).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    const entity = getRandomNumber(1, 9);
    const checksum = getRandomElement('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    return `${stateCode}${pan}${entity}Z${checksum}`;
};

// LocalStorage keys
const KEYS = {
    customers: 'stub_customers',
    products: 'stub_products',
    invoices: 'stub_invoices',
    payments: 'stub_payments'
};

// Generate Clients
export function generateClients(count, onProgress) {
    console.log(`Generating ${count} clients...`);
    const clients = [];

    for (let i = 0; i < count; i++) {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);
        const company = `${firstName} ${getRandomElement(companies)}`;
        const city = getRandomElement(cities);
        const state = getRandomElement(states);

        const clientData = {
            id: `local-cust-${Date.now()}-${i}`,
            serialNumber: String(i + 1).padStart(2, '0'), // S.No: 01, 02, 03... 99, 100... 1000
            name: company,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
            phone: `+91 ${getRandomNumber(70000, 99999)} ${getRandomNumber(10000, 99999)}`,
            address: `${getRandomNumber(1, 999)}, ${getRandomElement(['MG Road', 'Park Street', 'Main Road', 'Station Road'])}, ${city}, ${state} - ${getRandomNumber(400001, 600099)}`,
            company: company,
            taxId: generateGSTIN(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        clients.push(clientData);

        if ((i + 1) % 100 === 0) {
            console.log(`  Created ${i + 1} clients`);
            if (onProgress) onProgress({ type: 'clients', current: i + 1, total: count });
        }
    }

    // Save to localStorage
    localStorage.setItem(KEYS.customers, JSON.stringify(clients));
    console.log(`✅ Saved ${clients.length} clients to localStorage`);
    return clients;
}

// Generate Products
export function generateProducts(count, onProgress) {
    console.log(`Generating ${count} products...`);
    const products = [];

    for (let i = 0; i < count; i++) {
        const category = getRandomElement(productCategories);
        const productName = `${category} ${getRandomElement(['Pro', 'Plus', 'Premium', 'Standard', 'Basic', 'Enterprise'])} ${i + 1}`;

        const productData = {
            id: `local-prod-${Date.now()}-${i}`,
            serialNumber: String(i + 1).padStart(2, '0'), // S.No: 01, 02, 03... 99, 100... 2000
            name: productName,
            hsn: getRandomElement(hsnCodes),
            price: getRandomNumber(1000, 100000),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            priceHistory: []
        };

        products.push(productData);

        if ((i + 1) % 200 === 0) {
            console.log(`  Created ${i + 1} products`);
            if (onProgress) onProgress({ type: 'products', current: i + 1, total: count });
        }
    }

    // Save to localStorage
    localStorage.setItem(KEYS.products, JSON.stringify(products));
    console.log(`✅ Saved ${products.length} products to localStorage`);
    return products;
}

// Generate Invoices
export function generateInvoices(count, clients, products, onProgress) {
    console.log(`Generating ${count} invoices...`);
    const invoices = [];
    const payments = [];
    const startDate = new Date('2025-04-01');
    const endDate = new Date('2026-03-31');

    for (let i = 0; i < count; i++) {
        const client = getRandomElement(clients);
        const invoiceDate = getRandomDate(startDate, endDate);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + getRandomNumber(15, 45));

        // Select 1-5 random products
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
        const cgst = Math.round(subtotal * 0.09);
        const sgst = Math.round(subtotal * 0.09);
        const totalBeforeTDS = subtotal + cgst + sgst;
        const tdsAmount = Math.round(totalBeforeTDS * 0.20); // 20% TDS
        const totalAmount = totalBeforeTDS;

        // Determine status - NO DRAFTS in seeded data
        const today = new Date();
        const isPastDue = dueDate < today;
        const randomPaid = Math.random();

        let status, paidAmount = 0, received = 0;

        if (randomPaid < 0.6) {
            status = 'Paid';
            paidAmount = totalAmount - tdsAmount;
            received = paidAmount;
        } else if (randomPaid < 0.8) {
            status = 'Partial';
            paidAmount = Math.floor((totalAmount - tdsAmount) * getRandomNumber(30, 70) / 100);
            received = paidAmount;
        } else if (isPastDue) {
            status = 'Overdue';
        } else {
            status = 'Unpaid';
        }

        // Generate invoice number in format: INV 001/2025-26
        const fyStart = invoiceDate.getMonth() >= 3 ? invoiceDate.getFullYear() : invoiceDate.getFullYear() - 1;
        const fyEnd = fyStart + 1;
        const fyString = `${fyStart}-${fyEnd.toString().slice(2)}`;
        const invoiceNumber = `INV ${String(i + 1).padStart(3, '0')}/${fyString}`;

        const invoiceId = `local-inv-${Date.now()}-${i}`;
        const invoiceData = {
            id: invoiceId,
            invoiceNumber: invoiceNumber,
            clientId: client.id,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
                address: client.address,
                gstin: client.taxId
            },
            invoiceDate: invoiceDate.toISOString(),
            dueDate: dueDate.toISOString(),
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
            createdAt: invoiceDate.toISOString(),
            updatedAt: new Date().toISOString()
        };

        invoices.push(invoiceData);

        // Create payment record if paid or partial
        if (status === 'Paid' || status === 'Partial') {
            const paymentDate = new Date(invoiceDate);
            paymentDate.setDate(paymentDate.getDate() + getRandomNumber(1, 30));

            const paymentData = {
                id: `local-pay-${Date.now()}-${i}`,
                invoiceId: invoiceId,
                invoiceNumber: invoiceData.invoiceNumber,
                clientId: client.id,
                clientName: client.name,
                amount: paidAmount,
                tdsAmount: status === 'Paid' ? tdsAmount : 0,
                method: getRandomElement(['UPI', 'Bank Transfer', 'Cash']),
                transactionId: `TXN${Date.now()}${getRandomNumber(1000, 9999)}`,
                paymentDate: paymentDate.toISOString(),
                notes: `Payment for ${invoiceData.invoiceNumber}`,
                createdAt: paymentDate.toISOString(),
                updatedAt: new Date().toISOString()
            };

            payments.push(paymentData);
        }

        if ((i + 1) % 50 === 0) {
            console.log(`  Created ${i + 1} invoices`);
            if (onProgress) onProgress({ type: 'invoices', current: i + 1, total: count });
        }
    }

    // Save to localStorage
    localStorage.setItem(KEYS.invoices, JSON.stringify(invoices));
    localStorage.setItem(KEYS.payments, JSON.stringify(payments));
    console.log(`✅ Saved ${invoices.length} invoices and ${payments.length} payments to localStorage`);
}

// Main seeding function
export function seedDatabase(onProgress) {
    try {
        console.log('🌱 Starting database seeding...\n');

        if (onProgress) onProgress({ type: 'start', message: 'Starting database seeding...' });

        const clients = generateClients(1000, onProgress);
        if (onProgress) onProgress({ type: 'complete', stage: 'clients', count: clients.length });

        const products = generateProducts(2000, onProgress);
        if (onProgress) onProgress({ type: 'complete', stage: 'products', count: products.length });

        generateInvoices(500, clients, products, onProgress);
        if (onProgress) onProgress({ type: 'complete', stage: 'invoices', count: 500 });

        console.log('🎉 Database seeding completed successfully!');
        if (onProgress) onProgress({ type: 'done', message: 'Database seeding completed!' });

        // Reload the page to refresh all data
        setTimeout(() => {
            window.location.reload();
        }, 2000);

        return {
            success: true,
            clients: clients.length,
            products: products.length,
            invoices: 500
        };
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        if (onProgress) onProgress({ type: 'error', error: error.message });
        return {
            success: false,
            error: error.message
        };
    }
}
