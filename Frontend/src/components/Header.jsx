import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Bars3Icon, XMarkIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Invoices", path: "/invoices" },
  { name: "Clients", path: "/clients" },
  { name: "Products", path: "/products" },
  { name: "Reports", path: "/reports" },
  { name: "Payments", path: "/payments" },
  { name: "Settings", path: "/settings" },
];

export default function Header() {
  const { user, signOut } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium ${isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-white px-4 md:px-6 py-3 shadow-md">
      <div className="flex items-center gap-4 md:gap-20">
        <div className="flex items-center gap-2 md:gap-3">
          <img
            src="https://res.cloudinary.com/dnmvriw3e/image/upload/v1756868204/ESA_uggt8u.png"
            alt="ESA Logo"
            className="h-8 w-8 md:h-10 md:w-10"
          />
          <span className="text-base md:text-lg font-semibold text-gray-700">ESA</span>
        </div>

        <nav className="hidden gap-4 lg:gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={getNavLinkClass}>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
          2025-2026 FY
        </span>

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 md:gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm md:text-lg">
                  {user.displayName
                    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                    : user.email?.charAt(0).toUpperCase() || 'U'}
                </div>

              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white shadow-xl z-50 overflow-hidden border border-gray-100">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-base md:text-lg">
                      {user.displayName
                        ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                        : user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-3 text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Your Profile</span>
                </NavLink>

                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-3 text-sm transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  <span>Settings</span>
                </NavLink>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden border-t border-gray-100" id="mobile-menu">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}