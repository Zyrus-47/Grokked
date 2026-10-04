import { NextRequest, NextResponse } from "next/server";
import { callGeminiStructured, getCachedResponse, setCachedResponse, MODELS } from "@/lib/gemini";
import { BUILDER_SYSTEM_PROMPT } from "@/lib/agent-prompts";
import { BuilderOutputSchema } from "@/lib/zod-schemas";
import { DEMO_STEP_DATA } from "@/data/demo/todo-app";

export async function POST(req: NextRequest) {
  let currentStep: any = null;
  try {
    const { prompt, plan, step, previousFiles, isDemoMode } = await req.json();
    currentStep = step;

    if (!step) {
      return NextResponse.json({ error: "Step is required" }, { status: 400 });
    }

    if (isDemoMode) {
      const demoData = DEMO_STEP_DATA[step.id] || DEMO_STEP_DATA["step-1"];
      return NextResponse.json({
        files: demoData.files,
        changes: demoData.changes,
        executionNotes: demoData.executionNotes,
      });
    }

    const cacheKey = `build:${step.id}:${step.title}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    if (!process.env.GEMINI_API_KEY) {
      const demoData = DEMO_STEP_DATA[step.id] || DEMO_STEP_DATA["step-1"];
      return NextResponse.json({
        files: demoData.files,
        changes: demoData.changes,
        executionNotes: demoData.executionNotes,
      });
    }

    const isPython =
      plan?.techStackDescription?.toLowerCase().includes("python") ||
      prompt?.toLowerCase().includes("python");
    const fileExpectation = isPython
      ? 'Maintain full runnable code for "main.py" (and any helper files).'
      : 'Maintain full runnable code for "index.html", "style.css", and "app.js".';

    const builderPromptText = `Overall App Prompt: "${prompt}"
App Title: "${plan?.title || "Application"}"
Tech Stack: "${plan?.techStackDescription || "Standard"}"
Current Step: Step #${step.stepNumber}: "${step.title}"
Step Goal: "${step.goal}"

Previous Files Content:
${(previousFiles || [])
  .map(
    (f: any) =>
      `--- ${f.filename} ---
${f.content}`
  )
  .join("\n\n")}

Implement ONLY this step. ${fileExpectation} Keep changes to 30-60 lines.
Return JSON strictly in this structure:
{
  "stepId": "${step.id}",
  "stepTitle": "${step.title}",
  "files": [
    {
      "filename": "${isPython ? "main.py" : "index.html"}",
      "language": "${isPython ? "python" : "html"}",
      "content": "Full updated file content here"
    }
  ],
  "changes": [
    {
      "filename": "${isPython ? "main.py" : "app.js"}",
      "description": "What was added in this step"
    }
  ],
  "executionNotes": "Explanation of changes"
}`;

    const buildResult = await callGeminiStructured({
      model: MODELS.BUILDER,
      systemInstruction: BUILDER_SYSTEM_PROMPT,
      prompt: builderPromptText,
      parseAndValidate: (rawJson) => {
        let files = rawJson?.files || [];

        // If Gemini returned a single file object or code string
        if (!Array.isArray(files)) {
          if (rawJson?.content || rawJson?.code) {
            files = [
              {
                filename: rawJson.filename || (isPython ? "main.py" : "app.js"),
                language: (isPython ? "python" : "javascript") as any,
                content: rawJson.content || rawJson.code || "",
              },
            ];
          } else if (typeof rawJson === "object") {
            files = Object.entries(rawJson)
              .filter(([k]) => k.endsWith(".html") || k.endsWith(".css") || k.endsWith(".js") || k.endsWith(".py"))
              .map(([filename, content]) => ({
                filename,
                language: (filename.endsWith(".html") ? "html" : filename.endsWith(".css") ? "css" : filename.endsWith(".py") ? "python" : "javascript") as any,
                content: typeof content === "string" ? content : JSON.stringify(content),
              }));
          }
        }

        return BuilderOutputSchema.parse({
          stepId: step.id,
          stepTitle: step.title,
          files: Array.isArray(files) && files.length > 0 ? files : (previousFiles || []),
          changes: rawJson?.changes || [],
          executionNotes: rawJson?.executionNotes || "",
        });
      },
    });

    setCachedResponse(cacheKey, buildResult);
    return NextResponse.json(buildResult);
  } catch (error: any) {
    console.warn("[API/build-step warning]:", error?.message || error);
    const fallback = (currentStep?.id && DEMO_STEP_DATA[currentStep.id]) || DEMO_STEP_DATA["step-1"];
    return NextResponse.json({
      files: fallback.files,
      changes: fallback.changes,
      executionNotes: fallback.executionNotes,
      warning: "Gemini API temporarily unavailable; loaded resilient step build.",
    });
  }
}
