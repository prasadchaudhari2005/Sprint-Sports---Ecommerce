const mysql = require('mysql2');

// Create a connection pool with promise support
const pool = mysql.createPool({
  host: 'localhost', // Or your database host
  user: 'root',      // Your database username
  password: '1234',      // Your database password
  database: 'prasad_se', // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export a promise-wrapped version of the pool
module.exports = pool.promise();