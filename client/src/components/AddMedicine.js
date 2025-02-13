// src/components/AddMedicine.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/AddMedicine.css"; // Import the CSS file
import Heading from "./Heading";

function AddMedicine() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: null,
  });
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");
  const userString = localStorage.getItem("adminUser");

  useEffect(() => {
    if (!token || !userString) {
      navigate("/admin/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(userString);
    } catch (error) {
      console.error("Failed to parse user info:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin/login");
      return;
    }

    if (user.type !== "admin" || user.site !== "store") {
      console.error("Access denied: invalid user type or site");
      navigate("/unauthorized");
      return;
    }
  }, [token, userString, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const addMedicine = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    axios
      .post("/api/admin/medicines", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("Medicine added successfully!");
        navigate("/admin/medicines");
      })
      .catch((error) => {
        setErrors([error.response.data.error || "Failed to add medicine."]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="add-medicine-container">
        <h2>Add New Medicine</h2>
        {errors.length > 0 && <p className="form-error">{errors[0]}</p>}
        <form onSubmit={addMedicine} className="add-medicine-form">
          <div className="form-group">
            <label htmlFor="name">Medicine Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />

            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
            ></textarea>

            <label htmlFor="price">Price:</label>
            <input
              type="number"
              id="price"
              name="price"
              required
              step="0.01"
              value={formData.price}
              onChange={handleChange}
            />

            <label htmlFor="stock">Stock:</label>
            <input
              type="number"
              id="stock"
              name="stock"
              required
              value={formData.stock}
              onChange={handleChange}
            />

            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              <option value="Pain Relief">Pain Relief</option>
              <option value="Cold & Flu">Cold & Flu</option>
              <option value="Allergy">Allergy</option>
              <option value="Digestive Health">Digestive Health</option>
              <option value="Vitamins & Supplements">
                Vitamins & Supplements
              </option>
            </select>

            <label htmlFor="image">Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              required
              onChange={handleImageChange}
            />
          </div>
          <button type="submit" className="submit-button">
            Add Medicine
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddMedicine;
