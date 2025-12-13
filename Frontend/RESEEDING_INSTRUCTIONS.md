# Re-seeding Instructions

## The invoice number format has been updated!

**Old Format**: `INV-000001`, `INV-000002`  
**New Format**: `INV 001/2025-26`, `INV 002/2025-26`

## How to Re-seed with New Format

### Option 1: Clear and Re-seed via Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Run this command to clear old data:
   ```javascript
   localStorage.removeItem('stub_invoices');
   localStorage.removeItem('stub_payments');
   localStorage.removeItem('stub_customers');
   localStorage.removeItem('stub_products');
   ```
4. Navigate to `http://localhost:5173/seed-data`
5. Click "Start Seeding"
6. Wait for completion

### Option 2: Clear via Application Tab

1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Local Storage** → `http://localhost:5173`
4. Delete these keys:
   - `stub_invoices`
   - `stub_payments`
   - `stub_customers`
   - `stub_products`
5. Navigate to `http://localhost:5173/seed-data`
6. Click "Start Seeding"

## What's Fixed

✅ **Invoice Number Format**: Now generates `INV 001/2025-26` format  
✅ **Financial Year Aware**: Automatically calculates FY based on invoice date  
✅ **No Draft Status**: Seeded invoices only have Paid, Partial, Unpaid, or Overdue status  
✅ **Proper Status Distribution**:
   - 60% Paid
   - 20% Partial
   - 20% Unpaid/Overdue

## After Re-seeding

Your invoices will have:
- ✅ Correct format: `INV 001/2025-26`, `INV 002/2025-26`, etc.
- ✅ No drafts showing in Paid tab
- ✅ Proper status filtering across all tabs
- ✅ Sequential numbering within financial year

## Verification

After re-seeding, check:
1. **All Invoices tab**: Should show 500 invoices
2. **Paid tab**: Should show ~300 invoices (60%), NO drafts
3. **Invoice numbers**: Should be in format `INV 001/2025-26`
4. **Next new invoice**: Will be `INV 501/2025-26`
