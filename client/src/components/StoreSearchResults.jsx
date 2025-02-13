import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import Heading from "./Heading";
import "./CSS/StoreSearchResults.css";

function StoreSearchResults() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grab the search string from the URL: /store/search?query=...
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("query") || "";

  useEffect(() => {
    if (searchTerm) {
      fetchSearchResults(searchTerm);
    } else {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchSearchResults = async (term) => {
    try {
      setLoading(true);
      const res = await axios.get("/api/store/medicines", {
        params: { search: term, page: 1, limit: 50 }, // or your defaults
      });
      setMedicines(res.data.medicines);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Heading />
      <div style={{ padding: "1rem" }}>
        <h2>Search Results for: "{searchTerm}"</h2>
        {loading ? (
          <p>Loading...</p>
        ) : medicines.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div className="medicine-grid">
            {medicines.map((medicine) => (
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
                <p>Sold by: {medicine.sold_by}</p>
                <div className="medicine-card-buttons">
                  {/* Possibly link to the detail page, just like in StoreHome */}
                  <Link to={`/store/medicine/${medicine.medicine_id}`}>
                    <button className="details-button">Details</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreSearchResults;
