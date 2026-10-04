export type StepStatus = "locked" | "current" | "completed";

export interface ProjectFile {
  filename: string;
  language: "html" | "css" | "javascript" | "python";
  content: string;
}

export interface CodeDelta {
  filename: string;
  description: string;
  startLine?: number;
  endLine?: number;
}

export interface PlanStep {
  id: string;
  stepNumber: number;
  title: string;
  goal: string;
  estimatedLines: number;
  status: StepStatus;
}

export interface ProjectPlan {
  title: string;
  summary: string;
  techStackDescription: string;
  steps: PlanStep[];
}

export interface KeyConcept {
  name: string;
  definition: string;
  oneLineAnalogy: string;
}

export interface StepSummary {
  stepId: string;
  whatWasAdded: string;
  whyItsNeeded: string;
  keyConcepts: KeyConcept[];
  howItConnectsToPreviousStep: string;
}

export interface CodeReference {
  file: string;
  startLine: number;
  endLine: number;
}

export type QuestionType = "recall" | "predict-output" | "spot-the-bug";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  codeLines: CodeReference;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  concept: string;
  isSpacedRepetition?: boolean;
}

export interface VerificationResult {
  questionId: string;
  independentlySolvedIndex: number;
  matchesProvidedKey: boolean;
  codeExecutionPassed: boolean;
  ambiguityScore: number;
  critique?: string;
}

export type ConceptStatus = "green" | "yellow" | "red";

export interface ConceptMasteryRecord {
  concept: string;
  status: ConceptStatus;
  timesEncountered: number;
  timesCorrect: number;
  lastTestedStep: number;
  notes?: string;
}

export interface AgentActivityItem {
  id: string;
  timestamp: string;
  agent: "Planner" | "Builder" | "Explainer" | "Quiz" | "Verifier" | "Grader";
  status: "pending" | "running" | "success" | "retry" | "error";
  message: string;
  details?: string;
  toolUsed?: string;
}

export interface StepExecutionData {
  stepId: string;
  files: ProjectFile[];
  changes: CodeDelta[];
  executionNotes: string;
  summary?: StepSummary;
  quizQuestions?: QuizQuestion[];
  quizPassed?: boolean;
  quizScore?: number;
  quizAttempts?: number;
}
