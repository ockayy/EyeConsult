// src/components/MedicineDetail.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "./CSS/MedicineDetail.css"; // Corrected import
import Heading from "./Heading";

function MedicineDetail() {
  const { medicineId } = useParams();
  const navigate = useNavigate(); // Initialize navigate
  const [medicine, setMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios
      .get(`/api/store/medicines/${medicineId}`)
      .then((response) => {
        setMedicine(response.data);
      })
      .catch((error) => {
        console.error("Error fetching medicine:", error);
        setErrorMessage(
          "Failed to load medicine details. Please try again later."
        );
      });
  }, [medicineId]);

  const addToCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find(
      (item) => item.medicine_id === medicine.medicine_id
    );

    if (existingItem) {
      if (existingItem.quantity + quantity > medicine.stock) {
        setErrorMessage("Cannot add more than available stock.");
        return;
      }
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...medicine, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setSuccessMessage("Item added to cart!");

    // Clear the success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  if (!medicine)
    return (
      <div>
        <Heading />
        <div className="loading">Loading...</div>
      </div>
    );

  return (
    <div>
      <Heading />
      <div className="medicine-details-container">
        <div className="medicine-details-card">
          <div className="medicine-details-image-section">
            {medicine.image ? (
              <img
                src={`data:image/${medicine.image_type || "jpeg"};base64,${medicine.image}`}
                alt={medicine.name}
                className="medicine-details-image"
              />
            ) : (
              <div className="medicine-image-placeholder">No Image Available</div>
            )}
          </div>
          <div className="medicine-details-info">
            <h2>{medicine.name}</h2>
            <p className="description">{medicine.description}</p>
            <p className="price">Price: PKR {parseFloat(medicine.price).toFixed(2)}</p>
            <p className="stock">Stock: {medicine.stock}</p>
            <p className="sold-by">Sold by: {medicine.sold_by || "Unknown"}</p> {/* Added Sold by */}
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={medicine.stock}
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value > medicine.stock) {
                    setErrorMessage("Quantity exceeds available stock.");
                  } else {
                    setErrorMessage("");
                    setQuantity(value > 0 ? value : 1);
                  }
                }}
              />
            </div>
            <button
              onClick={addToCart}
              className="button"
              disabled={medicine.stock === 0}
            >
              {medicine.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}
            <button className="back-button" onClick={() => navigate(-1)}>
              &larr; Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineDetail;
