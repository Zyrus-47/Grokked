"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import confetti from "canvas-confetti";
import {
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Share2,
} from "lucide-react";
import { useGrokkedStore } from "@/lib/store";
import { ProjectFile } from "@/lib/types";

interface MasteryReportProps {
  files: ProjectFile[];
  onRestart: () => void;
}

export function MasteryReport({ files, onRestart }: MasteryReportProps) {
  const { plan, conceptMastery, comprehensionScore } = useGrokkedStore();
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [downloading, setDownloading] = useState(false);

  // Generate self-contained HTML for sandboxed iframe
  const pythonFile = files.find((f) => f.filename.endsWith(".py"))?.content;
  const htmlFile = files.find((f) => f.filename === "index.html")?.content || "";
  const cssFile = files.find((f) => f.filename === "style.css")?.content || "";
  const jsFile = files.find((f) => f.filename === "app.js")?.content || "";

  const bundledSrcDoc = pythonFile
    ? `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Python Runtime</title>
    <style>
      body { background: #080d1a; color: #38bdf8; font-family: 'Courier New', monospace; padding: 24px; margin: 0; }
      .header { border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px; font-weight: bold; color: #a855f7; display: flex; justify-content: space-between; font-size: 13px; }
      #output { white-space: pre-wrap; font-size: 13px; color: #f1f5f9; line-height: 1.6; }
      .prompt-sign { color: #10b981; }
    </style>
    <script src="https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js"></script>
  </head>
  <body>
    <div class="header">
      <span>🐍 Pyodide Python 3 WebAssembly Sandbox</span>
      <span style="color: #64748b;">Live In-Browser Execution</span>
    </div>
    <div id="output"><span class="prompt-sign">&gt;&gt;&gt;</span> Initializing Python WASM environment...</div>
    <script>
      async function main() {
        const out = document.getElementById("output");
        try {
          const pyodide = await loadPyodide();
          out.innerHTML = "<span class='prompt-sign'>&gt;&gt;&gt;</span> Python 3 environment loaded.\\n<span class='prompt-sign'>&gt;&gt;&gt;</span> Executing main.py...\\n\\n";
          pyodide.setStdout({
            batched: (msg) => { out.innerText += msg + "\\n"; }
          });
          const pyCode = ${JSON.stringify(pythonFile)};
          await pyodide.runPythonAsync(pyCode);
          out.innerHTML += "\\n\\n<span style='color: #10b981;'>[Program finished with exit status 0]</span>";
        } catch (e) {
          out.innerHTML += "\\n<span style='color: #ef4444;'>Error: " + e + "</span>";
        }
      }
      main();
    </script>
  </body>
</html>`
    : `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${cssFile}</style>
      </head>
      <body>
        ${htmlFile.replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, "").replace(/<\/body>[\s\S]*?<\/html>/i, "")}
        <script>
          try {
            ${jsFile}
          } catch(e) {
            console.error("User app runtime error:", e);
          }
        </script>
      </body>
    </html>
  `;

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.filename, file.content);
      });
      zip.file(
        "README.md",
        `# ${plan?.title || "Built with Grokked"}\n\nGenerated with Grokked — high comprehension AI vibe coding platform powered by Gemini.\n\nAll concepts verified with verified quiz gates.`
      );

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(plan?.title || "grokked-project").toLowerCase().replace(/\s+/g, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Zip generation error:", e);
    } finally {
      setDownloading(false);
    }
  };

  const concepts = Object.values(conceptMastery);
  const greenCount = concepts.filter((c) => c.status === "green").length;
  const yellowCount = concepts.filter((c) => c.status === "yellow").length;
  const redCount = concepts.filter((c) => c.status === "red").length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in">
      {/* Hero Achievement Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900 border border-indigo-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Project Completed & Comprehension Debt Cleared</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {plan?.title || "Your Verified Application"}
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            You successfully passed every step-by-step quiz gate. You didn't just vibe code — you
            proved real comprehension of the architecture, logic, and APIs!
          </p>
        </div>

        {/* Big Score Card */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 min-w-[170px] shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Score
          </span>
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono">
            {comprehensionScore}%
          </span>
          <span className="text-[11px] text-emerald-400 mt-1 font-medium">Verified Comprehension</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#0d1322] border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Preview (Sandbox)
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "code"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Project Files ({files.length})
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? "Zipping..." : "Download as .zip"}</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New App</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "preview" ? (
        <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-black">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">Sandboxed Iframe Runtime (`sandbox="allow-scripts"`)</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Client Code
            </span>
          </div>
          <iframe
            title="Live App Preview"
            srcDoc={bundledSrcDoc}
            sandbox="allow-scripts"
            className="w-full h-[520px] border-none bg-white"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.filename}
              className="p-4 rounded-xl bg-[#0a0f1d] border border-slate-800 overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 font-mono">{file.filename}</span>
                <span className="text-[10px] text-slate-500 uppercase">{file.language}</span>
              </div>
              <pre className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-64 flex-1">
                <code>{file.content}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Concept Mastery Summary Card */}
      <div className="p-6 rounded-2xl bg-[#0a0f1d] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Final Concept Mastery Report
            </h3>
            <p className="text-xs text-slate-400">
              Verified outcomes from the Quiz & Verifier agents across each incremental step.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400">✓ {greenCount} Proven</span>
            <span className="text-amber-400">~ {yellowCount} Shaky</span>
            <span className="text-red-400">✕ {redCount} Missed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {concepts.map((item) => (
            <div
              key={item.concept}
              className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                item.status === "green"
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                  : item.status === "yellow"
                  ? "bg-amber-950/20 border-amber-800/40 text-amber-200"
                  : "bg-red-950/20 border-red-800/40 text-red-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-100">{item.concept}</span>
                {item.status === "green" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : item.status === "yellow" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Accuracy: {item.timesCorrect}/{item.timesEncountered}</span>
                <span className="capitalize font-semibold">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
