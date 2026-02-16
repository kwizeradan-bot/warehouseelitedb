require('dotenv').config({ debug: false });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./dbconnect');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');

const app = express();

app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// Validation middleware for POST /api/v113/inventory
function validateInventory(req, res, next) {
  const {
    inv_name,
    quantity_available,
    section,
    location,
    purchase_price,
    selling_price,
    supplier,
    condition
  } = req.body;

  // helper to check empty or whitespace strings
  const isEmpty = value =>
    value === undefined ||
    value === null ||
    typeof value !== 'string' ||
    value.trim().length === 0;

  // text fields
  if (isEmpty(inv_name)) {
    return res.status(400).json({ error: 'inv_name cannot be empty or spaces' });
  }

  if (isEmpty(section)) {
    return res.status(400).json({ error: 'section cannot be empty or spaces' });
  }

  if (isEmpty(location)) {
    return res.status(400).json({ error: 'location cannot be empty or spaces' });
  }

  if (isEmpty(supplier)) {
    return res.status(400).json({ error: 'supplier cannot be empty or spaces' });
  }

  if (isEmpty(condition)) {
    return res.status(400).json({ error: 'condition cannot be empty or spaces' });
  }

  // numeric fields
  if (
    quantity_available === undefined ||
    quantity_available === null ||
    isNaN(Number(quantity_available))
  ) {
    return res.status(400).json({ error: 'quantity_available must be a valid number' });
  }

  if (
    purchase_price === undefined ||
    purchase_price === null ||
    isNaN(Number(purchase_price))
  ) {
    return res.status(400).json({ error: 'purchase_price must be a valid number' });
  }

  if (
    selling_price === undefined ||
    selling_price === null ||
    isNaN(Number(selling_price))
  ) {
    return res.status(400).json({ error: 'selling_price must be a valid number' });
  }

  next();
}

// POST create inventory item
app.post('/api/v113/inventory', validateInventory, (req, res) => {
  const data = req.body;
  const sql = 'INSERT INTO inventory SET ?';

  db.query(sql, data, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database insert error' });
    }
    res.json({ message: 'Created', id: result.insertId });
  });
});

// GET all inventory
app.get('/api/v113/inventory', (req, res) => {
  const sql = 'SELECT * FROM inventory';

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database select error' });
    }
    res.json(rows);
  });
});

// PUT update by id
app.put('/api/v113/inventory/:inv_id', (req, res) => {
  const id = req.params.inv_id;
  const data = req.body;
  const sql = 'UPDATE inventory SET ? WHERE inv_id = ?';

  db.query(sql, [data, id], err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database update error' });
    }
    res.json({ message: 'Updated' });
  });
});

// DELETE by id
app.delete('/api/v113/inventory/:inv_id', (req, res) => {
  const id = req.params.inv_id;
  const sql = 'DELETE FROM inventory WHERE inv_id = ?';

  db.query(sql, id, err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database delete error' });
    }
    res.json({ message: 'Deleted' });
  });
});

const JWT_SECRET = "your_super_secret_key"; // must match login secret

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token format invalid" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach decoded user info
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.get("/api/dashboard", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to your dashboard",
    user: req.user
  });
});


app.use("/api", registerRouter);
app.use("/api", loginRouter);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected server error:', err);
  res.status(500).json({ error: 'Server problem' });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
