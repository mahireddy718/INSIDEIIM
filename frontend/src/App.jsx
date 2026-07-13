import { useState } from "react";
import SearchForm from "./components/SearchForm.jsx";
import Loader from "./components/Loader.jsx";
import ResultCard from "./components/ResultCard.jsx";

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(companyName) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "The agent could not complete this case.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.masthead}>DOSSIER</div>
        <div style={styles.tagline}>AI Investment Research Agent — built on LangGraph.js</div>
      </header>

      <main style={styles.main}>
        <SearchForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <div style={styles.errorBox}>
            <strong>Case closed early.</strong> {error}
          </div>
        )}

        {isLoading && <Loader />}

        {result && !isLoading && <ResultCard result={result} />}

        {!result && !isLoading && !error && (
          <div style={styles.emptyState}>
            Enter a company above to open a new case file. The agent will research it, weigh
            the evidence, and render a verdict — with its reasoning shown in full.
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        Built for the InsideIIM × Altuni AI Labs take-home assignment.
      </footer>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "880px",
    margin: "0 auto",
    padding: "56px 24px 80px",
    display: "flex",
    flexDirection: "column",
    gap: "36px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    borderBottom: "1px solid #2a3346",
    paddingBottom: "24px",
  },
  masthead: {
    fontFamily: "var(--font-display)",
    fontSize: "44px",
    letterSpacing: "0.01em",
  },
  tagline: {
    fontSize: "13px",
    color: "var(--muted-on-ink)",
    letterSpacing: "0.03em",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: "26px",
  },
  errorBox: {
    border: "1px solid var(--pass)",
    color: "#f0b9b3",
    background: "rgba(163,57,47,0.12)",
    borderRadius: "2px",
    padding: "16px 18px",
    fontSize: "14px",
  },
  emptyState: {
    border: "1px dashed #2a3346",
    borderRadius: "2px",
    padding: "40px",
    color: "var(--muted-on-ink)",
    fontSize: "14px",
    lineHeight: 1.6,
    textAlign: "center",
  },
  footer: {
    fontSize: "11.5px",
    color: "var(--muted-on-ink)",
    textAlign: "center",
    letterSpacing: "0.03em",
  },
};
