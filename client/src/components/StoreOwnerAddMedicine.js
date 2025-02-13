// src/components/StoreOwnerAddMedicine.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/StoreOwnerAddMedicine.css"; // Create the CSS file as per your styling conventions
import Heading from "./Heading";

function StoreOwnerAddMedicine() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_pkr: "",
    stock: "",
    category: "",
    image: null,
  });
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("storeToken");
  const storeUserString = localStorage.getItem("storeUser");

  useEffect(() => {
    if (!token || !storeUserString) {
      navigate("/store/owners/login");
      return;
    }

    let storeUser;
    try {
      storeUser = JSON.parse(storeUserString);
    } catch (error) {
      console.error("Failed to parse store user info:", error);
      localStorage.removeItem("storeToken");
      localStorage.removeItem("storeUser");
      navigate("/store/owners/login");
      return;
    }

    if (storeUser.type !== "store_owner") {
      console.error("Access denied: Only Store Owners can add medicines.");
      navigate("/unauthorized");
      return;
    }
  }, [token, storeUserString, navigate]);

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
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    axios
      .post("/api/store/medicines", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("Medicine added successfully!");
        navigate("/store/owners/medicines");
      })
      .catch((error) => {
        setErrors([error.response?.data?.error || "Failed to add medicine."]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="store-owner-add-medicine-container">
        <h2>Add New Medicine</h2>
        {errors.length > 0 && <p className="form-error">{errors[0]}</p>}
        <form onSubmit={addMedicine} className="store-owner-add-medicine-form">
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

            <label htmlFor="price_pkr">Price (PKR):</label>
            <input
              type="number"
              id="price_pkr"
              name="price_pkr"
              required
              step="0.01"
              value={formData.price_pkr}
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

export default StoreOwnerAddMedicine;
