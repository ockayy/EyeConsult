// src/components/AdminLogin.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Heading from "./Heading";
import "./CSS/AdminLogin.css"; // Import the CSS file

function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clear main site tokens when logging into the store
    localStorage.removeItem("mainSiteToken");
    localStorage.removeItem("mainSiteUser");
    localStorage.removeItem("storeToken");
    localStorage.removeItem("storeUser");

    axios
      .post("/api/admin/login", formData)
      .then((response) => {
        console.log("Login Response:", response.data); // Debugging log
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminUser", JSON.stringify(response.data.user));
        navigate("/admin/dashboard");
      })
      .catch((error) => {
        console.error(
          "Login Error:",
          error.response?.data?.error || error.message
        );
        setErrors([error.response?.data?.error || "Login failed."]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="admin-login-container">
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <h2 className="admin-login-form__title">Admin Login</h2>
          {errors.length > 0 && (
            <p className="admin-login-form__error">{errors[0]}</p>
          )}

          <label className="admin-login-form__label" htmlFor="username">
            Username:
          </label>
          <input
            className="admin-login-form__input"
            type="text"
            id="username"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
          />

          <label className="admin-login-form__label" htmlFor="password">
            Password:
          </label>
          <input
            className="admin-login-form__input"
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit" className="admin-login-form__submit-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
