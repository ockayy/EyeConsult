import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/HomePage.css";
import Footer from "../Footer";
import DHeading from "../DHeading";
import OCT_working_illus from "../Images/OCT-Working.svg";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login/patient");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("User not authenticated");
        }
        const data = await response.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data)); // Store essential user data
      } catch (error) {
        console.error("Error fetching user:", error);
        navigate("/login/patient");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login/patient");
  };

  return (
    <div className="page-container">
      <DHeading user={user} onLogout={handleLogout} />
      <div className="content-wrap">
        <div className="container">
          <h1 className="container-Heading">
            Find <span className="opt">Best Ophthalmology</span> Near You
          </h1>
        </div>
        <div className="container2">
          <h2>How to Book an Appointment</h2>
          <div className="Vid-List">
            <div className="">
              <ul className="List">
                <li><b>Select a Timeslot:</b> Choose a timeslot that best fits your schedule from the available options.</li>
                <li><b>Search for Your Doctor:</b> Easily find your desired doctor using our comprehensive search feature.</li>
                <li><b>Confirm Your Appointment:</b> Click 'Book Appointment' to secure your visit.</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="container2">
          <h2 style={{paddingBottom:'30px'}}>How Our OCT Scan Reader Works</h2>
          <div className="Vid-List" style={{paddingBottom:'100px'}}>
            <div>
              <img src={OCT_working_illus} alt="eye scan illustration" />
            </div>
            <div className="Oct-desc">
              <p>
                Our Optical Coherence Tomography Scan Reader provides a seamless way for users to gain insights from their eye scans. To use the service, simply <b>take a clear, stable picture of your OCT scan</b> in a well-lit environment. <b>Upload the image to our website</b>, and our advanced Scan Reader will analyze it. The tool processes the image to extract detailed information and <b>generates a comprehensive summary</b> of the findings, offering you valuable insights into your eye health. This user-friendly process ensures you can easily understand your scan results from the comfort of your home.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;
