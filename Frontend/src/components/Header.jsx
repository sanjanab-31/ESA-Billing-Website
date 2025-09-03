import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { auth } from "../firebase/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="flex justify-between items-center bg-white px-6 py-3 shadow-md w-full">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dnmvriw3e/image/upload/v1756868204/ESA_uggt8u.png"
            alt="ESA Logo"
            className="h-10 w-10"
          />
          <span className="text-lg font-semibold text-gray-700">ESA</span>
        </div>

        {/* Navigation */}
        <nav className="flex gap-6">
          {[
            { name: "Dashboard", path: "/dashboard" },
            { name: "Invoices", path: "/invoices" },
            { name: "Clients", path: "/clients" },
            { name: "Products", path: "/products" },
            { name: "Reports", path: "/reports" },
            { name: "Payments", path: "/payments" },
            { name: "Settings", path: "/settings" },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:text-blue-600"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right: User Profile */}
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
            {user.displayName
              ? user.displayName.charAt(0).toUpperCase()
              : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {user.displayName || "Admin User"}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )}
    </header>
  );
}
