# Financial Year (FY) Management System

## Overview

The ESA Billing Website now includes an **automatic Financial Year management system** that handles:
- Automatic FY transitions (April 1st each year)
- Data archiving for previous years
- Fresh start for new FY while preserving historical data
- Client and Product data persistence across FYs

---

## How It Works

### Financial Year Definition
- **FY Period**: April 1 to March 31
- **Current FY**: 2025-2026 (April 1, 2025 - March 31, 2026)
- **Next FY**: 2026-2027 (April 1, 2026 - March 31, 2027)

### Automatic Transition

On **April 1st of each year**, the system automatically:

1. ✅ **Archives Previous FY Data**
   - All invoices from previous FY moved to archives
   - All payments from previous FY moved to archives
   - Data stored in `fy_archives` in localStorage

2. ✅ **Preserves Master Data**
   - Clients remain unchanged
   - Products remain unchanged
   - Settings remain unchanged

3. ✅ **Resets for New FY**
   - Invoice counter resets to 001
   - Dashboard shows only current FY data
   - Reports show only current FY data

4. ✅ **Updates FY Badge**
   - Header badge updates to new FY (e.g., "2026-2027 FY")

---

## Data Structure

### Current FY Data (Active)
```
localStorage:
  - stub_customers (all clients - persistent)
  - stub_products (all products - persistent)
  - stub_invoices (current FY only)
  - stub_payments (current FY only)
  - stub_settings (persistent)
  - last_checked_fy (current FY label)
```

### Archived FY Data
```
localStorage:
  - fy_archives: {
      "2024-25": {
        invoices: [...],
        payments: [...],
        startDate: "2024-04-01",
        endDate: "2025-03-31"
      },
      "2025-26": {
        invoices: [...],
        payments: [...],
        startDate: "2025-04-01",
        endDate: "2026-03-31"
      }
    }
```

---

## Features

### 1. Automatic FY Detection
- System automatically detects current FY based on today's date
- No manual configuration needed
- Works for any year

### 2. Daily FY Check
- System checks once per day if FY has changed
- If April 1st is detected, automatic transition occurs
- Page reloads to show fresh data

### 3. Archive Access
- View historical data from previous FYs
- Access via new "FY Archives" page
- See stats, invoices, payments from any archived year

### 4. Data Preservation
- **Never deleted**: Clients, Products, Settings
- **Archived**: Invoices, Payments (by FY)
- **Reset**: Invoice numbering, Dashboard stats

---

## Usage

### Viewing Current FY Data
- Dashboard shows only current FY invoices
- Reports show only current FY data
- Invoice list shows only current FY invoices

### Viewing Archived Data
1. Navigate to **FY Archives** page
2. Select a previous FY from sidebar
3. View:
   - Total invoices for that FY
   - Total revenue for that FY
   - Paid/Unpaid breakdown
   - Full invoice list
4. Export data if needed

### Manual FY Transition (Testing)
```javascript
import { performFYTransition } from './utils/financialYear';

// Manually trigger FY transition
const result = performFYTransition();
console.log(result);
// {
//   success: true,
//   currentFY: "2026-27",
//   archived: 150,  // invoices archived
//   current: 0,     // invoices in new FY
//   archives: ["2025-26", "2024-25"]
// }
```

---

## Implementation Steps

### Step 1: Add FY Utility to App
In `App.jsx`, add FY initialization:

```javascript
import { useEffect } from 'react';
import { initializeFYSystem } from './utils/financialYear';

function App() {
  useEffect(() => {
    // Initialize FY system on app start
    const result = initializeFYSystem();
    console.log('FY System initialized:', result);
  }, []);

  // ... rest of app
}
```

### Step 2: Add FY Archives Route
In `App.jsx`, add route:

```javascript
import FYArchives from './pages/admin/FYArchives';

// In routes:
<Route path="/fy-archives" element={<FYArchives />} />
```

### Step 3: Add Navigation Link
In your sidebar/navigation:

```javascript
<Link to="/fy-archives">
  <Archive className="w-5 h-5" />
  FY Archives
</Link>
```

---

## Testing FY Transition

### Method 1: Change System Date
1. Change your computer date to April 1, 2026
2. Reload the application
3. System will automatically archive 2025-26 data
4. New FY 2026-27 will start

### Method 2: Manual Trigger (Dev Only)
```javascript
// In browser console
import { performFYTransition } from './utils/financialYear';
performFYTransition();
location.reload();
```

---

## Benefits

✅ **Automatic**: No manual intervention needed  
✅ **Safe**: Previous data never deleted, only archived  
✅ **Clean**: Fresh start each FY with reset counters  
✅ **Accessible**: Historical data always available  
✅ **Compliant**: Follows Indian FY standards (April-March)  
✅ **Scalable**: Works for unlimited years  

---

## Important Notes

### Invoice Numbering
- **Current FY**: INV 001/2025-26, INV 002/2025-26...
- **After Transition**: INV 001/2026-27, INV 002/2026-27...
- Old invoices keep their original numbers in archives

### Dashboard Stats
- Shows only current FY data
- Historical stats available in FY Archives page

### Reports
- Default view: Current FY only
- Can add FY selector to view archived FY reports

### Clients & Products
- Serial numbers remain unchanged
- No reset across FYs
- Same clients/products available in all FYs

---

## Future Enhancements

1. **FY Selector in Reports**: View reports for any FY
2. **Year-over-Year Comparison**: Compare FYs side-by-side
3. **Export Archives**: Download archived data as Excel/PDF
4. **FY Summary Report**: Generate annual summary for each FY
5. **Tax Filing Helper**: Prepare data for tax filing

---

## Troubleshooting

### Issue: FY not transitioning
**Solution**: Check `last_checked_fy` in localStorage. Delete it to force re-check.

### Issue: Archived data not showing
**Solution**: Check `fy_archives` in localStorage. Ensure data exists.

### Issue: Invoice numbers not resetting
**Solution**: Check `last_invoice_number` in localStorage. Should be "0" after transition.

---

## Summary

The FY Management System provides:
- ✅ Automatic yearly transitions
- ✅ Complete data archiving
- ✅ Fresh start each FY
- ✅ Historical data access
- ✅ Zero manual work

**Your billing system is now ready for multi-year operation!** 🎉
