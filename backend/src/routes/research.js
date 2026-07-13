import { Router } from "express";
import { runDossierAgent } from "../agent/graph.js";

const router = Router();

router.post("/research", async (req, res) => {
  const { companyName } = req.body;

  if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
    return res.status(400).json({ error: "companyName is required" });
  }

  try {
    const result = await runDossierAgent(companyName.trim());
    return res.json({
      company: companyName.trim(),
      verdict: result.verdict,
      confidence: result.confidence,
      summary: result.summary,
      bullCase: result.bullCase,
      bearCase: result.bearCase,
      reasoning: result.reasoning,
      financialSummary: result.financialSummary,
      sentimentSummary: result.sentimentSummary,
      sources: result.sources,
      trace: result.trace,
    });
  } catch (err) {
    console.error("Agent run failed:", err);
    return res.status(500).json({ error: err.message || "Agent run failed" });
  }
});

export default router;
