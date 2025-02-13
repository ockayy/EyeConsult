// src/components/Login.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/Login.css";
import "./CSS/base.css";
import Heading from "./Heading";
import PropTypes from "prop-types";

function Login({ userType }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Define routes and API endpoint based on userType
  const dashboardRoute = `/dashboard/${userType}`;
  const signupRoute = `/signup/${userType}`;
  const forgotPasswordQuery = `userType=${userType}`;
  const apiEndpoint =
    userType === "patient" ? "/api/loginpatient" : "/api/logindoctor";

  // Redirect authenticated users based on userType
  useEffect(() => {
    const token = localStorage.getItem("mainSiteToken");
    const storedUser = JSON.parse(localStorage.getItem("mainSiteUser"));

    if (token && storedUser?.type === userType) {
      navigate(dashboardRoute);
    }
  }, [navigate, dashboardRoute, userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Clear any unrelated tokens
    ["adminToken", "adminUser", "storeToken", "storeUser"].forEach((item) =>
      localStorage.removeItem(item)
    );

    const formData = new FormData(e.target);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    setLoading(true);
    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        const data = await response.json();
        // Store token and user data under unique keys for main site
        localStorage.setItem("mainSiteToken", data.token);
        localStorage.setItem(
          "mainSiteUser",
          JSON.stringify({ ...data.user, type: userType })
        );
        navigate(dashboardRoute);
      } else {
        const errorData = await response.json();
        setErrors([{ message: errorData.error || "Invalid credentials." }]);
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrors([{ message: "Network or server error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Heading />
      <div className="login-container">
        <div className="login-form-wrapper">
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <h1 className="login-form__title">LOGIN</h1>
            {errors.length > 0 && (
              <ul role="alert" aria-live="assertive" className="error-messages">
                {errors.map((error, index) => (
                  <li key={index} className="error-message">
                    {error.message}
                  </li>
                ))}
              </ul>
            )}
            <label htmlFor="email" className="login-form__label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="login-form__input"
              name="email"
              required
            />
            <label htmlFor="password" className="login-form__label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="login-form__input"
              name="password"
              required
            />
            <Link
              to={`/forgot-password?${forgotPasswordQuery}`}
              className="forgot-password-link"
            >
              Forgot Password?
            </Link>
            <div className="login-actions">
              <button
                type="submit"
                className="login-form__submit-button"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <Link to={signupRoute} className="signup-button">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  userType: PropTypes.oneOf(["patient", "doctor"]).isRequired,
};

export default Login;
