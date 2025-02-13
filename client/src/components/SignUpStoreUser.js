import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Heading from "./Heading";
import "./CSS/StoreSignup.css";

function SignUpStoreUser() {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    gender: "",
    email: "",
    phoneno: "",
    cnic: "",
    address: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    fname: "",
    lname: "",
    gender: "",
    email: "",
    phoneno: "",
    cnic: "",
    address: "",
    password: "",
  });

  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{11}$/;
    const cnicRegex = /^[0-9]{13}$/;

    switch (name) {
      case "fname":
        return !nameRegex.test(value) ? "First name should contain only letters" : "";
      case "lname":
        return !nameRegex.test(value) ? "Last name should contain only letters" : "";
      case "email":
        return !emailRegex.test(value) ? "Please enter a valid email address" : "";
      case "phoneno":
        return !phoneRegex.test(value) ? "Phone number must be 11 digits" : "";
      case "cnic":
        return !cnicRegex.test(value) ? "CNIC must be 13 digits without dashes" : "";
      case "password":
        return value.length < 8 ? "Password must be at least 8 characters long" : "";
      case "address":
        return value.length < 10 ? "Address must be at least 10 characters long" : "";
      case "gender":
        return !value ? "Please select a gender" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setErrors(["Please fix all errors before submitting."]);
      return;
    }

    axios
      .post("/api/store/signup", formData)
      .then((response) => {
        alert("Registration successful! Please log in.");
        navigate("/store/login");
      })
      .catch((error) => {
        setErrors([error.response?.data?.error || "Registration failed."]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 className="signup-form__title">Store User Sign Up</h2>
          {errors.length > 0 && (
            <p className="signup-form__error">{errors[0]}</p>
          )}

          <label className="signup-form__label" htmlFor="fname">
            First Name:
          </label>
          <input
            className={`signup-form__input ${fieldErrors.fname ? 'input-error' : ''}`}
            type="text"
            id="fname"
            name="fname"
            required
            value={formData.fname}
            onChange={handleChange}
          />
          {fieldErrors.fname && (
            <span className="field-error">{fieldErrors.fname}</span>
          )}

          <label className="signup-form__label" htmlFor="lname">
            Last Name:
          </label>
          <input
            className={`signup-form__input ${fieldErrors.lname ? 'input-error' : ''}`}
            type="text"
            id="lname"
            name="lname"
            required
            value={formData.lname}
            onChange={handleChange}
          />
          {fieldErrors.lname && (
            <span className="field-error">{fieldErrors.lname}</span>
          )}

          <label className="signup-form__label" htmlFor="gender">
            Gender:
          </label>
          <select
            className={`signup-form__input ${fieldErrors.gender ? 'input-error' : ''}`}
            id="gender"
            name="gender"
            required
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {fieldErrors.gender && (
            <span className="field-error">{fieldErrors.gender}</span>
          )}

          <label className="signup-form__label" htmlFor="email">
            Email:
          </label>
          <input
            className={`signup-form__input ${fieldErrors.email ? 'input-error' : ''}`}
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          {fieldErrors.email && (
            <span className="field-error">{fieldErrors.email}</span>
          )}

          <label className="signup-form__label" htmlFor="phoneno">
            Phone Number:
          </label>
          <input
            className={`signup-form__input ${fieldErrors.phoneno ? 'input-error' : ''}`}
            type="tel"
            id="phoneno"
            name="phoneno"
            maxLength="11"
            required
            value={formData.phoneno}
            onChange={handleChange}
          />
          {fieldErrors.phoneno && (
            <span className="field-error">{fieldErrors.phoneno}</span>
          )}

          <label className="signup-form__label" htmlFor="cnic">
            CNIC:
          </label>
          <input
            className={`signup-form__input ${fieldErrors.cnic ? 'input-error' : ''}`}
            type="text"
            id="cnic"
            name="cnic"
            maxLength="13"
            required
            value={formData.cnic}
            onChange={handleChange}
          />
          {fieldErrors.cnic && (
            <span className="field-error">{fieldErrors.cnic}</span>
          )}

          <label className="signup-form__label" htmlFor="address">
            Address:
          </label>
          <textarea
            className={`signup-form__input ${fieldErrors.address ? 'input-error' : ''}`}
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            style={{ resize: 'none', height: '100px' }}
          ></textarea>
          {fieldErrors.address && (
            <span className="field-error">{fieldErrors.address}</span>
          )}

          <label className="signup-form__label" htmlFor="password">
            Password:
          </label>
          <input
            className={`signup-form__input ${fieldErrors.password ? 'input-error' : ''}`}
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          {fieldErrors.password && (
            <span className="field-error">{fieldErrors.password}</span>
          )}

          <button type="submit" className="signup-form__submit-button">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpStoreUser;