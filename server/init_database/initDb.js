const pool = require("../database"); // Adjust the path if necessary
const bcrypt = require("bcrypt");

const initDb = async () => {
  // 1. Drop all existing tables in correct reverse order
  //    (depends on your database constraints; messages depend on appointments, appointments depend on patient/doctors, etc.)
  const dropTables = async () => {
    try {
      await pool.query(`
        DROP TABLE IF EXISTS calls;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS medicines;
        DROP TABLE IF EXISTS store_owners;
        DROP TABLE IF EXISTS store_users;
        DROP TABLE IF EXISTS admins;
        DROP TABLE IF EXISTS appointments;
        DROP TABLE IF EXISTS blogs;
        DROP TABLE IF EXISTS exercise;
        DROP TABLE IF EXISTS doctors;
        DROP TABLE IF EXISTS patient;
      `);
      console.log("All tables dropped.");
    } catch (error) {
      console.error("Error dropping tables:", error);
      throw error;
    }
  };

  // 2. Create patient table
  const createPatientTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS patient (
          patient_id SERIAL PRIMARY KEY,
          fname VARCHAR NOT NULL,
          lname VARCHAR NOT NULL,
          gender VARCHAR,
          email VARCHAR UNIQUE NOT NULL,
          phoneno VARCHAR,
          cnic VARCHAR,
          password VARCHAR NOT NULL,
          address TEXT,
          description TEXT,
          profile_pic BYTEA,
          profile_pic_type VARCHAR,
          token VARCHAR,
          reset_token VARCHAR(255),
          reset_token_expiry TIMESTAMP,
          type VARCHAR NOT NULL DEFAULT 'patient',
          site VARCHAR NOT NULL DEFAULT 'main'
        );
      `);
      console.log("Patient table created.");
    } catch (error) {
      console.error("Error creating patient table:", error);
      throw error;
    }
  };

  // 3. Create doctors table
  const createDoctorsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS doctors (
          doctor_id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          phoneno VARCHAR,
          cnic VARCHAR,
          dob DATE,
          email VARCHAR UNIQUE NOT NULL,
          password VARCHAR NOT NULL,
          experience_years INTEGER,
          experience_title VARCHAR,
          education TEXT,
          current_hospital VARCHAR,
          fee NUMERIC(10, 2),
          description TEXT,
          available_start_time TIME,
          available_end_time TIME,
          specialization VARCHAR[],
          services VARCHAR[],
          profile_pic BYTEA,
          profile_pic_type VARCHAR,
          degree_pic BYTEA,
          degree_pic_type VARCHAR,
          reset_token VARCHAR(255),
          reset_token_expiry TIMESTAMP,
          type VARCHAR NOT NULL DEFAULT 'doctor',
          site VARCHAR NOT NULL DEFAULT 'main'
        );
      `);
      console.log("Doctors table created.");
    } catch (error) {
      console.error("Error creating doctors table:", error);
      throw error;
    }
  };

  // 4. Create appointments table
  //    Note the added `prescription TEXT` column for storing doctor prescriptions
  const createAppointmentsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS appointments (
          appointment_id SERIAL PRIMARY KEY,
          doctor_id INTEGER NOT NULL,
          patient_id INTEGER NOT NULL,
          appointment_date DATE,
          appointment_time TIME,
          fee NUMERIC(10, 2),    -- doctor's fee
          status VARCHAR,
          description TEXT,
          prescription TEXT,     -- new column for doctor prescription
          FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id) ON DELETE CASCADE,
          FOREIGN KEY (patient_id) REFERENCES patient (patient_id) ON DELETE CASCADE
        );
      `);
      console.log("Appointments table created (with prescription column).");
    } catch (error) {
      console.error("Error creating appointments table:", error);
      throw error;
    }
  };

  // 5. Create blogs table
  const createBlogsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS blogs (
          blog_id SERIAL PRIMARY KEY,
          blog_title VARCHAR NOT NULL,
          blog_description TEXT,
          published_at TIMESTAMP,
          blog_image BYTEA,
          blog_image_type VARCHAR,
          doctor_id INTEGER,
          FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL
        );
      `);
      console.log("Blogs table created.");
    } catch (error) {
      console.error("Error creating blogs table:", error);
      throw error;
    }
  };

  // 6. Create exercise table
  const createExerciseTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS exercise (
          ex_id SERIAL PRIMARY KEY,
          ex_title VARCHAR NOT NULL,
          ex_description TEXT,
          ex_pic BYTEA
        );
      `);
      console.log("Exercise table created.");
    } catch (error) {
      console.error("Error creating exercise table:", error);
      throw error;
    }
  };

  // 7. Create admins table
  const createAdminsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          admin_id SERIAL PRIMARY KEY,
          username VARCHAR NOT NULL,
          email VARCHAR UNIQUE NOT NULL,
          password VARCHAR NOT NULL,
          type VARCHAR NOT NULL DEFAULT 'admin',
          site VARCHAR NOT NULL DEFAULT 'store',
          UNIQUE (username, email)
        );
      `);
      console.log("Admins table created.");
    } catch (error) {
      console.error("Error creating admins table:", error);
      throw error;
    }
  };

  // 8. Insert a default admin user (optional)
  const insertAdminUser = async () => {
    try {
      // Hash the default password
      const hashedPassword = await bcrypt.hash("admin123", 10);

      // Insert default admin user if not present
      await pool.query(
        `INSERT INTO admins (username, email, password, type, site)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        ["admin", "admin@example.com", hashedPassword, "admin", "store"]
      );
      console.log("Default admin user created (if not already present).");
    } catch (error) {
      console.error("Error inserting admin user:", error);
      throw error;
    }
  };

  // 9. Create store_users table
  const createStoreUsersTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_users (
          user_id SERIAL PRIMARY KEY,
          fname VARCHAR NOT NULL,
          lname VARCHAR NOT NULL,
          gender VARCHAR,
          email VARCHAR UNIQUE NOT NULL,
          phoneno VARCHAR,
          cnic VARCHAR,
          password VARCHAR NOT NULL,
          address TEXT,
          profile_pic BYTEA,
          profile_pic_type VARCHAR,
          reset_token VARCHAR(255),
          reset_token_expiry TIMESTAMP,
          type VARCHAR NOT NULL DEFAULT 'store_user',
          site VARCHAR NOT NULL DEFAULT 'store'
        );
      `);
      console.log("Store Users table created.");
    } catch (error) {
      console.error("Error creating store users table:", error);
      throw error;
    }
  };

  // 10. Create store_owners table
  const createStoreOwnersTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_owners (
          owner_id SERIAL PRIMARY KEY,
          fname VARCHAR NOT NULL,
          lname VARCHAR NOT NULL,
          gender VARCHAR,
          email VARCHAR UNIQUE NOT NULL,
          phoneno VARCHAR,
          cnic VARCHAR,
          password VARCHAR NOT NULL,
          address TEXT,
          profile_pic BYTEA,
          profile_pic_type VARCHAR,
          reset_token VARCHAR(255),
          reset_token_expiry TIMESTAMP,
          type VARCHAR NOT NULL DEFAULT 'store_owner',
          site VARCHAR NOT NULL DEFAULT 'store'
        );
      `);
      console.log("Store Owners table created.");
    } catch (error) {
      console.error("Error creating store owners table:", error);
      throw error;
    }
  };

  // 11. Create medicines table
  const createMedicinesTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS medicines (
          medicine_id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL UNIQUE,
          description TEXT,
          price NUMERIC(10, 2) NOT NULL,
          stock INTEGER NOT NULL,
          category VARCHAR,
          image BYTEA,
          image_type VARCHAR,
          sold_by INTEGER, -- reference to store_owners(owner_id)
          FOREIGN KEY (sold_by) REFERENCES store_owners(owner_id) ON DELETE SET NULL
        );
      `);
      console.log("Medicines table created.");
    } catch (error) {
      console.error("Error creating medicines table:", error);
      throw error;
    }
  };

  // 12. Create orders table
  const createOrdersTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          order_date TIMESTAMP DEFAULT NOW(),
          total_price NUMERIC(10,2),
          status VARCHAR(50),
          address TEXT,
          FOREIGN KEY (user_id) REFERENCES store_users(user_id) ON DELETE CASCADE
        );
      `);
      console.log("Orders table created.");
    } catch (error) {
      console.error("Error creating orders table:", error);
      throw error;
    }
  };

  // 13. Create order_items table
  const createOrderItemsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          order_item_id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL,
          medicine_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price NUMERIC(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
          FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
        );
      `);
      console.log("Order Items table created.");
    } catch (error) {
      console.error("Error creating order items table:", error);
      throw error;
    }
  };

  // 14. Create messages table
  const createMessagesTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          message_id SERIAL PRIMARY KEY,
          appointment_id INT NOT NULL,
          sender_doctor_id INT,
          sender_patient_id INT,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          is_read BOOLEAN DEFAULT FALSE,

          -- Exactly one of sender_doctor_id or sender_patient_id must be non-null
          CONSTRAINT ck_sender CHECK (
            (sender_doctor_id IS NOT NULL AND sender_patient_id IS NULL)
            OR
            (sender_doctor_id IS NULL AND sender_patient_id IS NOT NULL)
          ),

          FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
          FOREIGN KEY (sender_doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
          FOREIGN KEY (sender_patient_id) REFERENCES patient(patient_id) ON DELETE CASCADE
        );
      `);
      console.log("Messages table created.");
    } catch (error) {
      console.error("Error creating messages table:", error);
      throw error;
    }
  };

  // 15. (NEW) Create calls table (for storing call logs between patient/doctor)
  //     This is optional but demonstrates how to track calls.
  const createCallsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS calls (
        call_id SERIAL PRIMARY KEY,
        appointment_id INT NOT NULL,
        room_url VARCHAR(255),       -- Daily.co room URL
        room_name VARCHAR(255),      -- Daily.co room name
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',  -- pending, ongoing, ended
        started_by_id INT,           -- ID of user who started the call
        started_by_type VARCHAR(50), -- 'doctor' or 'patient'
        doctor_joined BOOLEAN DEFAULT false,
        patient_joined BOOLEAN DEFAULT false,
        FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
        );
      `);
      console.log("Calls table created.");
    } catch (error) {
      console.error("Error creating calls table:", error);
      throw error;
    }
  };

  try {
    // 1) Drop existing tables
    await dropTables();

    // 2) Recreate all tables in the correct order
    await createPatientTable();
    await createDoctorsTable();
    await createAppointmentsTable(); // includes prescription
    await createBlogsTable();
    await createExerciseTable();
    await createAdminsTable();
    await insertAdminUser(); // default admin
    await createStoreUsersTable();
    await createStoreOwnersTable();
    await createMedicinesTable();
    await createOrdersTable();
    await createOrderItemsTable();
    await createMessagesTable();
    await createCallsTable(); // new calls table

    console.log("Database initialization complete.");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    // Close the pool and exit
    await pool.end();
    process.exit(0);
  }
};

initDb();
