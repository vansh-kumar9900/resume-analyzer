import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, default: "" },
  atsScore: { type: Number, default: null },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  thumbnailPath: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("VaultResume", resumeSchema);
