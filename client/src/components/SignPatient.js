import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Heading from "./Heading";
import "./CSS/SignUp.css";
import "./CSS/base.css";
import "./CSS/SharedStyles.css";
import SignImage from "./Images/Login.svg";

function SignPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    phoneno: "",
    email: "",
    gender: "",
    password: "",
    password2: ""
  });

  const [fieldErrors, setFieldErrors] = useState({
    fname: "",
    lname: "",
    phoneno: "",
    email: "",
    gender: "",
    password: "",
    password2: ""
  });

  const [submitErrors, setSubmitErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{11}$/;

    switch (name) {
      case "fname":
        return value && !nameRegex.test(value) 
          ? "First name should contain only letters"
          : "";
      case "lname":
        return value && !nameRegex.test(value)
          ? "Last name should contain only letters"
          : "";
      case "phoneno":
        return value && !phoneRegex.test(value)
          ? "Phone number must be 11 digits"
          : "";
      case "email":
        return value && !emailRegex.test(value)
          ? "Please enter a valid email address"
          : "";
      case "password":
        return value && value.length < 8
          ? "Password must be at least 8 characters long"
          : "";
      case "password2":
        return value && value !== formData.password
          ? "Passwords do not match"
          : "";
      case "gender":
        return value === ""
          ? "Please select a gender"
          : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Special case for password confirmation
    if (name === "password") {
      setFieldErrors(prev => ({
        ...prev,
        password: validateField("password", value),
        password2: formData.password2 ? validateField("password2", formData.password2) : ""
      }));
    } else {
      setFieldErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitErrors([]);
    setSuccessMessage("");

    // Validate all fields before submission
    const errors = Object.keys(formData).map(key => ({
      field: key,
      message: validateField(key, formData[key])
    })).filter(error => error.message);

    if (errors.length > 0) {
      setSubmitErrors(errors.map(err => ({ message: err.message })));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("https://eyeconsult.onrender.com/api/signuppatient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitErrors([{ message: data.error }]);
      } else {
        localStorage.setItem("token", data.token);
        setSuccessMessage("Sign up successful! Logging you in...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setSubmitErrors([{ message: "Network or server error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Heading />
      <div className="signup-container">
        <div className="signup-container__image">
          <img src={SignImage} alt="Patient Signup" />
        </div>
        <div className="signup-container__form-wrapper">
          <form onSubmit={handleSubmit} className="form-container">
            {submitErrors.length > 0 && (
              <div className="form__error">
                <ul>
                  {submitErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}
            {successMessage && (
              <div className="form__success">
                <p>{successMessage}</p>
              </div>
            )}
            <h2 className="form-container__title">Patient Sign Up</h2>

            {/* Personal Information */}
            <div className="form-group">
              <label htmlFor="fname">First Name:</label>
              <input
                type="text"
                placeholder="First Name"
                id="fname"
                name="fname"
                value={formData.fname}
                onChange={handleChange}
                className={`form__input ${fieldErrors.fname ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.fname && (
                <span className="form__field-error">{fieldErrors.fname}</span>
              )}

              <label htmlFor="lname">Last Name:</label>
              <input
                type="text"
                placeholder="Last Name"
                id="lname"
                name="lname"
                value={formData.lname}
                onChange={handleChange}
                className={`form__input ${fieldErrors.lname ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.lname && (
                <span className="form__field-error">{fieldErrors.lname}</span>
              )}

              <label htmlFor="phoneno">Phone No:</label>
              <input
                type="tel"
                maxLength="11"
                placeholder="+923XXXXXXXXX"
                id="phoneno"
                name="phoneno"
                value={formData.phoneno}
                onChange={handleChange}
                className={`form__input ${fieldErrors.phoneno ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.phoneno && (
                <span className="form__field-error">{fieldErrors.phoneno}</span>
              )}

              <label htmlFor="email">Email:</label>
              <input
                type="email"
                placeholder="Email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form__input ${fieldErrors.email ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.email && (
                <span className="form__field-error">{fieldErrors.email}</span>
              )}

              <label htmlFor="gender">Gender:</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`form__select ${fieldErrors.gender ? 'form__input--error' : ''}`}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {fieldErrors.gender && (
                <span className="form__field-error">{fieldErrors.gender}</span>
              )}
            </div>

            {/* Security Information */}
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                placeholder="Password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form__input ${fieldErrors.password ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.password && (
                <span className="form__field-error">{fieldErrors.password}</span>
              )}

              <label htmlFor="password2">Confirm Password:</label>
              <input
                type="password"
                placeholder="Confirm Password"
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className={`form__input ${fieldErrors.password2 ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.password2 && (
                <span className="form__field-error">{fieldErrors.password2}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="form__submit-button"
              disabled={isLoading || Object.values(fieldErrors).some(error => error)}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignPatient;
