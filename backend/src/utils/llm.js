import { ChatGroq } from "@langchain/groq";

/**
 * Single shared LLM instance for the whole agent.
 * We use Groq's Llama 3.3 70B — fast + free-tier friendly, good enough
 * reasoning quality for structured financial analysis.
 *
 * Swap provider here if you want (e.g. ChatGoogleGenerativeAI for Gemini) —
 * the rest of the agent only depends on the LangChain `invoke` interface,
 * so no other file needs to change.
 */
export function getLLM({ temperature = 0.2, json = false } = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is missing. Copy backend/.env.example to backend/.env and add your key."
    );
  }

  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature,
  });

  return json ? model.bind({ response_format: { type: "json_object" } }) : model;
}

/**
 * Strips markdown code fences etc. and safely parses JSON that the LLM
 * was asked to return. LLMs occasionally wrap JSON in ```json fences
 * even when told not to — this guards against that.
 */
export function parseJSON(text, fallback = {}) {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse LLM JSON output:", err.message);
    return fallback;
  }
}
