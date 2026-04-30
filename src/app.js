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
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
};

async function startApp() {
  await initDatabase(dbConfig);
  const pool = mysql.createPool(dbConfig);

  // GET all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  // POST create task
  app.post("/api/tasks", async (req, res) => {
    const { title } = req.body;
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }
    try {
      await pool.query("INSERT INTO tasks (title) VALUES (?)", [title.trim()]);
      res.status(201).json({ message: "Task created" });
    } catch (err) {
      res.status(500).json({ message: "Error creating task" });
    }
  });

  // PUT toggle completed status
  app.put("/api/tasks/:id/toggle", async (req, res) => {
    const { id } = req.params;
    try {
      const [[task]] = await pool.query("SELECT completed FROM tasks WHERE id = ?", [id]);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const newStatus = !task.completed;
      await pool.query("UPDATE tasks SET completed = ? WHERE id = ?", [newStatus, id]);
      res.json({ message: "Task toggled", completed: newStatus });
    } catch (err) {
      res.status(500).json({ message: "Error toggling task" });
    }
  });

  // DELETE task
  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
      res.json({ message: "Task deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });
}

startApp();