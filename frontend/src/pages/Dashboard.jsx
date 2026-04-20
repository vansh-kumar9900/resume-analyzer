import { useEffect, useRef, useState, useMemo } from "react";
import Navbar from "../components/Navbar.jsx";
import { analyzeResume, atsScore, chatAI } from "../services/api.js";

export default function Dashboard() {
  // ── Left panel state ───────────────────────────────────────────────────────
  const [file, setFile]               = useState(null);
  const [pastedResume, setPastedResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis]       = useState(null);
  const [ats, setAts]                 = useState(null);
  const [resumeSnapshot, setResumeSnapshot] = useState("");
  const [error, setError]             = useState("");
  const [busy, setBusy]               = useState(""); // "analyze" | "ats" | ""
  const [dragging, setDragging]       = useState(false);
  const [activeTab, setActiveTab]     = useState("upload"); // "upload" | "results"

  // ── Chat state ─────────────────────────────────────────────────────────────
  const [chatInput, setChatInput]     = useState("");
  const [messages, setMessages]       = useState([
    { role: "ai", text: "Hi! Upload your resume and run an analysis, then ask me anything about it." },
  ]);
  const [chatBusy, setChatBusy]       = useState(false);
  const chatEndRef                    = useRef(null);

  const canRun = useMemo(() => Boolean(file || pastedResume.trim()), [file, pastedResume]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  async function runAnalyze() {
    setError(""); setBusy("analyze");
    try {
      const data = await analyzeResume({ file, resumeText: pastedResume, jobDescription });
      setAnalysis(data.analysis);
      setAts(data.ats || null);
      setResumeSnapshot(data.resumeText || "");
      setActiveTab("results");
      let successMsg = "Resume analyzed!";
      if (data.ats) successMsg += ` ATS match score is ${data.ats.matchingPercentage}%.`;
      successMsg += " Ask me anything about your resume.";
      setMessages(m => [...m, { role: "ai", text: successMsg }]);
    } catch (err) { setError(err.message); }
    finally { setBusy(""); }
  }

  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg || chatBusy) return;
    setChatInput("");
    setMessages(m => [...m, { role: "user", text: msg }]);
    setChatBusy(true);
    try {
      const data = await chatAI({ message: msg, resumeText: resumeSnapshot, jobDescription });
      setMessages(m => [...m, { role: "ai", text: data.reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: "ai", text: `⚠️ Error: ${err.message}` }]);
    } finally { setChatBusy(false); }
  }

  function onChatKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#0f0f10" }}>
      <Navbar dark />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── LEFT: AI Chat Panel (like Cursor) ────────────────────────────── */}
        <div style={{
          width: 380, minWidth: 320, maxWidth: 420,
          background: "#161618",
          borderRight: "1px solid #2a2a2e",
          display: "flex", flexDirection: "column",
          height: "100%",
        }}>
          {/* Chat header */}
          <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid #2a2a2e" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4caf50" }} />
              <span style={{ color: "#e0e0e0", fontWeight: 700, fontSize: 14 }}>AI Coach</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 3, paddingLeft: m.role === "ai" ? 4 : 0 }}>
                  {m.role === "user" ? "You" : "AI Coach"}
                </div>
                <div style={{
                  maxWidth: "88%",
                  padding: "9px 13px",
                  borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: m.role === "user" ? "#388e3c" : "#222226",
                  color: m.role === "user" ? "#fff" : "#ddd",
                  fontSize: 13, lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatBusy && (
              <div style={{ paddingLeft: 4 }}>
                <span style={{ color: "#555", fontSize: 12 }}>AI is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ padding: "8px 12px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid #222" }}>
            {["Improve my summary", "What skills am I missing?", "Rewrite a bullet point"].map(q => (
              <button key={q} onClick={() => { setChatInput(q); }}
                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, background: "#222", border: "1px solid #333", color: "#aaa", cursor: "pointer" }}>
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px 14px", borderTop: "1px solid #2a2a2e" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={onChatKey}
                placeholder="Ask about your resume... (Enter to send)"
                rows={2}
                style={{
                  flex: 1, resize: "none", background: "#222226",
                  border: "1px solid #333", borderRadius: 10,
                  padding: "9px 12px", color: "#e0e0e0", fontSize: 13,
                  outline: "none", fontFamily: "inherit",
                }}
              />
              <button onClick={sendChat} disabled={chatBusy || !chatInput.trim()}
                style={{
                  background: chatBusy ? "#333" : "#388e3c",
                  border: "none", borderRadius: 10, padding: "9px 14px",
                  color: "#fff", cursor: chatBusy ? "not-allowed" : "pointer",
                  fontSize: 18, lineHeight: 1,
                }}>
                ↑
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Main workspace ─────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#0f0f10" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #2a2a2e", background: "#161618", padding: "0 20px" }}>
            {[["upload", "Upload"], ["results", "Results"]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{
                  padding: "12px 20px", background: "transparent", border: "none",
                  borderBottom: activeTab === id ? "2px solid #4caf50" : "2px solid transparent",
                  color: activeTab === id ? "#4caf50" : "#666",
                  fontWeight: activeTab === id ? 700 : 400,
                  cursor: "pointer", fontSize: 13, transition: "all 0.15s",
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

            {/* UPLOAD TAB */}
            {activeTab === "upload" && (
              <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gap: 18 }}>
                <div>
                  <h2 style={{ color: "#e0e0e0", margin: "0 0 4px", fontSize: 22 }}>Analyze your resume</h2>
                  <p style={{ color: "#666", margin: 0, fontSize: 14 }}>Upload a PDF/TXT or paste your resume text below</p>
                </div>

                {/* Drop zone */}
                <div
                  onDragEnter={e => { e.preventDefault(); setDragging(true); }}
                  onDragOver={e => e.preventDefault()}
                  onDragLeave={e => { e.preventDefault(); setDragging(false); }}
                  onDrop={onDrop}
                  style={{
                    border: `2px dashed ${dragging ? "#4caf50" : "#2a2a2e"}`,
                    borderRadius: 14, padding: "28px 20px", textAlign: "center",
                    background: dragging ? "#1a2a1a" : "#161618",
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                  onClick={() => document.getElementById("fileInput").click()}
                >

                  <div style={{ color: "#aaa", marginBottom: 8, fontSize: 14 }}>Drag & drop PDF or TXT here, or click to browse</div>
                  {file
                    ? <div style={{ color: "#4caf50", fontWeight: 600, fontSize: 13 }}>✓ {file.name}</div>
                    : <div style={{ color: "#555", fontSize: 12 }}>Supports PDF and TXT files</div>
                  }
                  <input id="fileInput" type="file" accept=".pdf,.txt" style={{ display: "none" }}
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>

                {/* Paste resume */}
                <div>
                  <label style={{ color: "#888", fontSize: 13, display: "block", marginBottom: 6 }}>Or paste resume text</label>
                  <textarea value={pastedResume} onChange={e => setPastedResume(e.target.value)}
                    rows={7} placeholder="Paste your resume here..."
                    style={{ ...darkTA, width: "100%" }} />
                </div>

                {/* Job description */}
                <div>
                  <label style={{ color: "#888", fontSize: 13, display: "block", marginBottom: 6 }}>
                    Job description <span style={{ color: "#555" }}>(required for ATS score)</span>
                  </label>
                  <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                    rows={5} placeholder="Paste the job description..."
                    style={{ ...darkTA, width: "100%" }} />
                </div>

                {error && <div style={{ color: "#ef5350", background: "#2a1515", borderRadius: 10, padding: "10px 14px", fontSize: 14 }}>{error}</div>}

                {/* Buttons */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={runAnalyze} disabled={!canRun || !!busy}
                    style={{ ...darkBtn("#388e3c"), opacity: (!canRun || !!busy) ? 0.5 : 1 }}>
                    {busy === "analyze" ? "Processing..." : "Analyze & Score Resume"}
                  </button>
                </div>
              </div>
            )}

            {/* RESULTS TAB */}
            {activeTab === "results" && (
              <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 18 }}>
                {!analysis && !ats && (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#555" }}>
                    <div style={{ fontSize: 16 }}>No results yet — go to Upload tab and analyze your resume first</div>
                  </div>
                )}

                {ats && (
                  <div style={{ background: "#161618", border: "1px solid #2a2a2e", borderRadius: 16, padding: "24px 28px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <h3 style={{ color: "#e0e0e0", margin: 0, fontSize: 18 }}>ATS Match Score</h3>
                      <div style={{
                        fontSize: 48, fontWeight: 900,
                        color: ats.matchingPercentage >= 70 ? "#4caf50" : ats.matchingPercentage >= 50 ? "#ff9800" : "#ef5350"
                      }}>{ats.matchingPercentage}%</div>
                    </div>
                    <div style={{ background: "#222", borderRadius: 99, height: 10, overflow: "hidden", marginBottom: 16 }}>
                      <div style={{ height: "100%", width: `${ats.matchingPercentage}%`,
                        background: ats.matchingPercentage >= 70 ? "#4caf50" : ats.matchingPercentage >= 50 ? "#ff9800" : "#ef5350",
                        transition: "width 1s ease", borderRadius: 99 }} />
                    </div>
                    {ats.notes && <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>{ats.notes}</p>}
                    {ats.requiredSkills?.length > 0 && (
                      <div>
                        <div style={{ color: "#aaa", fontSize: 13, marginBottom: 10, fontWeight: 600 }}>Required Skills from JD</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {ats.requiredSkills.map(s => (
                            <span key={s} style={{ background: "#1a2a1a", border: "1px solid #2d4a2d", color: "#81c784", padding: "4px 12px", borderRadius: 99, fontSize: 12 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {analysis && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    <ResultCard title="Skills Found" items={analysis.skills} color="#4caf50" bg="#1a2a1a" border="#2d4a2d" />
                    <ResultCard title="Missing Keywords" items={analysis.missingKeywords} color="#ef5350" bg="#2a1515" border="#4a2d2d" />
                    <ResultCard title="Suggestions" items={analysis.suggestions} color="#ff9800" bg="#2a1f10" border="#4a3a1a" fullWidth />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>
    </div>
  );
}

function ResultCard({ title, items, color, bg, border, fullWidth }) {
  return (
    <div style={{
      background: "#161618", border: "1px solid #2a2a2e",
      borderRadius: 14, padding: "18px 20px",
      gridColumn: fullWidth ? "1/-1" : undefined,
    }}>
      <div style={{ color, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{title}</div>
      {!items?.length
        ? <div style={{ color: "#555", fontSize: 13 }}>Nothing here yet.</div>
        : <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
            {items.map((x, i) => (
              <li key={i} style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5 }}>{x}</li>
            ))}
          </ul>
      }
    </div>
  );
}

const darkTA = {
  background: "#161618", border: "1px solid #2a2a2e",
  borderRadius: 10, padding: "10px 14px",
  color: "#e0e0e0", fontSize: 13,
  outline: "none", resize: "vertical",
  fontFamily: "inherit", boxSizing: "border-box",
};

function darkBtn(bg) {
  return {
    background: bg, border: "none", borderRadius: 10,
    padding: "11px 22px", color: "#fff",
    fontWeight: 600, fontSize: 14, cursor: "pointer",
  };
}
