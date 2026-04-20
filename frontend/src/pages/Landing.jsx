import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const features = [
  { icon: "", title: "Resume Analysis", text: "Extracts your skills, finds gaps, and gives actionable tips — powered by AI." },
  { icon: "", title: "ATS Score Matching", text: "Compare your resume to any job description and get an exact percentage match score." },
  { icon: "", title: "AI Coach", text: "Chat with the AI to refine your summary, rewrite bullet points, and prepare for interviews." },
];

const steps = [
  { n: "01", title: "Upload your resume", desc: "Drop a PDF or paste plain text — we handle the rest." },
  { n: "02", title: "Add a job description", desc: "Optional for analysis, required for ATS score." },
  { n: "03", title: "Get AI feedback instantly", desc: "Skills, gaps, suggestions, and an ATS score in seconds." },
];

export default function Landing() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0f0f10", color: "#e0e0e0" }}>
      <Navbar dark />

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section style={{ padding: "90px 0 80px", textAlign: "center", background: "radial-gradient(ellipse at 50% 0%, #1a2a1a 0%, #0f0f10 65%)" }}>
          <div className="container">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1a2a1a", border: "1px solid #2d4a2d", borderRadius: 99, padding: "5px 16px", fontSize: 12, color: "#81c784", marginBottom: 28, fontWeight: 600 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf50" }} />
              Powered by NVIDIA Llama 3.1 AI
            </div>

            <h1 style={{ fontSize: "clamp(36px, 6vw, 66px)", margin: "0 0 20px", lineHeight: 1.1, fontWeight: 900, letterSpacing: "-0.03em", color: "#fff" }}>
              Land your next job<br />
              <span style={{ background: "linear-gradient(90deg, #4caf50, #81c784)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                with AI-powered insights
              </span>
            </h1>

            <p style={{ maxWidth: 560, margin: "0 auto 40px", fontSize: "clamp(15px, 2vw, 18px)", color: "#888", lineHeight: 1.7 }}>
              Upload your resume and get skills analysis, ATS match score, and personalized suggestions from an AI coach — completely free.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/signup" style={{ background: "#388e3c", color: "#fff", padding: "13px 30px", borderRadius: 12, fontWeight: 700, fontSize: 16, display: "inline-block" }}>
                Get Started Free →
              </Link>
              <Link to="/login" style={{ background: "#161618", color: "#aaa", border: "1px solid #2a2a2e", padding: "13px 30px", borderRadius: 12, fontWeight: 600, fontSize: 16, display: "inline-block" }}>
                Login
              </Link>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section style={{ padding: "72px 0", background: "#0f0f10", borderTop: "1px solid #1a1a1e" }}>
          <div className="container">
            <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3vw, 34px)", margin: "0 0 8px", color: "#fff" }}>How it works</h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: 52, fontSize: 15 }}>Three steps to a better resume</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
              {steps.map(s => (
                <div key={s.n} style={{ textAlign: "center", padding: "0 12px" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#2d4a2d", lineHeight: 1, marginBottom: 14 }}>{s.n}</div>
                  <div style={{ fontWeight: 700, color: "#e0e0e0", fontSize: 16, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ color: "#666", fontSize: 14, lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: "72px 0", background: "#161618", borderTop: "1px solid #1a1a1e" }}>
          <div className="container">
            <h2 style={{ textAlign: "center", fontSize: "clamp(22px, 3vw, 34px)", margin: "0 0 8px", color: "#fff" }}>Everything you need</h2>
            <p style={{ textAlign: "center", color: "#666", marginBottom: 52, fontSize: 15 }}>All tools in one place</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {features.map(f => (
                <div key={f.title} style={{ background: "#0f0f10", border: "1px solid #2a2a2e", borderRadius: 16, padding: "28px 24px", transition: "border-color 0.2s" }}>
                  <div style={{ fontSize: 34, marginBottom: 14 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, color: "#81c784", marginBottom: 10, fontSize: 17 }}>{f.title}</div>
                  <div style={{ color: "#777", fontSize: 14, lineHeight: 1.65 }}>{f.text}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "80px 0", background: "#0f0f10", borderTop: "1px solid #1a1a1e", textAlign: "center" }}>
          <div className="container">
            <h2 style={{ color: "#fff", fontSize: "clamp(22px, 3vw, 38px)", margin: "0 0 12px" }}>Ready to improve your resume?</h2>
            <p style={{ color: "#666", marginBottom: 36, fontSize: 16 }}>Create a free account — no credit card needed.</p>
            <Link to="/signup" style={{ display: "inline-block", background: "#388e3c", color: "#fff", fontWeight: 700, padding: "14px 40px", borderRadius: 12, fontSize: 17 }}>
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      <Footer dark />
    </div>
  );
}
