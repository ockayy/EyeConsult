// src/components/Unauthorized.jsx

import React from "react";
import { Link } from "react-router-dom";
import "./CSS/Unauthorized.css"; // Create and style as needed

function Unauthorized() {
  return (
    <div className="unauthorized-container">
      <h2>Unauthorized Access</h2>
      <p>You do not have permission to view this page.</p>
      <Link to="/admin/login">Go to Admin Login</Link>
    </div>
  );
}

export default Unauthorized;
