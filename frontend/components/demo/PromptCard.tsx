"use client";

import React, { useState } from "react";
import { Database, AlertTriangle, ArrowRight, ChevronDown, Bot, Sparkles } from "lucide-react";
import { Hero3DVisual } from "@/components/visuals/Hero3DVisual";

interface PromptCardProps {
  prompt: string;
  onChangePrompt: (val: string) => void;
  onRunAnalysis: () => void;
  isRunning?: boolean;
}

export function PromptCard({
  prompt,
  onChangePrompt,
  onRunAnalysis,
  isRunning = false,
}: PromptCardProps) {
  const [activeTab, setActiveTab] = useState<"natural" | "sql">("natural");
  const [selectedDb, setSelectedDb] = useState("Acme Production (PostgreSQL)");

  const examplePrompts = [
    { label: "Delete inactive users", text: "Delete inactive customers older than 2 years." },
    { label: "Remove old sessions", text: "Clear web sessions older than 30 days." },
    { label: "Clean up test data", text: "Delete sandbox orders and test invoices." },
    { label: "Cancel expired subscriptions", text: "Cancel trial subscriptions that expired." },
  ];

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 lg:p-7 text-left select-none relative transition-all">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3.5">
          {/* Step Number Circle */}
          <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-md">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              Add Your Prompt
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Describe what you want the AI agent to do.
            </p>
          </div>
        </div>

        {/* Top Right: Database Selector & SQL preview */}
        <div className="flex flex-wrap items-center gap-3">
          {/* DB Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            <Database size={13} className="text-indigo-500" />
            <div className="text-left">
              <span className="text-[9px] text-slate-400 block leading-none">Database</span>
              <span className="font-semibold text-slate-800 text-[11px]">{selectedDb}</span>
            </div>
            <ChevronDown size={13} className="text-slate-400 ml-1" />
          </div>

          {/* Generated SQL snippet card */}
          <div className="p-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-[10px] hidden sm:block">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-700">
                <span className="text-rose-600 font-bold">DELETE</span> FROM users{"\n"}
                <span className="text-rose-600 font-bold">WHERE</span> last_login &lt; NOW() - INTERVAL &apos;2 years&apos;;
              </span>
              <AlertTriangle size={12} className="text-rose-500 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("natural")}
          className={`pb-2.5 transition-all relative ${
            activeTab === "natural"
              ? "text-[#6366F1] font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Natural Language
          {activeTab === "natural" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366F1] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sql")}
          className={`pb-2.5 transition-all relative ${
            activeTab === "sql"
              ? "text-[#6366F1] font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Write SQL
          {activeTab === "sql" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366F1] rounded-full" />
          )}
        </button>
      </div>

      {/* Main Input Box with 3D Graphic */}
      <div className="relative w-full rounded-2xl bg-white border border-slate-200 p-4 min-h-[160px] flex flex-col justify-between focus-within:border-indigo-500 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Left Text Input */}
          <div className="md:col-span-8">
            <textarea
              value={prompt}
              onChange={(e) => onChangePrompt(e.target.value)}
              rows={3}
              placeholder="E.g., Delete inactive customers older than 2 years."
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none resize-none font-medium"
            />
          </div>

          {/* Right Visual 3D Graphic */}
          <div className="md:col-span-4 hidden md:flex items-center justify-end pointer-events-none">
            <Hero3DVisual className="w-full max-w-[200px] scale-90" isCompact />
          </div>
        </div>

        {/* Char Counter */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-[10px] text-slate-400 font-mono">
            {prompt.length}/500
          </span>
        </div>
      </div>

      {/* Bottom Bar: Example Prompts & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-5">
        {/* Example prompts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Example prompts:</span>
          {examplePrompts.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => onChangePrompt(ex.text)}
              className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-all hover:border-indigo-300"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Run Analysis Button */}
        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer self-end sm:self-auto"
        >
          <span>{isRunning ? "Simulating..." : "Run Analysis"}</span>
          <ArrowRight size={14} className={isRunning ? "animate-pulse" : ""} />
        </button>
      </div>
    </div>
  );
}
