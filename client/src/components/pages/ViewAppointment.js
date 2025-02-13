// src/components/pages/ViewAppointments.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../AppointmentCard";
import Heading from "../Heading"; // or wherever your Heading component is
import "../CSS/ViewAppointment.css";

function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("mainSiteToken");

  useEffect(() => {
    if (!token) {
      navigate("/login/doctor");
      return;
    }

    const fetchData = async () => {
      try {
        // 1) Fetch doctor user
        const doctorRes = await fetch("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!doctorRes.ok) throw new Error("Unable to fetch doctor info");
        const doctorData = await doctorRes.json();
        setDoctor(doctorData);

        // 2) Fetch appointments
        const apptRes = await fetch("/api/doctor/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!apptRes.ok) throw new Error("Unable to fetch appointments");
        const apptData = await apptRes.json();
        setAppointments(apptData);
      } catch (err) {
        console.error("Error fetching data:", err);
        navigate("/login/doctor");
      }
    };

    fetchData();
  }, [token, navigate]);

  // Cancel an appointment
  const handleCancel = async (appointmentId) => {
    // Show a confirmation dialog
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmCancel) return; // If user clicked "Cancel," do nothing

    const token = localStorage.getItem("mainSiteToken");
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to cancel appointment");

      // Remove the canceled appointment from the current list
      setAppointments((prev) =>
        prev.filter((appt) => appt.appointment_id !== appointmentId)
      );
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  // Update prescription & status
  const handleUpdatePrescription = async (
    appointmentId,
    prescription,
    status
  ) => {
    try {
      const res = await fetch(
        `/api/appointments/${appointmentId}/prescription`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prescription, status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update prescription");

      const data = await res.json();
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === appointmentId ? data.appointment : appt
        )
      );
    } catch (err) {
      console.error("Error updating prescription:", err);
    }
  };

  // **Update date/time** for appointment
  const handleUpdateDateTime = async (appointmentId, date, time) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date, // 'appointment_date' on the server
          time, // 'appointment_time' on the server
        }),
      });
      if (!res.ok) throw new Error("Failed to update appointment date/time");

      const data = await res.json();

      // Update local state with the new appointment data
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === appointmentId ? data.appointment : appt
        )
      );
    } catch (err) {
      console.error("Error updating date/time:", err);
    }
  };

  // Start a call (create a calls row or dial phone)
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
        <h1>Doctor Appointments</h1>
        {appointments.length === 0 ? (
          <p>No appointments scheduled.</p>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointment_id}
              appointment={appointment}
              onCancel={handleCancel}
              onUpdatePrescription={handleUpdatePrescription}
              onUpdateDateTime={handleUpdateDateTime} // <-- pass the new function
              onStartCall={handleStartCall}
              token={token}
              isDoctor
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ViewAppointments;
