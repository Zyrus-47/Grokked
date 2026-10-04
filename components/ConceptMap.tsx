"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Brain, Sparkles } from "lucide-react";
import { useGrokkedStore } from "@/lib/store";
import { ConceptStatus } from "@/lib/types";

export function ConceptMap() {
  const { conceptMastery } = useGrokkedStore();
  const concepts = Object.values(conceptMastery);

  const getStatusBadge = (status: ConceptStatus) => {
    switch (status) {
      case "green":
        return {
          label: "Proven",
          bg: "bg-emerald-950/60 border-emerald-500/50 text-emerald-300",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case "yellow":
        return {
          label: "Shaky",
          bg: "bg-amber-950/60 border-amber-500/50 text-amber-300",
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case "red":
        return {
          label: "Missed",
          bg: "bg-red-950/60 border-red-500/50 text-red-300",
          icon: <XCircle className="w-3.5 h-3.5 text-red-400" />,
        };
    }
  };

  if (concepts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 text-center">
        No concepts evaluated yet. Take your first step quiz to populate your mastery map!
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#0a0f1d] border border-slate-800 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-indigo-400" />
          Concept Mastery Tracker
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">
          {concepts.filter((c) => c.status === "green").length}/{concepts.length} Proven
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {concepts.map((item) => {
          const badge = getStatusBadge(item.status);
          return (
            <div
              key={item.concept}
              className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2"
            >
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-200 truncate">{item.concept}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Accuracy: {item.timesCorrect}/{item.timesEncountered}
                </span>
              </div>

              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
