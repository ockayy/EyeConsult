import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Heading from "./Heading";
import "./CSS/LoginDoctor.css";

function LoginDoctor() {
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

  // Redirect if already logged in as a doctor
  useEffect(() => {
    const token = localStorage.getItem("mainSiteToken");
    const storedUser = JSON.parse(localStorage.getItem("mainSiteUser"));

    // If a doctor is already logged in, navigate to the doctor's view profile page
    if (token && storedUser?.type === "doctor") {
      navigate("/dashboard/doctor/viewprofile");
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

    // Clear unrelated tokens to ensure only doctor data is stored
    ["adminToken", "adminUser", "patientToken", "patientUser"].forEach((item) =>
      localStorage.removeItem(item)
    );

    setLoading(true);
    try {
      const response = await fetch("https://eyeconsult.onrender.com/api/logindoctor", {
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
          JSON.stringify({ ...data.user, type: "doctor" })
        );
        navigate("/dashboard/doctor/viewprofile");
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
      <div className="doctor-login-container">
        <form onSubmit={handleSubmit} className="doctor-login-form" noValidate>
          <h1>Doctor Login</h1>
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
            className={`doctor-login-input ${fieldErrors.email ? 'input-error' : ''}`}
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
            className={`doctor-login-input ${fieldErrors.password ? 'input-error' : ''}`}
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
            to="/forgot-password?userType=doctor"
            className="forgot-password-link"
          >
            Forgot Password?
          </Link>
          <div className="login-actions">
            <button
              type="submit"
              className="doctor-login-submit-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <Link to="/signup/doctor" className="doctor-signup-button">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginDoctor;
