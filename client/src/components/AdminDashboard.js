// src/components/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/AdminDashboard.css"; // Import the CSS file
import Heading from "./Heading";
import axios from "axios";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const userString = localStorage.getItem("adminUser");

  useEffect(() => {
    console.log("AdminDashboard Mounted");

    if (!token || !userString) {
      console.warn("No token or user info found. Redirecting to login.");
      navigate("/admin/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(userString);
      console.log("Parsed User:", user); // Debugging log
    } catch (error) {
      console.error("Failed to parse user info:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin/login");
      return;
    }

    // Check user type and site
    if (user.type !== "admin" || user.site !== "store") {
      console.error("Access denied: invalid user type or site");
      navigate("/unauthorized");
      return;
    }

    // Fetch admin stats
    axios
      .get("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Fetched Stats:", response.data); // Debugging log
        setStats(response.data);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
        if (error.response && error.response.status === 401) {
          // Unauthorized, possibly token expired
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          navigate("/admin/login");
        }
      });
  }, [token, userString, navigate]);

  return (
    <div>
      <Heading />
      <div className="admin-dashboard-container">
        <h2>Admin Dashboard</h2>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Total Medicines</h3>
            <p>{stats.totalMedicines}</p>
            <Link to="/admin/medicines">Manage Medicines</Link>
          </div>
          <div className="dashboard-card">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
            <Link to="/admin/orders">View Orders</Link>
          </div>
          <div className="dashboard-card">
            <h3>Pending Orders</h3>
            <p>{stats.pendingOrders}</p>
            <Link to="/admin/orders">View Orders</Link>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            navigate("/admin/login");
          }}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;
