import fs from "fs";
import path from "path";
import Resume from "../models/Resume.js";

export const RESUMES_DIR = path.join(process.cwd(), "uploads", "resumes");

if (!fs.existsSync(RESUMES_DIR)) {
  fs.mkdirSync(RESUMES_DIR, { recursive: true });
}

export async function saveResume({ name, company, atsScore, file }) {
  const entry = await Resume.create({
    name,
    company: company || "",
    atsScore: atsScore != null ? Number(atsScore) : null,
    filename: file.originalname,
    filepath: `/uploads/resumes/${file.filename}`,
    thumbnailPath: null,
    createdAt: new Date(),
  });
  return entry;
}

export async function getAllResumes() {
  return Resume.find().sort({ createdAt: -1 });
}

export async function deleteResume(id) {
  const doc = await Resume.findById(id);
  if (!doc) throw new Error("Resume not found");

  // Strip leading slash so path.join works correctly on all platforms
  const relative = doc.filepath.replace(/^[/\\]+/, "");
  const fullPath = path.join(process.cwd(), relative);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }

  await Resume.findByIdAndDelete(id);
}
