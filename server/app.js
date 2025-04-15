
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

// Create Express app
const app = express();

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
app.use("/api/vms", require("./routes/vms")); 
app.use("/api/users", require("./routes/users"));

// Basic route for checking server status
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

module.exports = app;
