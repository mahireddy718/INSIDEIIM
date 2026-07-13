const CONFIG = {
  INVEST: { color: "var(--invest)", label: "INVEST", rotate: "-6deg" },
  PASS: { color: "var(--pass)", label: "PASS", rotate: "-4deg" },
  WATCH: { color: "var(--watch)", label: "WATCH", rotate: "-5deg" },
};

export default function VerdictBadge({ verdict, confidence }) {
  const cfg = CONFIG[verdict] || CONFIG.WATCH;

  return (
    <div style={styles.wrap}>
      <div
        style={{
          ...styles.stamp,
          borderColor: cfg.color,
          color: cfg.color,
          transform: `rotate(${cfg.rotate})`,
        }}
      >
        {cfg.label}
      </div>
      <div style={styles.confidence}>
        <span style={{ ...styles.confidenceBar, width: `${confidence}%`, background: cfg.color }} />
        <span style={styles.confidenceLabel}>{confidence}% confidence</span>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
  },
  stamp: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "34px",
    border: "4px double",
    borderRadius: "6px",
    padding: "6px 22px",
    letterSpacing: "0.04em",
  },
  confidence: {
    position: "relative",
    width: "160px",
    height: "6px",
    background: "var(--paper-dim)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  confidenceBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: "3px",
  },
  confidenceLabel: {
    position: "absolute",
    top: "10px",
    right: 0,
    fontSize: "11px",
    color: "var(--muted)",
  },
};
