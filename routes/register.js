const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../dbconnect");

router.post("/register", async (req, res) => {
  const { username, password, role ,department } = req.body;

  if (!username || !password || !role || !department) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // check if username exists
  db.query(
    "SELECT id FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (result.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const sql = `
        INSERT INTO users (username, password, role, department)
        VALUES (?, ?, ?, ?)
      `;

      db.query(sql, [username, hashedPassword, role, department], err => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "User registered successfully" });
      });
    }
  );
});

module.exports = router;
