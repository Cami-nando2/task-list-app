const mysql = require("mysql2/promise");

async function initDatabase(config) {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    ssl: { rejectUnauthorized: false }
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
  await connection.query(`USE \`${config.database}\`;`);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.end();
  console.log("Database initialized successfully");
}

module.exports = initDatabase;