import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ProjectPlan,
  StepExecutionData,
  ConceptMasteryRecord,
  AgentActivityItem,
  QuizQuestion,
  ProjectFile,
} from "./types";
import { DEMO_PROJECT_PLAN, DEMO_STEP_DATA } from "@/data/demo/todo-app";

interface GrokkedState {
  // Project & Plan
  userPrompt: string;
  plan: ProjectPlan | null;
  currentStepIndex: number;
  
  // Step Data Cache
  stepData: Record<string, StepExecutionData>;
  
  // Editor State
  activeFile: string;
  highlightedLines: { file: string; start: number; end: number } | null;

  // Concept Tracker
  conceptMastery: Record<string, ConceptMasteryRecord>;
  comprehensionScore: number;

  // Agent Activity Telemetry Feed
  agentFeed: AgentActivityItem[];

  // Demo Mode
  isDemoMode: boolean;

  // Actions
  setUserPrompt: (prompt: string) => void;
  setPlan: (plan: ProjectPlan) => void;
  updateStepInPlan: (stepIndex: number, updates: Partial<ProjectPlan["steps"][0]>) => void;
  reorderPlanSteps: (newSteps: ProjectPlan["steps"]) => void;
  deletePlanStep: (stepId: string) => void;
  addPlanStep: (step: ProjectPlan["steps"][0]) => void;
  
  setCurrentStepIndex: (index: number) => void;
  setStepData: (stepId: string, data: Partial<StepExecutionData>) => void;
  
  setActiveFile: (filename: string) => void;
  setHighlightedLines: (highlight: { file: string; start: number; end: number } | null) => void;

  recordQuizResult: (stepId: string, passed: boolean, score: number, questions: QuizQuestion[]) => void;
  updateConceptStatus: (concept: string, status: "green" | "yellow" | "red", reason?: string) => void;
  setComprehensionScore: (score: number) => void;

  addAgentActivity: (activity: Omit<AgentActivityItem, "id" | "timestamp">) => void;
  clearAgentFeed: () => void;

  toggleDemoMode: (enabled?: boolean) => void;
  loadDemoProject: () => void;
  resetProject: () => void;
}

