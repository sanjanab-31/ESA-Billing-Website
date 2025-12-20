# Product Confirmation Implementation Guide

## Overview
Add confirmation dialogs when:
1. User adds a new product (not in the list) in the invoice
2. User clicks "Preview" button
3. User clicks "Save as Draft" button  
4. User clicks "Save Invoice" button

## Implementation Steps

### Step 1: Add State for Pending Actions

In `InvoiceManagementSystem` component, add these states after existing state declarations:

```javascript
const [pendingAction, setPendingAction] = useState(null); // 'preview', 'draft', 'save'
const [pendingProducts, setPendingProducts] = useState([]); // Products to be added
const [showProductConfirmation, setShowProductConfirmation] = useState(false);
const [showActionConfirmation, setShowActionConfirmation] = useState(false);
```

### Step 2: Modify handleAddNewProduct Function

Find the `handleAddNewProduct` function and update it to show confirmation:

```javascript
const handleAddNewProduct = (productName, hsn, price) => {
  // Store the pending product
  setPendingProducts([{ name: productName, hsn, price }]);
  setShowProductConfirmation(true);
};

const confirmAddProduct = async () => {
  if (pendingProducts.length > 0) {
    const product = pendingProducts[0];
    const result = await addProduct({
      name: product.name,
      hsn: product.hsn,
      price: Number.parseFloat(product.price),
    });

    if (result.success) {
      success(`Product "${product.name}" added successfully!`);
      // Add the product to the invoice items
      const newItem = {
        id: Date.now().toString(),
        productId: result.id,
        name: product.name,
        hsn: product.hsn,
        quantity: 1,
        price: Number.parseFloat(product.price),
      };
      setInvoiceData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  }
  setShowProductConfirmation(false);
  setPendingProducts([]);
};
```

### Step 3: Add Confirmation Handlers for Actions

```javascript
const handlePreviewClick = () => {
  setPendingAction('preview');
  setShowActionConfirmation(true);
};

const handleSaveDraftClick = () => {
  setPendingAction('draft');
  setShowActionConfirmation(true);
};

const handleSaveInvoiceClick = () => {
  setPendingAction('save');
  setShowActionConfirmation(true);
};

const confirmAction = () => {
  switch(pendingAction) {
    case 'preview':
      handlePreview(); // Call the actual preview function
      break;
    case 'draft':
      saveDraft(); // Call the actual save draft function
      break;
    case 'save':
      saveInvoice(); // Call the actual save invoice function
      break;
  }
  setShowActionConfirmation(false);
  setPendingAction(null);
};
```

### Step 4: Add Confirmation Modal Components

Add these modal components before the return statement:

```javascript
// Product Confirmation Modal
{showProductConfirmation && pendingProducts.length > 0 && (
  <ConfirmationModal
    isOpen={showProductConfirmation}
    onClose={() => {
      setShowProductConfirmation(false);
      setPendingProducts([]);
    }}
    onConfirm={confirmAddProduct}
    title="Add New Product"
    message={`Do you want to add "${pendingProducts[0].name}" to the products list?`}
    confirmLabel="Add Product"
    cancelLabel="Cancel"
    confirmClass="bg-blue-600 hover:bg-blue-700"
  />
)}

// Action Confirmation Modal
{showActionConfirmation && (
  <ConfirmationModal
    isOpen={showActionConfirmation}
    onClose={() => {
      setShowActionConfirmation(false);
      setPendingAction(null);
    }}
    onConfirm={confirmAction}
    title={
      pendingAction === 'preview' ? 'Preview Invoice' :
      pendingAction === 'draft' ? 'Save as Draft' :
      'Save Invoice'
    }
    message={
      pendingAction === 'preview' ? 'Do you want to preview this invoice?' :
      pendingAction === 'draft' ? 'Do you want to save this invoice as a draft?' :
      'Do you want to save this invoice?'
    }
    confirmLabel={
      pendingAction === 'preview' ? 'Preview' :
      pendingAction === 'draft' ? 'Save Draft' :
      'Save Invoice'
    }
    cancelLabel="Cancel"
    confirmClass="bg-blue-600 hover:bg-blue-700"
  />
)}
```

### Step 5: Update Button Handlers in CreateInvoiceComponent

In the `CreateInvoiceComponent`, update the button onClick handlers:

```javascript
// Preview Button
<button
  onClick={handlePreviewClick} // Changed from handlePreview
  className="..."
>
  Preview
</button>

// Save as Draft Button
<button
  onClick={handleSaveDraftClick} // Changed from saveDraft
  className="..."
>
  Save as Draft
</button>

// Save Invoice Button
<button
  onClick={handleSaveInvoiceClick} // Changed from saveInvoice
  className="..."
>
  Save Invoice
</button>
```

### Step 6: Pass New Handlers as Props

Update the props passed to `CreateInvoiceComponent`:

```javascript
<CreateInvoiceComponent
  // ... existing props
  handlePreviewClick={handlePreviewClick}
  handleSaveDraftClick={handleSaveDraftClick}
  handleSaveInvoiceClick={handleSaveInvoiceClick}
  // ... other props
/>
```

## Testing Checklist

- [ ] Adding a new product shows confirmation dialog
- [ ] Clicking "Preview" shows confirmation dialog
- [ ] Clicking "Save as Draft" shows confirmation dialog
- [ ] Clicking "Save Invoice" shows confirmation dialog
- [ ] Confirming adds the product/performs the action
- [ ] Canceling closes the dialog without action
- [ ] Product is added to the list after confirmation
- [ ] Invoice actions work correctly after confirmation

## Notes

- The `ConfirmationModal` component already exists in the file
- Make sure to import `success` from `useToast` if not already imported
- Test with both existing and new products
- Ensure the confirmation doesn't break existing functionality
