import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

class Database {
  private uri: string;

  constructor() {
    this.uri = process.env.MONGO_URI || "mongodb://localhost:27017/profio-dbcm-app";
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(this.uri);
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log("🛑 MongoDB disconnected");
    } catch (err) {
      console.error("Error while disconnecting MongoDB:", err);
    }
  }
}

export default Database;   // 👈 important
