import fs from "fs";
import Resume from "../models/Resume.js";

export async function saveResume({ name, company, atsScore, file }) {
  const fileData = fs.readFileSync(file.path).toString("base64");
  fs.unlinkSync(file.path); // delete from disk after reading

  const entry = await Resume.create({
    name,
    company: company || "",
    atsScore: atsScore != null ? Number(atsScore) : null,
    filename: file.originalname,
    fileData,
    mimetype: file.mimetype || "application/pdf",
    createdAt: new Date(),
  });
  return entry;
}

export async function getAllResumes() {
  return Resume.find().select("-fileData").sort({ createdAt: -1 });
}

export async function deleteResume(id) {
  const doc = await Resume.findById(id);
  if (!doc) throw new Error("Resume not found");
  await Resume.findByIdAndDelete(id);
}