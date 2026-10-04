"use client";

import React, { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Copy, Check, FileCode, Code2, Sparkles, Layers } from "lucide-react";
import { ProjectFile } from "@/lib/types";

interface CodePaneProps {
  files: ProjectFile[];
  activeFile: string;
  onSelectFile: (filename: string) => void;
  highlightedLines?: { file: string; start: number; end: number } | null;
  deltas?: { filename: string; description: string; startLine?: number; endLine?: number }[];
}

export function CodePane({
  files,
  activeFile,
  onSelectFile,
  highlightedLines,
  deltas = [],
}: CodePaneProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const currentFileObj = files.find((f) => f.filename === activeFile) || files[0] || {
    filename: "app.js",
    language: "javascript",
    content: "// Waiting for builder agent...",
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    applyHighlight();
  };

  const applyHighlight = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (highlightedLines && highlightedLines.file === currentFileObj.filename) {
      const newDecorations = [
        {
          range: new monaco.Range(
            highlightedLines.start,
            1,
            highlightedLines.end,
            1
          ),
          options: {
            isWholeLine: true,
            className: "monaco-highlight-line",
            glyphMarginClassName: "monaco-glyph-arrow",
            linesDecorationsClassName: "monaco-line-decoration",
          },
        },
      ];
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
      editor.revealLineInCenter(highlightedLines.start);
    } else {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }
  };

  useEffect(() => {
    applyHighlight();
  }, [highlightedLines, currentFileObj.filename]);

  const handleCopy = () => {
    if (!currentFileObj) return;
    navigator.clipboard.writeText(currentFileObj.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguage = (filename: string) => {
    if (filename.endsWith(".html")) return "html";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".py")) return "python";
    return "javascript";
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* File Tabs Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d1322] border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {files.map((file) => {
            const isActive = file.filename === currentFileObj.filename;
            const hasDelta = deltas.some((d) => d.filename === file.filename);
            const isHighlighted = highlightedLines && highlightedLines.file === file.filename;

            return (
              <button
                key={file.filename}
                onClick={() => onSelectFile(file.filename)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <FileCode
                  className={`w-3.5 h-3.5 ${
                    file.filename.endsWith(".html")
                      ? "text-orange-400"
                      : file.filename.endsWith(".css")
                      ? "text-sky-400"
                      : file.filename.endsWith(".py")
                      ? "text-emerald-400"
                      : "text-yellow-400"
                  }`}
                />
                <span>{file.filename}</span>
                {hasDelta && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Modified in this step" />
                )}
                {isHighlighted && (
                  <span className="px-1 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    Quiz Target
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Copy Button */}
        <div className="flex items-center gap-2">
          {highlightedLines && highlightedLines.file === currentFileObj.filename && (
            <span className="text-[11px] font-mono text-indigo-400 hidden sm:inline">
              Examining Lines {highlightedLines.start}–{highlightedLines.end}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
            title="Copy file code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Deltas Sub-bar */}
      {deltas.length > 0 && (
        <div className="px-3.5 py-1.5 bg-slate-900/40 border-b border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
          <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-slate-300 font-medium shrink-0">Step Delta:</span>
          <span className="truncate">
            {deltas.find((d) => d.filename === currentFileObj.filename)?.description ||
              "Foundation code accumulated from previous steps"}
          </span>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full min-h-[380px] lg:min-h-[500px]">
        <Editor
          height="100%"
          language={getLanguage(currentFileObj.filename)}
          theme="vs-dark"
          value={currentFileObj.content}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 20,
            fontFamily: "'JetBrains Mono', monospace",
            renderLineHighlight: "all",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            lineNumbersMinChars: 3,
            folding: true,
          }}
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}
