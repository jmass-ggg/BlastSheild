"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnalysisRecord } from "@/lib/types";
import { ActionTimeline } from "./ActionTimeline";
import { SqlViewer } from "./SqlViewer";
import { Bot, User, Send, ShieldAlert } from "lucide-react";

interface AgentChatProps {
  analysis: AnalysisRecord;
  onSendPrompt: (promptText: string) => void;
  isSimulating: boolean;
}

export function AgentChat({ analysis, onSendPrompt, isSimulating }: AgentChatProps) {
  const [inputPrompt, setInputPrompt] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [analysis]);

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
    <div className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{
        background: "rgba(4,7,18,0.8)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
      }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
              <Bot className="w-4 h-4" style={{ color: "#818cf8" }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#020308]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
                TrueForge DB Operator
              </h4>
              <span className="tag tag-indigo text-[8px]">GATED</span>
            </div>
            <p className="text-[10px]" style={{ color: "#475569" }}>Safety boundary active</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]"
          style={{ color: "#34d399", fontFamily: "var(--font-mono)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Intercepting
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User message */}
        <div className="flex items-start gap-3 justify-end">
          <div className="max-w-[88%] rounded-2xl rounded-tr-sm p-3.5 text-xs"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#e2e8f0",
            }}>
            <div className="flex items-center gap-1.5 text-[10px] font-bold mb-1.5"
              style={{ color: "#818cf8", fontFamily: "var(--font-mono)" }}>
              <User className="w-3 h-3" />
              USER
            </div>
            <p className="text-sm font-medium leading-relaxed">
              &quot;{analysis.prompt}&quot;
            </p>
          </div>
        </div>

        {/* Agent response */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Bot className="w-4 h-4" style={{ color: "#818cf8" }} />
          </div>

          <div className="flex-1 space-y-3 max-w-[95%]">
            {/* Thought bubble */}
            <div className="rounded-2xl rounded-tl-sm p-3.5 text-xs"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "#94a3b8",
              }}>
              <p className="leading-relaxed">
                I generated the requested SQL. Because this statement mutates state,{" "}
                <strong className="text-white">TrueForge MCP intercepted it</strong> and ran simulation
                in an isolated sandbox clone before touching production.
              </p>
            </div>

            {/* Intercepted SQL */}
            <div className="rounded-xl p-3.5 space-y-2.5"
              style={{
                background: "rgba(239,68,68,0.05)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" style={{ color: "#f87171" }} />
                  <span className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "#f87171", fontFamily: "var(--font-mono)" }}>
                    🛡 Destructive Action Intercepted
                  </span>
                </div>
                <span className="tag tag-red text-[9px]">
                  {analysis.operationType} ON {analysis.targetTable}
                </span>
              </div>
              <SqlViewer
                sql={analysis.originalSql}
                operation={analysis.operationType}
                table={analysis.targetTable}
                title="Intercepted SQL"
                isDangerous={true}
                variant="danger"
              />
            </div>

            {/* Timeline */}
            <ActionTimeline steps={analysis.steps} isSimulating={isSimulating} />
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="p-3.5 border-t space-y-2.5"
        style={{
          background: "rgba(0,0,0,0.3)",
          borderColor: "rgba(255,255,255,0.07)",
        }}>
        {/* Preset chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <span className="text-[10px] flex-shrink-0" style={{ color: "#475569", fontFamily: "var(--font-mono)" }}>
            Presets:
          </span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onSendPrompt(p)}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94a3b8",
                minHeight: 32,
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder="Type instructions for the database operator…"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            disabled={isSimulating}
            className="w-full pl-4 pr-12 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              minHeight: 42,
              fontFamily: "var(--font-mono)",
            }}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isSimulating}
            className="absolute right-1.5 w-9 h-9 flex items-center justify-center rounded-lg transition-all disabled:opacity-30"
            style={{
              background: "rgba(99,102,241,0.8)",
            }}
            aria-label="Send"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
