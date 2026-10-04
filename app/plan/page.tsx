"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListOrdered,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Play,
  Edit2,
  Check,
  RotateCcw,
  Sparkles,
  Info,
} from "lucide-react";
import { useGrokkedStore } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { PlanStep } from "@/lib/types";

export default function PlanEditorPage() {
  const router = useRouter();
  const { plan, updateStepInPlan, reorderPlanSteps, deletePlanStep, addPlanStep, setCurrentStepIndex } =
    useGrokkedStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editGoal, setEditGoal] = useState("");

  if (!plan || !plan.steps || plan.steps.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070b14]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-400 text-sm mb-4">No plan found. Start by entering an app prompt.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Go to Landing Page
          </button>
        </div>
      </div>
    );
  }

  const handleStartEditing = (step: PlanStep) => {
    setEditingId(step.id);
    setEditTitle(step.title);
    setEditGoal(step.goal);
  };

  const handleSaveEdit = (idx: number) => {
    updateStepInPlan(idx, {
      title: editTitle,
      goal: editGoal,
    });
    setEditingId(null);
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const newSteps = [...plan.steps];
    const temp = newSteps[idx - 1];
    newSteps[idx - 1] = newSteps[idx];
    newSteps[idx] = temp;
    reorderPlanSteps(newSteps.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  const handleMoveDown = (idx: number) => {
    if (idx === plan.steps.length - 1) return;
    const newSteps = [...plan.steps];
    const temp = newSteps[idx + 1];
    newSteps[idx + 1] = newSteps[idx];
    newSteps[idx] = temp;
    reorderPlanSteps(newSteps.map((s, i) => ({ ...s, stepNumber: i + 1 })));
  };

  const handleAddNewStep = () => {
    const newStepNum = plan.steps.length + 1;
    const newStep: PlanStep = {
      id: "step-" + Date.now(),
      stepNumber: newStepNum,
      title: "Custom Step " + newStepNum,
      goal: "Implement custom feature logic and UI enhancements.",
      estimatedLines: 40,
      status: "locked",
    };
    addPlanStep(newStep);
  };

  const handleStartBuilding = () => {
    setCurrentStepIndex(0);
    router.push("/build");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 sm:py-12 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider">
                Planner Agent Output
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                {plan.steps.length} Steps
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">{plan.title}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">{plan.summary}</p>
          </div>

          <button
            onClick={handleStartBuilding}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Building (Step 1)</span>
          </button>
        </div>

        {/* Tip Box */}
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
          <span>
            You can customize, reorder, delete, or add steps to suit your learning goals. Each step
            will require passing a verified code quiz before unlocking the next!
          </span>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {plan.steps.map((step, idx) => {
            const isEditing = editingId === step.id;

            return (
              <div
                key={step.id}
                className="p-4 rounded-xl bg-[#0a0f1d] border border-slate-800/80 hover:border-slate-700 transition shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 w-full">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </div>

                  <div className="flex-1 space-y-1 w-full">
                    {isEditing ? (
                      <div className="space-y-2 w-full">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-indigo-500 rounded px-3 py-1.5 text-xs text-white outline-none"
                          placeholder="Step Title"
                        />
                        <textarea
                          value={editGoal}
                          onChange={(e) => setEditGoal(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-300 outline-none"
                          placeholder="Step Goal"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-bold text-white">{step.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{step.goal}</p>
                        <span className="inline-block text-[10px] text-slate-500 font-mono">
                          ~{step.estimatedLines || 45} lines of delta code
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {isEditing ? (
                    <button
                      onClick={() => handleSaveEdit(idx)}
                      className="p-1.5 text-emerald-400 hover:bg-emerald-950/50 rounded-lg transition"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEditing(step)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                      title="Edit Step"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    disabled={idx === plan.steps.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    disabled={plan.steps.length <= 3}
                    onClick={() => deletePlanStep(step.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 disabled:opacity-30 rounded-lg transition"
                    title="Delete Step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Step Button */}
        <button
          onClick={handleAddNewStep}
          className="w-full py-3 rounded-xl border border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/40 text-slate-400 hover:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Step</span>
        </button>
      </main>
    </div>
  );
}
