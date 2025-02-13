import React from "react";
import "../CSS/About.css";
import Heading from "../Heading";
import Footer from "../Footer";
import oc from "../Images/onlineConsultation.svg";
import reader from "../Images/OCt1.svg"
import exercises from "../Images/13.svg"

function About(){
    
    return (
        <div>
            <Heading />
            <div className="about-container">
                <div className="about-us">
                    <h1 className="about-heading">About EyeCare Consult</h1>
                    <p className="about-desc">EyeCare Consult is your go-to platform for comprehensive eye care. We provide seamless access to top eye specialists, allowing you to book online appointments, view available time slots, and manage your schedule effortlessly. Our services include personalized eye exercises to maintain your vision health and an advanced scan reader for detailed eye health reports. Additionally, you can order medicines, spectacles, and contact lenses directly through our platform, making EyeCare Consult your one-stop solution for all eye care needs.</p>
                </div>
                <div className="about-mission">
                    <h4 className="about-heading">Our Mission</h4>
                    <p class="about-desc-mission">Our mission is to make healthcare <span class="colored-text">Accessible</span>, <span class="colored-text">Transparent</span> &amp; <span class="colored-text">Affordable</span> for the people of Pakistan</p>                    
                </div>
                <div className="about-us" >
                    <h1 className="about-heading">Our Services</h1>
                    <div className="service-card">
                        <div  className="card">
                            <div className="card-img-container"><img src={oc} alt="Online Consultation" className="card-img"/></div>
                            <p className="card-title">Online Consultation</p>
                            <p className="card-desc">Our online consultation services connect you with top eye specialists for convenient and comprehensive care. Book appointments, receive expert advice, and access personalized treatment plans from the comfort of your home.</p>

                        </div>

                        <div  className="card">
                            <div className="card-img-container"><img src={reader} alt="OCT Scan Reader" className="card-img"/></div>
                            <p className="card-title">OCT Scan Reader</p>
                            <p className="card-desc">Our OCT Scan Reader utilizes Artificial Intelligence to accurately predict three eye diseases: <b>Choroidal Neovascularization</b>, <b>Diabetic Macular Edema</b>, and <b>Drusen</b>. Experience advanced diagnostic capabilities for early detection and effective treatment.</p>
                        </div>

                        <div  className="card">
                            <div className="card-img-container"><img src={exercises} alt="Eye Exercises" className="card-img"/></div>
                            <p className="card-title">Eye Exercises</p>
                            <p className="card-desc">Our platform offers personalized eye exercises designed to improve and maintain your vision health. These exercises are tailored to your needs, helping to reduce eye strain and enhance overall eye function.</p>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}

export default About;