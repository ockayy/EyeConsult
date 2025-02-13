// src/components/ResetPassword.jsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Heading from "./Heading";
import "./CSS/ResetPassword.css";

function ResetPassword() {
  const { token, userType } = useParams(); // Extract token and userType from URL params
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend Password Confirmation
    if (newPassword !== confirmPassword) {
      setErrors([{ message: "Passwords do not match" }]);
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword, userType }),
      });

      if (response.ok) {
        setErrors([]);
        setSuccessMessage("Password reset successfully!");
        setTimeout(() => {
          navigate("/auth"); // Redirect to AuthPage
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrors([{ message: errorData.message }]);
        setSuccessMessage("");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      setErrors([{ message: "Network or server error" }]);
      setSuccessMessage("");
    }
  };

  return (
    <>
      <Heading />
      <div className="reset-password-container">
        <form onSubmit={handleSubmit} className="form-container">
          <h2 className="form-container__title">Reset Password</h2>
          {errors.length > 0 && (
            <ul className="form__error">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          )}
          {successMessage && <p className="form__success">{successMessage}</p>}
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            className="form__input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">Confirm New Password:</label>
          <input
            type="password"
            id="confirmPassword"
            className="form__input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="form__submit-button">
            Submit
          </button>
        </form>
      </div>
    </>
  );
}

export default ResetPassword;
