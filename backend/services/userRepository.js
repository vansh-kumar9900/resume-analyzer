import User from "../models/User.js";
import * as memory from "./userStore.js";

let mode = "memory";

export function setUserPersistence(next) {
  mode = next === "mongo" ? "mongo" : "memory";
}

export async function findUserByEmail(email) {
  const key = email.toLowerCase();
  if (mode === "mongo") {
    const doc = await User.findOne({ email: key }).lean();
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
    };
  }
  return memory.findUserByEmail(email);
}

export async function createUser({ name, email, passwordHash }) {
  const key = email.toLowerCase();
  if (mode === "mongo") {
    try {
      const doc = await User.create({ name, email: key, passwordHash });
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
      };
    } catch (err) {
      if (err.code === 11000) return null;
      throw err;
    }
  }
  return memory.createUser({ name, email, passwordHash });
}

export async function saveUserAnalysis(userId, analysisData) {
  if (mode === "mongo") {
    try {
      await User.findByIdAndUpdate(userId, {
        $push: { analyses: analysisData }
      });
    } catch (err) {
      console.error("Failed to save analysis to user history:", err.message);
    }
  }
}
