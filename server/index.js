
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { initDatabase } = require("./db/database");

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/vms", require("./routes/vms")); // Updated from /vm to /vms
app.use("/api/users", require("./routes/users"));

// Basic route for checking server status
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

// Export the app for use in other files (like server.js)
module.exports = { app };
