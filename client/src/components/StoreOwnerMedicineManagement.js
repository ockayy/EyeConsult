// src/components/StoreOwnerMedicineManagement.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./CSS/StoreOwnerMedicineManagement.css"; // Create corresponding CSS
import Heading from "./Heading";

function StoreOwnerMedicineManagement() {
  const [medicines, setMedicines] = useState([]);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("storeToken");

  useEffect(() => {
    axios
      .get("/api/store/medicines", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMedicines(response.data.medicines);
      })
      .catch((error) => {
        console.error("Error fetching medicines:", error);
        setErrors([
          error.response?.data?.error || "Failed to fetch medicines.",
        ]);
      });
  }, [token]);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;

    axios
      .delete(`/api/store/medicines/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        alert(response.data.message);
        setMedicines(medicines.filter((med) => med.medicine_id !== id));
      })
      .catch((error) => {
        console.error("Error deleting medicine:", error);
        setErrors([
          error.response?.data?.error || "Failed to delete medicine.",
        ]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="store-owner-medicine-management-container">
        <h2>Manage Medicines</h2>
        {errors.length > 0 && <p className="form-error">{errors[0]}</p>}
        <Link to="/store/owners/medicines/add" className="add-medicine-button">
          Add New Medicine
        </Link>
        <table className="medicines-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price (PKR)</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.medicine_id}>
                <td>{medicine.name}</td>
                <td>{medicine.description}</td>
                <td>{parseFloat(medicine.price_pkr).toFixed(2)}</td>
                <td>{medicine.stock}</td>
                <td>{medicine.category}</td>
                <td>
                  <Link
                    to={`/store/owners/medicines/edit/${medicine.medicine_id}`}
                  >
                    <button className="edit-button">Edit</button>
                  </Link>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(medicine.medicine_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StoreOwnerMedicineManagement;
