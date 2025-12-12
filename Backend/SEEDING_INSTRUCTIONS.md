# Database Seeding Instructions

This script will generate sample data for your ESA Billing Website:
- **1000 Clients** with realistic Indian names, addresses, and GSTIN
- **2000 Products** across various categories
- **500 Invoices** with 20% TDS on each bill
- **~300 Payment records** (for paid/partial invoices)

## Prerequisites

1. Make sure you have the Firebase Admin SDK service account key file
2. Node.js installed
3. Firebase Admin SDK package installed

## Setup Steps

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json` in the `Backend` folder

### 2. Install Dependencies

```bash
cd Backend
npm install firebase-admin
```

### 3. Run the Seeder

```bash
node seedData.js
```

## What the Script Does

### Clients (1000)
- Generates realistic Indian names and company names
- Creates valid GSTIN numbers
- Adds addresses with Indian cities and states
- Includes email and phone numbers

### Products (2000)
- Creates products across 8 categories (Software, Hardware, Consulting, etc.)
- Assigns HSN codes
- Sets random prices between ₹1,000 and ₹1,00,000

### Invoices (500)
- Distributes across the current financial year (April 2024 - March 2025)
- Each invoice includes:
  - 1-5 random products
  - CGST (9%) and SGST (9%)
  - **20% TDS** on the total amount
  - Random status: 60% Paid, 20% Partial, 20% Unpaid/Overdue
  
### Payments
- Automatically creates payment records for Paid and Partial invoices
- Includes transaction IDs and payment methods (UPI, Bank Transfer, Cash)
- TDS is recorded in the payment for fully paid invoices

## Expected Output

```
🌱 Starting database seeding...

Generating 1000 clients...
  Committed 500 clients
  Committed all 1000 clients
✅ Clients generated

Generating 2000 products...
  Committed 500 products
  Committed 1000 products
  Committed 1500 products
  Committed all 2000 products
✅ Products generated

Generating 500 invoices...
  Committed 250 invoices
  Committed all 500 invoices
✅ Invoices generated

🎉 Database seeding completed successfully!

Summary:
  - 1000 Clients
  - 2000 Products
  - 500 Invoices (with 20% TDS)
  - ~300 Payment records (for paid/partial invoices)
```

## Important Notes

⚠️ **Warning**: This script will add data to your Firebase database. Make sure you're running it on the correct project!

- The script uses batched writes for better performance
- All dates are within the current financial year (April 2024 - March 2025)
- TDS is calculated as 20% of the total invoice amount (including GST)
- The actual amount paid = Total Amount - TDS Amount (for paid invoices)

## Troubleshooting

### Error: "Cannot find module 'firebase-admin'"
```bash
npm install firebase-admin
```

### Error: "serviceAccountKey.json not found"
Make sure you've downloaded the service account key and placed it in the Backend folder.

### Error: "Permission denied"
Check that your Firebase service account has the necessary permissions to write to Firestore.

## Clean Up (Optional)

If you want to remove the seeded data later, you can use the Firebase Console or create a cleanup script.

---

**Created for ESA Billing Website**
