import { webSearch } from "../tools/webSearch.js";

/**
 * gatherInfo node
 * ----------------
 * First step of the graph. Runs a small batch of targeted web searches to
 * build a grounded picture of the company: what it does, its business
 * model, funding/ownership status, and competitive landscape.
 *
 * We deliberately run multiple *specific* queries instead of one broad
 * query — broad queries return shallow, generic results, while specific
 * ones (e.g. "X business model revenue") surface pages that actually
 * discuss the thing we care about.
 */
export async function gatherInfo(state) {
  const { companyName } = state;

  const queries = [
    `${companyName} company overview business model`,
    `${companyName} revenue funding valuation`,
    `${companyName} competitors market position`,
  ];

  const resultsPerQuery = await Promise.all(
    queries.map((q) => webSearch(q, { maxResults: 4 }).catch(() => []))
  );

  const searchResults = resultsPerQuery.flat();

  // De-duplicate by URL since different queries often surface the same page
  const seen = new Set();
  const deduped = searchResults.filter((r) => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  return {
    searchResults: deduped,
    sources: [...(state.sources || []), ...deduped.map((r) => ({ title: r.title, url: r.url }))],
    trace: [...(state.trace || []), `gatherInfo: ran ${queries.length} queries, found ${deduped.length} unique sources`],
  };
}
