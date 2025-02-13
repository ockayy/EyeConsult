// roleAuth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate JWT tokens and authorize based on roles and sites.
 * @param {Array} expectedUserTypes - Array of allowed user types (e.g., ['admin']).
 * @param {String} expectedSite - Allowed site (e.g., 'store').
 */
const authenticateToken = (expectedUserTypes = [], expectedSite = "") => {
  return (req, res, next) => {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader) {
      console.warn("No authorization header found.");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const authHeaderParts = authHeader.split(" ");
    if (authHeaderParts.length !== 2 || authHeaderParts[0] !== "Bearer") {
      console.warn("Malformed authorization header.");
      return res.status(401).json({ error: "Unauthorized: Malformed token" });
    }

    const token = authHeaderParts[1];
    console.log("Received Token:", token);

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error("Token verification failed:", err);
        return res.status(403).json({ error: "Forbidden: Invalid token" });
      }
      console.log("Decoded Token Payload:", user);
      req.user = user;

      // Check user type
      if (
        expectedUserTypes.length > 0 &&
        !expectedUserTypes.includes(user.type)
      ) {
        console.error(
          `Forbidden: User type '${
            user.type
          }' is not allowed. Expected types: ${expectedUserTypes.join(", ")}`
        );
        return res.status(403).json({ error: "Forbidden: Invalid user type" });
      }

      // Check user site
      if (expectedSite && user.site !== expectedSite) {
        console.error(
          `Forbidden: User site '${user.site}' does not match expected site '${expectedSite}'`
        );
        return res.status(403).json({ error: "Forbidden: Invalid site" });
      }

      next();
    });
  };
};

module.exports = { authenticateToken };
