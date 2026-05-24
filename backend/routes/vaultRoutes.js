import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middleware/authMiddleware.js";
import { saveResume, getAllResumes, deleteResume, RESUMES_DIR } from "../services/vaultService.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RESUMES_DIR),
  filename: (_req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
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
