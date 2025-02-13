// src/components/ForgotPassword.jsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Heading from "./Heading";
import "./CSS/ForgotPassword.css";

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const userTypeParam = queryParams.get("userType");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState(userTypeParam || "patient"); // Default to 'patient'
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setErrors([{ message: "Email is required" }]);
      return;
    }

    try {
      const response = await fetch("/api/request-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userType }),
      });

      if (response.ok) {
        setErrors([]);
        setSuccessMessage("Password reset email sent successfully.");
      } else {
        const errorData = await response.json();
        setErrors([{ message: errorData.message }]);
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error during password reset request:", error);
      setErrors([{ message: "Network or server error" }]);
      setSuccessMessage("");
    }
  };

  return (
    <>
      <Heading />
      <div className="forgot-password-container">
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <h2>Forgot Password</h2>
          {errors.length > 0 && (
            <ul className="form__error">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          )}
          {successMessage && <p className="form__success">{successMessage}</p>}
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            className="forgot-password-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="userType">User Type:</label>
          <select
            id="userType"
            className="forgot-password-select"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>

          <button type="submit" className="forgot-password-submit-button">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default ForgotPassword;
