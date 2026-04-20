import mongoose from "mongoose";
import { setUserPersistence } from "../services/userRepository.js";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    setUserPersistence("memory");
    console.warn(
      "MONGODB_URI is not set — users are stored in memory only (lost when the server restarts).\n" +
        "Add MONGODB_URI to backend/.env for persistent signup/login (local or Atlas)."
    );
    return false;
  }

  try {
    await mongoose.connect(uri);
    setUserPersistence("mongo");
    console.log("MongoDB connected");
    return true;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error("Fix MONGODB_URI or start MongoDB, then restart the server.");
    process.exit(1);
  }
}
