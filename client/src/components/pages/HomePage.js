// src/components/HomePage.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/HomePage.css";
import Footer from "../Footer";
import Heading from "../Heading";
import OCT_working_illus from "../Images/OCT-Working.svg";

function HomePage() {
  // State for newsletter subscription email.
  const [subscriptionEmail, setSubscriptionEmail] = useState("");

  // Simple email validation regex.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailRegex.test(subscriptionEmail)) {
      alert("Enter correct email");
      return;
    }
    alert("Thank you for subscribing!");
    setSubscriptionEmail("");
  };

  return (
    <div className="page-container">
      {/* Header Component (its buttons will remain styled via Heading.css) */}
      <Heading />

      <div className="content-wrap">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>
              Find <span className="highlight">Top Ophthalmologists</span> Near
              You
            </h1>
            <p>
              Connect with certified professionals and access cutting-edge
              diagnostic services — all from the comfort of your home.
            </p>
            <div className="hero-buttons">
              <Link to="/login/patient" className="hp-btn">
                Login as Patient
              </Link>
              <Link to="/login/doctor" className="hp-btn">
                Login as Doctor
              </Link>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="info-section">
          <h2>How It Works</h2>
          <div className="info-cards">
            <div className="info-card">
              <h3>Select a Timeslot</h3>
              <p>Choose a time that fits your schedule with ease.</p>
            </div>
            <div className="info-card">
              <h3>Search Your Doctor</h3>
              <p>Find a qualified professional using our search tool.</p>
            </div>
            <div className="info-card">
              <h3>Confirm Appointment</h3>
              <p>Secure your slot instantly with a simple click.</p>
            </div>
          </div>
        </section>

        {/* OCT Scan Reader Section */}
        <section className="oct-section">
          <h2>How OCT Scan Reader Works</h2>
          <div className="oct-content">
            <img src={OCT_working_illus} alt="OCT Scan Illustration" />
            <p>
              Upload your OCT scan to receive a comprehensive analysis powered
              by our AI algorithm, providing actionable insights for your eye
              health.
            </p>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="cta-section">
          <h2>Join Our Community</h2>
          <p>
            Whether you're seeking care or expanding your practice, sign up
            today to be part of our growing network.
          </p>
          <div className="cta-buttons">
            <Link to="/signup/patient" className="hp-btn">
              Sign Up as Patient
            </Link>
            <Link to="/signup/doctor" className="hp-btn">
              Sign Up as Doctor
            </Link>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <h2>What Our Users Say</h2>
          <div className="testimonial">
            <p>
              “This platform made finding an ophthalmologist so easy. The
              appointment process was seamless and I felt well cared for.”
            </p>
            <small>– Jane Doe, Patient</small>
          </div>
          <div className="testimonial">
            <p>
              “As a doctor, I love the ease with which I can connect with new
              patients. Highly recommend this service!”
            </p>
            <small>– Dr. John Smith, Ophthalmologist</small>
          </div>
        </section>

        {/* Newsletter Subscription Section */}
        <section className="newsletter-section">
          <h2>Stay Updated</h2>
          <p>
            Subscribe to our newsletter for the latest updates and health tips.
          </p>
          <div>
            <input
              type="email"
              placeholder="Your email address"
              value={subscriptionEmail}
              onChange={(e) => setSubscriptionEmail(e.target.value)}
            />
            <button className="subscribe-button" onClick={handleSubscribe}>
              Subscribe
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;
