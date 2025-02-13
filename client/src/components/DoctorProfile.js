import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Heading from "./Heading";
import Footer from "./Footer";
import "./CSS/DoctorProfile.css";

/**
 * This component now handles two scenarios:
 * 1) If there's NO :id param, assume the logged-in doctor is viewing their own profile (edit mode).
 * 2) If there's an :id param, we fetch that specific doctor for a patient to book an appointment with.
 */
function DoctorProfile() {
  const { id } = useParams(); // Could be undefined if it's the doctor themselves
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  // Editing fields (only used if it's the doctor themself)
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // Booking fields (only used if it's a patient viewing /:id)
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [description, setDescription] = useState("");

  // Distinguish whether this is our own profile or another doctor's
  const isOwnProfile = !id; // If there's no "id" param, it's the doctor's own profile
  const token = localStorage.getItem("mainSiteToken");

  // Restrict date selection to today onward for booking
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    // If no token, we can't do anything
    if (!token) {
      // If it's our own profile, redirect to doctor login
      // If it's a patient wanting to see a doc, maybe redirect to patient login
      // We'll just pick a default approach
      navigate("/login/doctor");
      return;
    }

    const fetchData = async () => {
      try {
        let fetchUrl;
        if (isOwnProfile) {
          // Fetch the logged-in doctor's data
          fetchUrl = "/api/user";
        } else {
          // We have an :id param, so fetch that specific doctor
          fetchUrl = `/api/doctors/${id}`;
        }

        const response = await fetch(fetchUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch doctor data");
        }

        const data = await response.json();
        setDoctor(data);
        setFormData(data);

        // If data contains a profile_pic in base64 (like from /api/doctors/:id) or from /api/user
        // But if your server sends actual BLOB data, you might need a separate endpoint.
        if (data.profile_pic && typeof data.profile_pic === "string") {
          // data.profile_pic is likely a base64 string
          setProfilePic(`data:image/jpeg;base64,${data.profile_pic}`);
        } else {
          // If it's your own doc from /api/user, you might fetch the pic separately
          // or it might not exist
        }
      } catch (error) {
        console.error("Error:", error);
        // If we fail, assume we need to log in or something
        navigate("/login/doctor");
      }
    };

    fetchData();
  }, [id, isOwnProfile, token, navigate]);

  // Calculate Age
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const todayDate = new Date();
    let age = todayDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = todayDate.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // ---------------------------
  // 1) Doctor Editing (own profile)
  // ---------------------------
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    // For editing own profile
    if (!token) {
      navigate("/login/doctor");
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const response = await fetch("/api/updateDoctorProfile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating profile:", errorData);
        return;
      }
      const updatedDoctor = await response.json();
      setDoctor(updatedDoctor);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // ---------------------------
  // 2) Patient Booking (viewing :id param)
  // ---------------------------
  const handleBookAppointment = () => {
    // If the user isn't logged in, we might redirect to patient login
    // but let's assume we do that check earlier
    setShowPopup(true);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedSlot) {
      alert("Please select date and time first.");
      return;
    }
    try {
      const response = await fetch("/api/bookAppointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor_id: doctor.doctor_id,
          date: selectedDate,
          time: selectedSlot,
          description: description,
        }),
      });
      if (response.ok) {
        setShowPopup(false);
        alert("Appointment booked successfully!");
      } else {
        const errorData = await response.json();
        console.error("Error booking appointment:", errorData);
        alert("Failed to book appointment. Please try again.");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("An error occurred while booking the appointment.");
    }
  };

  // Generate time slots if doctor has start/end times
  const timeSlots = generateTimeSlots(
    doctor?.available_start_time,
    doctor?.available_end_time
  );

  if (!doctor) {
    return (
      <div>
        <Heading />
        <div className="profile-background">
          <div className="profile-container">
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Heading />
      <div className="profile-background">
        <div className="profile-container">
          <div className="profile-header">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="profile-pic" />
            ) : (
              <img
                src="/path/to/default/image.jpg"
                alt="Profile"
                className="profile-pic"
              />
            )}
            <div className="profile-info">
              {isOwnProfile && editMode ? (
                <>
                  <input
                    type="file"
                    name="profile_pic"
                    onChange={handleFileChange}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="current_hospital"
                    value={formData.current_hospital || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee || ""}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <h2>{doctor.name}</h2>
                  <p>
                    <strong>Age:</strong> {calculateAge(doctor.dob)} Years
                  </p>
                  <p>
                    <strong>Hospital:</strong> {doctor.current_hospital}
                  </p>
                  <p>
                    <strong>Fee:</strong> {doctor.fee} PKR
                  </p>
                </>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <>
              <button
                onClick={() => setEditMode(!editMode)}
                className="edit-button"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>
              {editMode && (
                <button onClick={handleSave} className="save-button">
                  Save
                </button>
              )}
            </>
          )}

          <hr />

          <div className="profile-details-container">
            <div className="profile-details">
              <div className="section">
                <h3>Specialization</h3>
                {isOwnProfile && editMode ? (
                  <input
                    type="text"
                    name="specialization"
                    value={
                      Array.isArray(formData.specialization)
                        ? formData.specialization.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialization: e.target.value
                          .split(",")
                          .map((s) => s.trim()),
                      }))
                    }
                  />
                ) : (
                  <ul>
                    {doctor.specialization?.map((spec, index) => (
                      <li key={index}>{spec}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="section">
                <h3>Services</h3>
                {isOwnProfile && editMode ? (
                  <input
                    type="text"
                    name="services"
                    value={
                      Array.isArray(formData.services)
                        ? formData.services.join(", ")
                        : ""
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        services: e.target.value
                          .split(",")
                          .map((s) => s.trim()),
                      }))
                    }
                  />
                ) : (
                  <ul>
                    {doctor.services?.map((service, index) => (
                      <li key={index}>{service}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="section">
                <h3>Experience</h3>
                {isOwnProfile && editMode ? (
                  <>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years || ""}
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="experience_title"
                      value={formData.experience_title || ""}
                      onChange={handleChange}
                    />
                  </>
                ) : (
                  <p>
                    {doctor.experience_years} years, {doctor.experience_title}
                  </p>
                )}
              </div>
              <hr />
              <div className="section">
                <h3>About Doctor</h3>
                <div className="about-section">
                  <h4>Education</h4>
                  {isOwnProfile && editMode ? (
                    <textarea
                      name="education"
                      value={formData.education || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{doctor.education}</p>
                  )}
                </div>
                <div className="about-section">
                  {isOwnProfile && editMode ? (
                    <textarea
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{doctor.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* If it's some other doctor (patient side), show booking UI */}
            {!isOwnProfile && (
              <div className="appointment-section">
                <h3>Book Appointment</h3>
                <p>
                  <label htmlFor="appointment-date">Available Date:</label>
                  <input
                    type="date"
                    id="appointment-date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={today}
                  />
                </p>
                <p>
                  <label htmlFor="time-slots">Available Time:</label>
                  <select
                    id="time-slots"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                  >
                    <option value="">Select Time Slot</option>
                    {timeSlots.map((slot, index) => (
                      <option key={index} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </p>
                <button className="book-btn" onClick={handleBookAppointment}>
                  Book Appointment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Only show this popup if a patient is booking */}
      {!isOwnProfile && showPopup && (
        <div className="popup">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Confirm Appointment</h3>
              <button onClick={() => setShowPopup(false)}>×</button>
            </div>
            <div className="popup-body">
              <p>
                <strong>Doctor:</strong> {doctor.name}
              </p>
              <p>
                <strong>Specialization:</strong>{" "}
                {doctor.specialization?.join(", ")}
              </p>
              <p>
                <strong>Fee:</strong> {doctor.fee} PKR
              </p>
              <p>
                <strong>Date:</strong> {selectedDate}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {timeSlots.find((slot) => slot.value === selectedSlot)?.label ||
                  ""}
              </p>
              <textarea
                placeholder="Brief description of your problem"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button
                className="confirm-appointment-btn"
                onClick={handleConfirmAppointment}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/** Helper functions for time slots. Same as your original snippet. */
function generateTimeSlots(start, end) {
  if (!start || !end) return [];
  const startTime = parseTime(start);
  const endTime = parseTime(end);
  const slots = [];
  if (!startTime || !endTime) return [];
  let currentTime = new Date(startTime);
  while (currentTime < endTime) {
    const nextTime = new Date(currentTime.getTime() + 30 * 60000);
    slots.push({
      label: `${formatTime(currentTime)} - ${formatTime(nextTime)}`,
      value: formatTime24(currentTime),
    });
    currentTime = nextTime;
  }
  return slots;
}
function parseTime(timeString) {
  if (!timeString) return null;
  const [hoursStr, minutesStr] = timeString.split(":");
  if (!hoursStr || !minutesStr) return null;
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  return new Date(1970, 0, 1, hours, minutes);
}
function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const modifier = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  if (minutes < 10) minutes = "0" + minutes;
  return `${hours}:${minutes} ${modifier}`;
}
function formatTime24(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;
  return `${hours}:${minutes}`;
}

export default DoctorProfile;
