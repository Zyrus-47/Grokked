"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Target,
} from "lucide-react";
import { QuizQuestion } from "@/lib/types";

interface QuizCardProps {
  questions: QuizQuestion[];
  stepTitle: string;
  stepNumber: number;
  onQuestionChange: (question: QuizQuestion) => void;
  onFinishQuiz: (passed: boolean, score: number, userAnswers: Record<string, number>) => void;
  onRetryWithFreshQuestions: () => void;
  isLoadingFresh?: boolean;
}

export function QuizCard({
  questions,
  stepTitle,
  stepNumber,
  onQuestionChange,
  onFinishQuiz,
  onRetryWithFreshQuestions,
  isLoadingFresh,
}: QuizCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (currentQuestion) {
      onQuestionChange(currentQuestion);
    }
  }, [currentIndex, currentQuestion]);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
        <Sparkles className="w-8 h-8 mx-auto text-indigo-400 mb-2 animate-spin" />
        <p className="text-sm font-medium text-slate-300">
          Quiz Agent & Verifier are preparing verified questions...
        </p>
      </div>
    );
  }

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedOption,
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Calculate final score
      const finalAnswers = { ...userAnswers, [currentQuestion.id]: selectedOption! };
      let score = 0;
      questions.forEach((q) => {
        if (finalAnswers[q.id] === q.correctIndex) {
          score += 1;
        }
      });

      const passed = score >= 4;
      setIsComplete(true);
      if (passed) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      onFinishQuiz(passed, score, finalAnswers);
    }
  };

  // Final Score & Gate Result Screen
  if (isComplete) {
    let score = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) score += 1;
    });
    const passed = score >= 4;

    return (
      <div className="p-6 rounded-xl bg-[#0b101f] border border-slate-800 shadow-xl flex flex-col items-center text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
            passed
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              : "bg-red-500/20 text-red-400 border border-red-500/40"
          }`}
        >
          {passed ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
        </div>

        <h3 className="text-xl font-bold text-white">
          {passed ? "Comprehension Gate Cleared! 🚀" : "Comprehension Debt Detected ⚠️"}
        </h3>

        <p className="text-sm text-slate-400 mt-1 max-w-md">
          {passed
            ? `You scored ${score} out of 5 (${Math.round((score / 5) * 100)}%). You proved you truly understand this code!`
            : `You scored ${score} out of 5. You need at least 4/5 to unlock the next step. Let's fix the gaps!`}
        </p>

        {/* Breakdown of missed concepts */}
        {!passed && (
          <div className="w-full mt-4 p-3 rounded-lg bg-red-950/20 border border-red-900/40 text-left">
            <span className="text-xs font-bold text-red-300 block mb-1">
              Review Missed Questions & Explanations:
            </span>
            <div className="space-y-2 mt-2">
              {questions.map((q, i) => {
                const userAns = userAnswers[q.id];
                const isCorrect = userAns === q.correctIndex;
                if (isCorrect) return null;
                return (
                  <div key={q.id} className="text-xs bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <p className="font-semibold text-slate-200">
                      Q{i + 1}: {q.question}
                    </p>
                    <p className="text-emerald-400 mt-1">
                      ✓ Correct: {q.options[q.correctIndex]}
                    </p>
                    <p className="text-slate-400 mt-0.5">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 w-full">
          {!passed ? (
            <button
              onClick={onRetryWithFreshQuestions}
              disabled={isLoadingFresh}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg transition"
            >
              <RotateCcw className={`w-4 h-4 ${isLoadingFresh ? "animate-spin" : ""}`} />
              <span>{isLoadingFresh ? "Generating Fresh Questions..." : "Retake Gate (Fresh 5 Questions)"}</span>
            </button>
          ) : (
            <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm">
              ✓ Step unlocked! You can now proceed to the next step from the top stepper.
            </div>
          )}
        </div>
      </div>
    );
  }

  const isCurrentCorrect = selectedOption === currentQuestion.correctIndex;

  return (
    <div className="p-5 rounded-xl bg-[#0b101f] border border-slate-800 shadow-xl flex flex-col">
      {/* Top Question Progress & Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-400 font-mono">
            Question {currentIndex + 1} of 5
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {currentQuestion.type}
          </span>
          {currentQuestion.isSpacedRepetition && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-950/80 text-pink-300 border border-pink-800/40">
              Spaced Repetition
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
          <Target className="w-3.5 h-3.5" />
          <span>Pass Mark: 4/5</span>
        </div>
      </div>

      {/* Code target cue */}
      <div className="mt-3 px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 font-mono flex items-center justify-between">
        <span>Target: {currentQuestion.codeLines.file}</span>
        <span>Lines {currentQuestion.codeLines.startLine}–{currentQuestion.codeLines.endLine} (Highlighted in Editor)</span>
      </div>

      {/* Question Prompt */}
      <div className="mt-3 text-sm font-semibold text-slate-100 leading-relaxed">
        {currentQuestion.question}
      </div>

      {/* 4 Options */}
      <div className="mt-4 space-y-2.5">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQuestion.correctIndex;

          let btnStyle = "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700";

          if (isAnswerSubmitted) {
            if (isCorrect) {
              btnStyle = "bg-emerald-950/50 border-emerald-500/80 text-emerald-200 font-medium";
            } else if (isSelected && !isCorrect) {
              btnStyle = "bg-red-950/50 border-red-500/80 text-red-200 font-medium";
            } else {
              btnStyle = "bg-slate-900/30 border-slate-800/50 text-slate-500 opacity-60";
            }
          } else if (isSelected) {
            btnStyle = "bg-indigo-950/60 border-indigo-500 text-indigo-200 font-medium shadow-sm";
          }

          return (
            <button
              key={idx}
              disabled={isAnswerSubmitted}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 transition ${btnStyle}`}
            >
              <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0 border border-current">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1">{option}</span>
              {isAnswerSubmitted && isCorrect && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {isAnswerSubmitted && isSelected && !isCorrect && (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Reveal */}
      {isAnswerSubmitted && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs leading-relaxed border ${
            isCurrentCorrect
              ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-200"
              : "bg-red-950/30 border-red-800/50 text-red-200"
          }`}
        >
          <div className="font-bold flex items-center gap-1.5 mb-1">
            {isCurrentCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Spot On! High Comprehension.</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Not Quite. Here is why:</span>
              </>
            )}
          </div>
          <p className="text-slate-300">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">
          Concept: <span className="text-slate-300">{currentQuestion.concept}</span>
        </span>

        {!isAnswerSubmitted ? (
          <button
            disabled={selectedOption === null}
            onClick={handleSubmitAnswer}
            className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md transition"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md transition"
          >
            <span>{currentIndex + 1 < questions.length ? "Next Question" : "See Final Gate Score"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
