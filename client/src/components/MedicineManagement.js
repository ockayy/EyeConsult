// src/components/MedicineManagement.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CSS/MedicineManagement.css"; // Import the CSS file
import Heading from "./Heading";

function MedicineManagement() {
  const [medicines, setMedicines] = useState([]);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    axios
      .get("/api/admin/medicines", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setMedicines(response.data);
      })
      .catch((error) => {
        setErrors([error.response.data.error || "Failed to fetch medicines."]);
      });
  }, [token]);

  const deleteMedicine = (medicineId) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      axios
        .delete(`/api/admin/medicines/${medicineId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          alert("Medicine deleted successfully!");
          setMedicines(
            medicines.filter((medicine) => medicine.medicine_id !== medicineId)
          );
        })
        .catch((error) => {
          setErrors([
            error.response.data.error || "Failed to delete medicine.",
          ]);
        });
    }
  };

  return (
    <div>
      <Heading />
      <div className="medicine-management-container">
        <h2>Medicine Management</h2>
        {errors.length > 0 && <p className="form-error">{errors[0]}</p>}
        <button
          onClick={() => navigate("/admin/medicines/add")}
          className="add-medicine-button"
        >
          Add New Medicine
        </button>
        <table className="medicine-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price ($)</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.medicine_id}>
                <td>{medicine.name}</td>
                <td>{medicine.category}</td>
                <td>${parseFloat(medicine.price).toFixed(2)}</td>
                <td>{medicine.stock}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() =>
                        navigate(
                          `/admin/medicines/edit/${medicine.medicine_id}`
                        )
                      }
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMedicine(medicine.medicine_id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicineManagement;
