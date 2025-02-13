// src/components/LoginStoreUser.jsx

import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Heading from "./Heading";
import "./CSS/StoreLogin.css"; // Import the CSS file

function LoginStoreUser() {
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
    // Clear main site tokens when logging into the store
    localStorage.removeItem("mainSiteToken");
    localStorage.removeItem("mainSiteUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    axios
      .post("/api/store/login", formData)
      .then((response) => {
        localStorage.setItem("storeToken", response.data.token);
        localStorage.setItem("storeUser", JSON.stringify(response.data.user));
        navigate("/store");
      })
      .catch((error) => {
        setErrors([error.response?.data?.error || "Login failed."]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="store-user-login-container">
        <form
          className="store-user-login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <h1>Store User Login</h1>
          {errors.length > 0 && (
            <ul role="alert" aria-live="assertive" className="error-list">
              {errors.map((error, index) => (
                <li key={index} className="error-message">
                  {error}
                </li>
              ))}
            </ul>
          )}

          <label className="login-form__label" htmlFor="email">
            Email:
          </label>
          <input
            className="login-form__input"
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />

          <label className="login-form__label" htmlFor="password">
            Password:
          </label>
          <input
            className="login-form__input"
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />

          <div className="login-actions">
            <button
              type="submit"
              className="login-form__submit-button"
              disabled={false} // You can manage disabled state similarly to other forms if needed
            >
              Login
            </button>
            <Link to="/store/signup" className="signup-button">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginStoreUser;
