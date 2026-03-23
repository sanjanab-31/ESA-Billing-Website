import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCompanyProfile } from "../context/CompanyProfileContext";
import { Bars3Icon, XMarkIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightStartOnRectangleIcon, PhoneIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Invoices", path: "/invoices" },
  { name: "Clients", path: "/clients" },
  { name: "Products", path: "/products" },
  { name: "Reports", path: "/reports" },
  { name: "Payments", path: "/payments" },
  { name: "Settings", path: "/settings" },
];

function getFYLabel() {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-${year + 1} FY`;
}

export default function Header() {
  const { user, signOut } = useContext(AuthContext);
  const { companyProfile } = useCompanyProfile();
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const displayName = companyProfile?.ownerName || user?.displayName || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
  const headerLogo = companyProfile?.logoURL || "/Icon@4x-8.png";
  const headerCompanyName = companyProfile?.companyName || "Techno Vanam";

  return (
    <>
      {/* Header bar — full width, edge to edge */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* ── Left: Logo + Nav ─────────────────────────────── */}
            <div className="flex items-center gap-6 lg:gap-10">
              {/* Logo + Company name from profile */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <img
                  src={headerLogo}
                  alt={`${headerCompanyName} Logo`}
                  className="h-8 md:h-9 w-8 md:w-9 object-contain rounded"
                />
                <div className="hidden sm:block leading-tight">
                  <span className="block text-base md:text-lg font-bold text-gray-900 truncate max-w-[140px] md:max-w-[200px]">{headerCompanyName}</span>
                  <span className="block text-[10px] font-semibold text-blue-600 uppercase tracking-widest -mt-0.5">Billing</span>
                </div>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* ── Right: FY Badge + User + Hamburger ──────────── */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* FY Badge */}
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                {getFYLabel()}
              </span>

              {/* User avatar + dropdown */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                  >
                    <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-xs md:text-sm">
                      {initials}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl z-50 overflow-hidden border border-gray-100">
                      {/* Company + User info */}
                      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
                        {companyProfile?.companyName && (
                          <div className="flex items-center gap-2">
                            <BuildingOffice2Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <p className="text-sm font-semibold text-gray-900 truncate">{companyProfile.companyName}</p>
                          </div>
                        )}
                        {companyProfile?.phone && (
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-600 truncate">{companyProfile.phone}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3 pt-1">
                          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                            isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <UserCircleIcon className="h-4 w-4" />
                        <span>Your Profile</span>
                      </NavLink>

                      <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                            isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                        <span>Settings</span>
                      </NavLink>

                      <div className="border-t border-gray-100" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-lg" id="mobile-menu">
            <nav className="flex flex-col gap-0.5 px-3 py-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
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

      {/* Spacer — push page content below the fixed header */}
      <div className="h-14 md:h-16" />
    </>
  );
}
