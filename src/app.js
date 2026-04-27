require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const initDatabase = require("./db/init");  

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

async function startApp() {
  await initDatabase(dbConfig); 
  const pool = mysql.createPool(dbConfig);

  // Rutas API
  app.get("/api/tasks", async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    res.json(rows);
  });

  app.post("/api/tasks", async (req, res) => {
    const { title } = req.body;
    await pool.query("INSERT INTO tasks (title) VALUES (?)", [title]);
    res.status(201).json({ message: "Task created" });
  });

  app.put("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    await pool.query("UPDATE tasks SET completed = ? WHERE id = ?", [completed, id]);
    res.json({ message: "Task updated" });
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ message: "Task deleted" });
  });

  app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
  });
}

startApp();