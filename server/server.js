// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./database");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const axios = require('axios');
require("dotenv").config();

const app = express();
const adminRoutes = require("./adminRoutes"); // Import the admin routes
const storeRoutes = require("./storeRoutes");

const { authenticateToken } = require("./roleAuth"); // Import the shared middleware

// Middleware setup
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Near the top of your server.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://eyecareconsult.onrender.com', // Add your frontend URL when deployed
  process.env.NODE_ENV === 'production' ? 'https://eyecareconsult.onrender.com' : undefined
].filter(Boolean);

app.use(cors({
    origin: "https://eyecareconsult.onrender.com",
    credentials: true
}));

// File upload setup using multer
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit for file uploads

const JWT_SECRET = process.env.JWT_SECRET;

// Use the routes
app.use("/api/store", storeRoutes);
app.use("/api/admin", adminRoutes);

// Patient signup route
app.post("/api/signuppatient", async (req, res) => {
  try {
    const { fname, lname, gender, phoneno, email, password } = req.body;

    // Input validation regex
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{11}$/;

    // Validation checks
    if (!fname || !nameRegex.test(fname)) {
      return res.status(400).json({ error: "First name should contain only letters" });
    }
    if (!lname || !nameRegex.test(lname)) {
      return res.status(400).json({ error: "Last name should contain only letters" });
    }
    if (!phoneno || !phoneRegex.test(phoneno)) {
      return res.status(400).json({ error: "Phone number must be 11 digits" });
    }
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!gender) {
      return res.status(400).json({ error: "Please select a gender" });
    }

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM patient WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash sensitive information
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPhoneno = await bcrypt.hash(phoneno, 10);

    // Insert user into database
    const newUser = await pool.query(
      "INSERT INTO patient (fname, lname, gender, phoneno, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [fname, lname, gender, hashedPhoneno, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].patient_id, type: "patient", site: "main" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error("Error in SignUp:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Doctor signup route
app.post(
  "/api/signupdoctor",
  upload.fields([
    { name: "profile_pic", maxCount: 1 },
    { name: "degree_pic", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        phoneno,
        cnic,
        dob,
        email,
        password,
        experience_years,
        experience_title,
        current_hospital,
        fee,
        description,
        available_start_time,
        available_end_time,
        specializations,
        services,
      } = req.body;

      // Input validation regex
      const nameRegex = /^[A-Za-z\s]+$/;
      const emailRegex = /^[^\s@]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
      const phoneRegex = /^[0-9]{11}$/;
      const cnicRegex = /^[0-9]{13}$/;

      // Validate required files
      if (!req.files["profile_pic"]) {
        return res.status(400).json({ error: "Profile picture is required" });
      }
      if (!req.files["degree_pic"]) {
        return res.status(400).json({ error: "Degree picture is required" });
      }

      // Validate name
      if (!name || !nameRegex.test(name)) {
        return res.status(400).json({ error: "Name should contain only letters" });
      }

      // Validate phone number
      if (!phoneno || !phoneRegex.test(phoneno)) {
        return res.status(400).json({ error: "Phone number must be 11 digits" });
      }

      // Validate CNIC
      if (!cnic || !cnicRegex.test(cnic)) {
        return res.status(400).json({ error: "CNIC must be 13 digits without dashes" });
      }

      // Validate email
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      // Validate password
      if (!password || password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Validate date of birth
      if (!dob) {
        return res.status(400).json({ error: "Date of birth is required" });
      }
      const age = new Date().getFullYear() - new Date(dob).getFullYear();
      if (age < 25) {
        return res.status(400).json({ error: "Doctor must be at least 25 years old" });
      }

      // Validate experience years
      if (!experience_years || isNaN(experience_years) || experience_years < 0 || experience_years > 50) {
        return res.status(400).json({ error: "Please enter valid experience (0-50 years)" });
      }

      // Validate current hospital
      if (!current_hospital || current_hospital.length < 3) {
        return res.status(400).json({ error: "Hospital name must be at least 3 characters" });
      }

      // Validate fee
      if (!fee || isNaN(fee) || fee <= 0) {
        return res.status(400).json({ error: "Please enter a valid fee amount" });
      }

      // Validate description
      if (!description || description.length < 50) {
        return res.status(400).json({ error: "Description must be at least 50 characters" });
      }

      // Validate time range
      if (!available_start_time || !available_end_time) {
        return res.status(400).json({ error: "Both start and end times are required" });
      }
      const start = new Date(`2000/01/01 ${available_start_time}`);
      const end = new Date(`2000/01/01 ${available_end_time}`);
      if (end <= start) {
        return res.status(400).json({ error: "End time must be after start time" });
      }

      // Process specializations and services
      const specializationArray = Array.isArray(specializations)
        ? JSON.parse(specializations).map((item) => item.toString())
        : [];
      const servicesArray = Array.isArray(services)
        ? JSON.parse(services).map((item) => item.toString())
        : [];

      if (specializationArray.length === 0) {
        return res.status(400).json({ error: "Please select at least one specialization" });
      }
      if (servicesArray.length === 0) {
        return res.status(400).json({ error: "Please select at least one service" });
      }

      // Check if email already exists
      const existingUser = await pool.query(
        "SELECT * FROM doctors WHERE email = $1",
        [email]
      );
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Check if CNIC already exists
      const existingCNIC = await pool.query(
        "SELECT * FROM doctors WHERE cnic = $1",
        [cnic]
      );
      if (existingCNIC.rows.length > 0) {
        return res.status(400).json({ error: "CNIC already registered" });
      }

      // Format arrays for PostgreSQL
      const formatArray = (arr) => {
        return arr.length === 0 ? "{}" : `"{${arr.join('","')}}"`;
      };

      // Get file buffers
      const profile_pic = req.files["profile_pic"][0].buffer;
      const degree_pic = req.files["degree_pic"][0].buffer;

      // Hash password and sensitive info
      const hashedPassword = await bcrypt.hash(password, 10);
      const hashedCNIC = await bcrypt.hash(cnic, 10);

      // Insert into database
      const newDoctor = await pool.query(
        `INSERT INTO doctors (
          name, phoneno, cnic, dob, email, password, profile_pic, degree_pic,
          experience_years, experience_title, current_hospital, fee, description,
          available_start_time, available_end_time, specialization, services
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *`,
        [
          name,
          phoneno,
          hashedCNIC,
          dob,
          email,
          hashedPassword,
          profile_pic,
          degree_pic,
          experience_years,
          experience_title,
          current_hospital,
          fee,
          description,
          available_start_time,
          available_end_time,
          formatArray(specializationArray),
          formatArray(servicesArray),
        ]
      );

      const doctor = newDoctor.rows[0];
      const token = jwt.sign(
        { id: doctor.doctor_id, type: "doctor", site: "main" },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token, user: doctor });
    } catch (error) {
      console.error("Error during doctor signup:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// server.js

// Patient login route
app.post("/api/loginpatient", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userQuery = await pool.query(
      "SELECT * FROM patient WHERE email = $1",
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = userQuery.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate JWT token with 'type' and 'site' fields
    const token = jwt.sign(
      { id: user.patient_id, type: "patient", site: "main" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        patient_id: user.patient_id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        type: "patient", // Ensure 'type' is included
      },
    });
  } catch (err) {
    console.error("Error in Login", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Doctor login route
app.post("/api/logindoctor", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userQuery = await pool.query(
      "SELECT * FROM doctors WHERE email = $1",
      [email]
    );
    if (userQuery.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = userQuery.rows[0];
    const hashedPassword = user.password;

    if (!hashedPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const validPassword = await bcrypt.compare(password, hashedPassword);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.doctor_id, type: "doctor", site: "main" },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Include only essential information
    const userResponse = {
      doctor_id: user.doctor_id,
      name: user.name,
      email: user.email,
      current_hospital: user.current_hospital,
      specialization: user.specialization,
      services: user.services,
      type: "doctor", // Add this line
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error("Error in Login", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Protected route to get user profile
app.get("/api/user", authenticateToken([], "main"), async (req, res) => {
  try {
    let user;
    if (req.user.type === "patient") {
      user = await pool.query("SELECT * FROM patient WHERE patient_id = $1", [
        req.user.id,
      ]);
    } else if (req.user.type === "doctor") {
      user = await pool.query("SELECT * FROM doctors WHERE doctor_id = $1", [
        req.user.id,
      ]);
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (user.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    // Exclude sensitive information
    const userData = { ...user.rows[0] };
    delete userData.password;
    delete userData.reset_token;
    delete userData.reset_token_expiry;

    res.json(userData);
  } catch (err) {
    console.error("Error fetching user details", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update Doctor Profile
app.put(
  "/api/updateDoctorProfile",
  authenticateToken(["doctor"], "main"),
  upload.fields([{ name: "profile_pic", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        name,
        current_hospital,
        fee,
        experience_years,
        experience_title,
        available_start_time,
        available_end_time,
        education,
        description,
        specialization,
        services,
      } = req.body;
      const profile_pic = req.files["profile_pic"]
        ? req.files["profile_pic"][0].buffer
        : null;
      const profile_pic_type = req.files["profile_pic"]
        ? req.files["profile_pic"][0].mimetype.split("/")[1]
        : null;

      const parsedSpecializations = JSON.parse(specialization || "[]");
      const parsedServices = JSON.parse(services || "[]");

      const updatedDoctor = await pool.query(
        `UPDATE doctors SET name = $1, current_hospital = $2, fee = $3, experience_years = $4, experience_title = $5, available_start_time = $6, available_end_time = $7, education = $8, description = $9, specialization = $10, services = $11, profile_pic = COALESCE($12, profile_pic), profile_pic_type = COALESCE($13, profile_pic_type)
            WHERE doctor_id = $14 RETURNING *`,
        [
          name,
          current_hospital,
          fee,
          experience_years,
          experience_title,
          available_start_time,
          available_end_time,
          education,
          description,
          parsedSpecializations,
          parsedServices,
          profile_pic,
          profile_pic_type,
          req.user.id,
        ]
      );

      res.json(updatedDoctor.rows[0]);
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// This route must exist to serve patient images
app.get(
  "/api/patient/profile-pic/:patientId",
  authenticateToken(["patient", "doctor"], "main"),
  async (req, res) => {
    try {
      const { patientId } = req.params;
      const result = await pool.query(
        "SELECT profile_pic, profile_pic_type FROM patient WHERE patient_id = $1",
        [patientId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const { profile_pic, profile_pic_type } = result.rows[0];
      if (!profile_pic) {
        return res.status(404).json({ error: "No profile pic" });
      }

      // Return the image data with correct Content-Type
      res.setHeader("Content-Type", `image/${profile_pic_type}`);
      return res.send(profile_pic);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

// Get Doctor Profile Picture
app.get(
  "/api/doctor/profile-pic/:doctorId",
  authenticateToken(["doctor", "patient"], "main"),
  async (req, res) => {
    try {
      const { doctorId } = req.params;
      const result = await pool.query(
        "SELECT profile_pic, profile_pic_type FROM doctors WHERE doctor_id = $1",
        [doctorId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      const { profile_pic, profile_pic_type } = result.rows[0];
      if (!profile_pic) {
        return res.status(404).json({ error: "Profile picture not found" });
      }

      res.setHeader("Content-Type", `image/${profile_pic_type}`);
      res.send(profile_pic);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get All Doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await pool.query(
      "SELECT doctor_id, name, dob, specialization, current_hospital, encode(profile_pic, 'base64') as profile_pic FROM doctors"
    );
    res.json(doctors.rows);
  } catch (err) {
    console.error("Error fetching doctors", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Doctor by ID
app.get("/api/doctors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await pool.query(
      "SELECT * FROM doctors WHERE doctor_id = $1",
      [id]
    );
    if (doctor.rows.length === 0)
      return res.status(404).json({ error: "Doctor not found" });

    const doctorData = doctor.rows[0];
    const profilePicBase64 = doctorData.profile_pic
      ? Buffer.from(doctorData.profile_pic).toString("base64")
      : null;
    const degreePicBase64 = doctorData.degree_pic
      ? Buffer.from(doctorData.degree_pic).toString("base64")
      : null;

    const doctorWithImages = {
      ...doctorData,
      profile_pic: profilePicBase64,
      degree_pic: degreePicBase64,
    };

    res.json(doctorWithImages);
  } catch (err) {
    console.error("Error fetching doctor", err);
    res.status(500).json({ error: "Server error" });
  }
});

// In server.js or your routes file
app.put(
  "/api/appointments/:id",
  authenticateToken(["patient", "doctor"], "main"), // either can do it
  async (req, res) => {
    const appointmentId = req.params.id;
    const { date, time, description } = req.body;

    try {
      // 1) Verify the user is authorized to update THIS appointment
      let appointmentCheck;
      if (req.user.type === "patient") {
        appointmentCheck = await pool.query(
          "SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2",
          [appointmentId, req.user.id]
        );
      } else if (req.user.type === "doctor") {
        appointmentCheck = await pool.query(
          "SELECT * FROM appointments WHERE appointment_id = $1 AND doctor_id = $2",
          [appointmentId, req.user.id]
        );
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (appointmentCheck.rows.length === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // 2) Update the appointment (only date/time/description here)
      const updateResult = await pool.query(
        `
          UPDATE appointments
          SET appointment_date = $1, appointment_time = $2, description = $3
          WHERE appointment_id = $4
          RETURNING *
        `,
        [date, time, description, appointmentId]
      );

      const updatedAppt = updateResult.rows[0];
      return res.status(200).json({
        message: "Appointment updated successfully",
        appointment: updatedAppt,
      });
    } catch (err) {
      console.error("Error updating appointment:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Get Appointments for a Doctor
app.get(
  "/api/doctor/appointments",
  authenticateToken(["doctor"], "main"),
  async (req, res) => {
    try {
      const doctor_id = req.user.id;
      const appointments = await pool.query(
        `SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.description, a.status, a.fee,
                    p.fname AS patient_fname, p.lname AS patient_lname, p.gender
             FROM appointments a 
             JOIN patient p ON a.patient_id = p.patient_id 
             WHERE a.doctor_id = $1`,
        [doctor_id]
      );

      res.json(appointments.rows);
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Book an Appointment
app.post(
  "/api/bookAppointment",
  authenticateToken(["patient"], "main"),
  async (req, res) => {
    try {
      const { doctor_id, date, time, description } = req.body;
      const patient_id = req.user.id;

      // Validate the 'time' field
      let appointment_time = null;
      if (time && time.trim() !== "") {
        // Optionally, add further validation to ensure 'time' is in the correct format
        // Example: using a regex or Date object to validate
        const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d):?([0-5]\d)?$/; // Matches HH:MM or HH:MM:SS
        if (!timeRegex.test(time)) {
          return res.status(400).json({ error: "Invalid time format" });
        }
        appointment_time = time;
      }

      const feeResult = await pool.query(
        "SELECT fee FROM doctors WHERE doctor_id = $1",
        [doctor_id]
      );
      if (feeResult.rows.length === 0) {
        return res.status(400).json({ error: "Doctor not found" });
      }
      const doctorFee = feeResult.rows[0].fee || 0;

      // Insert the appointment with 'appointment_time' as null if invalid or not provided
      const newAppointment = await pool.query(
        `INSERT INTO appointments (doctor_id, patient_id, appointment_date, appointment_time, fee, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
        [doctor_id, patient_id, date, appointment_time, doctorFee, description]
      );

      res.json(newAppointment.rows[0]);
    } catch (error) {
      console.error("Error booking appointment:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.put(
  "/api/updatePatientProfile",
  authenticateToken(["patient"], "main"), // only for patients, site 'main'
  upload.single("profile_pic"), // handle one image file if provided
  async (req, res) => {
    try {
      const patientId = req.user.id; // from JWT
      // The fields come from `req.body`
      const {
        fname,
        lname,
        email,
        gender,
        password,
        passwordConfirm,
        description,
      } = req.body;

      // If a new profile pic was uploaded, it's in req.file
      const profile_pic = req.file ? req.file.buffer : null;
      const profile_pic_type = req.file
        ? req.file.mimetype.split("/")[1]
        : null;

      // OPTIONAL: if user wants to change password only if it’s non-empty and matches confirm
      let hashedPassword = null;
      if (password && password.trim().length > 0) {
        if (password !== passwordConfirm) {
          return res
            .status(400)
            .json({ error: "Password and confirm password do not match" });
        }
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Build the UPDATE query dynamically
      let updateQuery = `
        UPDATE patient SET
          fname = $1,
          lname = $2,
          email = $3,
          gender = $4,
          description = $5,
          profile_pic = COALESCE($6, profile_pic),
          profile_pic_type = COALESCE($7, profile_pic_type)
      `;
      const params = [
        fname,
        lname,
        email,
        gender,
        description || null,
        profile_pic,
        profile_pic_type,
      ];

      // If we have a new password, set it
      if (hashedPassword) {
        updateQuery += `, password = $${params.length + 1}`;
        params.push(hashedPassword);
      }

      updateQuery += ` WHERE patient_id = $${params.length + 1} RETURNING *`;
      params.push(patientId);

      const result = await pool.query(updateQuery, params);
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Patient not found or not updated" });
      }

      // Return the updated row
      const updatedPatient = result.rows[0];
      // Remove sensitive info
      delete updatedPatient.password;
      delete updatedPatient.reset_token;
      delete updatedPatient.reset_token_expiry;

      res.json(updatedPatient);
    } catch (error) {
      console.error("Error updating patient profile:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Cancel appointment endpoint
app.delete(
  "/api/appointments/:id/cancel",
  authenticateToken(["patient", "doctor"], "main"),
  async (req, res) => {
    const appointmentId = req.params.id;
    try {
      // Verify that the user is authorized to cancel this appointment
      let appointment;
      if (req.user.type === "patient") {
        appointment = await pool.query(
          "SELECT * FROM appointments WHERE appointment_id = $1 AND patient_id = $2",
          [appointmentId, req.user.id]
        );
      } else if (req.user.type === "doctor") {
        appointment = await pool.query(
          "SELECT * FROM appointments WHERE appointment_id = $1 AND doctor_id = $2",
          [appointmentId, req.user.id]
        );
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (appointment.rows.length === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Use the correct column name 'appointment_id'
      const result = await pool.query(
        "DELETE FROM appointments WHERE appointment_id = $1",
        [appointmentId]
      );

      res.status(200).json({ message: "Appointment canceled successfully" });
    } catch (error) {
      console.error("Error canceling appointment:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get Appointments for a Patient
app.get(
  "/api/patient/appointments",
  authenticateToken(["patient"], "main"),
  async (req, res) => {
    try {
      const patient_id = req.user.id;
      const appointments = await pool.query(
        `SELECT 
           a.appointment_id, 
           a.appointment_date, 
           a.appointment_time, 
           a.description, 
           a.status, 
           a.fee,
           d.name AS doctor_name, 
           d.specialization 
         FROM appointments a 
         JOIN doctors d ON a.doctor_id = d.doctor_id 
         WHERE a.patient_id = $1`,
        [patient_id]
      );

      res.json(appointments.rows);
    } catch (err) {
      console.error("Error fetching patient appointments", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get All Blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await pool.query(
      "SELECT blog_id, encode(blog_image, 'base64') as blog_image, blog_title, blog_description FROM blogs"
    );
    res.json(blogs.rows);
  } catch (err) {
    console.error("Error fetching blogs", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Blog by ID
app.get("/api/blogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const blog = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [
      id,
    ]);
    if (blog.rows.length === 0)
      return res.status(404).json({ error: "Blog not found" });

    const blogData = blog.rows[0];
    const imageBase64 = blogData.blog_image
      ? Buffer.from(blogData.blog_image).toString("base64")
      : null;
    const blogWithImage = { ...blogData, blog_image: imageBase64 };

    res.json(blogWithImage);
  } catch (err) {
    console.error("Error fetching blog", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get All Exercises
app.get("/api/exercises", async (req, res) => {
  try {
    const exercises = await pool.query(
      "SELECT ex_id, encode(ex_pic, 'base64') as ex_pic, ex_title, ex_description FROM exercise"
    );
    res.json(exercises.rows);
  } catch (err) {
    console.error("Error fetching exercises", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Exercise by ID
app.get("/api/exercises/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const exercise = await pool.query(
      "SELECT * FROM exercise WHERE ex_id = $1",
      [id]
    );
    if (exercise.rows.length === 0)
      return res.status(404).json({ error: "Exercise not found" });

    const exerciseData = exercise.rows[0];
    const imageBase64 = exerciseData.ex_pic
      ? Buffer.from(exerciseData.ex_pic).toString("base64")
      : null;
    const exerciseWithImage = { ...exerciseData, ex_pic: imageBase64 };

    res.json(exerciseWithImage);
  } catch (err) {
    console.error("Error fetching exercise", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Request Password Reset Route
app.post("/api/request-reset-password", async (req, res) => {
  const { email, userType } = req.body; // Get email and userType: 'patient', 'doctor'

  // Map userType to the correct table name in your database
  const tableNameMap = {
    patient: "patient",
    doctor: "doctors",
  };
  const tableName = tableNameMap[userType];

  if (!tableName) {
    return res.status(400).json({ message: "Invalid user type" });
  }

  console.log(`Processing reset for ${userType} with email: ${email}`);

  try {
    // Find user by email
    const userResult = await pool.query(
      `SELECT * FROM ${tableName} WHERE email = $1`,
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      console.error("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // Save token to database
    await pool.query(
      `UPDATE ${tableName} SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3`,
      [token, expiry, email]
    );

    console.log(
      `Reset token saved for ${email}: ${token}, expires at ${expiry}`
    );

    // Set up email transport using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail", // Correctly set to 'gmail'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. <a href="http://localhost:3000/reset-password/${userType}/${token}">Click here to reset your password</a></p>`,
    };

    // Send email with improved error handling
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Error sending email" });
    }
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------------------------------------------
   PRESCRIPTION ROUTE (NEW)
   Only the doctor who owns the appointment can update prescription/status
   ------------------------------------------------------------------ */
app.put(
  "/api/appointments/:id/prescription",
  authenticateToken(["doctor"], "main"),
  async (req, res) => {
    try {
      const appointmentId = req.params.id;
      const { prescription, status } = req.body;

      // Ensure this doctor owns the appointment
      const check = await pool.query(
        "SELECT * FROM appointments WHERE appointment_id = $1 AND doctor_id = $2",
        [appointmentId, req.user.id]
      );
      if (check.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Appointment not found or not authorized." });
      }

      // Update prescription & status
      const updated = await pool.query(
        `UPDATE appointments
           SET prescription = $1, status = $2
           WHERE appointment_id = $3
           RETURNING *`,
        [prescription, status, appointmentId]
      );

      return res.status(200).json({
        message: "Prescription and status updated",
        appointment: updated.rows[0],
      });
    } catch (error) {
      console.error("Error updating prescription/status:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);
+
/* ------------------------------------------------------------------
     MESSAGES ROUTES (NEW)
     Both doctor & patient can get and send messages for an appointment
     ------------------------------------------------------------------ */

// GET messages for an appointment
// Server.js - API endpoint
app.get("/api/appointments/:id/messages", authenticateToken(["patient", "doctor"]), async (req, res) => {
  try {
    const messages = await pool.query(`
      SELECT 
        m.*,
        CASE 
          WHEN m.sender_doctor_id IS NOT NULL THEN d.name
          WHEN m.sender_patient_id IS NOT NULL THEN CONCAT(p.fname, ' ', p.lname)
        END as sender_name
      FROM messages m
      LEFT JOIN doctors d ON m.sender_doctor_id = d.doctor_id 
      LEFT JOIN patient p ON m.sender_patient_id = p.patient_id
      WHERE m.appointment_id = $1
      ORDER BY m.created_at
    `, [req.params.id]);

    const transformedMessages = messages.rows.map(m => ({
      ...m,
      sender_type: m.sender_doctor_id ? 'doctor' : 'patient',
      sender_name: m.sender_name || 'Unknown'
    }));

    res.json(transformedMessages);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST a new message
app.post(
  "/api/appointments/:id/messages",
  authenticateToken(["doctor", "patient"], "main"),
  async (req, res) => {
    try {
      const appointmentId = req.params.id;
      const { content } = req.body;

      // Check if user is either doctor or patient of that appointment
      const check = await pool.query(
        `SELECT * FROM appointments
           WHERE appointment_id = $1
             AND (doctor_id = $2 OR patient_id = $2)`,
        [appointmentId, req.user.id]
      );
      if (check.rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Appointment not found or not yours." });
      }

      // Determine if sender is doctor or patient
      let sender_doctor_id = null;
      let sender_patient_id = null;
      if (req.user.type === "doctor") {
        sender_doctor_id = req.user.id;
      } else if (req.user.type === "patient") {
        sender_patient_id = req.user.id;
      }

      const newMsg = await pool.query(
        `INSERT INTO messages
           (appointment_id, sender_doctor_id, sender_patient_id, content)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
        [appointmentId, sender_doctor_id, sender_patient_id, content]
      );

      return res.status(201).json(newMsg.rows[0]);
    } catch (error) {
      console.error("Error sending message:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/* ------------------------------------------------------------------
     CALLS ROUTES (NEW, OPTIONAL)
     Minimal approach: log calls in the DB (calls table)
     ------------------------------------------------------------------ */

// Create a Daily.co room for an appointment
app.post('/api/appointments/:id/create-room', authenticateToken(['doctor'], 'main'), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const doctorId = req.user.id;

    // Debug logging
    console.log('Creating room for appointment:', appointmentId);
    console.log('Doctor ID:', doctorId);
    console.log('API Key present:', !!process.env.DAILY_API_KEY);

    // Create a unique room name using timestamp
    const uniqueRoomName = `appointment-${appointmentId}-${Date.now()}`;

    // Create Daily.co room with unique name
    const dailyResponse = await axios.post(
      'https://api.daily.co/v1/rooms',
      {
        name: uniqueRoomName,
        properties: {
          max_participants: 2,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`
        }
      }
    );

    console.log('Daily.co response:', dailyResponse.data);

    // Create call record in database
    const callResult = await pool.query(
      `INSERT INTO calls (
        appointment_id, 
        room_url, 
        room_name, 
        status, 
        started_by_id,
        started_by_type,
        doctor_joined
      )
      VALUES ($1, $2, $3, 'ongoing', $4, 'doctor', true)
      RETURNING *`,
      [
        appointmentId,
        dailyResponse.data.url,
        dailyResponse.data.name,
        doctorId
      ]
    );

    console.log('Call record created:', callResult.rows[0]);

    res.json({
      message: 'Video room created successfully',
      call: callResult.rows[0]
    });

  } catch (error) {
    console.error('Error creating room:', {
      message: error.message,
      dailyResponse: error.response?.data,
      stack: error.stack
    });

    if (error.response?.data) {
      console.error('Daily.co API error:', error.response.data);
    }

    res.status(500).json({ 
      message: 'Failed to create video room',
      error: error.response?.data || error.message 
    });
  }
});
 // Get call status for an appointment
 app.get('/api/appointments/:id/call-status', authenticateToken(['doctor', 'patient'], 'main'), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    console.log('Checking call status for appointment:', appointmentId);
    
    const callResult = await pool.query(
      `SELECT * FROM calls 
       WHERE appointment_id = $1 
       AND status = 'ongoing'
       ORDER BY started_at DESC 
       LIMIT 1`,
      [appointmentId]
    );

    console.log('Call result:', callResult.rows[0]); // Add this debug log

    if (callResult.rows.length === 0) {
      return res.json({ status: 'no-active-call' });
    }

    res.json({
      status: 'active',
      call: callResult.rows[0]
    });
  } catch (error) {
    console.error('Error getting call status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join a call (for patient)
app.post('/api/calls/:callId/join', authenticateToken(['patient'], 'main'), async (req, res) => {
  try {
    const callId = req.params.callId;
    const patientId = req.user.id;
    
    console.log('Patient attempting to join call:', { callId, patientId });

    // Verify this patient can join this call
    const callCheck = await pool.query(
      `SELECT c.*, a.patient_id 
       FROM calls c
       JOIN appointments a ON c.appointment_id = a.appointment_id
       WHERE c.call_id = $1 
       AND a.patient_id = $2
       AND c.status = 'ongoing'`,
      [callId, patientId]
    );

    if (callCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Call not found or not authorized' });
    }

    // Update call record to show patient joined
    const updatedCall = await pool.query(
      `UPDATE calls 
       SET patient_joined = true,
           status = CASE 
             WHEN doctor_joined THEN 'ongoing'
             ELSE status
           END
       WHERE call_id = $1
       RETURNING *`,
      [callId]
    );

    console.log('Patient joined call successfully:', updatedCall.rows[0]);

    res.json({
      message: 'Joined call successfully',
      call: updatedCall.rows[0]
    });

  } catch (error) {
    console.error('Error joining call:', error);
    res.status(500).json({ message: 'Failed to join call' });
  }
});

// End a call
app.post('/api/calls/:callId/end', authenticateToken(['doctor', 'patient'], 'main'), async (req, res) => {
  try {
    const callId = req.params.callId;
    const userId = req.user.id;
    const userType = req.user.type;

    console.log('User attempting to end call:', { callId, userId, userType });

    // Verify user is part of this call
    const callCheck = await pool.query(
      `SELECT c.*, a.doctor_id, a.patient_id 
       FROM calls c
       JOIN appointments a ON c.appointment_id = a.appointment_id
       WHERE c.call_id = $1 
       AND (
         (a.doctor_id = $2 AND $3 = 'doctor') OR 
         (a.patient_id = $2 AND $3 = 'patient')
       )
       AND c.status = 'ongoing'`,
      [callId, userId, userType]
    );

    if (callCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Call not found or not authorized' });
    }

    // Update call record
    const endedCall = await pool.query(
      `UPDATE calls 
       SET status = 'ended',
           ended_at = NOW(),
           doctor_joined = false,
           patient_joined = false
       WHERE call_id = $1
       RETURNING *`,
      [callId]
    );

    console.log('Call marked as ended in database:', endedCall.rows[0]);

    // Try to end the Daily.co room
    try {
      const dailyResponse = await axios.post(
        `https://api.daily.co/v1/rooms/${endedCall.rows[0].room_name}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`
          }
        }
      );
      console.log('Daily.co room ended successfully:', dailyResponse.data);
    } catch (dailyError) {
      console.error('Error ending Daily.co room:', {
        error: dailyError.message,
        response: dailyError.response?.data
      });
      // Continue anyway as the call is marked as ended in our database
    }

    res.json({
      message: 'Call ended successfully',
      call: endedCall.rows[0]
    });

  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ 
      message: 'Failed to end call',
      error: error.message 
    });
  }
});   


// Serve React frontend
app.use(express.static(path.join(__dirname, "../client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Reset Password Route
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword, userType } = req.body;

  // Map userType to the correct table name
  const tableNameMap = {
    patient: "patient",
    doctor: "doctors",
  };
  const tableName = tableNameMap[userType];

  if (!tableName) {
    console.error("Invalid user type provided:", userType);
    return res.status(400).json({ message: "Invalid user type" });
  }

  try {
    console.log(
      `Attempting password reset for token: ${token} and userType: ${userType}`
    );

    // Find user by token and check token expiry
    const userResult = await pool.query(
      `SELECT * FROM ${tableName} WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    console.log(`User search result for token ${token}:`, userResult.rows);

    if (userResult.rows.length === 0) {
      console.error("Invalid or expired token for reset:", token);
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = userResult.rows[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`New hashed password: ${hashedPassword}`);

    // Update user's password and clear reset token
    const updateResult = await pool.query(
      `UPDATE ${tableName} SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2`,
      [hashedPassword, token]
    );

    console.log(`Password update result:`, updateResult);

    if (updateResult.rowCount === 0) {
      console.error("Failed to update password for user:", user.email);
      return res.status(500).json({ message: "Failed to reset password" });
    }

    console.log("Password reset successfully for user:", user.email);
    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.use(express.static(path.join(__dirname, '../client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
