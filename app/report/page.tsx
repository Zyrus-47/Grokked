"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MasteryReport } from "@/components/MasteryReport";
import { Navbar } from "@/components/Navbar";
import { useGrokkedStore } from "@/lib/store";
import { ProjectFile } from "@/lib/types";

export default function ReportPage() {
  const router = useRouter();
  const { plan, stepData, resetProject } = useGrokkedStore();

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070b14]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-400 text-sm mb-4">No project completed yet.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
          >
            Start a Project
          </button>
        </div>
      </div>
    );
  }

  // Get the latest files from the last completed step
  let finalFiles: ProjectFile[] = [];
  for (let i = plan.steps.length - 1; i >= 0; i--) {
    const sId = plan.steps[i]?.id;
    if (sId && stepData[sId]?.files && stepData[sId].files.length > 0) {
      finalFiles = stepData[sId].files;
      break;
    }
  }

  const handleRestart = () => {
    resetProject();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14]">
      <Navbar />
      <main className="flex-1 py-6">
        <MasteryReport files={finalFiles} onRestart={handleRestart} />
      </main>
    </div>
  );
}
