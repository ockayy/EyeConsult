import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Heading from "./Heading";
import AppointmentCard from "./AppointmentCard";
import "./CSS/ViewAppointment.css";

function PatientViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("mainSiteToken");

  useEffect(() => {
    if (!token) {
      navigate("/login/patient");
      return;
    }

    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/patient/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [token, navigate]);

  // Cancel an appointment
  const handleCancel = async (appointmentId) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to cancel appointment");
      setAppointments((prev) =>
        prev.filter((appt) => appt.appointment_id !== appointmentId)
      );
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  // Start a call (logs it in the DB or triggers phone dial in a real app)
  const handleStartCall = async (appointmentId) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/calls`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error starting call");
      const callData = await res.json();
      alert("Call started! Call ID: " + callData.call_id);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  return (
    <div>
      <Heading />
      <div className="appointments-container">
        <h1>My Appointments</h1>

        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          appointments.map((appt) => (
            <AppointmentCard
              key={appt.appointment_id}
              appointment={appt}
              onCancel={handleCancel}
              onStartCall={handleStartCall}
              token={token}
              isDoctor={false} // ensures no prescription editing UI appears
            />
          ))
        )}
      </div>
    </div>
  );
}

export default PatientViewAppointments;
