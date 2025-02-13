// src/components/store/MedicineDetails.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./CSS/MedicineDetails.css"; // Ensure this path is correct
import Heading from "./Heading";

function MedicineDetails() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [store, setStore] = useState(null);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1); // Added quantity state

  useEffect(() => {
    // Fetch medicine details
    axios
      .get(`/api/store/medicines/${id}`)
      .then((response) => {
        setMedicine(response.data.medicine);
        return axios.get(`/api/store/users/${response.data.medicine.sold_by}`);
      })
      .then((storeResponse) => {
        setStore(storeResponse.data.store);
      })
      .catch((error) => {
        console.error("Error fetching medicine details:", error);
        setErrors([
          error.response?.data?.error || "Failed to fetch medicine details.",
        ]);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (medicine.stock < quantity) {
      alert("Requested quantity exceeds available stock.");
      return;
    }

    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = storedCart.find(
      (item) => item.medicine_id === medicine.medicine_id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      storedCart.push({ ...medicine, quantity: quantity });
    }

    localStorage.setItem("cart", JSON.stringify(storedCart));
    alert("Medicine added to cart!");
  };

  const handleBuyNow = () => {
    // Implement buy now functionality or navigate to checkout
    handleAddToCart();
    navigate("/cart"); // Example navigation to cart page
  };

  if (errors.length > 0) {
    return (
      <div>
        <Heading />
        <div className="medicine-details-container">
          <p className="error-message">{errors[0]}</p>
        </div>
      </div>
    );
  }

  if (!medicine || !store) {
    return (
      <div>
        <Heading />
        <div className="medicine-details-container">
          <p>Loading medicine details...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Heading />
      <div className="medicine-details-container">
        <button className="back-button" onClick={() => navigate(-1)}></button>
        <div className="details-card">
          <div className="details-image-section">
            {medicine.image ? (
              <img
                src={`data:image/${medicine.image_type};base64,${medicine.image}`}
                alt={medicine.name}
                className="medicine-image"
              />
            ) : (
              <div className="medicine-image-placeholder">
                No Image Available
              </div>
            )}
          </div>
          <div className="details-info-section">
            <h2>{medicine.name}</h2>
            <p className="description">{medicine.description}</p>
            <p className="price">PKR {parseFloat(medicine.price).toFixed(2)}</p>
            <p className="stock">
              <strong>Stock:</strong> {medicine.stock}
            </p>
            <p className="category">
              <strong>Category:</strong> {medicine.category}
            </p>
            <p className="sold-by">
              <strong>Sold By:</strong>{" "}
              <Link
                to={`/store/profile/${store.user_id}`}
                className="store-link"
              >
                {store.fname} {store.lname}
              </Link>
            </p>
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={medicine.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>
            <div className="action-buttons">
              <button className="add-to-cart-button" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="buy-now-button" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineDetails;
