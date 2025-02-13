// DoctorDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/DoctorDashboard.css";
import Footer from "../Footer";
import Heading from "../Heading"; // or the correct relative path
import AppointmentCard from "../AppointmentCard"; // Import the AppointmentCard component

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // UPDATED: Retrieve the same localStorage key used throughout your app
    const token = localStorage.getItem("mainSiteToken");
    if (!token) {
      navigate("/login/doctor");
      return;
    }

    const fetchDoctorData = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // pass the token
          },
        });

        if (!response.ok) {
          throw new Error("Doctor not authenticated");
        }

        const data = await response.json();
        setDoctor(data);

        // Fetch doctor's appointments
        const appointmentsResponse = await fetch("/api/doctor/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!appointmentsResponse.ok) {
          throw new Error("Error fetching appointments");
        }

        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        navigate("/login/doctor");
      }
    };

    fetchDoctorData();
  }, [navigate]);

  const handleCancel = async (appointmentId) => {
    try {
      const token = localStorage.getItem("mainSiteToken");
      await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update the state to remove the canceled appointment
      setAppointments(
        appointments.filter((app) => app.appointment_id !== appointmentId)
      );
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  return (
    <div className="doctor-dashboard">
      <Heading />{" "}
      <div className="appointments">
        <h2>Your Appointments</h2>
        {appointments.length === 0 ? (
          <p>No appointments scheduled.</p>
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointment_id}
              appointment={appointment}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>
      <Footer />
    </div>
  );
}

export default DoctorDashboard;
