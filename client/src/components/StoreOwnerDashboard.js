// src/components/StoreOwnerDashboard.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/StoreOwnerDashboard.css"; // Create corresponding CSS
import Heading from "./Heading";

function StoreOwnerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("storeToken");
  const storeUser = JSON.parse(localStorage.getItem("storeUser"));

  const handleLogout = () => {
    localStorage.removeItem("storeToken");
    localStorage.removeItem("storeUser");
    navigate("/store/login");
  };

  return (
    <div>
      <Heading />
      <div className="store-owner-dashboard-container">
        <h2>Store Owner Dashboard</h2>
        <div className="dashboard-options">
          <Link to="/store/owners/medicines" className="dashboard-link">
            Manage Medicines
          </Link>
          <Link to="/store/owners/orders" className="dashboard-link">
            View Orders
          </Link>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default StoreOwnerDashboard;
