"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  ShieldCheck,
  Zap,
  Terminal,
  Play,
} from "lucide-react";
import { useGrokkedStore } from "@/lib/store";
import { Navbar } from "@/components/Navbar";

export default function LandingPage() {
  const router = useRouter();
  const { userPrompt, setUserPrompt, setPlan, addAgentActivity, isDemoMode, loadDemoProject } =
    useGrokkedStore();

  const [inputVal, setInputVal] = useState(userPrompt || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const examplePrompts = [
    {
      title: "Task & Flow App with LocalStorage",
      prompt: "Build a sleek task and flow app with local storage persistence and filter tabs",
      badge: "Instant Demo",
    },
    {
      title: "Pomodoro Focus Timer with Sound Chimes",
      prompt: "Build an aesthetic Pomodoro focus timer with customizable intervals and sound notifications",
      badge: "Pedagogical",
    },
    {
      title: "Markdown Note Pad with Live Preview",
      prompt: "Build a split-screen markdown note pad with live HTML rendering and word counter",
      badge: "Interactive",
    },
  ];

  const handleGeneratePlan = async (promptToUse?: string) => {
    const text = promptToUse || inputVal;
    if (!text.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setUserPrompt(text);

    addAgentActivity({
      agent: "Planner",
      status: "running",
      message: `Analyzing prompt and creating pedagogical curriculum: "${text}"`,
    });

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, isDemoMode }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate plan");
      }

      setPlan(data.plan);

      addAgentActivity({
        agent: "Planner",
        status: "success",
        message: `Plan generated successfully: ${data.plan.steps.length} incremental steps created.`,
      });

      router.push("/plan");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred generating your plan. Try switching on Demo Mode.");
      addAgentActivity({
        agent: "Planner",
        status: "error",
        message: `Planner failed: ${err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    loadDemoProject();
    router.push("/build");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Glow pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow-lg mb-6 animate-pulse-subtle">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Stop Comprehension Debt in AI Coding</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15]">
          Vibe code apps. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Prove you understand
          </span>{" "}
          every line.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Grokked breaks your app idea into 4–8 incremental steps. At each milestone, you must pass
          a 5-question code comprehension quiz verified by Gemini before the next step unlocks.
        </p>

        {/* Prompt Input Form */}
        <div className="w-full max-w-2xl mt-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-[#0c1222] border border-slate-800 rounded-2xl shadow-2xl">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGeneratePlan()}
                placeholder="What do you want to vibe code? (e.g. build a todo app with login)..."
                className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => handleGeneratePlan()}
                disabled={loading || !inputVal.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Planning Steps...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 text-left flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                onClick={handleQuickDemo}
                className="underline text-red-200 font-semibold hover:text-white"
              >
                Launch Offline Demo instead
              </button>
            </div>
          )}

          {/* Example prompt chips */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-500 font-medium mr-1">Try an example:</span>
            {examplePrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputVal(item.prompt);
                  handleGeneratePlan(item.prompt);
                }}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-xs text-slate-300 hover:text-white transition shadow-sm"
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/50">
                  {item.badge}
                </span>
              </button>
            ))}
          </div>

          {/* Direct 1-Click Demo Mode Button */}
          <div className="mt-6 pt-4 border-t border-slate-900/80 flex items-center justify-center">
            <button
              onClick={handleQuickDemo}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400/90 hover:text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/40 px-4 py-2 rounded-xl transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Explore Pre-Verified 5-Step Demo Mode (Zero API calls required)</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl w-full mt-16 text-left">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-indigo-500/30 transition">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center mb-3">
              <Code2 className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-sm font-bold text-white">1. Incremental Steps</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              No monolithic walls of hallucinated code. Gemini Builder generates 30–60 lines at a
              time with full continuity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-purple-500/30 transition">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center mb-3">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-sm font-bold text-white">2. Real Analogies</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Gemini Explainer translates every new function and event listener into intuitive
              real-world mental models.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 transition">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold text-white">3. Verified Quiz Gate</h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Score ≥ 4/5 on real code MCQs independently solved and verified with Gemini Python Code
              Execution before moving on.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
