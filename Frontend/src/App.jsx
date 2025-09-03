// frontend/src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/auth/SiginIn";
import Dashboard from "./pages/dashboard/Dashboard";
import { AuthContext } from "./context/AuthContext";
import ClientManagement from "./pages/clients/ClientManagement";
import { TrendingUp, AlertCircle, MapPin, Phone, Mail, Trash2 } from "lucide-react";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-8">Loading...</div>;
  return user ? children : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/clients" element={
          <ProtectedRoute>
            <ClientManagement />
          </ProtectedRoute>
        } />
        {/* Add other routes */}
      </Routes>
    </Router>
  );
}
