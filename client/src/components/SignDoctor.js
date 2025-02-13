import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Heading from "./Heading";
import MultiSelectDropdown from "./MultiDrop";
import "./CSS/SignUp.css";
import "./CSS/base.css";
import "./CSS/SharedStyles.css";
import SignDocImage from "./Images/D_signup.svg";

const specializations = [
  "Cornea and External Disease",
  "Glaucoma",
  "Retina/Vitreous Surgery",
  "Neuro-Ophthalmology",
  "Oculoplastics/Orbital Surgery",
  "Pediatric Ophthalmology",
  "Uveitis",
  "Refractive Surgery",
  "Ocular Pathology",
  "Ocular Immunology",
  "Ophthalmic Genetics",
  "Geriatric Ophthalmology",
];

const services = [
  "Comprehensive Eye Exams",
  "Vision Correction",
  "Medical Eye Care",
  "Surgical Eye Care",
  "Pediatric Eye Care",
  "Emergency Eye Care",
  "Low Vision Services",
  "Dry Eye Treatment",
  "Neuro-Ophthalmology",
  "Oculoplastics",
  "Laser Eye Surgery",
  "Cataract Surgery",
  "Contact Lens Services",
  "Teleophthalmology",
];

function SignDoctor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phoneno: "",
    cnic: "",  // Add this
    email: "",
    password: "",
    password2: "",
    experience_years: "",
    current_hospital: "",
    experience_title: "",
    fee: "",
    description: "",
    available_start_time: "",
    available_end_time: "",
    dob: ""
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    phoneno: "",
    cnic: "",  // Add this
    email: "",
    password: "",
    password2: "",
    experience_years: "",
    current_hospital: "",
    experience_title: "",
    fee: "",
    description: "",
    available_start_time: "",
    available_end_time: "",
    dob: ""
  });

  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [submitErrors, setSubmitErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{11}$/;
    const cnicRegex = /^[0-9]{13}$/;  // Add this

    switch (name) {
      case "name":
        return value && !nameRegex.test(value) 
          ? "Name should contain only letters"
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
      case "experience_years":
        return value && (isNaN(value) || value < 0 || value > 50)
          ? "Please enter a valid experience (0-50 years)"
          : "";
      case "fee":
        return value && (isNaN(value) || value <= 0)
          ? "Please enter a valid fee amount"
          : "";
      case "cnic":
      return value && !cnicRegex.test(value)
        ? "CNIC must be 13 digits without dashes"
        : "";
      case "current_hospital":
        return value && value.length < 3
          ? "Hospital name must be at least 3 characters"
          : "";
      case "description":
        return value && value.length < 50
          ? "Description must be at least 50 characters"
          : "";
      case "dob":
        if (!value) return "";
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return age < 25 ? "Doctor must be at least 25 years old" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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

  const validateTimeRange = () => {
    if (formData.available_start_time && formData.available_end_time) {
      const start = new Date(`2000/01/01 ${formData.available_start_time}`);
      const end = new Date(`2000/01/01 ${formData.available_end_time}`);
      if (end <= start) {
        return "End time must be after start time";
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitErrors([]);
    setSuccessMessage("");

    // Additional validations
    if (selectedSpecializations.length === 0) {
      setSubmitErrors(prev => [...prev, { message: "Please select at least one specialization" }]);
      setIsLoading(false);
      return;
    }

    if (selectedServices.length === 0) {
      setSubmitErrors(prev => [...prev, { message: "Please select at least one service" }]);
      setIsLoading(false);
      return;
    }

    const timeError = validateTimeRange();
    if (timeError) {
      setSubmitErrors(prev => [...prev, { message: timeError }]);
      setIsLoading(false);
      return;
    }

    // Validate all fields
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
      const formDataToSend = new FormData(e.target);
      formDataToSend.append("specializations", JSON.stringify(selectedSpecializations));
      formDataToSend.append("services", JSON.stringify(selectedServices));

      const response = await fetch("/api/signupdoctor", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMessage("Sign up successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error) {
      console.error("Error during registration:", error);
      setSubmitErrors([{ message: error.message || "Network or server error" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Heading />
      <div className="signup-container">
        <div className="signup-container__image">
          <img src={SignDocImage} alt="Doctor Signup" />
        </div>
        <div className="signup-container__form-wrapper">
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="form-container">
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
            <h2 className="form-container__title">Doctor Sign Up</h2>

            {/* Personal Information */}
            <h3>Personal Information</h3>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                placeholder="Name"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form__input ${fieldErrors.name ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.name && (
                <span className="form__field-error">{fieldErrors.name}</span>
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

              {/* Add CNIC field */}
              <label htmlFor="cnic">CNIC:</label>
              <input
                type="text"
                maxLength="13"
                placeholder="Enter CNIC without dashes"
                id="cnic"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                className={`form__input ${fieldErrors.cnic ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.cnic && (
                <span className="form__field-error">{fieldErrors.cnic}</span>
              )}

              <label htmlFor="dob">Date of Birth:</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={`form__input ${fieldErrors.dob ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.dob && (
                <span className="form__field-error">{fieldErrors.dob}</span>
              )}

              <label htmlFor="degree_pic">Degree Picture:</label>
              <input
                type="file"
                id="degree_pic"
                name="degree_pic"
                className="form__input"
                accept="image/*"
                required
              />
            </div>

            <div className="form-group">
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

              <label htmlFor="profile_pic">Profile Picture:</label>
              <input
                type="file"
                id="profile_pic"
                name="profile_pic"
                className="form__input"
                accept="image/*"
                required
              />
            </div>

            {/* Professional Information */}
            <h3>Professional Information</h3>
            <div className="form-group">
              <label htmlFor="experience_years">Years of Experience:</label>
              <input
                type="number"
                placeholder="Years of Experience"
                id="experience_years"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                className={`form__input ${fieldErrors.experience_years ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.experience_years && (
                <span className="form__field-error">{fieldErrors.experience_years}</span>
              )}

              <MultiSelectDropdown
                options={specializations}
                selectedOptions={selectedSpecializations}
                setSelectedOptions={setSelectedSpecializations}
                label="Specializations"
              />

              <label htmlFor="current_hospital">Current Hospital:</label>
              <input
                type="text"
                placeholder="Current Hospital"
                id="current_hospital"
                name="current_hospital"
                value={formData.current_hospital}
                onChange={handleChange}
                className={`form__input ${fieldErrors.current_hospital ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.current_hospital && (
                <span className="form__field-error">{fieldErrors.current_hospital}</span>
              )}

              <label htmlFor="available_start_time">Available Start Time:</label>
              <input
                type="time"
                id="available_start_time"
                name="available_start_time"
                value={formData.available_start_time}
                onChange={handleChange}
                className="form__input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="experience_title">Title of Experience:</label>
              <input
                type="text"
                placeholder="Title of Experience"
                id="experience_title"
                name="experience_title"
                value={formData.experience_title}
                onChange={handleChange}
                className={`form__input ${fieldErrors.experience_title ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.experience_title && (
                <span className="form__field-error">{fieldErrors.experience_title}</span>
              )}

              <MultiSelectDropdown
                options={services}
                selectedOptions={selectedServices}
                setSelectedOptions={setSelectedServices}
                label="Services"
              />

              <label htmlFor="fee">Fee/25min:</label>
              <input
                type="number"
                placeholder="Fee in PKR"
                id="fee"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                className={`form__input ${fieldErrors.fee ? 'form__input--error' : ''}`}
                required
              />
              {fieldErrors.fee && (
                <span className="form__field-error">{fieldErrors.fee}</span>
              )}

              <label htmlFor="available_end_time">Available End Time:</label>
              <input
                type="time"
                id="available_end_time"
                name="available_end_time"
                value={formData.available_end_time}
                onChange={handleChange}
                className="form__input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                placeholder="Description"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form__textarea ${fieldErrors.description ? 'form__input--error' : ''}`}
                required
                style={{ resize: 'none', height: '150px' }}  // Add fixed height and disable resize
              ></textarea>
              {fieldErrors.description && (
                <span className="form__field-error">{fieldErrors.description}</span>
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

export default SignDoctor;