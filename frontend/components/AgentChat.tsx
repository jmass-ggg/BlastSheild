"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AnalysisRecord } from "@/lib/types";
import { ActionTimeline } from "./ActionTimeline";
import { SqlViewer } from "./SqlViewer";
import { 
  Bot, 
  User, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  Terminal,
  Clock 
} from "lucide-react";

interface AgentChatProps {
  analysis: AnalysisRecord;
  onSendPrompt: (promptText: string) => void;
  isSimulating: boolean;
}

export function AgentChat({
  analysis,
  onSendPrompt,
  isSimulating,
}: AgentChatProps) {
  const [inputPrompt, setInputPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isSimulating) return;
    onSendPrompt(inputPrompt.trim());
    setInputPrompt("");
  };

  const samplePrompts = [
    "Delete inactive customers older than 2 years",
    "Purge active web sessions cache",
    "Cancel trial subscriptions without filter",
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d1322] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Agent Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="p-2 rounded-xl bg-indigo-600/25 border border-indigo-500/40 text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white font-mono">
                TrueForge Database Operator
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                SANDBOX-GATED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pre-Execution Safety Boundary Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Intercepting</span>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User Prompt Message */}
        <div className="flex items-start gap-3 justify-end">
          <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-indigo-600/20 border border-indigo-500/40 p-3.5 text-xs text-slate-100 shadow-md">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300 mb-1 font-mono uppercase">
              <User className="w-3.5 h-3.5" />
              <span>James (Operations Lead)</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              &quot;{analysis.prompt}&quot;
            </p>
          </div>
        </div>

        {/* Agent Interception Stream */}
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 mt-1 flex-shrink-0">
            <Bot className="w-4 h-4" />
          </div>

          <div className="flex-1 space-y-3 max-w-[95%]">
            {/* Agent Thought */}
            <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 p-3.5 text-xs text-slate-300 space-y-1.5 shadow-sm">
              <p className="leading-relaxed">
                I have generated the requested SQL query. Because this statement mutates state, <strong className="text-white font-semibold">TrueForge MCP intercepted it</strong> and ran pre-execution simulation in an isolated sandbox clone before touching production.
              </p>
            </div>

            {/* Intercepted SQL Card */}
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-3.5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="font-mono text-xs font-bold text-rose-300 uppercase tracking-wider">
                    🛡️ Destructive Action Intercepted
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  {analysis.operationType} ON {analysis.targetTable}
                </span>
              </div>

              <SqlViewer
                sql={analysis.originalSql}
                operation={analysis.operationType}
                table={analysis.targetTable}
                title="Generated Production Query"
                isDangerous={analysis.riskLevel === "CRITICAL" || analysis.riskLevel === "HIGH"}
                variant="danger"
              />
            </div>

            {/* 8-Step Simulation Pipeline */}
            <ActionTimeline steps={analysis.steps} isSimulating={isSimulating} />
          </div>
        </div>
      </div>

      {/* Prompt Composer with 44px Minimum Target Buttons */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 space-y-2.5">
        {/* Sample Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">Presets:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSendPrompt(p)}
              className="flex-shrink-0 min-h-[36px] px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors touch-target"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Type instructions for the database operator agent..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isSimulating}
            className="w-full min-h-[44px] pl-4 pr-12 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 font-sans"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isSimulating}
            className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors touch-target"
            aria-label="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
