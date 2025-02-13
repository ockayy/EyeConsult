// src/components/StoreHome.jsx

import React, { useEffect, useState } from "react";
import "./CSS/StoreHome.css";
import axios from "axios";
import Heading from "./Heading"; // Use Heading component
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom"; // Import Link

function StoreHome() {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([
    "Pain Relief",
    "Cold & Flu",
    "Allergy",
    "Digestive Health",
    "Vitamins & Supplements",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("nameAsc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, [selectedCategory, sortOption, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortOption]);

  const fetchMedicines = () => {
    let url = "/api/store/medicines";

    // Add category, sorting, and pagination parameters
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (selectedCategory !== "All") {
      params.category = selectedCategory;
    }

    // Sorting options
    if (sortOption === "nameAsc") {
      params.sortBy = "name";
      params.order = "asc";
    } else if (sortOption === "nameDesc") {
      params.sortBy = "name";
      params.order = "desc";
    } else if (sortOption === "priceAsc") {
      params.sortBy = "price";
      params.order = "asc";
    } else if (sortOption === "priceDesc") {
      params.sortBy = "price";
      params.order = "desc";
    }

    axios
      .get(url, { params })
      .then((response) => {
        setMedicines(response.data.medicines);
        setTotalCount(response.data.totalCount);
      })
      .catch((error) => {
        console.error("Error fetching medicines:", error);
      });
  };

  const handleAddToCart = (medicine) => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = storedCart.find(
      (item) => item.medicine_id === medicine.medicine_id
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      storedCart.push({ ...medicine, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(storedCart));
    alert("Medicine added to cart!");
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div>
      <Heading />
      <div className="store-homepage-container">
        <div className="filter-sort-container">
          <div className="categories">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All</option>
              {categories.map((category, idx) => (
                <option value={category} key={idx}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="sorting">
            <label htmlFor="sort">Sort By:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="priceAsc">Price (Low to High)</option>
              <option value="priceDesc">Price (High to Low)</option>
            </select>
          </div>
        </div>
        <div className="medicine-grid">
          {medicines.length > 0 ? (
            medicines.map((medicine) => (
              <div className="medicine-card" key={medicine.medicine_id}>
                {medicine.image ? (
                  <img
                    src={`data:image/${medicine.image_type};base64,${medicine.image}`}
                    alt={medicine.name}
                  />
                ) : (
                  <div className="medicine-image-placeholder">No Image</div>
                )}
                <h3>{medicine.name}</h3>
                <p>{medicine.description}</p>
                <div className="price">
                  PKR {parseFloat(medicine.price).toFixed(2)}
                </div>
                <p>Sold by: {medicine.sold_by}</p> {/* Display store info */}
                <div className="medicine-card-buttons">
                  <button
                    className="add-to-cart-button"
                    onClick={() => handleAddToCart(medicine)}
                  >
                    Add to Cart
                  </button>
                  <Link to={`/store/medicine/${medicine.medicine_id}`}>
                    <button className="details-button">Details</button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No medicines available.</p>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaArrowLeft /> Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreHome;
