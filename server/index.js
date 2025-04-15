
require("dotenv").config();
const app = require("./app");
const { initDatabase } = require("./db/database");
const PORT = process.env.PORT || 5000;

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

// Start the server
startServer();
