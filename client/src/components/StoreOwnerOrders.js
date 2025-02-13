// src/components/StoreOwnerOrders.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./CSS/StoreOwnerOrders.css"; // Create corresponding CSS
import Heading from "./Heading";

function StoreOwnerOrders() {
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);
  const token = localStorage.getItem("storeToken");

  useEffect(() => {
    axios
      .get("/api/store/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setOrders(response.data);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setErrors([error.response?.data?.error || "Failed to fetch orders."]);
      });
  }, [token]);

  const updateOrderStatus = (orderId, newStatus) => {
    axios
      .put(
        `/api/store/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        alert("Order status updated successfully.");
        setOrders(
          orders.map((order) =>
            order.order_id === orderId ? response.data : order
          )
        );
      })
      .catch((error) => {
        console.error("Error updating order status:", error);
        setErrors([
          error.response?.data?.error || "Failed to update order status.",
        ]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="store-owner-orders-container">
        <h2>Manage Orders</h2>
        {errors.length > 0 && <p className="form-error">{errors[0]}</p>}
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total Price (PKR)</th>
                <th>Status</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id}</td>
                  <td>
                    {order.fname} {order.lname} ({order.email})
                  </td>
                  <td>{parseFloat(order.total_price).toFixed(2)}</td>
                  <td>{order.status}</td>
                  <td>{order.address}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.order_id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StoreOwnerOrders;
