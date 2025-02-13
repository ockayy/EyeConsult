import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/Admin.css";
import Heading from "./Heading";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [errors, setErrors] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || "");

  useEffect(() => {
    if (!token) {
      setErrors(["Please log in to access this page."]);
      return;
    }

    axios
      .get("/api/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("Orders data:", response.data);

        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          // If not, set an error
          setErrors([
            "Invalid response from server. Expected an array of orders.",
          ]);
        }
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        console.log("Error response data:", error.response?.data);
        setErrors([error.response?.data?.error || "Failed to fetch orders."]);
      });
  }, [token]);

  const updateOrderStatus = (orderId, status) => {
    axios
      .put(
        `/api/admin/orders/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        alert("Order status updated successfully!");
        setOrders(
          orders.map((order) =>
            order.order_id === orderId ? { ...order, status } : order
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

  if (errors.length > 0) {
    return (
      <div>
        <Heading />
        <div className="order-management">
          <h2>Order Management</h2>
          {errors.map((error, index) => (
            <p key={index} className="form-error">
              {error}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Heading />
      <div className="order-management">
        <h2>Order Management</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_id}>
                  <td>{order.order_id || "N/A"}</td>
                  <td>{order.user_id || "N/A"}</td>
                  <td>
                    $
                    {order.total_price
                      ? parseFloat(order.total_price).toFixed(2)
                      : "N/A"}
                  </td>
                  <td>{order.status || "N/A"}</td>
                  <td>
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.order_id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
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

export default OrderManagement;
