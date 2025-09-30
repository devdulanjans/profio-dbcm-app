import app from "./app";
import Database from "./database";

const PORT = process.env.PORT || 5000;

async function startServer() {
  const db = new Database();

  try {
    await db.connect(); // wait for DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
