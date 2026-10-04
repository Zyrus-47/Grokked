"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Brain, RotateCcw, Play, CheckCircle2, ShieldCheck } from "lucide-react";
import { useGrokkedStore } from "@/lib/store";
import { PoweredByGeminiModal } from "./PoweredByGeminiModal";

export function Navbar() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const {
    comprehensionScore,
    isDemoMode,
    toggleDemoMode,
    resetProject,
    plan,
    currentStepIndex,
  } = useGrokkedStore();

  const getMeterColor = (score: number) => {
    if (score < 40) return "from-red-500 to-amber-500";
    if (score < 75) return "from-amber-500 to-emerald-400";
    return "from-emerald-400 to-cyan-400";
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-white text-base">Grokked</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">
                    Gemini AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:inline -mt-0.5">
                  Vibe Code with High Comprehension
                </span>
              </div>
            </Link>

            {plan && (
              <div className="hidden lg:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800 text-xs text-slate-400">
                <span className="font-medium text-slate-200 truncate max-w-[200px]">{plan.title}</span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-400 font-mono">
                  Step {currentStepIndex + 1} of {plan.steps.length}
                </span>
              </div>
            )}
          </div>

          {/* Center: Comprehension Meter */}
          <div className="flex-1 max-w-xs hidden md:flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Comprehension Meter
              </span>
              <span className="font-bold text-slate-200 font-mono">{comprehensionScore}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getMeterColor(comprehensionScore)} transition-all duration-700 ease-out`}
                style={{ width: `${Math.max(5, Math.min(100, comprehensionScore))}%` }}
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Demo Mode Toggle */}
            <button
              onClick={() => toggleDemoMode()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                isDemoMode
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
              title="Toggle offline sample project (Zero API calls)"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isDemoMode ? "bg-amber-400 animate-pulse" : "bg-slate-600"
                }`}
              />
              Demo Mode
            </button>

            {/* Powered by Gemini Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Gemini Specs</span>
            </button>

            {/* Reset Button */}
            {plan && (
              <button
                onClick={() => {
                  if (confirm("Reset current project and start over?")) {
                    resetProject();
                    router.push("/");
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/80 transition"
                title="Reset Project"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <PoweredByGeminiModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
