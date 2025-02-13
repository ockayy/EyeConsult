import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Heading from "./Heading";

import "./CSS/LoginPatient.css";

function LoginPatient() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("mainSiteToken");
    const storedUser = JSON.parse(localStorage.getItem("mainSiteUser"));

    if (token && storedUser?.type === "patient") {
      navigate("/patient/viewprofile");
    }
  }, [navigate]);

  const validateField = (name, value) => {
    const emailRegex = /^[^\s@]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
    
    switch (name) {
      case "email":
        return !emailRegex.test(value) ? "Please enter a valid email address" : "";
      case "password":
        return value.length < 8 ? "Password must be at least 8 characters" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setErrors([{ message: "Please fix all errors before submitting." }]);
      return;
    }

    // Clear any unrelated tokens
    ["adminToken", "adminUser", "doctorToken", "doctorUser"].forEach((item) =>
      localStorage.removeItem(item)
    );

    setLoading(true);
    try {
      const response = await fetch("/api/loginpatient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("mainSiteToken", data.token);
        localStorage.setItem(
          "mainSiteUser",
          JSON.stringify({ ...data.user, type: "patient" })
        );
        navigate("/patient/viewprofile");
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
      <div className="patient-login-container">
        <form onSubmit={handleSubmit} className="patient-login-form" noValidate>
          <h1>Patient Login</h1>
          {errors.length > 0 && (
            <ul role="alert" aria-live="assertive" className="error-list">
              {errors.map((error, index) => (
                <li key={index} className="error-message">
                  {error.message}
                </li>
              ))}
            </ul>
          )}
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className={`patient-login-input ${fieldErrors.email ? 'input-error' : ''}`}
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {fieldErrors.email && (
            <span className="field-error">{fieldErrors.email}</span>
          )}
          
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className={`patient-login-input ${fieldErrors.password ? 'input-error' : ''}`}
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {fieldErrors.password && (
            <span className="field-error">{fieldErrors.password}</span>
          )}
          
          <Link
            to="/forgot-password?userType=patient"
            className="forgot-password-link"
          >
            Forgot Password?
          </Link>
          <div className="login-actions">
            <button
              type="submit"
              className="patient-login-submit-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <Link to="/signup/patient" className="patient-signup-button">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPatient;