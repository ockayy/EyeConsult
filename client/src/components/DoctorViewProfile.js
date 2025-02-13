import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/ViewProfile.css";
import Heading from "./Heading"; // or the correct relative path

function DoctorViewProfile() {
  const [doctor, setDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [selectedSpecializations, setSelectedSpecializations] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const navigate = useNavigate();
  const specializations = [
    "Cornea and External Disease",
    "Glaucoma",
    "Retina/Vitreous Surgery",
    "Neuro-Ophthalmology",
    "Oculoplastics/Orbital Surgery",
    "Pediatric Ophthalmology",
    "Uveitis",
    "Refractive Surgery",
    "Ocular Pathology",
    "Ocular Immunology",
    "Ophthalmic Genetics",
    "Geriatric Ophthalmology",
  ];
  
  const services = [
    "Comprehensive Eye Exams",
    "Vision Correction",
    "Medical Eye Care",
    "Surgical Eye Care",
    "Pediatric Eye Care",
    "Emergency Eye Care",
    "Low Vision Services",
    "Dry Eye Treatment",
    "Neuro-Ophthalmology",
    "Oculoplastics",
    "Laser Eye Surgery",
    "Cataract Surgery",
    "Contact Lens Services",
    "Teleophthalmology",
  ];

  useEffect(() => {
    const fetchDoctorData = async () => {
      // UPDATED: Retrieve 'mainSiteToken' from localStorage
      const token = localStorage.getItem("mainSiteToken");
      if (!token) {
        navigate("/login/doctor");
        return;
      }

      try {
        // Fetch the logged-in doctor's profile
        const response = await fetch("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Unable to authenticate doctor");
          navigate("/login/doctor");
          return;
        }

        const data = await response.json();
        setDoctor(data);
        setFormData(data);
        setSelectedSpecializations(data.specialization || []);
        setSelectedServices(data.services || []);

        // If doctor has a profile_pic saved, fetch it separately
        if (data.profile_pic) {
          const imageResponse = await fetch(
            `/api/doctor/profile-pic/${data.doctor_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!imageResponse.ok) {
            console.error("Error fetching doctor profile picture");
            return;
          }

          const imageBlob = await imageResponse.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePic(reader.result);
          };
          reader.readAsDataURL(imageBlob);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        navigate("/login/doctor");
      }
    };

    fetchDoctorData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    // Append the file to formData
    setFormData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  };

  const handleSpecializationChange = (specialization) => {
    setSelectedSpecializations(prev => {
      const newSpecializations = prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization];
      
      // Update formData as well
      setFormData(prevData => ({
        ...prevData,
        specialization: newSpecializations
      }));
      
      return newSpecializations;
    });
  };

  const handleServicesChange = (service) => {
    setSelectedServices(prev => {
      const newServices = prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service];
      
      // Update formData as well
      setFormData(prevData => ({
        ...prevData,
        services: newServices
      }));
      
      return newServices;
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("mainSiteToken");
    if (!token) {
      navigate("/login/doctor");
      return;
    }

    // Convert our local 'formData' object to FormData for file upload
    const formDataToSend = new FormData();

    // For arrays like specialization/services, we need to stringify them
    Object.keys(formData).forEach((key) => {
      if (key === "specialization" || key === "services") {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch("/api/updateDoctorProfile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // NOTE: Do NOT set "Content-Type" when using FormData;
          // it gets auto-set.
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedDoctor = await response.json();
        setDoctor(updatedDoctor);
        setEditMode(false);
      } else {
        const errorData = await response.json();
        console.error("Error updating profile:", errorData);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  useEffect(() => {
    const textareas = document.querySelectorAll('.auto-resize-textarea');
    textareas.forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }, [formData]);


  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (!doctor) return null;

  return (
    <div>
      <Heading />{" "}
      <div className="profile-background">
        <div className="profile-container">
          <div className="profile-header">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Profile Picture"
                className="profile-pic"
              />
            ) : (
              <img
                src="/path/to/default/profile/picture.jpg"
                alt="Profile Picture"
                className="profile-pic"
              />
            )}

            <div className="profile-info">
              {editMode ? (
                <>
                  {/* Upload new profile pic */}
                  <input
                    type="file"
                    name="profile_pic"
                    onChange={handleFileChange}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
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
                  <h2 id="left-align">{doctor.name}</h2>
                  <p>
                    <b>Age:</b> {calculateAge(doctor.dob)} Years
                  </p>
                  <p>{doctor.current_hospital}</p>
                  <p>
                    <b>Fee:</b> {doctor.fee} PKR
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Buttons for editing/saving */}
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

          <hr />
          <div className="profile-details"> 
          <div className="section">
              <h3 id="left-align">Specialization</h3>
              {editMode ? (
                <div className="checkbox-group">
                  {specializations.map((spec) => (
                    <div key={spec} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`spec-${spec}`}
                        checked={selectedSpecializations.includes(spec)}
                        onChange={() => handleSpecializationChange(spec)}
                      />
                      <label htmlFor={`spec-${spec}`}>{spec}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <ul>
                  {selectedSpecializations.map((spec, index) => (
                    <li key={index}>{spec}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="section">
              <h3 id="left-align" >Services</h3>
              {editMode ? (
                <div className="checkbox-group">
                  {services.map((service) => (
                    <div key={service} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`service-${service}`}
                        checked={selectedServices.includes(service)}
                        onChange={() => handleServicesChange(service)}
                      />
                      <label htmlFor={`service-${service}`}>{service}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <ul>
                  {selectedServices.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="section">
              <h3 id="left-align">Experience</h3>
              {editMode ? (
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

            <div className="section">
              <h3 id="left-align">Available</h3>
              {editMode ? (
                <>
                  <input
                    type="time"
                    name="available_start_time"
                    value={formData.available_start_time || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="time"
                    name="available_end_time"
                    value={formData.available_end_time || ""}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <p>
                  {doctor.available_start_time} to {doctor.available_end_time}
                </p>
              )}
            </div>

            <hr />

            <div className="section">
              <h3 id="left-align">About Doctor</h3>
              <div className="about-section">
                <h4 id="left-align">Education</h4>
                {editMode ? (
                  <textarea
                    className="auto-resize-textarea"
                    name="education"
                    value={formData.education || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{doctor.education}</p>
                )}
              </div>
              <div className="about-section">
                {editMode ? (
                  <textarea
                    className="auto-resize-textarea"
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
        </div>
      </div>
    </div>
  );
}

export default DoctorViewProfile;
