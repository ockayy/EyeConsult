// src/components/UserManagement.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CSS/Admin.css";
import Heading from "./Heading";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [errors, setErrors] = useState([]);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    axios
      .get("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        setErrors([error.response.data.error || "Failed to fetch users."]);
      });
  }, [token]);

  const deleteUser = (userId) => {
    axios
      .delete(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        alert("User deleted successfully!");
        setUsers(users.filter((user) => user.user_id !== userId));
      })
      .catch((error) => {
        setErrors([error.response.data.error || "Failed to delete user."]);
      });
  };

  return (
    <div>
      <Heading />
      <div className="user-management">
        <h2>User Management</h2>
        {errors.length > 0 && <p className="form-error">{errors[0]}</p>}
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>
                    {user.fname} {user.lname}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phoneno}</td>
                  <td>
                    <button
                      onClick={() => deleteUser(user.user_id)}
                      className="button"
                    >
                      Delete
                    </button>
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

export default UserManagement;
