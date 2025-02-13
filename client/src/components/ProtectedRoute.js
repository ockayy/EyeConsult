// src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element: Component, allowedRoles, redirectTo }) => {
  // Retrieve user information from localStorage
  const mainSiteUser = JSON.parse(localStorage.getItem("mainSiteUser"));
  const storeUser = JSON.parse(localStorage.getItem("storeUser"));
  const storeOwnerUser = JSON.parse(localStorage.getItem("storeOwnerUser"));
  const adminUser = JSON.parse(localStorage.getItem("adminUser"));

  // Determine the user's role
  let userRole = null;
  if (mainSiteUser && mainSiteUser.type) {
    userRole = mainSiteUser.type; // 'patient' or 'doctor'
  } else if (storeUser) {
    userRole = "store";
  } else if (storeOwnerUser) {
    userRole = "store_owner";
  } else if (adminUser) {
    userRole = "admin";
  }

  // Check if user is authenticated and has an allowed role
  if (userRole && allowedRoles.includes(userRole)) {
    return <Component />;
  } else {
    return <Navigate to={redirectTo} replace />;
  }
};

export default ProtectedRoute;
