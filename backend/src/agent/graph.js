import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { gatherInfo } from "./nodes/research.js";
import { analyzeFinancials } from "./nodes/financials.js";
import { analyzeSentiment } from "./nodes/sentiment.js";
import { synthesizeDecision } from "./nodes/decision.js";

/**
 * Agent state shape. Each node returns a partial object; LangGraph merges
 * it into the running state using the reducer defined per-key below.
 * Arrays use a concat reducer so nodes can each append without clobbering
 * what earlier nodes wrote (used for `sources` and `trace`).
 */
const DossierState = Annotation.Root({
  companyName: Annotation(),
  searchResults: Annotation(),
  financialSummary: Annotation(),
  sentimentSummary: Annotation(),
  verdict: Annotation(),
  confidence: Annotation(),
  summary: Annotation(),
  bullCase: Annotation(),
  bearCase: Annotation(),
  reasoning: Annotation(),
  sources: Annotation({
    reducer: (curr = [], next = []) => next, // nodes pass the full accumulated list themselves
    default: () => [],
  }),
  trace: Annotation({
    reducer: (curr = [], next = []) => next,
    default: () => [],
  }),
});

/**
 * The pipeline is intentionally a simple linear graph:
 *   gatherInfo -> analyzeFinancials -> analyzeSentiment -> synthesizeDecision
 *
 * Why linear and not a fancier branching/looping graph? See README
 * "Key decisions & trade-offs" — short version: a 7-day take-home favors a
 * pipeline that's easy to reason about and debug over a maze of conditional
 * edges. LangGraph is still doing real work for us here: explicit typed
 * state, composable nodes, and a natural place to later add branching
 * (e.g. public vs private company paths) or loops (e.g. re-search if
 * evidence is too thin) without restructuring everything.
 */
export function buildDossierGraph() {
  const graph = new StateGraph(DossierState)
    .addNode("gatherInfo", gatherInfo)
    .addNode("analyzeFinancials", analyzeFinancials)
    .addNode("analyzeSentiment", analyzeSentiment)
    .addNode("synthesizeDecision", synthesizeDecision)
    .addEdge(START, "gatherInfo")
    .addEdge("gatherInfo", "analyzeFinancials")
    .addEdge("analyzeFinancials", "analyzeSentiment")
    .addEdge("analyzeSentiment", "synthesizeDecision")
    .addEdge("synthesizeDecision", END);

  return graph.compile();
}

export async function runDossierAgent(companyName) {
  const app = buildDossierGraph();
  const result = await app.invoke({ companyName, sources: [], trace: [] });
  return result;
}
