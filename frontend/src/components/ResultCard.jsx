import VerdictBadge from "./VerdictBadge.jsx";
import ReasoningPanel from "./ReasoningPanel.jsx";

export default function ResultCard({ result }) {
  const { company, verdict, confidence, summary, sources } = result;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>DOSSIER · CASE FILE</div>
          <h2 style={styles.company}>{company}</h2>
          <p style={styles.summary}>{summary}</p>
        </div>
        <VerdictBadge verdict={verdict} confidence={confidence} />
      </div>

      <hr style={styles.rule} />

      <ReasoningPanel result={result} />

      {sources && sources.length > 0 && (
        <>
          <hr style={styles.rule} />
          <section>
            <h4 style={styles.sourcesTitle}>Sources referenced</h4>
            <ol style={styles.sourcesList}>
              {sources.map((s, i) => (
                <li key={i} style={styles.sourceItem}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>
                    {s.title || s.url}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "var(--paper)",
    color: "var(--ink)",
    borderRadius: "3px",
    padding: "36px",
    boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },
  eyebrow: {
    fontSize: "11px",
    letterSpacing: "0.16em",
    color: "var(--muted)",
    marginBottom: "8px",
  },
  company: {
    fontFamily: "var(--font-display)",
    fontSize: "32px",
    margin: "0 0 10px",
  },
  summary: {
    fontSize: "14px",
    lineHeight: 1.55,
    color: "#3a3527",
    maxWidth: "520px",
    margin: 0,
  },
  rule: {
    border: "none",
    borderTop: "1px dashed var(--line)",
    margin: "26px 0",
  },
  sourcesTitle: {
    fontFamily: "var(--font-display)",
    fontSize: "15px",
    margin: "0 0 10px",
  },
  sourcesList: {
    margin: 0,
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  sourceItem: { fontSize: "12.5px" },
  sourceLink: {
    color: "#3a5f8a",
    textDecoration: "none",
    borderBottom: "1px solid transparent",
  },
};
