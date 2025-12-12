# Client-Side Data Seeding - Quick Start

## ✅ No Service Account Key Needed!

This seeder runs directly in your browser using your existing Firebase configuration.

## How to Use

### Option 1: Navigate in Browser
1. Make sure your app is running (`npm run dev`)
2. Sign in to your application
3. Navigate to: `http://localhost:5173/seed-data`
4. Click "Start Seeding"
5. Wait for completion (10-15 minutes)

### Option 2: Direct URL
Simply go to: **http://localhost:5173/seed-data**

## What Gets Created

- ✅ **1,000 Clients** - Realistic Indian business data
- ✅ **2,000 Products** - Across 8 categories
- ✅ **500 Invoices** - With 20% TDS on each
- ✅ **~300 Payments** - For paid/partial invoices

## Important Notes

⚠️ **Keep the tab open** - Don't close or refresh during seeding
⚠️ **Takes 10-15 minutes** - Due to Firebase rate limiting
⚠️ **One-time process** - Only run once to avoid duplicates

## Features

- Real-time progress tracking
- Automatic rate limiting to avoid Firebase quota issues
- Error handling and reporting
- Visual feedback for each stage

## Data Details

### Clients
- Indian names and company names
- Valid GSTIN numbers
- Complete addresses with cities/states
- Email and phone numbers

### Products
- Categories: Software, Hardware, Consulting, Support, Training, Development, Maintenance, Integration
- HSN codes
- Prices: ₹1,000 to ₹1,00,000

### Invoices
- Financial Year: April 2024 - March 2025
- 1-5 products per invoice
- CGST (9%) + SGST (9%)
- **20% TDS** on total amount
- Status: 60% Paid, 20% Partial, 20% Unpaid/Overdue

### Payments
- Automatic for Paid/Partial invoices
- Payment methods: UPI, Bank Transfer, Cash
- Transaction IDs included
- TDS recorded for full payments

## Troubleshooting

### "Permission denied" error
- Make sure you're signed in
- Check Firebase security rules allow writes

### Slow progress
- This is normal due to rate limiting
- Don't refresh the page

### Page timeout
- Keep the browser tab active
- Disable sleep mode if needed

---

**Ready to seed?** Just go to `/seed-data` in your browser! 🚀
