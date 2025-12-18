import React, { useContext } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import SignIn from "./pages/auth/SignIn";
import Dashboard from "./pages/dashboard/Dashboard";
import Invoices from "./pages/invoices/InvoiceManagement";
import InvoiceForm from "./pages/invoices/InvoiceForm";
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
import DataSeeder from "./pages/admin/DataSeeder";
import ClearAndReseed from "./pages/admin/ClearAndReseed";
import PropTypes from 'prop-types';

function ProtectedLayout() {
  const { user, authInitialized } = useContext(AuthContext);

  if (!authInitialized) {
    return null;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <>
      <InactivityDetector />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "invoices", element: <Invoices /> },
      { path: "invoices/new", element: <InvoiceForm /> },
      { path: "invoices/edit/:id", element: <InvoiceForm /> },
      { path: "clients", element: <Clients /> },
      { path: "products", element: <Products /> },
      { path: "reports", element: <Report /> },
      { path: "payments", element: <Payments /> },
      { path: "settings", element: <Settings /> },
      { path: "seed-data", element: <DataSeeder /> },
      { path: "clear-and-reseed", element: <ClearAndReseed /> },
      { path: "*", element: <Navigate to="/dashboard" replace /> }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});

export default function App() {
  return (
    <ToastProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
      <ToastContainer />
    </ToastProvider>
  );
}