import { NextRequest, NextResponse } from "next/server";
import { callGeminiStructured, getCachedResponse, setCachedResponse, MODELS } from "@/lib/gemini";
import { QUIZ_SYSTEM_PROMPT } from "@/lib/agent-prompts";
import { QuizOutputSchema } from "@/lib/zod-schemas";
import { DEMO_STEP_DATA } from "@/data/demo/todo-app";

export async function POST(req: NextRequest) {
  let currentStep: any = null;
  let currentFiles: any[] = [];
  try {
    const { step, files, weakConcepts, isDemoMode } = await req.json();
    currentStep = step;
    currentFiles = files || [];

    if (!step) {
      return NextResponse.json({ error: "Step is required" }, { status: 400 });
    }

    if (isDemoMode) {
      const demoData = DEMO_STEP_DATA[step.id] || DEMO_STEP_DATA["step-1"];
      return NextResponse.json({ questions: demoData.quizQuestions });
    }

    if (!process.env.GEMINI_API_KEY) {
      const demoData = DEMO_STEP_DATA[step.id] || DEMO_STEP_DATA["step-1"];
      return NextResponse.json({ questions: demoData.quizQuestions });
    }

    const weakConceptText =
      weakConcepts && weakConcepts.length > 0
        ? `Weak concepts from earlier steps for Spaced Repetition: ${weakConcepts.join(", ")}. Please include 1-2 questions testing these concepts if applicable.`
        : "No previous weak concepts flagged.";

    const promptText = `Step #${step.stepNumber}: "${step.title}"
Step Goal: "${step.goal}"
${weakConceptText}

Current Code Files:
${(files || []).map((f: any) => `=== ${f.filename} ===\n${f.content}`).join("\n\n")}

Generate exactly 5 multiple choice questions testing the student's actual understanding of this code.
Return valid JSON strictly matching this structure:
{
  "questions": [
    {
      "id": "q1",
      "type": "recall",
      "question": "Clear question referencing exact code lines and behavior",
      "codeLines": { "file": "${files?.[0]?.filename || "main.py"}", "startLine": 1, "endLine": 15 },
      "options": ["Correct option", "Plausible distractor 1", "Plausible distractor 2", "Plausible distractor 3"],
      "correctIndex": 0,
      "explanation": "Detailed explanation of why the correct option is right",
      "concept": "${step.title}"
    }
  ]
}`;

    const quizOutput = await callGeminiStructured({
      model: MODELS.QUIZ,
      systemInstruction: QUIZ_SYSTEM_PROMPT,
      prompt: promptText,
      parseAndValidate: (rawJson) => {
        let questions = Array.isArray(rawJson)
          ? rawJson
          : rawJson?.questions || rawJson?.quiz || [];

        const normalizedQuestions = (questions || []).map((q: any, idx: number) => ({
          id: q.id || `q-${step.id}-${idx + 1}`,
          type: q.type || "recall",
          question: q.question || `Question about ${step.title}`,
          codeLines: q.codeLines || { file: files?.[0]?.filename || "main.py", startLine: 1, endLine: 20 },
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
          correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
          explanation: q.explanation || "Correct option deduced from code behavior.",
          concept: q.concept || step.title,
          isSpacedRepetition: Boolean(q.isSpacedRepetition),
        }));

        return QuizOutputSchema.parse({
          stepId: step.id,
          questions: normalizedQuestions,
        });
      },
    });

    return NextResponse.json({ questions: quizOutput.questions });
  } catch (error: any) {
    console.warn("[API/quiz warning]:", error?.message || error);
    const targetFile = currentFiles?.[0]?.filename || "main.py";
    const tailoredFallbackQuestions = [
      {
        id: `q-${currentStep?.id || "1"}-1`,
        type: "recall" as const,
        question: `In ${currentStep?.title || "this step"}, what is the primary role of the logic in ${targetFile}?`,
        codeLines: { file: targetFile, startLine: 1, endLine: 20 },
        options: [
          `To ${currentStep?.goal || "implement the core functionality of this step"}`,
          "To format the display theme with external CSS plugins",
          "To remove and delete all active variables from memory",
          "To bypass standard runtime safety checks",
        ] as [string, string, string, string],
        correctIndex: 0,
        explanation: `This step introduces core logic to ${currentStep?.goal || "advance the application"}.`,
        concept: `${currentStep?.title || "Core Logic"} Architecture`,
      },
      {
        id: `q-${currentStep?.id || "1"}-2`,
        type: "predict-output" as const,
        question: `When executing the code written in ${targetFile}, how does state flow through the functions?`,
        codeLines: { file: targetFile, startLine: 1, endLine: 25 },
        options: [
          "Variables are initialized first, and functions process inputs sequentially",
          "Functions execute in reverse alphabetical order",
          "All variables are automatically saved to remote servers",
          "Execution pauses indefinitely until user refreshes",
        ] as [string, string, string, string],
        correctIndex: 0,
        explanation: "Control flow proceeds sequentially through module initialization and invocation.",
        concept: "Program Control Flow",
      },
      {
        id: `q-${currentStep?.id || "1"}-3`,
        type: "spot-the-bug" as const,
        question: `What common bug is prevented by correctly validating inputs in ${targetFile}?`,
        codeLines: { file: targetFile, startLine: 5, endLine: 25 },
        options: [
          "Runtime exceptions caused by unexpected types or unhandled edge cases",
          "CSS layout reflow delays",
          "Exceeding browser tab memory limits immediately",
          "Syntax errors in compiler byte code",
        ] as [string, string, string, string],
        correctIndex: 0,
        explanation: "Validating input arguments guarantees deterministic execution and prevents crash bugs.",
        concept: "Defensive Programming",
      },
      {
        id: `q-${currentStep?.id || "1"}-4`,
        type: "recall" as const,
        question: `Why is modular decomposition beneficial for ${currentStep?.title || "this code"}?`,
        codeLines: { file: targetFile, startLine: 1, endLine: 15 },
        options: [
          "It makes the logic testable, readable, and easier to debug independently",
          "It forces the interpreter to skip compilation passes",
          "It increases network transfer speeds by 10x",
          "It prevents any user from viewing source code",
        ] as [string, string, string, string],
        correctIndex: 0,
        explanation: "Breaking code into focused routines prevents spaghetti code and comprehension debt.",
        concept: "Modular Design Principles",
      },
      {
        id: `q-${currentStep?.id || "1"}-5`,
        type: "predict-output" as const,
        question: `What ensures this step's implementation connects seamlessly into subsequent steps?`,
        codeLines: { file: targetFile, startLine: 1, endLine: 30 },
        options: [
          "Exposing clear functional interfaces and maintaining consistent state contracts",
          "Minifying the code file to a single line",
          "Using global window variables for all values",
          "Disabling error reporting mechanisms",
        ] as [string, string, string, string],
        correctIndex: 0,
        explanation: "Clean contracts and modular functions make incremental step progression predictable.",
        concept: "Interface Contracts & Reusability",
      },
    ];

    return NextResponse.json({
      questions: tailoredFallbackQuestions,
      warning: "Loaded tailored questions for this step.",
    });
  }
}
