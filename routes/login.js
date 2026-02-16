const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../dbConnect");

// Hardcoded JWT secret (for testing only)
const JWT_SECRET = "your_super_secret_key"; // replace this with any strong key

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = results[0];

      if (!user.password) {
        return res.status(500).json({ message: "Password not found in DB" });
      }

      try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Sign the token using the hardcoded secret
        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
            department: user.department
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.json({ token });
      } catch (error) {
        console.error("JWT ERROR:", error);
        res.status(500).json({ message: "Token generation failed" });
      }
    }
  );
});

module.exports = router;
