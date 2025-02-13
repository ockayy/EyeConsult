// src/components/Cart.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CSS/Cart.css"; // Ensure this CSS file is present
import Heading from "./Heading";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa"; // Importing icons

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(cart);
  }, []);

  // Update localStorage whenever cartItems change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Handle quantity increase
  const handleIncrease = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.medicine_id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    setCartItems(updatedCart);
  };

  // Handle quantity decrease
  const handleDecrease = (id) => {
    const updatedCart = cartItems.map((item) =>
      item.medicine_id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    setCartItems(updatedCart);
  };

  // Handle deleting an item
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this item from your cart?")) {
      return;
    }
    const updatedCart = cartItems.filter((item) => item.medicine_id !== id);
    setCartItems(updatedCart);
  };

  // Handle clearing the entire cart
  const handleClearCart = () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }
    setCartItems([]);
  };

  // Handle checkout process
  const handleCheckout = async () => {
    const token = localStorage.getItem("storeToken");
    const userString = localStorage.getItem("storeUser");

    if (!token || !userString) {
      // User is not logged in, redirect to login page
      alert("Please log in or sign up to proceed with checkout.");
      navigate("/store/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(userString);
      console.log("Parsed User:", user); // Debugging log
    } catch (error) {
      console.error("Failed to parse user info:", error);
      localStorage.removeItem("storeToken");
      localStorage.removeItem("storeUser");
      navigate("/store/login");
      return;
    }

    // Validate address
    if (!address.trim()) {
      setErrors(["Please provide a delivery address."]);
      return;
    }

    // Validate cart items
    if (cartItems.length === 0) {
      setErrors(["Your cart is empty."]);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
        })),
        address: address.trim(),
      };

      console.log("Order Data:", orderData); // Debugging log

      const response = await axios.post("/api/store/orders", orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Order Response:", response.data); // Debugging log

      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      setCartItems([]);
      setAddress("");
      navigate("/store/orders");
    } catch (error) {
      console.error("Checkout Error:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        setErrors([error.response.data.error || "Checkout failed."]);
      } else if (error.request) {
        console.error("Error Request:", error.request);
        setErrors(["No response received from the server. Please try again later."]);
      } else {
        console.error("Error Message:", error.message);
        setErrors(["An unexpected error occurred during checkout. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * parseInt(item.quantity, 10),
    0
  );

  return (
    <div>
      <Heading />
      <div className="cart-container">
        <h2>Your Cart</h2>
        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((error, index) => (
              <p key={index} className="form-error">
                {error}
              </p>
            ))}
          </div>
        )}
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-actions">
              <button
                onClick={handleClearCart}
                className="clear-cart-button"
                title="Clear Cart"
              >
                Clear Cart
              </button>
            </div>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.medicine_id}>
                    <td>{item.name}</td>
                    <td>${parseFloat(item.price).toFixed(2)}</td>
                    <td>
                      <div className="quantity-control">
                        <button
                          onClick={() => handleDecrease(item.medicine_id)}
                          className="quantity-button"
                          disabled={item.quantity <= 1}
                          title="Decrease Quantity"
                        >
                          <FaMinus />
                        </button>
                        <span className="quantity-number">{item.quantity}</span>
                        <button
                          onClick={() => handleIncrease(item.medicine_id)}
                          className="quantity-button"
                          title="Increase Quantity"
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td>${(parseFloat(item.price) * parseInt(item.quantity, 10)).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(item.medicine_id)}
                        className="delete-button"
                        title="Remove Item"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="total-price">Total: ${total.toFixed(2)}</p>
            <div className="form-group">
              <label htmlFor="address">Delivery Address:</label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="Enter your delivery address here..."
              ></textarea>
            </div>
            <button
              onClick={handleCheckout}
              className="checkout-button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
