const STEPS = [
  "Filing intake — reading subject name",
  "Gathering open-source research",
  "Reviewing financial signals",
  "Scanning recent press & sentiment",
  "Drafting committee verdict",
];

export default function Loader() {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>CASE IN PROGRESS</div>
      <ul style={styles.list}>
        {STEPS.map((step, i) => (
          <li key={step} style={{ ...styles.item, animationDelay: `${i * 0.5}s` }}>
            <span style={styles.bullet}>{String(i + 1).padStart(2, "0")}</span>
            {step}
          </li>
        ))}
      </ul>
      <style>{`
        @keyframes pulseIn {
          0% { opacity: 0.25; }
          50% { opacity: 1; }
          100% { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrap: {
    border: "1px solid #2a3346",
    borderRadius: "2px",
    padding: "28px",
    background: "var(--ink-soft)",
  },
  title: {
    fontSize: "11px",
    letterSpacing: "0.16em",
    color: "var(--muted-on-ink)",
    marginBottom: "16px",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  item: {
    display: "flex",
    gap: "12px",
    alignItems: "baseline",
    fontSize: "14px",
    color: "var(--paper)",
    animation: "pulseIn 1.8s ease-in-out infinite",
  },
  bullet: {
    color: "var(--watch)",
    fontSize: "12px",
  },
};
