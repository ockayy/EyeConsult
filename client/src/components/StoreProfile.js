// src/components/store/StoreProfile.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "./CSS/StoreProfile.css"; // Create the CSS file as per your styling conventions
import Heading from "./Heading";

function StoreProfile() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Fetch store owner details
    axios
      .get(`/api/store/users/${storeId}`)
      .then((response) => {
        setStore(response.data.store);
        // Fetch medicines sold by this store
        return axios.get(`/api/store/medicines?sold_by=${storeId}`);
      })
      .then((medResponse) => {
        setMedicines(medResponse.data.medicines);
      })
      .catch((error) => {
        console.error("Error fetching store profile:", error);
        setErrors([
          error.response?.data?.error || "Failed to fetch store profile.",
        ]);
      });
  }, [storeId]);

  if (errors.length > 0) {
    return (
      <div>
        <Heading />
        <div className="store-profile-container">
          <p className="error-message">{errors[0]}</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div>
        <Heading />
        <div className="store-profile-container">
          <p>Loading store profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Heading />
      <div className="store-profile-container">
        <h2>
          {store.fname} {store.lname}'s Store
        </h2>
        <p>
          <strong>Address:</strong> {store.address}
        </p>
        <p>
          <strong>Phone:</strong> {store.phoneno}
        </p>
        <p>
          <strong>Email:</strong> {store.email}
        </p>

        <h3>Medicines Sold by This Store:</h3>
        {medicines.length === 0 ? (
          <p>No medicines found for this store.</p>
        ) : (
          <ul className="store-medicines-list">
            {medicines.map((med) => (
              <li key={med.medicine_id}>
                <Link
                  to={`/store/medicine/${med.medicine_id}`}
                  className="medicine-link"
                >
                  {med.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default StoreProfile;
