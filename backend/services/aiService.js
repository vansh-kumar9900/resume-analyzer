// AI Service — NVIDIA NIM (Llama 3.1) with smart fallback

const NVIDIA_API_KEY = (process.env.NVIDIA_API_KEY || "").trim();
const NVIDIA_MODEL   = (process.env.NVIDIA_MODEL   || "meta/llama-3.1-8b-instruct").trim();
const NVIDIA_BASE    = "https://integrate.api.nvidia.com/v1";

async function callNvidia(messages, temperature = 0.4) {
  if (!NVIDIA_API_KEY) return null;

  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages,
      temperature,
      max_tokens: 1024,
      stream: false,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`NVIDIA API error (${res.status}): ${text.slice(0, 400)}`);

  let data;
  try { data = JSON.parse(text); } catch { throw new Error("NVIDIA returned non-JSON: " + text.slice(0, 200)); }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

function cleanJSON(raw) {
  return raw
    .replace(/^```(?:json)?[\r\n]*/i, "")
    .replace(/```[\r\n]*$/,           "")
    .trim();
}

// ─── Resume Analysis ──────────────────────────────────────────────────────────
export async function analyzeResume(resumeText, jobDescription) {
  if (!resumeText?.trim()) throw new Error("Resume text is empty");

  const sysPrompt =
    'You are a professional resume coach. Respond ONLY with a valid JSON object — no markdown fences, no extra text. The object must have exactly three keys: "skills" (array of strings), "missingKeywords" (array of strings), "suggestions" (array of strings).';

  const userPrompt =
    `Resume:\n${resumeText.slice(0, 12000)}` +
    (jobDescription ? `\n\nJob Description:\n${jobDescription.slice(0, 8000)}` : "");

  try {
    const raw = await callNvidia(
      [{ role: "system", content: sysPrompt }, { role: "user", content: userPrompt }],
      0.3
    );
    if (raw) {
      try { return JSON.parse(cleanJSON(raw)); } catch (e) {
        console.warn("JSON parse failed, raw was:", raw.slice(0, 300));
      }
    }
  } catch (err) {
    console.warn("NVIDIA call failed:", err.message);
  }

  // heuristic fallback
  return {
    skills: guessSkills(resumeText),
    missingKeywords: jobDescription ? pickMissing(resumeText, jobDescription) : ["Add a job description to see missing keywords"],
    suggestions: [
      "Quantify achievements with numbers (%, $, time saved).",
      "Start every bullet with a strong action verb (Built, Led, Reduced).",
      "Keep formatting ATS-friendly — avoid tables and graphics.",
      "Tailor your summary to the specific role.",
    ],
  };
}

// ─── ATS Score ────────────────────────────────────────────────────────────────
export async function matchATS(resumeText, jobDescription) {
  if (!resumeText?.trim())     throw new Error("Resume text is empty");
  if (!jobDescription?.trim()) throw new Error("Job description is required");

  const sysPrompt =
    'You are an ATS matcher. Respond ONLY with a valid JSON object — no markdown fences, no extra text. Keys: "requiredSkills" (array of strings), "matchingPercentage" (number 0-100), "notes" (one short string).';

  const userPrompt =
    `Resume:\n${resumeText.slice(0, 12000)}\n\nJob Description:\n${jobDescription.slice(0, 8000)}`;

  try {
    const raw = await callNvidia(
      [{ role: "system", content: sysPrompt }, { role: "user", content: userPrompt }],
      0.2
    );
    if (raw) {
      try { return JSON.parse(cleanJSON(raw)); } catch {}
    }
  } catch (err) {
    console.warn("NVIDIA ATS call failed:", err.message);
  }

  const req     = guessSkills(jobDescription).slice(0, 8);
  const has     = new Set(guessSkills(resumeText).map(s => s.toLowerCase()));
  const matched = req.filter(s => has.has(s.toLowerCase()));
  const pct     = req.length ? Math.round((matched.length / req.length) * 100) : 65;
  return { requiredSkills: req, matchingPercentage: Math.min(98, Math.max(30, pct)), notes: "Heuristic score — NVIDIA key active but fell back." };
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export async function generateSuggestions(resumeText, jobDescription, userMessage) {
  if (!userMessage?.trim()) throw new Error("Message is empty");

  const sysPrompt = "You are a helpful, concise resume coach. Give practical, specific advice.";
  const userPrompt =
    `User question: ${userMessage}` +
    (resumeText    ? `\n\nResume:\n${resumeText.slice(0, 8000)}`       : "") +
    (jobDescription? `\n\nJob description:\n${jobDescription.slice(0, 4000)}` : "");

  try {
    const reply = await callNvidia(
      [{ role: "system", content: sysPrompt }, { role: "user", content: userPrompt }],
      0.6
    );
    if (reply) return reply;
  } catch (err) {
    console.warn("NVIDIA chat failed:", err.message);
  }

  return "Tip: Rewrite bullets as Action + Context + Result. E.g. \"Reduced page load time by 30% by caching API responses.\" (NVIDIA API unavailable right now — check your key in backend/.env)";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function guessSkills(text) {
  const kw = [
    "JavaScript","TypeScript","React","Vue","Angular","Node.js","Express",
    "Python","Django","FastAPI","SQL","PostgreSQL","MySQL","MongoDB",
    "AWS","GCP","Azure","Docker","Kubernetes","Git","CI/CD","REST","GraphQL",
    "Linux","Agile","Scrum","Leadership","Communication","Project Management",
    "Excel","Figma","Machine Learning","TensorFlow","PyTorch","Java","C++","C#",
  ];
  const lo = text.toLowerCase();
  return kw.filter(k => lo.includes(k.toLowerCase()));
}

function pickMissing(resume, jd) {
  const words   = jd.toLowerCase().split(/[^a-z0-9+#.]+/g).filter(w => w.length > 4);
  const rLow    = resume.toLowerCase();
  const missing = [];
  const seen    = new Set();
  for (const w of words) {
    if (!rLow.includes(w) && !seen.has(w)) { seen.add(w); missing.push(w); if (missing.length >= 8) break; }
  }
  return missing.length ? missing : ["communication", "stakeholders", "metrics"];
}
