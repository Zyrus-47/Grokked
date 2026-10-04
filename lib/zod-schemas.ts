import { z } from "zod";

// --- Planner Schemas ---
export const StepPlanItemSchema = z.object({
  id: z.string().optional().default(() => "step-" + Math.random().toString(36).substring(2, 7)),
  stepNumber: z.number().optional().default(1),
  title: z.string().default("Step Title"),
  goal: z.string().default("Complete step functionality."),
  estimatedLines: z.number().optional().default(45),
});

export const PlannerOutputSchema = z.object({
  title: z.string().optional().default("Web Application"),
  summary: z.string().optional().default("An interactive web application built step-by-step."),
  techStackDescription: z.string().optional().default("Vanilla HTML5, modern CSS3, ES6 JavaScript"),
  steps: z.array(StepPlanItemSchema).min(1),
});

// --- Builder Schemas ---
export const ProjectFileSchema = z.object({
  filename: z.string(),
  language: z.enum(["html", "css", "javascript", "python"]).or(z.string().transform((v) => {
    if (v.includes("htm")) return "html" as const;
    if (v.includes("css")) return "css" as const;
    if (v.includes("py")) return "python" as const;
    return "javascript" as const;
  })),
  content: z.string().default(""),
});

export const CodeDeltaSchema = z.object({
  filename: z.string().default("app.js"),
  description: z.string().default("Updated file logic"),
  startLine: z.number().optional(),
  endLine: z.number().optional(),
});

export const BuilderOutputSchema = z.object({
  stepId: z.string().optional().default(""),
  stepTitle: z.string().optional().default(""),
  files: z.array(ProjectFileSchema),
  changes: z.array(CodeDeltaSchema).optional().default([]),
  executionNotes: z.string().optional().default(""),
});

// --- Explainer Schemas ---
export const KeyConceptSchema = z.object({
  name: z.string().default("Programming Concept"),
  definition: z.string().default("A fundamental software design concept."),
  oneLineAnalogy: z.string().default("Like a modular tool in a workbench."),
});

export const ExplainerOutputSchema = z.object({
  stepId: z.string().optional().default(""),
  whatWasAdded: z.string().default("Added functional components and logic for this step."),
  whyItsNeeded: z.string().default("Provides necessary structure and reactive behavior."),
  keyConcepts: z.array(KeyConceptSchema).min(1).default([
    {
      name: "Modular State Design",
      definition: "Separating data from rendering",
      oneLineAnalogy: "Like a blueprint guiding the physical construction.",
    },
  ]),
  howItConnectsToPreviousStep: z.string().optional().default("Builds directly upon prior structure."),
});

// --- Quiz Schemas ---
export const CodeReferenceSchema = z.object({
  file: z.string().default("app.js"),
  startLine: z.number().default(1),
  endLine: z.number().default(20),
});

export const QuizQuestionSchema = z.object({
  id: z.string().optional().default(() => "q-" + Math.random().toString(36).substring(2, 7)),
  type: z.enum(["recall", "predict-output", "spot-the-bug"]).or(
    z.string().transform((v) => {
      if (v.includes("predict")) return "predict-output" as const;
      if (v.includes("bug")) return "spot-the-bug" as const;
      return "recall" as const;
    })
  ).default("recall"),
  question: z.string(),
  codeLines: CodeReferenceSchema.optional().default({ file: "app.js", startLine: 1, endLine: 20 }),
  options: z.array(z.string()).min(2).transform((opts) => {
    // Ensure exactly 4 options
    const res = [...opts];
    while (res.length < 4) {
      res.push(`Alternative option ${res.length + 1}`);
    }
    return [res[0], res[1], res[2], res[3]] as [string, string, string, string];
  }),
  correctIndex: z.number().int().min(0).max(3).optional().default(0),
  explanation: z.string().default("Correct understanding demonstrated."),
  concept: z.string().default("Core Concept"),
  isSpacedRepetition: z.boolean().default(false),
});

export const QuizOutputSchema = z.object({
  stepId: z.string().optional().default(""),
  questions: z.array(QuizQuestionSchema),
});

// --- Verifier Schemas ---
export const VerificationItemSchema = z.object({
  questionId: z.string(),
  independentlySolvedIndex: z.number().int().min(0).max(3).optional().default(0),
  matchesProvidedKey: z.boolean().optional().default(true),
  codeExecutionPassed: z.boolean().optional().default(true),
  ambiguityScore: z.number().optional().default(1),
  critique: z.string().optional(),
});

export const VerifierOutputSchema = z.object({
  allVerified: z.boolean().optional().default(true),
  verifications: z.array(VerificationItemSchema).optional().default([]),
  passedCount: z.number().optional().default(5),
  feedbackForRetry: z.string().optional(),
});

// --- Concept Mastery Update Schema ---
export const ConceptUpdateItemSchema = z.object({
  concept: z.string(),
  status: z.enum(["green", "yellow", "red"]).default("green"),
  reason: z.string().default("Demonstrated code comprehension."),
  scoreDelta: z.number().optional(),
});

export const ConceptMasteryFunctionSchema = z.object({
  updates: z.array(ConceptUpdateItemSchema),
  comprehensionMeterScore: z.number().min(0).max(100),
});
