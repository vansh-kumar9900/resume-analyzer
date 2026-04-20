import { Link, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../services/api.js";

export default function Navbar({ dark }) {
  const navigate  = useNavigate();
  const loggedIn  = Boolean(getToken());

  function logout() { clearToken(); navigate("/login"); }

  const bg     = dark ? "#161618" : "#fff";
  const border = dark ? "#2a2a2e" : "#d7e8da";
  const text   = dark ? "#e0e0e0" : "#1b1b1b";
  const muted  = dark ? "#888"    : "#388e3c";

  return (
    <header style={{ background: bg, borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0" }}>
        <Link to="/" style={{ color: dark ? "#81c784" : "#2e7d32", textDecoration: "none", fontWeight: 800, fontSize: 18 }}>
          Resume Analyzer
        </Link>
        <nav style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {loggedIn ? (
            <>
              <Link to="/dashboard" style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${border}`, color: muted, fontSize: 13, fontWeight: 600 }}>Dashboard</Link>
              <button onClick={logout} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${border}`, background: "transparent", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${border}`, color: dark ? "#aaa" : "#388e3c", fontSize: 13, fontWeight: 600 }}>Login</Link>
              <Link to="/signup" style={{ padding: "7px 16px", borderRadius: 8, background: "#388e3c", color: "#fff", fontSize: 13, fontWeight: 700 }}>Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
