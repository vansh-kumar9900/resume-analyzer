import { Router } from "express";
import multer from "multer";
import path from "path";
import os from "os";
import { requireAuth } from "../middleware/authMiddleware.js";
import { saveResume, getAllResumes, deleteResume } from "../services/vaultService.js";

// Store temporarily in system temp folder instead of disk
const upload = multer({
  dest: os.tmpdir(),
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf") return cb(null, true);
    cb(new Error("Only PDF files can be saved to the vault"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.use(requireAuth);

router.post("/save", upload.single("resume"), async (req, res) => {
  try {
    const { name, company, atsScore } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Resume name is required" });
    if (!req.file) return res.status(400).json({ message: "PDF file is required" });

    const entry = await saveResume({ name: name.trim(), company, atsScore, file: req.file });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const resumes = await getAllResumes();
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// New route to serve PDF by id
router.get("/:id/pdf", async (req, res) => {
  try {
    const doc = await (await import("../models/Resume.js")).default.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Resume not found" });
    const buffer = Buffer.from(doc.fileData, "base64");
    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", `inline; filename="${doc.filename}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteResume(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    const status = err.message === "Resume not found" ? 404 : 500;
    res.status(status).json({ message: err.message });
  }
});

export default router;