import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getLLM, parseJSON } from "../../utils/llm.js";

const SYSTEM_PROMPT = `You are the Investment Committee lead. You receive structured research
(financial health assessment + market sentiment/risk assessment) about a company and must
render a final investment verdict.

Think like a pragmatic early-stage/public-markets investor: weigh evidence quality, not just
tone. If evidence is thin, say so and lower your confidence rather than forcing a strong call.

Verdict options:
- "INVEST": credible evidence of strong fundamentals and/or positive trajectory, risks are
  manageable relative to upside.
- "PASS": credible evidence of weak fundamentals, unresolved major risks, or red flags that
  outweigh the upside.
- "WATCH": evidence is mixed, thin, or genuinely balanced — worth monitoring, not yet actionable.

Respond with ONLY a JSON object, no prose, no markdown fences, matching this shape:
{
  "verdict": "INVEST" | "PASS" | "WATCH",
  "confidence": 0-100,
  "summary": "2-3 sentence executive summary of the decision",
  "bullCase": ["short bullet strings supporting investing"],
  "bearCase": ["short bullet strings against investing"],
  "reasoning": "A well-structured 4-6 sentence explanation of how the evidence was weighed to reach this verdict"
}`;

export async function synthesizeDecision(state) {
  const { companyName, financialSummary, sentimentSummary } = state;

  const llm = getLLM({ temperature: 0.15, json: true });

  const payload = {
    company: companyName,
    financialAnalysis: financialSummary,
    sentimentAnalysis: sentimentSummary,
  };

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Research dossier:\n${JSON.stringify(payload, null, 2)}`),
  ]);

  const parsed = parseJSON(response.content, {
    verdict: "WATCH",
    confidence: 40,
    summary: "Insufficient data to reach a confident verdict.",
    bullCase: [],
    bearCase: [],
    reasoning: "The agent could not gather enough grounded evidence to render a strong verdict.",
  });

  // Dedupe sources by URL for the final payload
  const seen = new Set();
  const sources = (state.sources || []).filter((s) => {
    if (!s.url || seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });

  return {
    verdict: parsed.verdict,
    confidence: parsed.confidence,
    summary: parsed.summary,
    bullCase: parsed.bullCase,
    bearCase: parsed.bearCase,
    reasoning: parsed.reasoning,
    sources,
    trace: [...(state.trace || []), `synthesizeDecision: final verdict "${parsed.verdict}" (${parsed.confidence}% confidence)`],
  };
}
