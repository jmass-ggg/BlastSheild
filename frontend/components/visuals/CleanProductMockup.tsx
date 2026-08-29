"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  ArrowRight,
  CheckCircle2,
  Lock,
  Server,
  Zap,
  Bot,
  Layers,
  FileCode,
} from "lucide-react";
import type { AnalysisRecord } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface CleanProductMockupProps {
  analysis: AnalysisRecord;
  isSafeMode: boolean;
}

export function CleanProductMockup({ analysis, isSafeMode }: CleanProductMockupProps) {
  const isReadOnly = analysis.operationType === "SELECT";
  const contained = isSafeMode || isReadOnly;

  return (
    <div className="clean-mockup-window">
      {/* Window Titlebar */}
      <div className="clean-mockup-titlebar">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] text-[11px] text-slate-400 font-mono">
          <Lock size={10} className="text-emerald-400" />
          <span>blastshield.internal/gate/anl-8821</span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">PostgreSQL 16.2</div>
      </div>

      {/* Main Inspection Canvas */}
      <div className="p-5 space-y-4 bg-slate-950/60">
        {/* Top Status Banner */}
        <div
          className={`flex items-center justify-between p-3 rounded-xl border ${
            contained
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/25 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {contained ? (
              <ShieldCheck size={18} className="text-emerald-400" />
            ) : (
              <ShieldAlert size={18} className="text-rose-400" />
            )}
            <div>
              <strong className="block text-xs font-bold">
                {contained ? "Sandbox Containment Active" : "Destructive Query Intercepted"}
              </strong>
              <span className="text-[11px] text-slate-300">
                {contained
                  ? "Zero cascade deletions. Scoped mutation verified safe."
                  : `Blocked ${formatNumber(analysis.totalAffectedRows)} cascade row deletions.`}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10">
            {contained ? "PASS" : `RISK ${analysis.riskScore}`}
          </span>
        </div>

        {/* 3-Step Clean Architectural Pipeline */}
        <div className="grid grid-cols-3 gap-2 text-left">
          {/* Step 1: Agent Source */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">1. Agent</span>
              <Bot size={13} className="text-indigo-400" />
            </div>
            <strong className="block text-xs text-white truncate">TrueForge Bot</strong>
            <span className="text-[10px] text-slate-400">{analysis.operationType} request</span>
          </div>

          {/* Step 2: Safety Gate */}
          <div
            className={`p-3 rounded-xl border ${
              contained
                ? "bg-emerald-950/30 border-emerald-500/30"
                : "bg-rose-950/30 border-rose-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">2. Gate</span>
              <ShieldCheck
                size={13}
                className={contained ? "text-emerald-400" : "text-rose-400"}
              />
            </div>
            <strong className="block text-xs text-white truncate">
              {contained ? "Plan Scoped" : "Policy Intercept"}
            </strong>
            <span className="text-[10px] text-slate-400">
              {contained ? "0 cascades" : `${analysis.cascadesCount} cascade tables`}
            </span>
          </div>

          {/* Step 3: Production Database */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">3. Prod DB</span>
              <Database size={13} className="text-cyan-400" />
            </div>
            <strong className="block text-xs text-white truncate">AWS RDS Cluster</strong>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 size={10} /> 100% Protected
            </span>
          </div>
        </div>

        {/* Database Table Affected Preview */}
        <div className="rounded-xl border border-white/[0.08] bg-slate-900/40 overflow-hidden">
          <div className="px-3 py-2 bg-slate-900/80 border-b border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Database size={12} className="text-slate-400" />
              <span>Target Schema: public.{analysis.targetTable}</span>
            </span>
            <span className="text-slate-500 font-mono">
              {contained ? "Safe Scope" : `${analysis.tableDiffs.length} dependent tables`}
            </span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Direct Table Impact</span>
              <strong className="text-slate-200 font-mono">
                {formatNumber(contained ? analysis.recommendedAlternative.directRows : analysis.directRows)} rows
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Cascaded Foreign Rows</span>
              <strong
                className={`font-mono ${
                  contained ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {contained ? "0 rows (Clean)" : `${formatNumber(analysis.indirectRows)} rows deleted`}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
