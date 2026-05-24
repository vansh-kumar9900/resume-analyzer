import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { getVaultResumes, deleteVaultResume } from "../services/api.js";

function ResumeThumbnail({ name, company }) {
  return (
    <div style={{
      height: 180,
      borderRadius: "12px 12px 0 0",
      background: "linear-gradient(135deg, #0d1f12 0%, #111a14 40%, #162018 70%, #0f1a18 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Noise / dot-grid texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
        pointerEvents: "none",
      }} />
      {/* Soft glow behind icon */}
      <div style={{
        position: "absolute",
        width: 120, height: 120,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(56,142,60,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      {/* Icon */}
      <FileText size={64} color="#4caf50" strokeWidth={1.4} style={{ position: "relative", zIndex: 1, filter: "drop-shadow(0 0 12px rgba(76,175,80,0.35))" }} />
      {/* Name */}
      <div style={{
        position: "relative", zIndex: 1,
        color: "#e0e0e0", fontWeight: 700, fontSize: 14,
        textAlign: "center", maxWidth: "85%",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {name}
      </div>
      {/* Company */}
      {company && (
        <div style={{
          position: "relative", zIndex: 1,
          color: "#5a8a5e", fontSize: 12, fontWeight: 500,
          textAlign: "center", maxWidth: "85%",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {company}
        </div>
      )}
    </div>
  );
}

function badgeStyle(bg, color) {
  return { background: bg, color, border: `1px solid ${color}33`, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function Vault() {
  const [resumes, setResumes]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [deleting, setDeleting]   = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getVaultResumes();
      setResumes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await deleteVaultResume(id);
      setResumes(r => r.filter(x => x._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f10", display: "flex", flexDirection: "column" }}>
      <Navbar dark />

      <div style={{ flex: 1, padding: "32px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ color: "#e0e0e0", margin: "0 0 6px", fontSize: 26, fontWeight: 800 }}>Resume Vault</h1>
            <p style={{ color: "#666", margin: 0, fontSize: 14 }}>Your saved resume versions with ATS scores</p>
          </div>
          <Link to="/dashboard"
            style={{ padding: "10px 20px", borderRadius: 10, background: "#388e3c", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 13 }}>
            + Analyze New Resume
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#2a1515", border: "1px solid #4a2d2d", borderRadius: 10, padding: "12px 16px", color: "#ef9090", marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "#161618", border: "1px solid #2a2a2e", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ height: 180, background: "#1a1a1c", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ height: 16, background: "#222", borderRadius: 6, marginBottom: 8, width: "70%" }} />
                  <div style={{ height: 12, background: "#222", borderRadius: 6, width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && resumes.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🗄</div>
            <h2 style={{ color: "#e0e0e0", margin: "0 0 10px", fontSize: 20 }}>Your vault is empty</h2>
            <p style={{ color: "#666", margin: "0 0 24px", fontSize: 14 }}>Analyze a resume and click "Save to Vault" to get started</p>
            <Link to="/dashboard"
              style={{ padding: "12px 28px", borderRadius: 10, background: "#388e3c", color: "#fff", textDecoration: "none", fontWeight: 600 }}>
              Analyze a Resume
            </Link>
          </div>
        )}

        {/* Card grid */}
        {!loading && resumes.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {resumes.map(r => (
              <div key={r._id} style={{
                background: "#161618",
                border: "1px solid #2a2a2e",
                borderRadius: 14,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#388e3c"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(56,142,60,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2e"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Thumbnail */}
                <ResumeThumbnail name={r.name} company={r.company} />

                {/* Card body */}
                <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Name + ATS badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <h3 style={{ color: "#e0e0e0", margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.3, wordBreak: "break-word" }}>{r.name}</h3>
                    <Atsbage score={r.atsScore} />
                  </div>

                  {/* Company */}
                  {r.company && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12 }}>🏢</span>
                      <span style={{ color: "#888", fontSize: 13 }}>{r.company}</span>
                    </div>
                  )}

                  {/* Date */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12 }}>📅</span>
                    <span style={{ color: "#555", fontSize: 12 }}>{formatDate(r.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 6 }}>
                    <a
                      href={`${import.meta.env.VITE_API_BASE?.replace("/api","") || "http://localhost:5050"}/api/vault/${r._id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, padding: "8px 0", borderRadius: 8,
                        background: "#1a2a1a", border: "1px solid #2d4a2d",
                        color: "#81c784", fontSize: 13, fontWeight: 600,
                        textAlign: "center", textDecoration: "none",
                        transition: "background 0.15s",
                      }}>
                      View PDF
                    </a>
                    <button
                      onClick={() => setConfirmId(r._id)}
                      disabled={deleting === r._id}
                      style={{
                        flex: "none", padding: "8px 14px", borderRadius: 8,
                        background: "#2a1515", border: "1px solid #4a2d2d",
                        color: "#ef9090", fontSize: 13, fontWeight: 600,
                        cursor: deleting === r._id ? "not-allowed" : "pointer",
                        opacity: deleting === r._id ? 0.5 : 1,
                        transition: "background 0.15s",
                      }}>
                      {deleting === r._id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20,
        }} onClick={e => { if (e.target === e.currentTarget) setConfirmId(null); }}>
          <div style={{
            background: "#161618", border: "1px solid #2a2a2e",
            borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 380,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}>
            <h3 style={{ color: "#e0e0e0", margin: "0 0 10px", fontSize: 18 }}>Delete Resume?</h3>
            <p style={{ color: "#888", fontSize: 14, margin: "0 0 24px", lineHeight: 1.5 }}>
              This will permanently delete the resume file and its metadata. This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => handleDelete(confirmId)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "#c62828", border: "none", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Delete
              </button>
              <button onClick={() => setConfirmId(null)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: "#2a2a2e", border: "none", color: "#aaa", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>
    </div>
  );
}

function Atsbage({ score }) {
  if (score == null) return <span style={badgeStyle("#333", "#888")}>No ATS</span>;
  if (score >= 70)   return <span style={badgeStyle("#1a3a1a", "#4caf50")}>{score}%</span>;
  if (score >= 50)   return <span style={badgeStyle("#3a2a00", "#ff9800")}>{score}%</span>;
  return               <span style={badgeStyle("#3a1515", "#ef5350")}>{score}%</span>;
}
