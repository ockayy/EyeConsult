import React from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/DoctorCard.css";

function DoctorCard({
  doctor_id,
  name,
  age,
  specialization,
  hospital,
  imageUrl,
  imageType,
}) {
  const navigate = useNavigate();

  // If the specialization prop is an array, we can join them into a string:
  const specializationString = specialization.join(", ");

  const handleViewProfile = () => {
    // UPDATED: Retrieve the correct token key
    const token = localStorage.getItem("mainSiteToken");
    // UPDATED: Retrieve the user object or user type from the same system you use elsewhere
    const user = JSON.parse(localStorage.getItem("mainSiteUser"));
    const userType = user?.type; // for example, "patient" or "doctor"

    // If a user is logged in (token != null) and userType is 'patient',
    // route them to the patient-specific route:
    if (token && userType === "patient") {
      navigate(`/dashboard/patient/doctors/${doctor_id}`);
    }
    // If no user or userType is something else, route them to the public route:
    else {
      navigate(`/doctor/${doctor_id}`);
    }
  };

  const handleBookAppointment = () => {
    const token = localStorage.getItem("mainSiteToken");
    const user = JSON.parse(localStorage.getItem("mainSiteUser"));
    const userType = user?.type;

    // If no token, redirect to a sign-up or selection page
    if (!token) {
      navigate(`/selection?role=patient`);
      return;
    }

    // If the user is a patient, or you allow booking from anyone logged in,
    // navigate to the same place as "View Profile" or directly open a booking form.
    // For simplicity, we’ll do the same as handleViewProfile:
    navigate(`/doctor/${doctor_id}`);
  };

  return (
    <div className="doctor-card">
      <img
        src={`data:${imageType};base64,${imageUrl}`}
        alt={`${name}'s profile`}
        className="doctor-image"
      />
      <div className="doctor-info">
        <h3>{name}</h3>
        <p>
          <b>Age:</b> {age}
        </p>
        <p>
          <b>Specialization:</b> {specializationString}
        </p>
        <p>
          <b>Hospital:</b> {hospital}
        </p>
      </div>
      <div className="doctor-buttons">
        <button className="view-profile" onClick={handleViewProfile}>
          View Profile
        </button>
        <button className="book-appointment" onClick={handleBookAppointment}>
          Book Appointment
        </button>
      </div>
    </div>
  );
}

export default DoctorCard;
