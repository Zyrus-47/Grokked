import { NextRequest, NextResponse } from "next/server";
import { callGeminiStructured, getCachedResponse, setCachedResponse, MODELS } from "@/lib/gemini";
import { PLANNER_SYSTEM_PROMPT } from "@/lib/agent-prompts";
import { PlannerOutputSchema } from "@/lib/zod-schemas";
import { DEMO_PROJECT_PLAN } from "@/data/demo/todo-app";

export async function POST(req: NextRequest) {
  let userPrompt = "Interactive Application";
  try {
    const { prompt, isDemoMode } = await req.json();
    if (prompt) userPrompt = prompt;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (isDemoMode) {
      return NextResponse.json({ plan: DEMO_PROJECT_PLAN });
    }

    const cacheKey = `plan:${prompt.trim().toLowerCase()}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return NextResponse.json({ plan: cached, cached: true });
    }

    // If no GEMINI_API_KEY is configured in env, fallback gracefully to demo plan
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        plan: DEMO_PROJECT_PLAN,
        note: "GEMINI_API_KEY not found in environment. Demo plan loaded.",
      });
    }

    const userPromptText = `User App Request: "${prompt}"

Break this app down into 4 to 8 small, bite-sized, pedagogical steps matching the user's requested language and application idea (e.g. Python, or modern Web HTML/CSS/JS).
Return JSON matching this exact structure:
{
  "title": "Title of the App",
  "summary": "Brief pedagogical summary",
  "techStackDescription": "e.g. Python 3 Standard Library OR Modern Web HTML/CSS/JS",
  "steps": [
    {
      "id": "step-1",
      "stepNumber": 1,
      "title": "Clear Action-Oriented Title",
      "goal": "Clear goal description",
      "estimatedLines": 45
    }
  ]
}`;

    const planData = await callGeminiStructured({
      model: MODELS.PLANNER,
      systemInstruction: PLANNER_SYSTEM_PROMPT,
      prompt: userPromptText,
      parseAndValidate: (rawJson) => {
        // Normalize any unexpected JSON shapes from Gemini
        let normalized = rawJson;
        if (Array.isArray(rawJson)) {
          normalized = {
            title: prompt,
            summary: "Step-by-step educational build plan.",
            techStackDescription: "Vanilla HTML5, CSS3, ES6 JavaScript",
            steps: rawJson,
          };
        } else if (rawJson?.plan && Array.isArray(rawJson.plan?.steps)) {
          normalized = rawJson.plan;
        } else if (!rawJson?.steps && Array.isArray(rawJson?.plan)) {
          normalized = {
            ...rawJson,
            steps: rawJson.plan,
          };
        }

        // Ensure steps is an array
        if (!Array.isArray(normalized?.steps)) {
          normalized.steps = [
            {
              id: "step-1",
              stepNumber: 1,
              title: "Foundation HTML & Layout",
              goal: "Scaffold application layout and styling",
              estimatedLines: 40,
            },
          ];
        }

        // Map steps to guarantee id and stepNumber exist
        normalized.steps = normalized.steps.map((s: any, idx: number) => ({
          ...s,
          id: s.id || `step-${idx + 1}`,
          stepNumber: s.stepNumber || idx + 1,
          title: s.title || `Step ${idx + 1}`,
          goal: s.goal || "Implement core feature functionality",
          estimatedLines: s.estimatedLines || 45,
          status: idx === 0 ? "current" : "locked",
        }));

        const validated = PlannerOutputSchema.parse(normalized);

        const stepsWithStatus = validated.steps.map((s, idx) => ({
          ...s,
          id: s.id || `step-${idx + 1}`,
          stepNumber: idx + 1,
          status: idx === 0 ? "current" : "locked",
        }));

        return {
          title: validated.title || prompt,
          summary: validated.summary || "Interactive web application build plan",
          techStackDescription: validated.techStackDescription || "Vanilla HTML5, modern CSS3, ES6 JavaScript",
          steps: stepsWithStatus,
        };
      },
    });

    setCachedResponse(cacheKey, planData);
    return NextResponse.json({ plan: planData });
  } catch (error: any) {
    console.warn("[API/plan warning]:", error?.message || error);
    // When Gemini is under high demand (503 UNAVAILABLE) or rate-limited, provide a customized fallback plan
    const fallbackSteps = [
      {
        id: "step-1",
        stepNumber: 1,
        title: "Semantic HTML Structure & UI Shell",
        goal: `Scaffold semantic layout and dark styling for: ${userPrompt}`,
        estimatedLines: 45,
        status: "current" as const,
      },
      {
        id: "step-2",
        stepNumber: 2,
        title: "State Representation & DOM Rendering",
        goal: "Implement pure state model and idempotent rendering pipeline",
        estimatedLines: 50,
        status: "locked" as const,
      },
      {
        id: "step-3",
        stepNumber: 3,
        title: "Interactive Input Handlers & Validation",
        goal: "Intercept form submissions, prevent page reloads, and sanitize inputs",
        estimatedLines: 40,
        status: "locked" as const,
      },
      {
        id: "step-4",
        stepNumber: 4,
        title: "Event Delegation & State Modifications",
        goal: "Use single listener event delegation to toggle items and modify data",
        estimatedLines: 45,
        status: "locked" as const,
      },
      {
        id: "step-5",
        stepNumber: 5,
        title: "LocalStorage Persistence & View Filters",
        goal: "Persist state to browser storage and implement active/completed tabs",
        estimatedLines: 50,
        status: "locked" as const,
      },
    ];

    const fallbackPlan = {
      title: `${userPrompt.charAt(0).toUpperCase() + userPrompt.slice(1)} Web App`,
      summary: `A complete 5-step pedagogical curriculum designed for "${userPrompt}".`,
      techStackDescription: "Vanilla HTML5, modern CSS3, ES6 JavaScript",
      steps: fallbackSteps,
      warning: "Gemini API experienced high demand or temporary rate limit. Provided resilient fallback plan.",
    };

    return NextResponse.json({ plan: fallbackPlan });
  }
}
