// DoctorHeading.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/DoctorHeading.css"; // Import the new CSS file
import logo from "./Images/Landing page logo.svg";

function DoctorHeading({ user, onLogout }) {
  const navigate = useNavigate();
  const [isContact, setIsContact] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleContactToggle = () => {
    setIsContact(!isContact);
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("mainSiteToken");
    localStorage.removeItem("mainSiteUser");
    if (onLogout) onLogout();
    navigate("/login/doctor");
  };

  return (
    <header className="doctor-header">
      {/* TOP BAR */}
      <div className="doctor-header-top">
        {/* Doctor Dropdown on left */}
        <div className="doctor-dropdown">
          <button className="dropdown-toggle" onClick={handleDropdownToggle}>
            {user ? `Dr. ${user.name}` : "Loading..."}
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/dashboard/doctor/viewprofile" className="dropdown-item">
                View Profile
              </Link>
              <button className="dropdown-item" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          )}
        </div>

        {/* Logo in center */}
        <div className="doctor-header-logo-container">
          <img src={logo} alt="Logo" className="doctor-header-logo" />
        </div>

        {/* Contact button on the right */}
        <button className="header-button header-button-right" onClick={handleContactToggle}>
          {isContact ? "Contact Us" : "0900-78601"}
        </button>
      </div>

      {/* BOTTOM NAV BAR */}
      <div className="doctor-header-bottom">
        <nav className="doctor-header-nav">
          <Link to="/dashboard/doctor/viewprofile">View Profile</Link>
          <Link to="/dashboard/doctor/viewappointment">Appointments</Link>
          <Link to="/dashboard/doctor/exercises">Exercises</Link>
          <Link to="/dashboard/doctor/blogs">Blogs</Link>
          <Link to="/">Store</Link>
        </nav>
      </div>
    </header>
  );
}

export default DoctorHeading;
