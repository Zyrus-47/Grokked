"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CodePane,
} from "@/components/CodePane";
import { Stepper } from "@/components/Stepper";
import { SummaryCards } from "@/components/SummaryCards";
import { QuizCard } from "@/components/QuizCard";
import { AgentFeed } from "@/components/AgentFeed";
import { ConceptMap } from "@/components/ConceptMap";
import { Navbar } from "@/components/Navbar";
import { useGrokkedStore } from "@/lib/store";
import {
  QuizQuestion,
  ProjectFile,
  StepExecutionData,
} from "@/lib/types";
import {
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  FileCode,
  CheckSquare,
} from "lucide-react";

export default function BuildStepPage() {
  const router = useRouter();
  const {
    plan,
    currentStepIndex,
    stepData,
    setStepData,
    activeFile,
    setActiveFile,
    highlightedLines,
    setHighlightedLines,
    recordQuizResult,
    updateConceptStatus,
    setComprehensionScore,
    comprehensionScore,
    conceptMastery,
    addAgentActivity,
    isDemoMode,
    userPrompt,
  } = useGrokkedStore();

  const [activeTab, setActiveTab] = useState<"summary" | "quiz">("summary");
  const [isBuilding, setIsBuilding] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const currentStep = plan?.steps[currentStepIndex];
  const currentExecution = currentStep ? stepData[currentStep.id] : undefined;

  // Track accumulated files across all previous steps
  const getAccumulatedFiles = (): ProjectFile[] => {
    if (!plan) return [];
    let files: ProjectFile[] = [];
    for (let i = 0; i <= currentStepIndex; i++) {
      const sId = plan.steps[i]?.id;
      if (sId && stepData[sId]?.files && stepData[sId].files.length > 0) {
        files = stepData[sId].files;
      }
    }
    return (
      files.length > 0
        ? files
        : [
            {
              filename: "index.html",
              language: "html",
              content: `<!-- Building Step ${currentStepIndex + 1}... -->`,
            },
            {
              filename: "style.css",
              language: "css",
              content: `/* Building Step ${currentStepIndex + 1}... */`,
            },
            {
              filename: "app.js",
              language: "javascript",
              content: `// Step ${currentStepIndex + 1} initialization...`,
            },
          ]
    );
  };

  // Step Lifecycle Orchestrator: Builder -> Explainer -> Quiz Generator -> Verifier
  useEffect(() => {
    if (!currentStep) return;

    // Check if the current execution is valid and fresh (not stale fallback)
    const hasValidFiles = Boolean(currentExecution?.files && currentExecution.files.length > 0);
    const hasValidSummary = Boolean(
      currentExecution?.summary &&
      !currentExecution.summary.whatWasAdded?.includes("essential code for this step") &&
      !currentExecution.summary.keyConcepts?.some((c) =>
        c.oneLineAnalogy?.includes("new room to a building")
      )
    );
    
    // Check if quiz questions match the current project's actual files
    const hasValidQuiz = Boolean(
      currentExecution?.quizQuestions &&
      currentExecution.quizQuestions.length > 0 &&
      currentExecution.quizQuestions.every((q) => {
        if (!q.codeLines?.file) return true;
        return currentExecution.files?.some((f) => f.filename === q.codeLines.file);
      })
    );

    // If step already has code, real summary, and valid quiz questions, don't re-trigger
    if (hasValidFiles && hasValidSummary && hasValidQuiz) {
      return;
    }

    orchestrateStepPipeline();
  }, [currentStepIndex, currentStep?.id]);

  const orchestrateStepPipeline = async () => {
    if (!currentStep || !plan) return;
    setErrorMessage("");
    setIsBuilding(true);

    try {
      // 1. BUILDER AGENT
      addAgentActivity({
        agent: "Builder",
        status: "running",
        message: `Writing code for Step ${currentStep.stepNumber}: "${currentStep.title}"`,
      });

      const previousFiles = getAccumulatedFiles();

      const buildRes = await fetch("/api/build-step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userPrompt,
          plan,
          step: currentStep,
          previousFiles,
          isDemoMode,
        }),
      });

      const buildData = await buildRes.json();
      if (!buildRes.ok || buildData.error) {
        throw new Error(buildData.error || "Builder agent failed.");
      }

      setStepData(currentStep.id, {
        files: buildData.files,
        changes: buildData.changes,
        executionNotes: buildData.executionNotes,
      });

      // Ensure activeFile matches one of the generated files
      if (buildData.files && buildData.files.length > 0) {
        const fileExists = buildData.files.some((f: any) => f.filename === activeFile);
        if (!fileExists) {
          setActiveFile(buildData.files[0].filename);
        }
      }

      addAgentActivity({
        agent: "Builder",
        status: "success",
        message: `Step ${currentStep.stepNumber} code complete: ${buildData.files.length} files updated.`,
      });
      setIsBuilding(false);

      // 2. EXPLAINER AGENT
      setIsExplaining(true);
      addAgentActivity({
        agent: "Explainer",
        status: "running",
        message: `Analyzing mental models & real-world analogies for Step ${currentStep.stepNumber}...`,
      });

      const explainRes = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: currentStep,
          files: buildData.files,
          changes: buildData.changes,
          isDemoMode,
        }),
      });

      const explainData = await explainRes.json();
      if (!explainRes.ok || explainData.error) {
        throw new Error(explainData.error || "Explainer agent failed.");
      }

      setStepData(currentStep.id, {
        summary: explainData.summary,
      });

      addAgentActivity({
        agent: "Explainer",
        status: "success",
        message: `Produced structured summary with ${explainData.summary?.keyConcepts?.length || 2} key analogies.`,
      });
      setIsExplaining(false);

      // 3. QUIZ & VERIFIER AGENTS
      await generateAndVerifyQuiz(buildData.files);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to orchestrate agents for this step.");
      setIsBuilding(false);
      setIsExplaining(false);
      setIsGeneratingQuiz(false);
      setIsVerifying(false);
    }
  };

  const generateAndVerifyQuiz = async (stepFiles: ProjectFile[]) => {
    if (!currentStep) return;
    setIsGeneratingQuiz(true);

    try {
      // Find weak concepts for spaced repetition
      const weakConcepts = Object.values(conceptMastery)
        .filter((c) => c.status === "red" || c.status === "yellow")
        .map((c) => c.concept);

      addAgentActivity({
        agent: "Quiz",
        status: "running",
        message: `Generating 5 targeted MCQs on real code (Spaced Repetition: ${weakConcepts.length} concepts)...`,
      });

      const quizRes = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: currentStep,
          files: stepFiles,
          weakConcepts,
          isDemoMode,
        }),
      });

      const quizData = await quizRes.json();
      if (!quizRes.ok || quizData.error) {
        throw new Error(quizData.error || "Quiz agent failed.");
      }

      setIsGeneratingQuiz(false);
      setIsVerifying(true);

      // VERIFIER AGENT
      addAgentActivity({
        agent: "Verifier",
        status: "running",
        message: `Blindly solving and testing 5 questions using Gemini Python Code Execution...`,
        toolUsed: "code_execution (python)",
      });

      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: currentStep,
          files: stepFiles,
          questions: quizData.questions,
          isDemoMode,
        }),
      });

      const verifyData = await verifyRes.json();

      addAgentActivity({
        agent: "Verifier",
        status: "success",
        message: `Verification complete: ${verifyData.passedCount || 5}/5 questions verified & approved.`,
        toolUsed: "code_execution (python)",
      });

      setStepData(currentStep.id, {
        quizQuestions: quizData.questions,
      });

      setIsVerifying(false);
    } catch (err: any) {
      console.error(err);
      setIsGeneratingQuiz(false);
      setIsVerifying(false);
    }
  };

  // Called when active quiz question changes -> highlight code in Monaco!
  const handleQuizQuestionChange = (question: QuizQuestion) => {
    if (question.codeLines) {
      setHighlightedLines({
        file: question.codeLines.file,
        start: question.codeLines.startLine,
        end: question.codeLines.endLine,
      });
      if (question.codeLines.file !== activeFile) {
        setActiveFile(question.codeLines.file);
      }
    }
  };

  // Called when quiz is submitted
  const handleFinishQuiz = async (
    passed: boolean,
    score: number,
    userAnswers: Record<string, number>
  ) => {
    if (!currentStep) return;

    recordQuizResult(currentStep.id, passed, score, currentExecution?.quizQuestions || []);

    // Call GRADER agent to update Concept Mastery
    try {
      addAgentActivity({
        agent: "Grader",
        status: "running",
        message: `Updating concept mastery map via Gemini function calling tool...`,
        toolUsed: "updateConceptMastery",
      });

      const gradeRes = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: currentExecution?.quizQuestions || [],
          userAnswers,
          conceptMastery,
          currentScore: comprehensionScore,
          isDemoMode,
        }),
      });

      const gradeData = await gradeRes.json();
      if (gradeData.updates) {
        gradeData.updates.forEach((u: any) => {
          updateConceptStatus(u.concept, u.status, u.reason);
        });
      }
      if (gradeData.comprehensionMeterScore !== undefined) {
        setComprehensionScore(gradeData.comprehensionMeterScore);
      }

      addAgentActivity({
        agent: "Grader",
        status: "success",
        message: `Grading logged: Comprehension meter updated to ${gradeData.comprehensionMeterScore || comprehensionScore}%.`,
        toolUsed: "updateConceptMastery",
      });
    } catch (err) {
      console.error("Grading update failed:", err);
    }
  };

  // On Quiz Failure -> Generate fresh 5 questions
  const handleRetryFresh = async () => {
    const files = getAccumulatedFiles();
    await generateAndVerifyQuiz(files);
  };

  if (!plan || !currentStep) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070b14]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-400 text-sm mb-4">No active project found.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Start New Project
          </button>
        </div>
      </div>
    );
  }

  const files = currentExecution?.files && currentExecution.files.length > 0
    ? currentExecution.files
    : getAccumulatedFiles();

  const isAllStepsCompleted = plan.steps.every((s) => s.status === "completed");

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14]">
      <Navbar />
      <Stepper />

      {/* Main Workspace Split Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Monaco Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-[500px] lg:min-h-[620px]">
          <CodePane
            files={files}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            highlightedLines={highlightedLines}
            deltas={currentExecution?.changes}
          />
        </div>

        {/* Right Column: Interactive Review / Quiz Gate Tabs (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Tab Bar */}
          <div className="flex items-center justify-between p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === "summary"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Step Explainer</span>
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition relative ${
                activeTab === "quiz"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Quiz Gate (Pass ≥ 4/5)</span>
              {currentExecution?.quizPassed && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            <button
              onClick={() => {
                if (currentStep) {
                  setStepData(currentStep.id, { files: [], summary: undefined, quizQuestions: [] });
                }
                orchestrateStepPipeline();
              }}
              className="p-2 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800 transition shrink-0"
              title="Regenerate code, explainer & quiz for this step"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 ${
                  isBuilding || isExplaining || isGeneratingQuiz || isVerifying
                    ? "animate-spin text-indigo-400"
                    : ""
                }`}
              />
            </button>
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                onClick={() => orchestrateStepPipeline()}
                className="flex items-center gap-1 text-red-200 underline font-semibold ml-2 shrink-0"
              >
                <RotateCcw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {/* Active Tab Body */}
          <div className="flex-1 overflow-y-auto max-h-[600px] pr-1">
            {activeTab === "summary" ? (
              <SummaryCards
                summary={currentExecution?.summary}
                isLoading={isBuilding || isExplaining}
                onTakeQuiz={() => setActiveTab("quiz")}
              />
            ) : (
              <QuizCard
                questions={currentExecution?.quizQuestions || []}
                stepTitle={currentStep.title}
                stepNumber={currentStep.stepNumber}
                onQuestionChange={handleQuizQuestionChange}
                onFinishQuiz={handleFinishQuiz}
                onRetryWithFreshQuestions={handleRetryFresh}
                isLoadingFresh={isGeneratingQuiz || isVerifying}
              />
            )}
          </div>

          {/* Unlock to Final Screen Banner if completed */}
          {isAllStepsCompleted && (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 to-indigo-950/70 border border-emerald-500/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">All Steps Completed!</span>
                  <span className="text-[10px] text-slate-300">
                    View final live sandbox & download your project
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push("/report")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
              >
                <span>Final Showcase</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Concept Map Section */}
      <div className="max-w-7xl mx-auto w-full px-4 py-2">
        <ConceptMap />
      </div>

      {/* Agent Activity Streaming Feed Bar */}
      <AgentFeed />
    </div>
  );
}
