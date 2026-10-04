"use client";

import React from "react";
import { Sparkles, X, Cpu, ShieldCheck, FileJson, Terminal, Workflow, Zap } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PoweredByGeminiModal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  const features = [
    {
      title: "Structured Outputs (JSON Schema)",
      agent: "All Agents",
      model: "gemini-2.5-flash & gemini-2.5-pro",
      icon: <FileJson className="w-5 h-5 text-indigo-400" />,
      desc: "Guarantees 100% type-safe JSON with strict schema validation using Zod and responseMimeType: 'application/json'.",
    },
    {
      title: "Gemini Python Code Execution",
      agent: "Verifier Agent",
      model: "gemini-2.5-pro",
      icon: <Terminal className="w-5 h-5 text-emerald-400" />,
      desc: "Solves questions blindly and executes algorithmic code inside a sandboxed Python runner to independently verify question outputs before student exposure.",
    },
    {
      title: "Function Calling / Tool Use",
      agent: "Grader & Concept Tracker",
      model: "gemini-2.5-flash",
      icon: <Workflow className="w-5 h-5 text-amber-400" />,
      desc: "Directly calls updateConceptMastery tool to categorize student knowledge into Red (Missed), Yellow (Shaky), and Green (Proven).",
    },
    {
      title: "Ultra-Long Context Window",
      agent: "Builder & Quiz Agents",
      model: "gemini-2.5-flash / pro",
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      desc: "Passes cumulative code history across all prior steps, ensuring incremental continuity without hallucinating broken dependencies.",
    },
    {
      title: "Multi-Agent Orchestration",
      agent: "Full Pipeline",
      model: "Planner ➔ Builder ➔ Explainer ➔ Quiz ➔ Verifier ➔ Grader",
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      desc: "6 discrete agents with dedicated system instructions collaborate seamlessly to transform raw prompts into verified learning milestones.",
    },
    {
      title: "Spaced Repetition Synthesis",
      agent: "Quiz Generator",
      model: "gemini-2.5-pro",
      icon: <ShieldCheck className="w-5 h-5 text-pink-400" />,
      desc: "Dynamically ingests previous weak concepts to re-test student comprehension across progressive steps.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[#0d1321] border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Powered by Google Gemini
              </h2>
              <p className="text-xs text-slate-400">
                Official Google Gen AI SDK integration & multi-agent architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 rounded-md bg-slate-800 group-hover:bg-slate-700/80 transition">
                  {f.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                  {f.agent}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-100">{f.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.desc}</p>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                Model: <span className="text-slate-300">{f.model}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>SDK: <code className="text-indigo-300">@google/genai</code></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
