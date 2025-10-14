import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/auth/SignIn";
import Dashboard from "./pages/dashboard/Dashboard";
import Invoices from "./pages/invoices/InvoiceManagement";
import Products from "./pages/products/ProductsList";
import Payments from "./pages/payments/Payment";
import Header from "./components/Header";
import { AuthContext } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/Toast";
import Clients from "./pages/clients/ClientManagement";
import Report from "./pages/reports/RevenueLineChart";
import Settings from "./pages/settings/SettingsPage";
import InactivityDetector from "./components/InactivityDetector";


function ProtectedRoute({ children }) {
  const { user, authInitialized } = useContext(AuthContext);

  // Wait for Firebase to initialize authentication before making decisions
  if (!authInitialized) {
    return null; // Don't show anything while Firebase initializes
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // ✅ 2. RENDER THE DETECTOR ALONGSIDE YOUR PROTECTED CONTENT
  return (
    <>
      <InactivityDetector />
      {children}
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/signin" element={<SignIn />} />

          {/* Protected with header */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-1 p-6">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/reports" element={<Report />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer />
      </Router>
    </ToastProvider>
  );
}