import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadResume.js";
import { analyze, atsScore, chat } from "../controllers/resumeController.js";

const router = Router();

router.use(requireAuth);

// If the client sends multipart, parse the optional file; otherwise continue (JSON body)
function optionalResumeFile(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return uploadResume.single("resume")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || "Upload error" });
      next();
    });
  }
  next();
}

router.post("/analyze", optionalResumeFile, analyze);
router.post("/ats-score", optionalResumeFile, atsScore);
router.post("/chat", chat);

export default router;
