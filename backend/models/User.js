import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  resumeText: { type: String },
  jobDescription: { type: String },
  skills: [String],
  missingKeywords: [String],
  suggestions: [String],
  atsScore: { type: Number },
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    analyses: [analysisSchema],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
