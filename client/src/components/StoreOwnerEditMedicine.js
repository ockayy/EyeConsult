// src/components/StoreOwnerEditMedicine.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CSS/StoreOwnerEditMedicine.css"; // Create the CSS file as per your styling conventions
import Heading from "./Heading";

function StoreOwnerEditMedicine() {
  const { medicineId } = useParams();
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
      console.error("Access denied: Only Store Owners can edit medicines.");
      navigate("/unauthorized");
      return;
    }

    // Fetch medicine details
    axios
      .get(`/api/store/medicines/${medicineId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { name, description, price_pkr, stock, category } = response.data;
        setFormData({
          name,
          description,
          price_pkr,
          stock,
          category,
          image: null,
        });
      })
      .catch((error) => {
        setErrors([
          error.response?.data?.error || "Failed to fetch medicine details.",
        ]);
      });
  }, [medicineId, token, storeUserString, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const updateMedicine = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    axios
      .put(`/api/store/medicines/${medicineId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("Medicine updated successfully!");
        navigate("/store/owners/medicines");
      })
      .catch((error) => {
        setErrors([
          error.response?.data?.error || "Failed to update medicine.",
        ]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="store-owner-edit-medicine-container">
        <h2>Edit Medicine</h2>
        {errors.length > 0 && <p className="form-error">{errors[0]}</p>}
        <form
          onSubmit={updateMedicine}
          className="store-owner-edit-medicine-form"
        >
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

            <label htmlFor="image">
              Image (leave blank to keep current image):
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <button type="submit" className="submit-button">
            Update Medicine
          </button>
        </form>
      </div>
    </div>
  );
}

export default StoreOwnerEditMedicine;
