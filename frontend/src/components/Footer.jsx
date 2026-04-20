export default function Footer({ dark }) {
  const bg     = dark ? "#161618" : "#fff";
  const border = dark ? "#2a2a2e" : "#d7e8da";
  const color  = dark ? "#555"    : "#888";
  return (
    <footer style={{ background: bg, borderTop: `1px solid ${border}` }}>
      <div className="container" style={{ padding: "18px 0", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ color, fontSize: 13 }}>© {new Date().getFullYear()} Resume Analyzer — built for learning.</span>
        <span style={{ color, fontSize: 12 }}>AI Powered</span>
      </div>
    </footer>
  );
}
