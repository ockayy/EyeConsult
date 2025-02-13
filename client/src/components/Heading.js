// src/components/Heading.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaBars, FaSearch } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import "./CSS/Heading.css";
import logo from "./Images/Landing page logo.svg";

function Heading() {
  // Main site user (patient or doctor)
  const [user, setUser] = useState(null);
  // Store user roles
  const [storeUser, setStoreUser] = useState(null);
  const [storeOwnerUser, setStoreOwnerUser] = useState(null);
  // Admin user
  const [adminUser, setAdminUser] = useState(null);

  // Cart count for store
  const [cartItemCount, setCartItemCount] = useState(0);

  // Logout overlay state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Mobile nav open/close
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // -------------------- Load from localStorage on mount --------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("mainSiteUser");
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedStoreUser = localStorage.getItem("storeUser");
    if (storedStoreUser) setStoreUser(JSON.parse(storedStoreUser));

    const storedStoreOwnerUser = localStorage.getItem("storeOwnerUser");
    if (storedStoreOwnerUser)
      setStoreOwnerUser(JSON.parse(storedStoreOwnerUser));

    const storedAdminUser = localStorage.getItem("adminUser");
    if (storedAdminUser) setAdminUser(JSON.parse(storedAdminUser));
  }, []);

  // -------------------- Logout Handlers --------------------
  const handleLogout = () => {
    // Show overlay "Logging out..." for 0.8s
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("mainSiteToken");
      localStorage.removeItem("mainSiteUser");
      setUser(null);
      navigate("/");
      setIsLoggingOut(false);
    }, 800);
  };

  const handleStoreLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("storeToken");
      localStorage.removeItem("storeUser");
      localStorage.removeItem("storeOwnerToken");
      localStorage.removeItem("storeOwnerUser");
      setStoreUser(null);
      setStoreOwnerUser(null);
      navigate("/store");
      setIsLoggingOut(false);
    }, 800);
  };

  const handleAdminLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      setAdminUser(null);
      navigate("/admin/login");
      setIsLoggingOut(false);
    }, 800);
  };

  // -------------------- Is this a store-related page? --------------------
  const isStorePage =
    location.pathname.startsWith("/store") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/store/owners");

  // If we're on a store page, update the cart count
  useEffect(() => {
    if (isStorePage) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(itemCount);
    }
  }, [isStorePage, location]);

  // -------------------- Mobile Nav Toggle --------------------
  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  // -------------------- Search Handler --------------------
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      // Navigate to the search results page with the query as a URL parameter
      navigate(`/store/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      // Optionally, close the mobile nav if it's open
      if (isNavOpen) setIsNavOpen(false);
    }
  };

  // -------------------- Render the nav links --------------------
  const renderNavLinks = () => {
    // If on a store page
    if (isStorePage) {
      return (
        <>
          <Link to="/store">Store Home</Link>
          {storeUser && <Link to="/store/orders">My Orders</Link>}
          {storeOwnerUser && (
            <Link to="/store/owners/dashboard">Owner Dashboard</Link>
          )}
          {adminUser && <Link to="/admin/dashboard">Admin Dashboard</Link>}
        </>
      );
    }

    // If user is a doctor, hide "Store"
    if (user?.type === "doctor") {
      return (
        <>
          <Link to="/dashboard/doctor/viewprofile">View Profile</Link>
          <Link to="/dashboard/doctor/viewappointment">Appointments</Link>
          <Link to="/eyeexercise">Exercises</Link>
          <Link to="/blogs">Blogs</Link>
          {/* No "Store" link for doctors */}
        </>
      );
    }

    // If user is a patient, hide "Store"
    if (user?.type === "patient") {
      return (
        <>
          <Link to="/doctors">Doctors</Link>
          <Link to="/scan-reader">Scan Reader</Link>
          <Link to="/eyeexercise">Exercises</Link>
          <Link to="/blogs">Blogs</Link>
          <Link to="/about">About Us</Link>
          {/* No "Store" link for patients */}
        </>
      );
    }

    // Otherwise (public, store roles from non-store page, etc.), show "Home" and "Store"
    return (
      <>
        <Link to="/doctors">Doctors</Link>
        <Link to="/scan-reader">Scan Reader</Link>
        <Link to="/eyeexercise">Exercises</Link>
        <Link to="/blogs">Blogs</Link>
        <Link to="/about">About Us</Link>
        <Link to="/store">Store</Link>
      </>
    );
  };

  // -------------------- Determine if Search Bar Should be Shown --------------------
  // Desktop search bar
  const shouldShowDesktopSearchBar =
    isStorePage && ((!storeUser && !storeOwnerUser && !adminUser) || storeUser);

  // Mobile search bar is always rendered inside the mobile nav if isStorePage
  const shouldShowMobileSearchBar =
    isStorePage && ((!storeUser && !storeOwnerUser && !adminUser) || storeUser);

  // -------------------- Determine User Display --------------------
  // On mobile, only show user's name
  const isMobile = window.innerWidth <= 768;

  return (
    <header className="header">
      <div className="header-top">
        {/* Left: Mobile Hamburger Toggle (visible only on mobile) */}
        <button
          className="mobile-nav-toggle"
          onClick={toggleNav}
          aria-label="Toggle navigation"
        >
          <FaBars />
        </button>

        {/* Center: Logo and Home Link */}
        <div className="header-logo-container">
          <Link to="/">
            <img src={logo} alt="Company Logo" className="header-logo" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="header-nav-links desktop-nav-links">
          {renderNavLinks()}
        </div>

        {/* Conditional Search Bar for Desktop */}
        {shouldShowDesktopSearchBar && (
          <form className="header-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="header-search-input"
              placeholder="Search in Store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search in Store"
            />
            <button
              type="submit"
              className="header-search-button"
              aria-label="Search"
            >
              <FaSearch />
            </button>
          </form>
        )}

        {/* Right: Actions (Dropdown, Cart) */}
        <div className="header-actions">
          {/* The main user dropdown */}
          {isStorePage ? (
            /* Store Page User Dropdown */
            storeUser || storeOwnerUser || adminUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="primary"
                  id="store-dropdown-basic"
                  className="dropdown-toggle"
                >
                  {storeUser
                    ? `${storeUser.fname} ${storeUser.lname}`
                    : storeOwnerUser
                    ? `${storeOwnerUser.fname} ${storeOwnerUser.lname}`
                    : adminUser
                    ? `${adminUser.username}`
                    : "User"}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {storeUser && (
                    <>
                      <Dropdown.Item as={Link} to="/store/orders">
                        My Orders
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleStoreLogout}>
                        Log Out
                      </Dropdown.Item>
                    </>
                  )}
                  {storeOwnerUser && (
                    <>
                      <Dropdown.Item as={Link} to="/store/owners/dashboard">
                        Owner Dashboard
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleStoreLogout}>
                        Log Out
                      </Dropdown.Item>
                    </>
                  )}
                  {adminUser && (
                    <>
                      <Dropdown.Item as={Link} to="/admin/dashboard">
                        Dashboard
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleAdminLogout}>
                        Log Out
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              // Not logged in on store page
              <div className="store-auth-buttons">
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="primary"
                    id="login-dropdown-basic"
                    className="dropdown-toggle"
                  >
                    Login
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/store/login">
                      User Login
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/store/owners/login">
                      Seller Login
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )
          ) : (
            /* Non-Store Page User Dropdown */
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-basic"
                className="dropdown-toggle"
              >
                {user
                  ? user.type === "doctor"
                    ? `${user.name || "Doctor"}`
                    : `${user.fname || ""} ${user.lname || ""}`
                  : storeUser
                  ? `${storeUser.fname} ${storeUser.lname}`
                  : storeOwnerUser
                  ? `${storeOwnerUser.fname} ${storeOwnerUser.lname}`
                  : adminUser
                  ? `${adminUser.username}`
                  : "Login"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {user ? (
                  // If mainSiteUser is set (doctor or patient)
                  user.type === "doctor" ? (
                    <>
                      <Dropdown.Item
                        as={Link}
                        to="/dashboard/doctor/viewprofile"
                      >
                        View Profile
                      </Dropdown.Item>
                      <Dropdown.Item
                        as={Link}
                        to="/dashboard/doctor/viewappointment"
                      >
                        Appointments
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout}>
                        Log Out
                      </Dropdown.Item>
                    </>
                  ) : (
                    // Else assume patient
                    <>
                      <Dropdown.Item
                        as={Link}
                        to="/dashboard/patient/viewprofile"
                      >
                        View Profile
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout}>
                        Log Out
                      </Dropdown.Item>
                    </>
                  )
                ) : storeUser || storeOwnerUser ? (
                  <>
                    {storeUser && (
                      <Dropdown.Item as={Link} to="/store/orders">
                        My Orders
                      </Dropdown.Item>
                    )}
                    {storeOwnerUser && (
                      <Dropdown.Item as={Link} to="/store/owners/dashboard">
                        Owner Dashboard
                      </Dropdown.Item>
                    )}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleStoreLogout}>
                      Log Out
                    </Dropdown.Item>
                  </>
                ) : adminUser ? (
                  <>
                    <Dropdown.Item as={Link} to="/admin/dashboard">
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleAdminLogout}>
                      Log Out
                    </Dropdown.Item>
                  </>
                ) : (
                  // Finally, if no one is logged in on non-store page
                  <>
                    <Dropdown.Item as={Link} to="/login/patient">
                      Patient Login
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/login/doctor">
                      Doctor Login
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          )}

          {/* Desktop Cart Icon */}
          {!isMobile && isStorePage && (
            <div className="cart-icon-container desktop-cart">
              <Link to="/store/cart" className="cart-link">
                <FaShoppingCart className="cart-icon" />
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu for Mobile */}
      <nav className={`header-nav ${isNavOpen ? "open" : ""}`}>
        <div className="header-nav-links mobile-nav-links">
          {renderNavLinks()}

          {/* Mobile Cart Link */}
          {isStorePage && (
            <div className="cart-text-container mobile-cart">
              <Link to="/store/cart" className="cart-link">
                Cart
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
              </Link>
            </div>
          )}

          {/* Conditional Search Bar in Mobile Nav */}
          {shouldShowMobileSearchBar && (
            <form
              className="mobile-header-search-form"
              onSubmit={handleSearchSubmit}
            >
              <input
                type="text"
                className="mobile-header-search-input"
                placeholder="Search in Store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search in Store"
              />
              <button
                type="submit"
                className="mobile-header-search-button"
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </form>
          )}
        </div>
      </nav>

      {/* If logging out, show an animated overlay */}
      {isLoggingOut && (
        <div className="logout-overlay">
          <div className="spinner"></div>
          <p>Logging out...</p>
        </div>
      )}
    </header>
  );
}

export default Heading;
