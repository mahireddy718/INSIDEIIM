import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { newsSearch } from "../tools/webSearch.js";
import { getLLM, parseJSON } from "../../utils/llm.js";

const SYSTEM_PROMPT = `You are a risk & sentiment analyst inside an investment research pipeline.
You are given recent news snippets about a company. Assess market sentiment and surface risks.

Rules:
- Base sentiment on the actual tone/content of the articles, not on the company's reputation
  from general knowledge.
- Actively look for red flags: lawsuits, layoffs, regulatory action, leadership churn,
  declining metrics, controversy, negative press cycles.
- Also note genuine positive catalysts if present: product launches, partnerships, awards,
  growth milestones.
- Respond with ONLY a JSON object, no prose, no markdown fences, matching this shape:
{
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "recentDevelopments": ["short bullet strings of notable recent news"],
  "riskFactors": ["short bullet strings of concrete risks found in the news"],
  "positiveCatalysts": ["short bullet strings of positive signals found in the news"]
}`;

export async function analyzeSentiment(state) {
  const { companyName } = state;

  const news = await newsSearch(`${companyName} news`, { maxResults: 6 }).catch(() => []);

  const context = news
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`)
    .join("\n\n")
    .slice(0, 10000);

  const llm = getLLM({ temperature: 0.2, json: true });

  const response = await llm.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `Company: ${companyName}\n\nRecent news context:\n${context || "(no recent news found)"}`
    ),
  ]);

  const parsed = parseJSON(response.content, {
    sentiment: "neutral",
    recentDevelopments: [],
    riskFactors: [],
    positiveCatalysts: [],
  });

  return {
    sentimentSummary: parsed,
    sources: [...(state.sources || []), ...news.map((r) => ({ title: r.title, url: r.url }))],
    trace: [...(state.trace || []), `analyzeSentiment: news sentiment is "${parsed.sentiment}"`],
  };
}
