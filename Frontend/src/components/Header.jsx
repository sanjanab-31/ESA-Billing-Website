import { useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseClient";
// IMPROVEMENT: Import icons for the mobile menu
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

// IMPROVEMENT: Moved navItems array outside the component
// This prevents it from being recreated on every render.
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
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // IMPROVEMENT: State for mobile navigation
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Effect to handle clicks outside the user dropdown
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
  
  // IMPROVEMENT: Effect to close modals on 'Escape' key press for accessibility
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
      await signOut(auth);
      setIsDropdownOpen(false); // Close dropdown on logout
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  
  // A helper function to generate NavLink styles
  const getNavLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:text-blue-600"
    }`;

  return (
    // FIX: Added 'fixed top-0 left-0 z-50' to make the header sticky
    <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-white px-6 py-3 shadow-md">
      {/* Left: Logo + Desktop Nav */}
      <div className="flex items-center gap-8 md:gap-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/dnmvriw3e/image/upload/v1756868204/ESA_uggt8u.png"
            alt="ESA Logo"
            className="h-10 w-10"
          />
          <span className="text-lg font-semibold text-gray-700">ESA</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={getNavLinkClass}>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right: User Profile & Mobile Menu Button */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
              // ACCESSIBILITY: Add ARIA attributes for screen readers
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                {user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="hidden text-right lg:block">
                <p className="text-sm font-medium text-gray-700">
                  {user.displayName || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-20">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? "bg-blue-50 text-blue-600" : "text-gray-700"
                    } hover:bg-gray-100`
                  }
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Your Profile
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* IMPROVEMENT: Hamburger Menu Button */}
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
      
      {/* IMPROVEMENT: Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md md:hidden" id="mobile-menu">
          <nav className="flex flex-col gap-1 px-2 pt-2 pb-3">
             {navItems.map((item) => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={getNavLinkClass}
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on navigation
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