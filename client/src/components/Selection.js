import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import "./CSS/Selection.css";
import Heading from "./Heading";

function Selection() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role");

  // Define allowed roles
  const allowedRoles = ["patient", "doctor"];

  // Handle cases where role is not allowed or missing
  React.useEffect(() => {
    if (!allowedRoles.includes(role)) {
      // Redirect to home or show an unauthorized message
      navigate("/unauthorized", { replace: true });
    }
  }, [role, navigate]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div>
      <Heading /> {/* Header remains unchanged */}
      <div className="selection-container">
        <button
          className="selection-button"
          onClick={() => handleNavigation(`/login/${role}`)}
        >
          <FaSignInAlt className="icon" />
          Login
        </button>
        <span className="selection-or">or</span>
        <button
          className="selection-button"
          onClick={() => handleNavigation(`/signup/${role}`)}
        >
          <FaUserPlus className="icon" />
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Selection;
