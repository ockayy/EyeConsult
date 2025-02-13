// adminRoutes.js

const express = require("express");
const router = express.Router();
const pool = require("./database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
require("dotenv").config();

const { authenticateToken } = require("./roleAuth");

const JWT_SECRET = process.env.JWT_SECRET;

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminQuery = await pool.query(
      "SELECT * FROM admins WHERE username = $1",
      [username]
    );

    if (adminQuery.rows.length === 0) {
      return res.status(400).json({ error: "Admin not found" });
    }

    const admin = adminQuery.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Include 'site' in the token payload
    const token = jwt.sign(
      { id: admin.admin_id, type: "admin", site: "store" },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: {
        admin_id: admin.admin_id,
        username: admin.username,
        email: admin.email,
        type: admin.type, // Added
        site: admin.site, // Added
      },
    });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: View Medicines
router.get(
  "/medicines",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const medicines = await pool.query(
        "SELECT medicine_id, name, description, price, stock, category, encode(image, 'base64') as image FROM medicines"
      );
      res.json(medicines.rows);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Get Medicine by ID
router.get(
  "/medicines/:id",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const medicine = await pool.query(
        "SELECT medicine_id, name, description, price, stock, category, encode(image, 'base64') as image FROM medicines WHERE medicine_id = $1",
        [id]
      );
      if (medicine.rows.length === 0) {
        return res.status(404).json({ error: "Medicine not found" });
      }
      res.json(medicine.rows[0]);
    } catch (error) {
      console.error("Error fetching medicine:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Add Medicine
router.post(
  "/medicines",
  authenticateToken(["admin"], "store"),
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, stock, category } = req.body;
      const image = req.file ? req.file.buffer : null;
      const image_type = req.file ? req.file.mimetype.split("/")[1] : null;

      const result = await pool.query(
        `INSERT INTO medicines (name, description, price, stock, category, image, image_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, description, price, stock, category, image, image_type]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error adding medicine:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Update Medicine
router.put(
  "/medicines/:id",
  authenticateToken(["admin"], "store"),
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, stock, category } = req.body;
      const image = req.file ? req.file.buffer : null;
      const image_type = req.file ? req.file.mimetype.split("/")[1] : null;

      const result = await pool.query(
        `UPDATE medicines SET
           name = $1,
           description = $2,
           price = $3,
           stock = $4,
           category = $5,
           image = COALESCE($6, image),
           image_type = COALESCE($7, image_type)
         WHERE medicine_id = $8 RETURNING *`,
        [name, description, price, stock, category, image, image_type, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Medicine not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating medicine:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Delete Medicine
router.delete(
  "/medicines/:id",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `DELETE FROM medicines WHERE medicine_id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Medicine not found" });
      }

      res.json({ message: "Medicine deleted successfully" });
    } catch (error) {
      console.error("Error deleting medicine:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Get All Orders
router.get(
  "/orders",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const ordersResult = await pool.query(
        `SELECT o.*, u.fname, u.lname, u.email
         FROM orders o
         JOIN store_users u ON o.user_id = u.user_id
         ORDER BY o.order_id DESC`
      );
      const orders = ordersResult.rows;

      // Handle empty orders
      if (orders.length === 0) {
        return res.json([]);
      }

      // Get all order items in one query
      const orderIds = orders.map((order) => order.order_id);

      const itemsResult = await pool.query(
        `SELECT oi.*, m.name, oi.order_id
         FROM order_items oi
         JOIN medicines m ON oi.medicine_id = m.medicine_id
         WHERE oi.order_id = ANY($1::int[])`,
        [orderIds]
      );

      const itemsByOrderId = {};
      for (const item of itemsResult.rows) {
        if (!itemsByOrderId[item.order_id]) {
          itemsByOrderId[item.order_id] = [];
        }
        itemsByOrderId[item.order_id].push(item);
      }

      // Attach items to corresponding orders
      for (const order of orders) {
        order.items = itemsByOrderId[order.order_id] || [];
      }

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Get a Specific Order by ID
router.get(
  "/orders/:id",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const orderResult = await pool.query(
        `SELECT o.*, u.fname, u.lname, u.email
           FROM orders o
           JOIN store_users u ON o.user_id = u.user_id
           WHERE o.order_id = $1`,
        [id]
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const order = orderResult.rows[0];

      const itemsResult = await pool.query(
        `SELECT oi.*, m.name
           FROM order_items oi
           JOIN medicines m ON oi.medicine_id = m.medicine_id
           WHERE oi.order_id = $1`,
        [order.order_id]
      );
      order.items = itemsResult.rows;

      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Update Order Status
router.put(
  "/orders/:id",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await pool.query(
        `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Delete an Order
router.delete(
  "/orders/:id",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Delete order items first to maintain referential integrity
      await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [id]);

      // Then delete the order itself
      const result = await pool.query(
        `DELETE FROM orders WHERE order_id = $1 RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Admin: Get Admin Stats
router.get(
  "/stats",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const totalMedicinesResult = await pool.query(
        `SELECT COUNT(*) FROM medicines`
      );
      const totalOrdersResult = await pool.query(`SELECT COUNT(*) FROM orders`);
      const pendingOrdersResult = await pool.query(
        `SELECT COUNT(*) FROM orders WHERE status = 'Pending'`
      );

      // Prepare the stats object
      const stats = {
        totalMedicines: parseInt(totalMedicinesResult.rows[0].count, 10),
        totalOrders: parseInt(totalOrdersResult.rows[0].count, 10),
        pendingOrders: parseInt(pendingOrdersResult.rows[0].count, 10),
      };

      // Send the stats as a JSON response
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete Store User
router.delete(
  "/users/:id",
  authenticateToken(["admin"], "store"),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      const adminId = req.user.id;
      if (parseInt(id, 10) === adminId) {
        return res
          .status(400)
          .json({ error: "Admins cannot delete themselves" });
      }

      // Delete the store user
      const result = await pool.query(
        "DELETE FROM store_users WHERE user_id = $1 RETURNING *;",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Store user not found" });
      }

      res.json({ message: "Store user deleted successfully" });
    } catch (error) {
      console.error("Error deleting store user:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;
