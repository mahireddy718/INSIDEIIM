import { useState } from "react";

export default function SearchForm({ onSubmit, isLoading }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.fieldRow}>
        <span style={styles.fieldLabel}>SUBJECT</span>
        <input
          style={styles.input}
          type="text"
          placeholder="e.g. Zerodha, Nvidia, Zomato…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
      </div>
      <button style={{ ...styles.button, opacity: isLoading ? 0.5 : 1 }} type="submit" disabled={isLoading}>
        {isLoading ? "Opening file…" : "Open case file →"}
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "12px",
    alignItems: "stretch",
    flexWrap: "wrap",
  },
  fieldRow: {
    flex: "1 1 320px",
    display: "flex",
    alignItems: "center",
    background: "var(--ink-soft)",
    border: "1px solid #2a3346",
    borderRadius: "2px",
    padding: "0 16px",
  },
  fieldLabel: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    color: "var(--muted-on-ink)",
    marginRight: "14px",
    whiteSpace: "nowrap",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "var(--paper)",
    fontFamily: "var(--font-mono)",
    fontSize: "15px",
    padding: "16px 0",
  },
  button: {
    background: "var(--watch)",
    color: "#1a1204",
    border: "none",
    borderRadius: "2px",
    padding: "0 26px",
    fontFamily: "var(--font-mono)",
    fontSize: "14px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    cursor: "pointer",
  },
};
