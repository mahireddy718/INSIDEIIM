import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getLLM, parseJSON } from "../../utils/llm.js";

const SYSTEM_PROMPT = `You are a meticulous financial analyst working inside an investment
research pipeline. You are given raw web-search snippets about a company. Extract and
reason about its financial health as best the evidence allows.

Rules:
- Only state figures/facts that are supported by the provided context. If a number isn't
  present, do not invent one — say it's unknown/unclear instead.
- Distinguish clearly between "confirmed from source" and "reasonable inference".
- Be skeptical of PR language; look for concrete signals (revenue, growth rate, funding
  rounds, profitability, burn rate, valuation trend, market share).
- Respond with ONLY a JSON object, no prose, no markdown fences, matching this shape:
{
  "financialHealth": "strong" | "moderate" | "weak" | "unclear",
  "keySignals": ["short bullet strings of concrete evidence found"],
  "revenueOrFundingNotes": "1-3 sentence summary of what's known about revenue/funding/valuation",
  "concerns": ["short bullet strings of financial red flags, or empty array"]
}`;

export async function analyzeFinancials(state) {
  const { companyName, searchResults } = state;

  const context = (searchResults || [])
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`)
    .join("\n\n")
    .slice(0, 12000); // keep prompt bounded

  const llm = getLLM({ temperature: 0.1, json: true });

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `Company: ${companyName}\n\nWeb research context:\n${context || "(no search results found)"}`
    ),
  ]);

  const parsed = parseJSON(response.content, {
    financialHealth: "unclear",
    keySignals: [],
    revenueOrFundingNotes: "Insufficient data from search results.",
    concerns: [],
  });

  return {
    financialSummary: parsed,
    trace: [...(state.trace || []), `analyzeFinancials: assessed as "${parsed.financialHealth}"`],
  };
}
