"use client";

import React, { useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useGrokkedStore } from "@/lib/store";
import { AgentActivityItem } from "@/lib/types";

export function AgentFeed() {
  const [isOpen, setIsOpen] = useState(true);
  const { agentFeed } = useGrokkedStore();

  const getAgentColor = (agent: AgentActivityItem["agent"]) => {
    switch (agent) {
      case "Planner":
        return "text-indigo-400 bg-indigo-950/80 border-indigo-800/50";
      case "Builder":
        return "text-blue-400 bg-blue-950/80 border-blue-800/50";
      case "Explainer":
        return "text-purple-400 bg-purple-950/80 border-purple-800/50";
      case "Quiz":
        return "text-pink-400 bg-pink-950/80 border-pink-800/50";
      case "Verifier":
        return "text-emerald-400 bg-emerald-950/80 border-emerald-800/50";
      case "Grader":
        return "text-amber-400 bg-amber-950/80 border-amber-800/50";
    }
  };

  return (
    <div className="border-t border-slate-800/80 bg-[#070b14] w-full">
      {/* Feed Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-slate-900/60 transition text-xs font-mono"
      >
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </div>
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Multi-Agent Gemini Orchestration Telemetry
          </span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 font-bold">
            {agentFeed.length} Events
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span>{isOpen ? "Hide Telemetry" : "Show Telemetry"}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Feed Items */}
      {isOpen && (
        <div className="max-h-48 overflow-y-auto p-3 space-y-2 border-t border-slate-900">
          {agentFeed.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs font-mono hover:border-slate-700/80 transition"
            >
              <span className="text-[10px] text-slate-500 shrink-0 mt-0.5">{item.timestamp}</span>

              {/* Agent Pill */}
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 border ${getAgentColor(
                  item.agent
                )}`}
              >
                {item.agent}
              </span>

              {/* Message */}
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                <span className="text-slate-200">{item.message}</span>
                {item.details && (
                  <span className="text-slate-400 text-[11px]">({item.details})</span>
                )}
                {item.toolUsed && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/70 border border-emerald-800/60 text-[10px] text-emerald-300 flex items-center gap-1">
                    <Terminal className="w-2.5 h-2.5" />
                    {item.toolUsed}
                  </span>
                )}
              </div>

              {item.status === "success" && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
