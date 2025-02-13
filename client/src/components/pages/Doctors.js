// Doctors.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Heading from '../Heading';
import DoctorCard from '../DoctorCard';
import Footer from '../Footer';
import '../CSS/Doctors.css';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, []);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div>
      <Heading />
      <div className="doctors-container">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.doctor_id}
            doctor_id={doctor.doctor_id}
            name={doctor.name}
            age={calculateAge(doctor.dob)}
            specialization={doctor.specialization}
            hospital={doctor.current_hospital}
            imageUrl={doctor.profile_pic}
            imageType={doctor.profile_pic_type}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Doctors;
