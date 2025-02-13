// src/components/StoreOrders.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import Heading from "./Heading";
import "./CSS/StoreOrders.css"; // Ensure this CSS file styles the component appropriately

function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // To handle order details expansion

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("storeToken"); // Ensure this key matches how you store the token
        if (!token) {
          setErrors("User not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/store/orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assuming the server returns { orders: [...] }
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setErrors(
          error.response?.data?.error ||
            "Failed to fetch orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  return (
    <div>
      <Heading />
      <div className="orders-container">
        <h2>Your Orders</h2>
        {loading && <p className="loading">Loading orders...</p>}
        {errors && <p className="form-error">{errors}</p>}
        {!loading && !errors && (
          <>
            {orders.length === 0 ? (
              <p>You have no orders.</p>
            ) : (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <React.Fragment key={order.order_id}>
                      <tr>
                        <td>{order.order_id}</td>
                        <td>PKR{parseFloat(order.total_price).toFixed(2)}</td>
                        <td>{order.status}</td>
                        <td>{new Date(order.created_at).toLocaleString()}</td>
                        <td>
                          <button
                            onClick={() => toggleOrderDetails(order.order_id)}
                            className="details-button"
                          >
                            {expandedOrderId === order.order_id
                              ? "Hide Details"
                              : "View Details"}
                          </button>
                        </td>
                      </tr>
                      {expandedOrderId === order.order_id && (
                        <tr className="order-details-row">
                          <td colSpan="5">
                            <div className="order-details">
                              <h4>Order Items:</h4>
                              <ul>
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item) => (
                                    <li key={item.order_item_id}>
                                      <strong>{item.medicine_name}</strong> -
                                      Quantity: {item.quantity} - Price: PKR
                                      {parseFloat(item.price).toFixed(2)}
                                    </li>
                                  ))
                                ) : (
                                  <li>No items found for this order.</li>
                                )}
                              </ul>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default StoreOrders;
