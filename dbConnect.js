const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',          
  user: 'root',                
  password: '',                
  database: 'warehouseEliteDB' 
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.log('❌ Database connection failed');
    console.log(err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});


module.exports = db;