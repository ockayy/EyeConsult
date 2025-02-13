// storeRoutes.js
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
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// Store User Sign Up
router.post("/signup", async (req, res) => {
  try {
    const { fname, lname, gender, email, phoneno, cnic, password, address } =
      req.body;

    // Input validation
    // (Implement necessary validation for each field)

    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM store_users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const newUser = await pool.query(
      `INSERT INTO store_users (fname, lname, gender, email, phoneno, cnic, password, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [fname, lname, gender, email, phoneno, cnic, hashedPassword, address]
    );

    // Generate JWT token with 'site' field
    const token = jwt.sign(
      { id: newUser.rows[0].user_id, type: "store_user", site: "store" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: newUser.rows[0] });
  } catch (error) {
    console.error("Error in store user sign up:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Store User Loginsss
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userQuery = await pool.query(
      "SELECT * FROM store_users WHERE email = $1",
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

    // Generate JWT token with 'site' field
    const token = jwt.sign(
      { id: user.user_id, type: "store_user", site: "store" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in store user login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// View Medicines with Category, Sorting, and Pagination
router.get("/medicines", async (req, res) => {
  try {
    const { category, sortBy, order, page = 1, limit = 10, search } = req.query;

    let query = `
      SELECT 
        m.medicine_id,
        m.name,
        m.description,
        m.price,
        m.stock,
        m.category,
        encode(m.image, 'base64') as image,
        so.fname AS seller_fname,
        so.lname AS seller_lname
      FROM medicines m
      JOIN store_owners so ON m.sold_by = so.owner_id
    `;

    let countQuery = `
      SELECT COUNT(*) 
      FROM medicines m
      JOIN store_owners so ON m.sold_by = so.owner_id
    `;

    const params = [];
    const countParams = [];
    const whereConditions = [];

    // 1. Category filter
    if (category && category !== "All") {
      whereConditions.push(`m.category = $${params.length + 1}`);
      params.push(category);
      countParams.push(category);
    }

    // 2. Search filter (ILIKE for case-insensitive partial match on name)
    //    If you also want to match in description, you can do OR m.description ILIKE ...
    if (search && search.trim() !== "") {
      whereConditions.push(`(m.name ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    // 3. If we have any conditions, add WHERE
    if (whereConditions.length > 0) {
      const whereClause = " WHERE " + whereConditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    // 4. Sorting
    if (sortBy) {
      const columns = ["name", "price"];
      if (columns.includes(sortBy)) {
        const sortOrder =
          order && order.toUpperCase() === "DESC" ? "DESC" : "ASC";
        query += ` ORDER BY m.${sortBy} ${sortOrder}`;
      }
    } else {
      // Default sort by name ASC
      query += ` ORDER BY m.name ASC`;
    }

    // 5. Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit);
    params.push(offset);

    // 6. Execute main query
    const medicinesResult = await pool.query(query, params);

    // 7. Execute count query
    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // 8. Structure the response
    const medicines = medicinesResult.rows.map((med) => ({
      medicine_id: med.medicine_id,
      name: med.name,
      description: med.description,
      price: med.price,
      stock: med.stock,
      category: med.category,
      image: med.image,
      // Combine owner first+last name:
      sold_by: `${med.seller_fname} ${med.seller_lname}`,
    }));

    res.json({ medicines, totalCount });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get Medicine by ID
router.get("/medicines/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const medicineResult = await pool.query(
      `
      SELECT 
        m.medicine_id,
        m.name,
        m.description,
        m.price,
        m.stock,
        m.category,
        encode(m.image, 'base64') as image,
        so.fname AS seller_fname,
        so.lname AS seller_lname
      FROM medicines m
      JOIN store_owners so ON m.sold_by = so.owner_id
      WHERE m.medicine_id = $1
      `,
      [id]
    );

    if (medicineResult.rows.length === 0) {
      return res.status(404).json({ error: "Medicine not found" });
    }

    const med = medicineResult.rows[0];

    // Structure the response with store owner's full name
    const medicine = {
      medicine_id: med.medicine_id,
      name: med.name,
      description: med.description,
      price: med.price,
      stock: med.stock,
      category: med.category,
      image: med.image,
      sold_by: `${med.seller_fname} ${med.seller_lname}`, // Combine first and last names
    };

    res.json(medicine);
  } catch (error) {
    console.error("Error fetching medicine:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create Order
router.post(
  "/orders",
  authenticateToken(["store_user"], "store"),
  async (req, res) => {
    try {
      const user_id = req.user.id;
      const { items, address } = req.body; // items is an array of { medicine_id, quantity }

      // Input validation
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "No items provided" });
      }

      // Start a transaction
      await pool.query("BEGIN");

      // Calculate total price and validate stock
      let totalPrice = 0;
      for (const item of items) {
        const medicineResult = await pool.query(
          "SELECT price, stock FROM medicines WHERE medicine_id = $1",
          [item.medicine_id]
        );
        if (medicineResult.rows.length === 0) {
          await pool.query("ROLLBACK");
          return res
            .status(400)
            .json({ error: `Medicine ID ${item.medicine_id} not found` });
        }
        const medicine = medicineResult.rows[0];
        if (medicine.stock < item.quantity) {
          await pool.query("ROLLBACK");
          return res.status(400).json({
            error: `Insufficient stock for medicine ID ${item.medicine_id}`,
          });
        }
        totalPrice += medicine.price * item.quantity;
      }

      // Insert order
      const orderResult = await pool.query(
        `INSERT INTO orders (user_id, total_price, status, address)
           VALUES ($1, $2, $3, $4) RETURNING order_id`,
        [user_id, totalPrice, "Pending", address]
      );
      const order_id = orderResult.rows[0].order_id;

      // Insert order items and update stock
      for (const item of items) {
        const medicineResult = await pool.query(
          "SELECT price FROM medicines WHERE medicine_id = $1",
          [item.medicine_id]
        );
        const medicine = medicineResult.rows[0];
        const price = medicine.price;

        await pool.query(
          `INSERT INTO order_items (order_id, medicine_id, quantity, price)
             VALUES ($1, $2, $3, $4)`,
          [order_id, item.medicine_id, item.quantity, price]
        );

        // Update stock
        await pool.query(
          `UPDATE medicines SET stock = stock - $1 WHERE medicine_id = $2`,
          [item.quantity, item.medicine_id]
        );
      }

      // Commit transaction
      await pool.query("COMMIT");

      res.json({ message: "Order created successfully", order_id });
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Get Orders for a User
router.get(
  "/orders",
  authenticateToken(["store_user"], "store"),
  async (req, res) => {
    try {
      const user_id = req.user.id;

      const ordersResult = await pool.query(
        `
        SELECT 
          o.order_id, 
          o.user_id, 
          o.total_price, 
          o.status, 
          o.address, 
          o.order_date,  -- Corrected column name
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'order_item_id', oi.order_item_id,
                'medicine_id', oi.medicine_id,
                'medicine_name', m.name,
                'quantity', oi.quantity,
                'price', oi.price
              )
            ) FILTER (WHERE oi.order_item_id IS NOT NULL),
            '[]'
          ) AS items
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN medicines m ON oi.medicine_id = m.medicine_id
        WHERE o.user_id = $1
        GROUP BY o.order_id
        ORDER BY o.order_date DESC  -- Corrected column name
        `,
        [user_id]
      );

      res.json({ orders: ordersResult.rows });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ====== New Routes for Store Owners ======

// Middleware to check if the user is a store owner
const authenticateStoreOwner = authenticateToken(["store_owner"], "store");

// Store Owner Sign Up
router.post("/owners/signup", async (req, res) => {
  try {
    const { fname, lname, gender, email, phoneno, cnic, address, password } =
      req.body;

    // Basic validation (you can enhance this)
    if (!fname || !lname || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // Check if email already exists in store_owners
    const existingOwner = await pool.query(
      "SELECT * FROM store_owners WHERE email = $1",
      [email]
    );
    if (existingOwner.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert store owner into the database
    const newOwner = await pool.query(
      `INSERT INTO store_owners (fname, lname, gender, email, phoneno, cnic, password, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [fname, lname, gender, email, phoneno, cnic, hashedPassword, address]
    );

    // Generate JWT token with 'site' field
    const token = jwt.sign(
      { id: newOwner.rows[0].owner_id, type: "store_owner", site: "store" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, user: newOwner.rows[0] });
  } catch (error) {
    console.error("Error during Store Owner signup:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Store Owner Login
router.post("/owners/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const ownerQuery = await pool.query(
      "SELECT * FROM store_owners WHERE email = $1",
      [email]
    );

    if (ownerQuery.rows.length === 0) {
      return res.status(400).json({ error: "Store Owner not found" });
    }

    const owner = ownerQuery.rows[0];
    const validPassword = await bcrypt.compare(password, owner.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Generate JWT token with 'site' field
    const token = jwt.sign(
      { id: owner.owner_id, type: "store_owner", site: "store" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        owner_id: owner.owner_id,
        fname: owner.fname,
        lname: owner.lname,
        email: owner.email,
        type: owner.type,
        site: owner.site,
      },
    });
  } catch (error) {
    console.error("Error during Store Owner login:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch Medicines for Store Owner
router.get("/owners/medicines", authenticateStoreOwner, async (req, res) => {
  try {
    const storeOwnerId = req.user.id;

    const medicines = await pool.query(
      "SELECT * FROM medicines WHERE sold_by = $1",
      [storeOwnerId]
    );

    res.json(medicines.rows);
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add Medicine
router.post(
  "/owners/medicines",
  authenticateStoreOwner,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, stock, category } = req.body;
      const image = req.file ? req.file.buffer : null;
      const image_type = req.file ? req.file.mimetype.split("/")[1] : null;
      const storeOwnerId = req.user.id;

      // Validate price and stock
      const numericPrice = parseFloat(price);
      const numericStock = parseInt(stock, 10);

      if (isNaN(numericPrice) || isNaN(numericStock)) {
        return res
          .status(400)
          .json({ error: "Price and stock must be numbers." });
      }

      // Insert medicine
      const result = await pool.query(
        `INSERT INTO medicines (name, description, price, stock, category, image, image_type, sold_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [
          name,
          description,
          numericPrice,
          numericStock,
          category,
          image,
          image_type,
          storeOwnerId,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error adding medicine:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update Medicine
router.put(
  "/owners/medicines/:id",
  authenticateStoreOwner,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, stock, category } = req.body;
      const image = req.file ? req.file.buffer : null;
      const image_type = req.file ? req.file.mimetype.split("/")[1] : null;
      const storeOwnerId = req.user.id;

      // Validate price and stock
      const numericPrice = parseFloat(price);
      const numericStock = parseInt(stock, 10);

      if (isNaN(numericPrice) || isNaN(numericStock)) {
        return res
          .status(400)
          .json({ error: "Price and stock must be numbers." });
      }

      // Verify ownership
      const medicineCheck = await pool.query(
        "SELECT * FROM medicines WHERE medicine_id = $1 AND sold_by = $2;",
        [id, storeOwnerId]
      );

      if (medicineCheck.rows.length === 0) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this medicine" });
      }

      // Update medicine
      const result = await pool.query(
        `UPDATE medicines SET
           name = $1,
           description = $2,
           price = $3,
           stock = $4,
           category = $5,
           image = COALESCE($6, image),
           image_type = COALESCE($7, image_type)
         WHERE medicine_id = $8 RETURNING *;`,
        [
          name,
          description,
          numericPrice,
          numericStock,
          category,
          image,
          image_type,
          id,
        ]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating medicine:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete Medicine
router.delete(
  "/owners/medicines/:id",
  authenticateStoreOwner,
  async (req, res) => {
    try {
      const { id } = req.params;
      const storeOwnerId = req.user.id;

      // Verify ownership
      const medicineCheck = await pool.query(
        "SELECT * FROM medicines WHERE medicine_id = $1 AND sold_by = $2;",
        [id, storeOwnerId]
      );

      if (medicineCheck.rows.length === 0) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this medicine" });
      }

      // Delete medicine
      await pool.query("DELETE FROM medicines WHERE medicine_id = $1;", [id]);

      res.json({ message: "Medicine deleted successfully" });
    } catch (error) {
      console.error("Error deleting medicine:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update Order Status (Store Owner can update orders related to their products)
router.put(
  "/owners/orders/:id/status",
  authenticateStoreOwner,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const storeOwnerId = req.user.id;

      // Check if the order contains products from this store owner
      const orderItems = await pool.query(
        `SELECT oi.*
         FROM order_items oi
         JOIN medicines m ON oi.medicine_id = m.medicine_id
         WHERE oi.order_id = $1 AND m.sold_by = $2;`,
        [id, storeOwnerId]
      );

      if (orderItems.rows.length === 0) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this order" });
      }

      // Update order status
      const result = await pool.query(
        `UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *;`,
        [status, id]
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ======================================

module.exports = router;
