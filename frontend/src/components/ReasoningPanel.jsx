function BulletList({ items }) {
  if (!items || items.length === 0) {
    return <p style={styles.empty}>None surfaced from available research.</p>;
  }
  return (
    <ul style={styles.list}>
      {items.map((item, i) => (
        <li key={i} style={styles.listItem}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ReasoningPanel({ result }) {
  const { reasoning, bullCase, bearCase, financialSummary, sentimentSummary } = result;

  return (
    <div style={styles.wrap}>
      <section>
        <h3 style={styles.h3}>Committee reasoning</h3>
        <p style={styles.reasoning}>{reasoning}</p>
      </section>

      <div style={styles.exhibits}>
        <section style={{ ...styles.exhibit, borderColor: "var(--invest)" }}>
          <h4 style={{ ...styles.h4, color: "var(--invest)" }}>Exhibit A — Bull case</h4>
          <BulletList items={bullCase} />
        </section>
        <section style={{ ...styles.exhibit, borderColor: "var(--pass)" }}>
          <h4 style={{ ...styles.h4, color: "var(--pass)" }}>Exhibit B — Bear case</h4>
          <BulletList items={bearCase} />
        </section>
      </div>

      <div style={styles.exhibits}>
        <section style={styles.subSection}>
          <h4 style={styles.h4}>Financial health — {financialSummary?.financialHealth}</h4>
          <p style={styles.note}>{financialSummary?.revenueOrFundingNotes}</p>
          <BulletList items={financialSummary?.keySignals} />
        </section>
        <section style={styles.subSection}>
          <h4 style={styles.h4}>Market sentiment — {sentimentSummary?.sentiment}</h4>
          <BulletList items={sentimentSummary?.recentDevelopments} />
        </section>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: "26px" },
  h3: {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    margin: "0 0 8px",
    color: "var(--ink)",
  },
  h4: {
    fontFamily: "var(--font-display)",
    fontSize: "15px",
    margin: "0 0 10px",
    color: "var(--ink)",
  },
  reasoning: {
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#3a3527",
    margin: 0,
  },
  exhibits: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },
  exhibit: {
    border: "1px solid",
    borderRadius: "2px",
    padding: "16px 18px",
    background: "rgba(255,255,255,0.35)",
  },
  subSection: {
    border: "1px solid var(--line)",
    borderRadius: "2px",
    padding: "16px 18px",
  },
  list: { margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "6px" },
  listItem: { fontSize: "13px", lineHeight: 1.5, color: "#3a3527" },
  note: { fontSize: "13px", color: "#3a3527", margin: "0 0 10px" },
  empty: { fontSize: "13px", color: "var(--muted)", fontStyle: "italic", margin: 0 },
};
