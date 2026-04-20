import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, setToken } from "../services/api.js";

export default function Login() {
  const navigate  = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function onSubmit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await login({ email, password });
      setToken(data.token);
      navigate("/dashboard");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f10", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Link to="/" style={{ color: "#81c784", fontWeight: 800, fontSize: 18, marginBottom: 32, display: "block" }}>Resume Analyzer</Link>

      <div style={{ background: "#161618", border: "1px solid #2a2a2e", borderRadius: 18, padding: "36px 40px", width: "100%", maxWidth: 420 }}>
        <h1 style={{ color: "#fff", margin: "0 0 6px", fontSize: 24, fontWeight: 800 }}>Welcome back</h1>
        <p style={{ color: "#666", margin: "0 0 28px", fontSize: 14 }}>Sign in to your account</p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ color: "#888", fontSize: 13, display: "block", marginBottom: 6 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={inputStyle} placeholder="you@example.com" />
          </div>
          <div>
            <label style={{ color: "#888", fontSize: 13, display: "block", marginBottom: 6 }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={inputStyle} placeholder="••••••••" />
          </div>

          {error && <div style={{ color: "#ef5350", background: "#2a1515", borderRadius: 8, padding: "9px 12px", fontSize: 13 }}>{error}</div>}

          <button type="submit" disabled={loading}
            style={{ background: loading ? "#2a3a2a" : "#388e3c", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ color: "#555", marginTop: 20, fontSize: 13, textAlign: "center" }}>
          No account?{" "}
          <Link to="/signup" style={{ color: "#81c784", fontWeight: 600 }}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#0f0f10", border: "1px solid #2a2a2e",
  borderRadius: 10, padding: "11px 14px",
  color: "#e0e0e0", fontSize: 14, outline: "none",
  fontFamily: "inherit",
};
