// src/components/LoginStoreOwner.jsx

import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Heading from "./Heading";
import "./CSS/LoginStoreOwner.css"; // Import the CSS file
import "./CSS/base.css"; // Ensure base styles are imported if used

function LoginStoreOwner() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clear other site tokens when logging into the store as Store Owner
    localStorage.removeItem("mainSiteToken");
    localStorage.removeItem("mainSiteUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    axios
      .post("/api/store/owners/login", formData) // Updated endpoint
      .then((response) => {
        // Check if the logged-in user is a Store Owner
        if (response.data.user.type !== "store_owner") {
          setErrors(["Access denied: Not a Store Owner"]);
          return;
        }
        localStorage.setItem("storeOwnerToken", response.data.token); // Updated storage key
        localStorage.setItem(
          "storeOwnerUser",
          JSON.stringify(response.data.user)
        ); // Updated storage key
        navigate("/store/owners/dashboard");
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
      <div className="login-store-owner-container">
        <form
          className="login-store-owner-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="login-store-owner-form__title">Store Owner Login</h2>
          {errors.length > 0 && (
            <ul
              role="alert"
              aria-live="assertive"
              className="login-store-owner-form__error"
            >
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}

          <label className="login-store-owner-form__label" htmlFor="email">
            Email:
          </label>
          <input
            className="login-store-owner-form__input"
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <label className="login-store-owner-form__label" htmlFor="password">
            Password:
          </label>
          <input
            className="login-store-owner-form__input"
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <div className="login-store-owner-actions">
            <button
              type="submit"
              className="login-store-owner-form__submit-button"
              disabled={false} // You can manage disabled state similarly to other forms if needed
            >
              Login
            </button>
            <Link to="/store/owners/signup" className="signup-button">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginStoreOwner;
