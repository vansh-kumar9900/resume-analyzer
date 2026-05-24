import "dotenv/config.js";
import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import vaultRoutes from "./routes/vaultRoutes.js";
import { connectDB } from "./config/db.js";

if (!process.env.JWT_SECRET) {
  console.error("Set JWT_SECRET in backend/.env (see .env.example)");
  process.exit(1);
}

await connectDB();

const app = express();
const PORT = process.env.PORT || 5050;

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  process.env.FRONTEND_URL,
].filter(Boolean));

// Allow React dev server to call the API (localhost or 127.0.0.1)
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.has(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded vault resumes as static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Route groups
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/vault", vaultRoutes);

// Simple health check for debugging
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Helps catch typos while testing API routes
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use (another process is listening).\n` +
        "Stop the other server, or set a different PORT in backend/.env.\n" +
        "Windows: netstat -ano | findstr :" +
        PORT +
        "\n" +
        "Then: taskkill /PID <pid_from_last_column> /F"
    );
    process.exit(1);
  }
  throw err;
});
