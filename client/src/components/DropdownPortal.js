// src/components/DropdownPortal.jsx

import React from "react";
import ReactDOM from "react-dom";

const DropdownPortal = ({ children }) => {
  return ReactDOM.createPortal(
    children,
    document.getElementById("dropdown-root")
  );
};

export default DropdownPortal;
