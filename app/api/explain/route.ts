import { NextRequest, NextResponse } from "next/server";
import { callGeminiStructured, getCachedResponse, setCachedResponse, MODELS } from "@/lib/gemini";
import { EXPLAINER_SYSTEM_PROMPT } from "@/lib/agent-prompts";
import { ExplainerOutputSchema } from "@/lib/zod-schemas";
import { DEMO_STEP_DATA } from "@/data/demo/todo-app";

export async function POST(req: NextRequest) {
  let currentStep: any = null;
  try {
    const { step, files, changes, isDemoMode } = await req.json();
    currentStep = step;

    if (!step) {
      return NextResponse.json({ error: "Step is required" }, { status: 400 });
    }

    if (isDemoMode) {
      const demoData = DEMO_STEP_DATA[step.id] || DEMO_STEP_DATA["step-1"];
      return NextResponse.json({ summary: demoData.summary });
    }

    const cacheKey = `explain:${step.id}:${step.title}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return NextResponse.json({ summary: cached });
    }

    if (!process.env.GEMINI_API_KEY) {
      const demoData = DEMO_STEP_DATA[step.id] || DEMO_STEP_DATA["step-1"];
      return NextResponse.json({ summary: demoData.summary });
    }

    const promptText = `Step #${step.stepNumber}: "${step.title}"
Step Goal: "${step.goal}"

Deltas / Changes in this step:
${JSON.stringify(changes || [], null, 2)}

Full Files Content for this step:
${(files || []).map((f: any) => `--- ${f.filename} ---\n${f.content}`).join("\n\n")}

Explain this step to the student.
You MUST return valid JSON strictly matching this exact schema:
{
  "stepId": "${step.id}",
  "whatWasAdded": "Concise 2-3 sentence explanation of the functions, classes, and logic added in this step",
  "whyItsNeeded": "Why this specific code is necessary for the application",
  "keyConcepts": [
    {
      "name": "Concept Name",
      "definition": "Clear concise explanation of this programming concept",
      "oneLineAnalogy": "A memorable, vivid real-world analogy"
    }
  ],
  "howItConnectsToPreviousStep": "How this code builds on prior foundations"
}`;

    const summary = await callGeminiStructured({
      model: MODELS.EXPLAINER,
      systemInstruction: EXPLAINER_SYSTEM_PROMPT,
      prompt: promptText,
      parseAndValidate: (rawJson) => {
        const obj = rawJson?.summary || rawJson || {};
        let whatWasAdded = obj.whatWasAdded;
        let whyItsNeeded = obj.whyItsNeeded;
        let howItConnects = obj.howItConnectsToPreviousStep;
        let keyConcepts = Array.isArray(obj.keyConcepts) ? obj.keyConcepts : [];

        // If Gemini placed text into an 'explanation' string instead of separated keys
        if ((!whatWasAdded || !whyItsNeeded) && typeof obj.explanation === "string") {
          const text = obj.explanation;
          const addedMatch = text.match(/what (?:was )?added\??[:\s]*([\s\S]*?)(?=(?:why|how|key concepts|$))/i);
          const whyMatch = text.match(/why (?:is this |it's )?needed\??[:\s]*([\s\S]*?)(?=(?:what|how|key concepts|$))/i);
          const connectMatch = text.match(/how (?:does this |it )?connect[s]?\??[:\s]*([\s\S]*?)(?=(?:what|why|key concepts|$))/i);

          if (addedMatch) whatWasAdded = addedMatch[1].trim().slice(0, 400);
          if (whyMatch) whyItsNeeded = whyMatch[1].trim().slice(0, 400);
          if (connectMatch) howItConnects = connectMatch[1].trim().slice(0, 400);

          if (!whatWasAdded) whatWasAdded = text.slice(0, 300);
          if (!whyItsNeeded) whyItsNeeded = `Provides foundational logic for ${step.title}.`;
        }

        return ExplainerOutputSchema.parse({
          stepId: step.id,
          whatWasAdded: whatWasAdded || `Implemented core logic for ${step.title}.`,
          whyItsNeeded: whyItsNeeded || `Crucial to achieve: ${step.goal}.`,
          keyConcepts: keyConcepts.length > 0 ? keyConcepts : [
            {
              name: `${step.title} Core Mechanism`,
              definition: `Implements the primary programming logic for: ${step.goal}.`,
              oneLineAnalogy: `Like fitting the primary driving gear into the clockwork assembly.`,
            },
          ],
          howItConnectsToPreviousStep: howItConnects || "Integrates directly with prior foundations.",
        });
      },
    });

    setCachedResponse(cacheKey, summary);
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.warn("[API/explain warning]:", error?.message || error);
    const tailoredFallback = {
      stepId: currentStep?.id || "step-1",
      whatWasAdded: `Implemented ${currentStep?.title || "step features"} with functional handlers and state updates.`,
      whyItsNeeded: `Required to achieve the step goal: "${currentStep?.goal || "application functionality"}".`,
      keyConcepts: [
        {
          name: `${currentStep?.title || "Core Logic"} Implementation`,
          definition: "Structuring code cleanly to handle runtime state and user interaction.",
          oneLineAnalogy: "Like assembling the engine block before connecting the transmission.",
        },
      ],
      howItConnectsToPreviousStep: "Builds upon previous foundations to advance the application.",
    };
    return NextResponse.json({
      summary: tailoredFallback,
      warning: "Loaded resilient conceptual summary.",
    });
  }
}
