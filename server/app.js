
const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./db/database");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const vmRoutes = require("./routes/vms");
const vmTypeRoutes = require("./routes/vmTypes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase()
  .then(() => console.log("Database initialized"))
  .catch((err) => console.error("Database initialization failed:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vms", vmRoutes);
app.use("/api/vm-types", vmTypeRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "VM Management API" });
});

module.exports = app;
