  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import "./CSS/ViewProfile.css"; // Ensure this CSS file is imported
  import Heading from "./Heading";
  import VideoCallSection from "./VideoCallSection";


  // -------------------- Subcomponent: Messages (Chat) --------------------
  function AppointmentMessages({ appointmentId, token }) {
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState("");
    const [callStatus, setCallStatus] = useState('no-call');
    const [roomUrl, setRoomUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const fetchMessages = async () => {
        try {
          const res = await fetch(`/api/appointments/${appointmentId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to load messages");
          const data = await res.json();
          setMessages(data);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };
      fetchMessages();
    }, [appointmentId, token]);

    const handleSend = async () => {
      if (!newMsg.trim()) return;
      
      try {
        const res = await fetch(`/api/appointments/${appointmentId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newMsg }),
        });
        if (!res.ok) throw new Error("Failed to send message");
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setNewMsg("");
      } catch (err) {
        console.error("Error sending message:", err);
      }
    };

    return (
      <div className="messages-container">
        <h4 className="messages-header">Messages</h4>
        <div className="messages-list">
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((m) => (
              <div key={m.message_id} className="single-message">
                <b>{m.sender_name} ({m.sender_type}):</b> {m.content}
              </div>
            ))
          )}
        </div>
        <textarea
          className="new-message-textarea"
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          rows={2}
        />
        <button 
          className="send-message-btn" 
          onClick={handleSend}
          disabled={!newMsg.trim()}
        >
          Send
        </button>
      </div>
    );
  }

  // -------------------- Main Component: ViewProfile --------------------
  function ViewProfile() {
    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [profilePic, setProfilePic] = useState(null);

    // For inline editing of a single appointment
    const [editingApptId, setEditingApptId] = useState(null);
    const [apptFormData, setApptFormData] = useState({
      appointment_date: "",
      appointment_time: "",
      description: "",
    });

    // Track whether messages are visible for each appointment
    const [openMessages, setOpenMessages] = useState({});

    const navigate = useNavigate();

    // -------------------- 1. Helper Functions to Format Date/Time --------------------
    function formatDate(rawDate) {
      if (!rawDate) return "N/A";
      const d = new Date(rawDate);
      if (isNaN(d)) return "N/A";
      return d.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    function formatTimeOnly(rawTime) {
      if (!rawTime) return "N/A";
      const dummy = `1970-01-01T${rawTime}`;
      const timeObj = new Date(dummy);
      if (isNaN(timeObj)) return "N/A";
      return timeObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // -------------------- 2. Fetch Profile Picture --------------------
    const fetchProfilePic = async (patientId) => {
      const token = localStorage.getItem("mainSiteToken");
      try {
        const imageResponse = await fetch(
          `/api/patient/profile-pic/${patientId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setProfilePic(reader.result);
          };
          reader.readAsDataURL(imageBlob);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    // -------------------- 3. Fetch User & Appointments on Mount --------------------
    useEffect(() => {
      const fetchUserData = async () => {
        const token = localStorage.getItem("mainSiteToken");
        if (!token) {
          navigate("/login/patient");
          return;
        }
        try {
          // 1) Fetch user data
          const response = await fetch("/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Failed to fetch user data");
          const data = await response.json();

          setUser(data);
          setFormData(data);

          // 2) Fetch profile picture if patient_id is available
          if (data.patient_id) {
            await fetchProfilePic(data.patient_id);
          }

          // 3) Fetch appointments
          const appointmentsResponse = await fetch("/api/patient/appointments", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json();
            setAppointments(appointmentsData);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          navigate("/login/patient");
        }
      };

      fetchUserData();
    }, [navigate]);

    // -------------------- 4. Handle Profile Editing Fields --------------------
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file input
    const handleFileChange = (e) => {
      const { name, files } = e.target;
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    };

    // -------------------- 5. Save (Update) Profile --------------------
    const handleSave = async () => {
      const token = localStorage.getItem("mainSiteToken");
      const formDataToSend = new FormData();

      // Copy all fields from `formData` into FormData object
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      try {
        const response = await fetch("/api/updatePatientProfile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // DO NOT manually set Content-Type when using FormData
          },
          body: formDataToSend,
        });

        if (response.ok) {
          const updatedUser = await response.json();
          setUser(updatedUser);
          setEditMode(false);

          // Optionally store updated user info in local storage
          localStorage.setItem(
            "mainSiteUser",
            JSON.stringify({ ...updatedUser, type: "patient" })
          );

          // Re-fetch updated profile pic if needed
          if (updatedUser.patient_id) {
            await fetchProfilePic(updatedUser.patient_id);
          }
        } else {
          const err = await response.json();
          console.error("Error updating profile:", err);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    };

    // -------------------- 6. Appointment Actions --------------------

    // Cancel an appointment
    const handleCancelAppointment = async (appointmentId) => {
      // 1) Prompt the user first:
      const confirmCancel = window.confirm(
        "Are you sure you want to cancel this appointment?"
      );
      if (!confirmCancel) return; // If they clicked 'Cancel', do nothing

      const token = localStorage.getItem("mainSiteToken");
      try {
        const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to cancel appointment");

        // Remove from local state if successful
        setAppointments((prev) =>
          prev.filter((appt) => appt.appointment_id !== appointmentId)
        );
      } catch (err) {
        console.error("Error canceling appointment:", err);
      }
    };

    // Start editing an appointment
    const handleEditAppointment = (appt) => {
      setEditingApptId(appt.appointment_id);
      setApptFormData({
        appointment_date: appt.appointment_date || "",
        appointment_time: appt.appointment_time || "",
        description: appt.description || "",
      });
    };

    // Save the updated appointment
    const handleUpdateAppointment = async (appointmentId) => {
      const token = localStorage.getItem("mainSiteToken");
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: apptFormData.appointment_date,
            time: apptFormData.appointment_time,
            description: apptFormData.description,
          }),
        });
        if (!res.ok) throw new Error("Failed to update appointment");
        const updated = await res.json();

        // updated.appointment should have the new row
        setAppointments((prev) =>
          prev.map((original) =>
            original.appointment_id === appointmentId
              ? updated.appointment
              : original
          )
        );

        // Exit edit mode
        setEditingApptId(null);
        setApptFormData({
          appointment_date: "",
          appointment_time: "",
          description: "",
        });
      } catch (error) {
        console.error("Error updating appointment:", error);
      }
    };

    // Cancel editing an appointment
    const handleCancelEdit = () => {
      setEditingApptId(null);
      setApptFormData({
        appointment_date: "",
        appointment_time: "",
        description: "",
      });
    };

    // Toggle showing messages for an appointment
    const toggleMessages = (appointmentId) => {
      setOpenMessages((prev) => ({
        ...prev,
        [appointmentId]: !prev[appointmentId],
      }));
    };

    // -------------------- 7. Render --------------------
    if (!user) return null;

    return (
      <div>
        <Heading />
        <div className="profile-background">
          <div className="profile-container">
            {/* ---------------- Profile Header ---------------- */}
            <div className="profile-header">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="profile-pic" />
              ) : (
                <img
                  src="/path/to/default/profile/picture.jpg"
                  alt="Profile"
                  className="profile-pic"
                />
              )}

              <div className="profile-info">
                {editMode ? (
                  <>
                    <input
                      type="file"
                      name="profile_pic"
                      onChange={handleFileChange}
                    />
                    <input
                      type="text"
                      name="fname"
                      value={formData.fname || ""}
                      className="Doc-input"
                      onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="lname"
                      value={formData.lname || ""}
                      className="Doc-input"
                      onChange={handleChange}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      className="Doc-input"
                      onChange={handleChange}
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="New Password"
                      className="Doc-input"
                      onChange={handleChange}
                    />
                    <input
                      type="password"
                      name="passwordConfirm"
                      placeholder="Confirm Password"
                      className="Doc-input"
                      onChange={handleChange}
                    />
                    <select
                      name="gender"
                      className="Doc-input"
                      value={formData.gender || ""}
                      onChange={handleChange}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </>
                ) : (
                  <>
                    <h2 id="left-align">{`${user.fname} ${user.lname}`}</h2>
                    <p>
                      <b>Email:</b> {user.email}
                    </p>
                    <p>
                      <b>Gender:</b> {user.gender}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Edit / Save Buttons */}
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

            {/* ---------------- Profile Details ---------------- */}
            <div className="profile-details">
              {/* ---------- Appointments Section ---------- */}
              <div className="section">
                <h3 className="P-about">Your Appointments</h3>
                {appointments.length === 0 ? (
                  <p>No appointments have been made.</p>
                ) : (
                  appointments.map((appointment) => {
                    const showDate =
                      appointment.appointment_date &&
                      formatDate(appointment.appointment_date);
                    const showTime =
                      appointment.appointment_time &&
                      formatTimeOnly(appointment.appointment_time);

                    // If this appointment is in editing mode
                    if (editingApptId === appointment.appointment_id) {
                      return (
                        <div
                          key={appointment.appointment_id}
                          className="appointment-card"
                        >
                          <h4>
                            Editing Appointment #{appointment.appointment_id}
                          </h4>
                          <label>Date:</label>
                          <input
                            type="date"
                            value={apptFormData.appointment_date}
                            onChange={(e) =>
                              setApptFormData((prev) => ({
                                ...prev,
                                appointment_date: e.target.value,
                              }))
                            }
                          />
                          <label>Time:</label>
                          <input
                            type="time"
                            value={apptFormData.appointment_time}
                            onChange={(e) =>
                              setApptFormData((prev) => ({
                                ...prev,
                                appointment_time: e.target.value,
                              }))
                            }
                          />
                          <label>Description:</label>
                          <input
                            type="text"
                            value={apptFormData.description}
                            onChange={(e) =>
                              setApptFormData((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                          />
                          <button
                            className="update-appointment-btn"
                            onClick={() =>
                              handleUpdateAppointment(appointment.appointment_id)
                            }
                          >
                            Save
                          </button>
                          <button
                            className="cancel-appointment-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      );
                    } else {
                      // Normal read-only appointment card
                      return (
                        <div
                          key={appointment.appointment_id}
                          className="appointment-card"
                        >
                          <p>
                            <b>Appointment #:</b> {appointment.appointment_id}
                          </p>
                          <p>
                            <b>Date:</b> {showDate || "N/A"}
                          </p>
                          <p>
                            <b>Time:</b> {showTime || "N/A"}
                          </p>
                          <p>
                            <b>Doctor:</b> {appointment.doctor_name || "N/A"}
                          </p>
                          <p>
                            <b>Specialization:</b>{" "}
                            {appointment.specialization
                              ? appointment.specialization.join(", ")
                              : "N/A"}
                          </p>
                          <p>
                            <b>Description:</b> {appointment.description || "N/A"}
                          </p>
                          <p>
                            <b>Prescription:</b>{" "}
                            {appointment.prescription || "No prescription yet"}
                          </p>
                          <p>
                            <b>Fee:</b>{" "}
                            {appointment.fee ? `${appointment.fee} PKR` : "N/A"}
                          </p>
                          {/* Edit & Cancel Buttons */}
                          <button
                            className="update-appointment-btn"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            Edit
                          </button>
                          <button
                            className="cancel-appointment-btn"
                            onClick={() =>
                              handleCancelAppointment(appointment.appointment_id)
                            }
                          >
                            Cancel
                          </button>

                        {/* Add Video Call Section */}
                        <VideoCallSection 
                            appointmentId={appointment.appointment_id}
                            token={localStorage.getItem("mainSiteToken")}
                          />

                        <hr />
                          <hr />
                          {/* Messages Toggle */}
                          <button
                            onClick={() =>
                              toggleMessages(appointment.appointment_id)
                            }
                          >
                            {openMessages[appointment.appointment_id]
                              ? "Hide Messages"
                              : "Show Messages"}
                          </button>
                          {/* Show chat if toggled */}
                          {openMessages[appointment.appointment_id] && (
                            <AppointmentMessages
                              appointmentId={appointment.appointment_id}
                              token={localStorage.getItem("mainSiteToken")}
                            />
                          )}
                        </div>
                      );
                    }
                  })
                )}
              </div>

              <hr />

              {/* ---------- Description Section ---------- */}
              <div className="section">
                <h3 className="P-about">Description</h3>
                {editMode ? (
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    className="Doc-description"
                    onChange={handleChange}
                  ></textarea>
                ) : (
                  <p>{user.description || "No description yet."}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default ViewProfile;
