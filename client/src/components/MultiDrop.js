// src/components/MultiDrop.jsx
import React, { useState } from "react";
import "./CSS/MultiDrop.css";

function MultiSelectDropdown({
  options,
  selectedOptions,
  setSelectedOptions,
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChange = (value) => {
    if (selectedOptions.includes(value)) {
      // Remove the selected option
      setSelectedOptions(selectedOptions.filter((item) => item !== value));
    } else {
      // Add the selected option
      setSelectedOptions([...selectedOptions, value]);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="multi-select-dropdown">
      <div className="dropdown-header" onClick={toggleDropdown}>
        <span>{label}</span>
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="dropdown-list">
          {options.map((option, index) => (
            <div key={index} className="dropdown-item">
              <input
                type="checkbox"
                id={`option-${index}`}
                value={option}
                checked={selectedOptions.includes(option)}
                onChange={() => handleSelectChange(option)}
              />
              <label htmlFor={`option-${index}`}>{option}</label>
            </div>
          ))}
        </div>
      )}
      {selectedOptions.length > 0 && (
        <div className="selected-options">
          {selectedOptions.map((option, index) => (
            <span key={index} className="selected-option">
              {option}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiSelectDropdown;
