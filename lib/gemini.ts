import { GoogleGenAI } from "@google/genai";

// In-memory cache for agent responses keyed by prompt + step
const agentResponseCache = new Map<string, any>();

export function getCachedResponse<T>(cacheKey: string): T | null {
  return (agentResponseCache.get(cacheKey) as T) || null;
}

export function setCachedResponse<T>(cacheKey: string, data: T): void {
  agentResponseCache.set(cacheKey, data);
}

// Configurable model names with hackathon defaults
export const MODELS = {
  PLANNER: process.env.MODEL_PLANNER || "gemini-2.5-flash",
  BUILDER: process.env.MODEL_BUILDER || "gemini-2.5-flash",
  EXPLAINER: process.env.MODEL_EXPLAINER || "gemini-2.5-flash",
  QUIZ: process.env.MODEL_QUIZ || "gemini-2.5-flash",
  VERIFIER: process.env.MODEL_VERIFIER || "gemini-2.5-flash",
  GRADER: process.env.MODEL_GRADER || "gemini-2.5-flash",
};

let genAIInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env.local");
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
}

/**
 * Exponential backoff wrapper around an async Gemini call
 */
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1500
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) {
      throw error;
    }
    const isRateLimit =
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("RESOURCE_EXHAUSTED");

    const wait = isRateLimit ? delayMs * 2 : delayMs;
    console.warn(`[Gemini SDK] Retrying after error (${retries} attempts left, waiting ${wait}ms)...`, error?.message || error);
    await new Promise((resolve) => setTimeout(resolve, wait));
    return withExponentialBackoff(fn, retries - 1, wait * 1.5);
  }
}

/**
 * Helper to call Gemini with structured JSON output and schema validation
 */
export async function callGeminiStructured<T>(params: {
  model: string;
  systemInstruction?: string;
  prompt: string;
  responseSchema?: any;
  tools?: any[];
  parseAndValidate: (rawJson: any) => T;
}): Promise<T> {
  const ai = getGeminiClient();

  const makeCall = async (retryPrompt?: string) => {
    const config: any = {
      responseMimeType: "application/json",
    };

    if (params.systemInstruction) {
      config.systemInstruction = params.systemInstruction;
    }

    if (params.responseSchema) {
      config.responseSchema = params.responseSchema;
    }

    if (params.tools) {
      config.tools = params.tools;
    }

    let modelToUse = params.model;
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: retryPrompt || params.prompt,
      config,
    }).catch(async (err: any) => {
      if (err?.message?.includes("not found") || err?.message?.includes("NOT_FOUND") || err?.status === 404) {
        console.warn(`[Gemini SDK] Model ${modelToUse} unavailable, falling back to gemini-2.5-flash...`);
        return await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: retryPrompt || params.prompt,
          config,
        });
      }
      throw err;
    });

    const text = response.text?.trim() || "";
    if (!text) {
      throw new Error("Received empty response from Gemini model.");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e: any) {
      // If the model wrapped in markdown fences, extract JSON
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error(`Failed to parse model JSON: ${text.slice(0, 150)}...`);
      }
    }

    return params.parseAndValidate(parsed);
  };

  try {
    return await withExponentialBackoff(() => makeCall());
  } catch (initialError: any) {
    console.warn("[Gemini Structured] Initial attempt failed, retrying with error feedback...", initialError.message);
    // Retry once with error fed back
    const recoveryPrompt = `${params.prompt}\n\n[SYSTEM RECOVERY NOTE]: The previous output failed validation with error: ${initialError.message}. Please strictly ensure valid JSON conforming strictly to the requested schema.`;
    return await withExponentialBackoff(() => makeCall(recoveryPrompt), 1, 2000);
  }
}
