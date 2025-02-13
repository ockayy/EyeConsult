// src/components/EditMedicine.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./CSS/EditMedicine.css"; // Import the CSS file
import Heading from "./Heading";

function EditMedicine() {
  const { medicineId } = useParams();
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

  useEffect(() => {
    axios
      .get(`/api/admin/medicines/${medicineId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const { name, description, price, stock, category } = response.data;
        setFormData({ name, description, price, stock, category, image: null });
      })
      .catch((error) => {
        setErrors([
          error.response.data.error || "Failed to fetch medicine details.",
        ]);
      });
  }, [medicineId, token]);

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
      .put(`/api/admin/medicines/${medicineId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("Medicine updated successfully!");
        navigate("/admin/medicines");
      })
      .catch((error) => {
        setErrors([error.response.data.error || "Failed to update medicine."]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="edit-medicine-container">
        <h2>Edit Medicine</h2>
        {errors.length > 0 && <p className="form-error">{errors[0]}</p>}
        <form onSubmit={updateMedicine} className="edit-medicine-form">
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

export default EditMedicine;
