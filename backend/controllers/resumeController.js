import { fileToText } from "../services/resumeText.js";
import { analyzeResume, matchATS, generateSuggestions } from "../services/aiService.js";
import { saveUserAnalysis } from "../services/userRepository.js";

// Runs general resume analysis (JD optional)
export async function analyze(req, res) {
  try {
    const jd = req.body.jobDescription || "";
    let resumeText = (req.body.resumeText || "").trim();

    if (req.file) {
      resumeText = (await fileToText(req.file.path)).trim();
    }

    if (!resumeText) {
      return res.status(400).json({ message: "Upload a resume or paste text" });
    }

    const result = await analyzeResume(resumeText, jd);
    
    let atsResult = null;
    if (jd) {
      atsResult = await matchATS(resumeText, jd);
    }

    if (req.userId) {
      await saveUserAnalysis(req.userId, {
        resumeText,
        jobDescription: jd,
        skills: result.skills,
        missingKeywords: result.missingKeywords,
        suggestions: result.suggestions,
        atsScore: atsResult ? atsResult.matchingPercentage : null
      });
    }

    // Send full text back so the UI chat can reuse it without re-parsing the file
    return res.json({ resumeText, analysis: result, ats: atsResult });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not analyze resume" });
  }
}

// ATS style match — JD required
export async function atsScore(req, res) {
  try {
    const jd = (req.body.jobDescription || "").trim();
    let resumeText = (req.body.resumeText || "").trim();

    if (req.file) {
      resumeText = (await fileToText(req.file.path)).trim();
    }

    if (!resumeText) {
      return res.status(400).json({ message: "Upload a resume or paste text" });
    }
    if (!jd) {
      return res.status(400).json({ message: "Job description is required for ATS score" });
    }

    const result = await matchATS(resumeText, jd);
    return res.json({ resumeText, ats: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Could not compute ATS score" });
  }
}

// Simple chat endpoint for sidebar
export async function chat(req, res) {
  try {
    const { message, resumeText, jobDescription } = req.body;
    const reply = await generateSuggestions(resumeText || "", jobDescription || "", message);
    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Chat failed" });
  }
}
