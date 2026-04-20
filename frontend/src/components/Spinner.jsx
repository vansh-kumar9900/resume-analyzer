export default function Spinner({ label, light }) {
  const ring = light
    ? { border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff" }
    : { border: "2px solid var(--green)", borderTopColor: "transparent" };

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span className="spinner" style={ring} />
      {label}
    </span>
  );
}
