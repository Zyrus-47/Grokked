"use client";

import React from "react";
import { Check, Lock, ChevronRight, Play } from "lucide-react";
import { useGrokkedStore } from "@/lib/store";

export function Stepper() {
  const { plan, currentStepIndex, setCurrentStepIndex } = useGrokkedStore();

  if (!plan || !plan.steps || plan.steps.length === 0) return null;

  return (
    <div className="w-full bg-[#0a0f1d] border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        {plan.steps.map((step, index) => {
          const isCompleted = step.status === "completed";
          const isCurrent = index === currentStepIndex;
          const isLocked = step.status === "locked" && !isCompleted && !isCurrent;

          return (
            <React.Fragment key={step.id}>
              <button
                disabled={isLocked}
                onClick={() => setCurrentStepIndex(index)}
                className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-all shrink-0 ${
                  isCurrent
                    ? "bg-indigo-600/20 border border-indigo-500/50 shadow-sm"
                    : isCompleted
                    ? "bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer"
                    : "opacity-50 cursor-not-allowed border border-transparent"
                }`}
              >
                {/* Status Icon */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : isCurrent
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 animate-pulse"
                      : "bg-slate-800 text-slate-500 border border-slate-700"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                {/* Step Title & Meta */}
                <div className="flex flex-col">
                  <span
                    className={`text-xs font-semibold truncate max-w-[130px] lg:max-w-[180px] ${
                      isCurrent
                        ? "text-indigo-200"
                        : isCompleted
                        ? "text-slate-300 group-hover:text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {isCompleted ? "Verified ✓" : isCurrent ? "Active Step" : "Locked Gate"}
                  </span>
                </div>
              </button>

              {index < plan.steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-700 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
