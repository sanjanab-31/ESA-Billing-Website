import { useEffect, useState, useRef } from "react"; // 1. Import useRef
import { NavLink, useNavigate } from "react-router-dom"; // 2. Import useNavigate
import { auth } from "../firebase/firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth"; // 3. Import signOut

export default function Header() {
  const [user, setUser] = useState(null);
  // 4. State to manage dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Ref to detect clicks outside the dropdown

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 5. Effect to close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  // 6. Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false); // Close dropdown on logout
      navigate("/login"); // Optional: Redirect user to login page
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

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

      {/* Right: User Profile with Dropdown */}
      {user && (
        // 7. Added relative positioning and the ref to the container
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)} // Toggle dropdown
            className="flex items-center gap-4 focus:outline-none"
          >
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
          </button>

          {/* 8. The Dropdown Menu */}
          {isDropdownOpen && (
  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
    <NavLink
      to="/settings" // Changed from "/profile" to "/settings"
      className={({ isActive }) => // Added active styling for consistency
        `block px-4 py-2 text-sm ${
          isActive ? "bg-blue-50 text-blue-600" : "text-gray-700"
        } hover:bg-gray-100`
      }
      onClick={() => setIsDropdownOpen(false)} // Close on click
    >
      Your Profile
    </NavLink>
    <button
      onClick={handleLogout}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      Logout
    </button>
  </div>
)}
        </div>
      )}
    </header>
  );
}