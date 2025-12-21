import React from "react";
import InvoiceManagement from "./InvoiceManagement";

// This page will render only the CreateInvoiceComponent in create mode
export default function CreateInvoicePage() {
  // We use InvoiceManagement with a prop or state to show only the create invoice UI
  // For now, we can just render InvoiceManagement with a query param or similar
  // But for a clean separation, you may want to refactor CreateInvoiceComponent out
  // For now, we will just render InvoiceManagement and let it handle the route
  return <InvoiceManagement createMode={true} />;
}
