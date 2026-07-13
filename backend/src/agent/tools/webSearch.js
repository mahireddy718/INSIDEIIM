import { tavily } from "@tavily/core";

let client = null;
function getClient() {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error(
      "TAVILY_API_KEY is missing. Copy backend/.env.example to backend/.env and add your key."
    );
  }
  if (!client) client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  return client;
}

/**
 * Generic web search used by the research node.
 * Returns a compact list of { title, url, content } results so the LLM
 * has grounded, citable context instead of hallucinating facts.
 */
export async function webSearch(query, { maxResults = 5, topic = "general" } = {}) {
  const tv = getClient();
  const res = await tv.search(query, {
    max_results: maxResults,
    search_depth: "advanced",
    topic, // "general" | "news"
    include_answer: false,
  });

  return (res.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score,
  }));
}

/**
 * News-flavoured search — biases Tavily toward recent news articles,
 * used by the sentiment/news node to catch recent developments,
 * controversies, funding rounds, lawsuits, etc.
 */
export async function newsSearch(query, { maxResults = 6 } = {}) {
  return webSearch(query, { maxResults, topic: "news" });
}