export const useGrokkedStore = create<GrokkedState>()(
  persist(
    (set, get) => ({
      userPrompt: "",
      plan: null,
      currentStepIndex: 0,
      stepData: {},
      activeFile: "index.html",
      highlightedLines: null,
      conceptMastery: {
        "Semantic Form Submissions": {
          concept: "Semantic Form Submissions",
          status: "green",
          timesEncountered: 1,
          timesCorrect: 1,
          lastTestedStep: 1,
        },
        "CSS Backdrop Filters": {
          concept: "CSS Backdrop Filters",
          status: "green",
          timesEncountered: 1,
          timesCorrect: 1,
          lastTestedStep: 1,
        },
      },
      comprehensionScore: 20,
      agentFeed: [
        {
          id: "init-1",
          timestamp: new Date().toLocaleTimeString(),
          agent: "Planner",
          status: "success",
          message: "Grokked multi-agent system ready.",
          details: "Gemini 2.5 Flash & Pro initialized",
        },
      ],
      isDemoMode: false,

      setUserPrompt: (userPrompt) => set({ userPrompt }),

      setPlan: (plan) =>
        set({
          plan,
          currentStepIndex: 0,
          stepData: {},
          highlightedLines: null,
        }),

      updateStepInPlan: (stepIndex, updates) => {
        const plan = get().plan;
        if (!plan) return;
        const newSteps = [...plan.steps];
        newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates };
        set({ plan: { ...plan, steps: newSteps } });
      },

      reorderPlanSteps: (newSteps) => {
        const plan = get().plan;
        if (!plan) return;
        set({ plan: { ...plan, steps: newSteps } });
      },

      deletePlanStep: (stepId) => {
        const plan = get().plan;
        if (!plan) return;
        const filtered = plan.steps.filter((s) => s.id !== stepId);
        const renumbered = filtered.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
        set({ plan: { ...plan, steps: renumbered } });
      },

      addPlanStep: (newStep) => {
        const plan = get().plan;
        if (!plan) return;
        const steps = [...plan.steps, newStep].map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
        set({ plan: { ...plan, steps } });
      },

      setCurrentStepIndex: (currentStepIndex) => {
        set({ currentStepIndex, highlightedLines: null });
      },

      setStepData: (stepId, data) => {
        set((state) => {
          const current = state.stepData[stepId] || {
            stepId,
            files: [],
            changes: [],
            executionNotes: "",
          };
          return {
            stepData: {
              ...state.stepData,
              [stepId]: { ...current, ...data },
            },
          };
        });
      },

      setActiveFile: (activeFile) => set({ activeFile }),

      setHighlightedLines: (highlightedLines) => set({ highlightedLines }),

      recordQuizResult: (stepId, passed, score, questions) => {
        const currentData = get().stepData[stepId];
        const attempts = (currentData?.quizAttempts || 0) + 1;
        
        get().setStepData(stepId, {
          quizPassed: passed,
          quizScore: score,
          quizAttempts: attempts,
          quizQuestions: questions,
        });

        // If passed, mark this step as completed and unlock next step in plan
        if (passed) {
          const plan = get().plan;
          if (plan) {
            const stepIndex = plan.steps.findIndex((s) => s.id === stepId);
            if (stepIndex !== -1) {
              get().updateStepInPlan(stepIndex, { status: "completed" });
              if (stepIndex + 1 < plan.steps.length) {
                get().updateStepInPlan(stepIndex + 1, { status: "current" });
              }
            }
          }
        }
      },

      updateConceptStatus: (concept, status, reason) => {
        set((state) => {
          const existing = state.conceptMastery[concept] || {
            concept,
            status: "yellow",
            timesEncountered: 0,
            timesCorrect: 0,
            lastTestedStep: state.currentStepIndex + 1,
          };
          return {
            conceptMastery: {
              ...state.conceptMastery,
              [concept]: {
                ...existing,
                status,
                timesEncountered: existing.timesEncountered + 1,
                timesCorrect: status === "green" ? existing.timesCorrect + 1 : existing.timesCorrect,
                notes: reason,
              },
            },
          };
        });
      },

      setComprehensionScore: (comprehensionScore) => set({ comprehensionScore }),

      addAgentActivity: (activity) => {
        const item: AgentActivityItem = {
          ...activity,
          id: "act-" + Date.now() + "-" + Math.random().toString(36).substring(2, 5),
          timestamp: new Date().toLocaleTimeString(),
        };
        set((state) => ({
          agentFeed: [item, ...state.agentFeed].slice(0, 30),
        }));
      },

      clearAgentFeed: () => set({ agentFeed: [] }),

      toggleDemoMode: (enabled) => {
        const nextVal = enabled !== undefined ? enabled : !get().isDemoMode;
        if (nextVal) {
          get().loadDemoProject();
        }
        set({ isDemoMode: nextVal });
      },

      loadDemoProject: () => {
        set({
          isDemoMode: true,
          userPrompt: "Build a modern task and flow app with localStorage and filters",
          plan: DEMO_PROJECT_PLAN,
          currentStepIndex: 1, // Start on Step 2 with Step 1 already complete
          stepData: DEMO_STEP_DATA,
          activeFile: "app.js",
          comprehensionScore: 40,
          conceptMastery: {
            "Semantic Form Submissions": {
              concept: "Semantic Form Submissions",
              status: "green",
              timesEncountered: 1,
              timesCorrect: 1,
              lastTestedStep: 1,
            },
            "CSS Backdrop Filters": {
              concept: "CSS Backdrop Filters",
              status: "green",
              timesEncountered: 1,
              timesCorrect: 1,
              lastTestedStep: 1,
            },
            "Accessible Dynamic Regions (ARIA)": {
              concept: "Accessible Dynamic Regions (ARIA)",
              status: "green",
              timesEncountered: 1,
              timesCorrect: 1,
              lastTestedStep: 1,
            },
            "CSS Box Model": {
              concept: "CSS Box Model",
              status: "green",
              timesEncountered: 1,
              timesCorrect: 1,
              lastTestedStep: 1,
            },
            "DOM Parsing & Script Execution Order": {
              concept: "DOM Parsing & Script Execution Order",
              status: "green",
              timesEncountered: 1,
              timesCorrect: 1,
              lastTestedStep: 1,
            },
          },
          agentFeed: [
            {
              id: "demo-act-5",
              timestamp: new Date().toLocaleTimeString(),
              agent: "Quiz",
              status: "success",
              message: "Step 2 Quiz generated: 5 questions targeted to app.js lines 1-49",
            },
            {
              id: "demo-act-4",
              timestamp: new Date().toLocaleTimeString(),
              agent: "Verifier",
              status: "success",
              message: "Verifier verified 5/5 questions using Gemini Python Code Execution.",
              toolUsed: "code_execution (python)",
            },
            {
              id: "demo-act-3",
              timestamp: new Date().toLocaleTimeString(),
              agent: "Explainer",
              status: "success",
              message: "Produced structured summary: Single Source of Truth & Idempotent Rendering.",
            },
            {
              id: "demo-act-2",
              timestamp: new Date().toLocaleTimeString(),
              agent: "Builder",
              status: "success",
              message: "Step 2 written: pure state model and render pipeline (app.js + style.css).",
            },
            {
              id: "demo-act-1",
              timestamp: new Date().toLocaleTimeString(),
              agent: "Planner",
              status: "success",
              message: "Created 5-step curriculum for VibeFlow task application.",
            },
          ],
        });
      },

      resetProject: () => {
        set({
          userPrompt: "",
          plan: null,
          currentStepIndex: 0,
          stepData: {},
          activeFile: "index.html",
          highlightedLines: null,
          comprehensionScore: 0,
          conceptMastery: {},
          isDemoMode: false,
          agentFeed: [],
        });
      },
    }),
    {
      name: "grokked_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userPrompt: state.userPrompt,
        plan: state.plan,
        currentStepIndex: state.currentStepIndex,
        stepData: state.stepData,
        conceptMastery: state.conceptMastery,
        comprehensionScore: state.comprehensionScore,
        isDemoMode: state.isDemoMode,
      }),
    }
  )
);
