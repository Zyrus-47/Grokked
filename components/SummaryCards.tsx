"use client";

import React from "react";
import { Lightbulb, HelpCircle, GitFork, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { StepSummary } from "@/lib/types";

interface SummaryCardsProps {
  summary?: StepSummary;
  onTakeQuiz: () => void;
  isLoading?: boolean;
}

export function SummaryCards({ summary, onTakeQuiz, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-28 bg-slate-900/60 rounded-xl border border-slate-800" />
        <div className="h-28 bg-slate-900/60 rounded-xl border border-slate-800" />
        <div className="h-40 bg-slate-900/60 rounded-xl border border-slate-800" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
        <BookOpen className="w-8 h-8 mx-auto text-indigo-400 mb-2 opacity-50" />
        <p className="text-sm">Summary will appear once the Explainer Agent analyzes this step.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* What Was Added Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>What Was Added</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{summary.whatWasAdded}</p>
      </div>

      {/* Why It's Needed Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Why It's Needed</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed">{summary.whyItsNeeded}</p>
      </div>

      {/* Key Concepts with Real-World Analogies */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
        <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          <span>Key Concepts & Analogies</span>
        </div>
        <div className="space-y-3">
          {summary.keyConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#080d1a] border border-slate-800/90 hover:border-emerald-500/30 transition"
            >
              <div className="text-xs font-bold text-slate-100 flex items-center justify-between">
                <span>{concept.name}</span>
                <span className="text-[10px] text-emerald-400/90 font-mono">Concept #{idx + 1}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{concept.definition}</p>
              <div className="mt-2 text-xs bg-emerald-950/30 border border-emerald-800/40 p-2 rounded text-emerald-300 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="font-semibold text-emerald-200">Analogy: </strong>
                  {concept.oneLineAnalogy}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Connects to Previous Step */}
      {summary.howItConnectsToPreviousStep && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md">
          <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <GitFork className="w-4 h-4" />
            <span>Connection to Previous Step</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {summary.howItConnectsToPreviousStep}
          </p>
        </div>
      )}

      {/* Take The Quiz Call to Action Button */}
      <div className="pt-2">
        <button
          onClick={onTakeQuiz}
          className="w-full group flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 transition-all transform hover:-translate-y-0.5"
        >
          <span>Take the Comprehension Quiz (5 Questions)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
