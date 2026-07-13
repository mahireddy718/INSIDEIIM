# Dossier — AI Investment Research Agent

Built for the **InsideIIM × Altuni AI Labs — AI Product Development Engineer (Intern)** take-home assignment.

Give it a company name. It researches the company on the open web, weighs the financial and
sentiment evidence it finds, and returns an **INVEST / PASS / WATCH** verdict with full reasoning,
a bull case, a bear case, and the sources it used — like a one-page investment committee memo.

---

## 1. Overview

**What it does**

1. You type a company name into the React front end.
2. The Node/Express backend runs a **LangGraph.js** agent that:
   - searches the live web for the company's business model, funding, and competitive position,
   - searches recent news for sentiment and risk signals,
   - has an LLM assess financial health and market sentiment separately,
   - has the LLM synthesize both into a final verdict with a confidence score and reasoning.
3. The UI renders the result as a "case file": a stamped verdict, an executive summary, a bull
   case / bear case side-by-side, the underlying financial/sentiment notes, and a footnoted list
   of every source the agent actually read.

**Stack** (matches the brief): React (Vite) front end · Node.js/Express back end ·
LangGraph.js for the agent · Groq (Llama 3.3 70B) as the LLM · Tavily as the web-search tool.

---

## 2. How to run it

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys) (LLM)
- A free [Tavily API key](https://app.tavily.com) (web search — 1,000 free searches/month)

### Backend
```bash
cd backend
cp .env.example .env
# open .env and paste in GROQ_API_KEY and TAVILY_API_KEY
npm install
npm start
# → running on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → running on http://localhost:5173 (proxies /api to the backend)
```

Open `http://localhost:5173`, type a company name, and submit. A single run takes roughly
15–30 seconds (three web-search calls + three LLM calls).

### Deploying
- Backend: any Node host (Render, Railway, Fly.io). Set `GROQ_API_KEY` and `TAVILY_API_KEY` as
  environment variables there.
- Frontend: Vercel. Set the build's API base (or a Vercel rewrite) to point `/api/*` at the
  deployed backend URL instead of `localhost:5000`.

---

## 3. How it works — architecture

```
                     ┌──────────────┐
   companyName  ───▶ │ gatherInfo   │  Tavily web search (3 targeted queries:
                     │              │  overview, revenue/funding, competitors)
                     └──────┬───────┘
                            ▼
                     ┌──────────────┐
                     │analyzeFinance│  LLM reads the search context and rates
                     │  -ials       │  financial health (strong/moderate/weak/
                     │              │  unclear) + concrete evidence + concerns
                     └──────┬───────┘
                            ▼
                     ┌──────────────┐
                     │analyzeSenti- │  Tavily *news* search + LLM rates market
                     │  ment        │  sentiment, recent developments, risks,
                     │              │  positive catalysts
                     └──────┬───────┘
                            ▼
                     ┌──────────────┐
                     │synthesize-   │  LLM (the "investment committee") weighs
                     │  Decision    │  both analyses into a final verdict +
                     │              │  confidence + bull/bear case + reasoning
                     └──────┬───────┘
                            ▼
                     JSON response ──▶ React "case file" UI
```

This is a **LangGraph `StateGraph`** with one typed state object threaded through four nodes.
Each node is a plain async function that reads the state and returns a partial update — LangGraph
merges it in. `sources` and `trace` are accumulated across nodes so the final response can show
exactly what the agent read and did, in order (visible in the API response's `trace` field, and
used to drive the UI's source list).

Two tools back the graph: a general web-search tool and a news-flavoured search tool (both thin
wrappers over the Tavily API in `backend/src/agent/tools/webSearch.js`). Every LLM node is
prompted to only state what the retrieved context actually supports, and to say "unclear" rather
than invent numbers — this matters a lot for an investment tool, where a confident-sounding
hallucinated revenue figure is worse than an honest "not disclosed."

---

## 4. Key decisions & trade-offs

- **Linear graph, not a branching/looping one.** LangGraph supports conditional edges and cycles
  (e.g., re-search if evidence is thin, or branch on public vs. private company). I chose a
  straight `research → financials → sentiment → decision` pipeline instead. For a 7-day solo
  build, a linear graph is far easier to reason about, debug, and demo, while LangGraph still
  earns its place: typed state, composable nodes, and a natural extension point for exactly the
  branching/looping above (see "What I'd improve"). A maze of conditional edges would have cost
  build time without adding much demonstrable value at this scope.

- **Tavily over a finance-specific data API.** I didn't have access to a paid market-data
  provider (e.g. a stock API with real financial statements), so the agent works entirely from
  live web search + LLM reasoning rather than structured financial data. This means it's better
  suited to qualitative research (funding status, business model, sentiment, controversies) than
  to precise quantitative figures — the prompts are written to be honest about that limitation
  rather than hide it (nodes explicitly say "unclear" instead of guessing numbers).

- **Groq (Llama 3.3 70B) over GPT-4/Claude for the agent's own reasoning.** Free tier, low
  latency (matters since one run makes 3 sequential LLM calls), and quality was sufficient for
  structured JSON reasoning at this scope. The LLM call is isolated in `utils/llm.js`, so swapping
  providers is a one-file change.

- **Structured JSON at every LLM node, not free text.** Every node forces the LLM into a strict
  JSON schema (verdict/confidence/bull-bear/etc.) instead of returning prose that gets parsed
  later. This makes the pipeline deterministic to render in the UI and easy to unit-test, at the
  cost of slightly more rigid/less "conversational" LLM outputs.

- **No auth, no persistence/database.** Out of scope for a research-agent demo — every run is
  stateless. Would be one of the first things added for a real product (see below).

- **No streaming of intermediate steps to the UI (yet).** The backend runs the full graph and
  returns one JSON response; the frontend shows a generic "case in progress" loader rather than
  live per-node updates. `trace` is already returned by the API for this reason — wiring it to
  stream live (SSE or a WebSocket) was cut for time. See "What I'd improve."

- **Inline styles over a CSS framework.** Kept the frontend to a handful of components with no
  extra UI library dependency, since the brief didn't require one and it kept the bundle and
  setup minimal.

---

## 5. Example runs

> Run the app locally with your own `GROQ_API_KEY` and `TAVILY_API_KEY`, then paste 2–3 real runs
> here before submitting (e.g. one well-known large company, one smaller/less-covered company, one
> that should plausibly get a PASS). You can grab the raw JSON straight from the API:
>
> ```bash
> curl -s -X POST http://localhost:5000/api/research \
>   -H "Content-Type: application/json" \
>   -d '{"companyName": "Zerodha"}' | json_pp
> ```
>
> Or just take a screenshot of the rendered case-file card in the UI — either is fine to paste
> below. Delete this note once filled in.

### Run 1 — `<Company name>`
```
<paste verdict / confidence / summary / reasoning JSON or screenshot here>
```

### Run 2 — `<Company name>`
```
<paste here>
```

### Run 3 — `<Company name>`
```
<paste here>
```

---

## 6. What I'd improve with more time

- **Real financial data source.** Plug in a market-data API (e.g. for listed companies) so
  financial-health assessment is grounded in actual statements/ratios instead of inferred from
  search snippets — this is the single biggest quality upgrade available.
- **Streaming node-by-node progress to the UI** over SSE/WebSocket, replacing the generic loader
  with the agent's real trace as it happens (backend already produces this via `state.trace`).
- **Conditional/looping graph edges** — e.g. a "confidence check" edge that loops back into
  `gatherInfo` with a refined query if the financial or sentiment node reports `"unclear"`, and a
  branch that treats public vs. private companies differently (public → look for ticker/filings
  language; private → look for funding-round language).
- **Caching search results per company** (even a simple in-memory TTL cache) to make repeat runs
  near-instant and cheaper on API quota.
- **Source-level citations inline in the reasoning text**, not just a flat source list at the
  bottom, so each claim in the bull/bear case links back to the exact snippet that supports it.
- **Basic auth + a history view** so a user can revisit past case files instead of every run being
  stateless.
- **Automated tests** for the graph nodes with mocked search/LLM responses, and a couple of
  Playwright tests for the happy path in the UI.

---

## 7. AI usage / chat transcript (bonus)

This project was built with heavy AI assistance, as the brief explicitly encourages
("AI usage is mandatory"). Attach your actual chat session transcript here (a Claude conversation
export, screenshots, or a copy-pasted log) so the reviewers can see the build process. This
repository intentionally does not include a fabricated transcript — the transcript should be
your own real session, since that's the part of the submission that has to reflect your own
solo work and judgment, not just the final code.
#   I N S I D E I I M  
 