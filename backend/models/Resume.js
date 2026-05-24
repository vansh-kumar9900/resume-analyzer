import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, default: "" },
  atsScore: { type: Number, default: null },
  filename: { type: String, required: true },
  fileData: { type: String, required: true }, // base64 PDF
  mimetype: { type: String, default: "application/pdf" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("VaultResume", resumeSchema);