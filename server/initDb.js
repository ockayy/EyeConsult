// initDb.js

const pool = require("./database");
const bcrypt = require("bcrypt");

const initDb = async () => {
  const dropTables = async () => {
    try {
      await pool.query(`
        DROP TABLE IF EXISTS order_items;
        DROP TABLE IF EXISTS orders;
        DROP TABLE IF EXISTS medicines;
        DROP TABLE IF EXISTS store_users;
        DROP TABLE IF EXISTS admins;
        DROP TABLE IF EXISTS appointments;
        DROP TABLE IF EXISTS blogs;
        DROP TABLE IF EXISTS exercise;
        DROP TABLE IF EXISTS doctors;
        DROP TABLE IF EXISTS patient;
        -- Partners table is removed completely
      `);
      console.log("All tables dropped.");
    } catch (error) {
      console.error("Error dropping tables:", error);
      throw error;
    }
  };

  const createPatientTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS patient (
          patient_id SERIAL PRIMARY KEY,
          fname VARCHAR,
          lname VARCHAR,
          gender VARCHAR,
          email VARCHAR UNIQUE,
          phoneno VARCHAR,
          cnic VARCHAR,
          password VARCHAR,
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

  const createDoctorsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS doctors (
          doctor_id SERIAL PRIMARY KEY,
          name VARCHAR,
          phoneno VARCHAR,
          cnic VARCHAR,
          dob DATE,
          email VARCHAR UNIQUE,
          password VARCHAR,
          experience_years INTEGER,
          experience_title VARCHAR,
          education TEXT,
          current_hospital VARCHAR,
          fee NUMERIC,
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

  const createAppointmentsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS appointments (
          appointment_id SERIAL PRIMARY KEY,
          doctor_id INTEGER NOT NULL,
          patient_id INTEGER NOT NULL,
          appointment_date DATE,
          appointment_time TIME,
          status VARCHAR,
          description TEXT,
          FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id),
          FOREIGN KEY (patient_id) REFERENCES patient (patient_id)
        );
      `);
      console.log("Appointments table created.");
    } catch (error) {
      console.error("Error creating appointments table:", error);
      throw error;
    }
  };

  const createBlogsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS blogs (
          blog_id SERIAL PRIMARY KEY,
          blog_title VARCHAR,
          blog_description TEXT,
          published_at TIMESTAMP,
          doctor_id INTEGER,
          blog_image BYTEA,
          blog_image_type VARCHAR,
          FOREIGN KEY (doctor_id) REFERENCES doctors (doctor_id)
        );
      `);
      console.log("Blogs table created.");
    } catch (error) {
      console.error("Error creating blogs table:", error);
      throw error;
    }
  };

  const createExerciseTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS exercise (
          ex_id SERIAL PRIMARY KEY,
          ex_title VARCHAR,
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

  const createAdminsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          admin_id SERIAL PRIMARY KEY,
          username VARCHAR UNIQUE NOT NULL,
          email VARCHAR UNIQUE NOT NULL,
          password VARCHAR NOT NULL,
          type VARCHAR NOT NULL DEFAULT 'admin',
          site VARCHAR NOT NULL DEFAULT 'store'
        );
      `);
      console.log("Admins table created.");
    } catch (error) {
      console.error("Error creating admins table:", error);
      throw error;
    }
  };

  const insertAdminUser = async () => {
    try {
      // Hash the default password
      const hashedPassword = await bcrypt.hash("admin123", 10);

      // Insert default admin user
      await pool.query(
        `INSERT INTO admins (username, email, password, type, site)
         VALUES ($1, $2, $3, $4, $5)`,
        ["admin", "admin@example.com", hashedPassword, "admin", "store"]
      );
      console.log("Default admin user created.");
    } catch (error) {
      console.error("Error inserting admin user:", error);
      throw error;
    }
  };

  const createStoreUsersTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_users (
          user_id SERIAL PRIMARY KEY,
          fname VARCHAR,
          lname VARCHAR,
          gender VARCHAR,
          email VARCHAR UNIQUE,
          phoneno VARCHAR,
          cnic VARCHAR,
          password VARCHAR,
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

  const createMedicinesTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS medicines (
          medicine_id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          description TEXT,
          price NUMERIC(10, 2) NOT NULL,
          stock INTEGER NOT NULL,
          category VARCHAR,
          image BYTEA,
          image_type VARCHAR
        );
      `);
      console.log("Medicines table created.");
    } catch (error) {
      console.error("Error creating medicines table:", error);
      throw error;
    }
  };

  const createOrdersTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          order_id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES store_users(user_id),
          order_date TIMESTAMP DEFAULT NOW(),
          total_price NUMERIC(10,2),
          status VARCHAR(50),
          address TEXT
        );
      `);
      console.log("Orders table created.");
    } catch (error) {
      console.error("Error creating orders table:", error);
      throw error;
    }
  };

  const createOrderItemsTable = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          order_item_id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(order_id),
          medicine_id INTEGER REFERENCES medicines(medicine_id),
          quantity INTEGER NOT NULL,
          price NUMERIC(10,2) NOT NULL
        );
      `);
      console.log("Order Items table created.");
    } catch (error) {
      console.error("Error creating order items table:", error);
      throw error;
    }
  };

  try {
    await dropTables();
    await createPatientTable();
    await createDoctorsTable();
    // Partners table is removed, so no creation
    await createAppointmentsTable();
    await createBlogsTable();
    await createExerciseTable();
    await createAdminsTable();
    await insertAdminUser(); // Insert default admin user
    await createStoreUsersTable();
    await createMedicinesTable();
    await createOrdersTable();
    await createOrderItemsTable();
    console.log("Database initialization complete.");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

initDb();
