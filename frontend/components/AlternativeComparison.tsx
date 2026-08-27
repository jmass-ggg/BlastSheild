"use client";

import React from "react";
import { motion } from "framer-motion";
import { SqlAlternative } from "@/lib/types";
import { SqlViewer } from "./SqlViewer";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  ArrowRight, 
  TrendingDown, 
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface AlternativeComparisonProps {
  originalSql: string;
  originalRiskScore: number;
  originalDirectRows: number;
  originalIndirectRows: number;
  originalArrRisk: number;
  alternative: SqlAlternative;
  isUsingSafer: boolean;
  onToggleAlternative: (useSafe: boolean) => void;
}

export function AlternativeComparison({
  originalSql,
  originalRiskScore,
  originalDirectRows,
  originalIndirectRows,
  originalArrRisk,
  alternative,
  isUsingSafer,
  onToggleAlternative,
}: AlternativeComparisonProps) {
  const totalOriginalAffected = originalDirectRows + originalIndirectRows;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101726] p-5 shadow-xl space-y-4">
      {/* Header with Segmented Action Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Decision Engine: Compare Candidate Actions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select which action to route to the production authorization gate
          </p>
        </div>

        {/* Segmented Switcher Controls (44px touch targets) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => onToggleAlternative(false)}
            className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 touch-target ${
              !isUsingSafer
                ? "bg-rose-950 text-rose-300 border border-rose-600/50 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Original (85 Risk)</span>
          </button>
          
          <button
            onClick={() => onToggleAlternative(true)}
            className={`min-h-[38px] px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 touch-target ${
              isUsingSafer
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.3)] font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recommended (34 Risk) ★</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Visual Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Original Destructive Intent */}
        <div
          onClick={() => onToggleAlternative(false)}
          className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
            !isUsingSafer
              ? "bg-rose-950/20 border-rose-500/60 ring-2 ring-rose-500/30"
              : "bg-slate-900/40 border-slate-800/80 opacity-60 hover:opacity-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="font-mono text-xs font-bold text-rose-300 uppercase tracking-wider">
                Original Hard Delete
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Risk: {originalRiskScore} / 100 (CRITICAL)
            </span>
          </div>

          <div className="mb-3">
            <SqlViewer
              sql={originalSql}
              operation="DELETE"
              table="users"
              title="Destructive SQL Query"
              variant="danger"
            />
          </div>

          {/* Quick Metrics Table */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Total Rows Destroyed:</span>
              <span className="font-mono font-bold text-rose-400">
                {formatNumber(totalOriginalAffected)} records
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Cascading Tables:</span>
              <span className="font-mono font-bold text-rose-400">
                3 Tables (Orders, Payments, Subs)
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">ARR Revenue Exposure:</span>
              <span className="font-mono font-bold text-rose-400">
                {formatCurrency(originalArrRisk)} (347 active)
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Rollback Capability:</span>
              <span className="text-rose-400 font-semibold">
                Hard (Restore from backup required)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Recommended Safe Alternative */}
        <div
          onClick={() => onToggleAlternative(true)}
          className={`relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
            isUsingSafer
              ? "bg-emerald-950/25 border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.15)]"
              : "bg-slate-900/40 border-slate-800/80 opacity-70 hover:opacity-100"
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider">
                {alternative.title}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Risk: {alternative.riskScore} / 100 (MEDIUM)
            </span>
          </div>

          <div className="mb-3">
            <SqlViewer
              sql={alternative.sql}
              operation="UPDATE"
              table="users"
              title="Synthesized Safe SQL"
              variant="safe"
            />
          </div>

          {/* Quick Metrics Table */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Rows Mutated (Soft-Del):</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatNumber(alternative.directRows)} users
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Cascading Deletions:</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 Cascades (Shielded)
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">ARR Revenue Exposure:</span>
              <span className="font-mono font-bold text-emerald-400">
                $0.00 ARR Loss (Protected)
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Rollback Capability:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 100% Recoverable via SQL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Action Toggle Bar */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-slate-400">
          {isUsingSafer 
            ? "✓ BlastShield safe alternative active. Risk reduced by 51 points." 
            : "⚠️ Original hard deletion selected. 3 dependent cascade branches active."}
        </span>

        {!isUsingSafer ? (
          <button
            onClick={() => onToggleAlternative(true)}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg flex items-center gap-2 touch-target"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Apply Safer Alternative (Risk Drops to 34)</span>
          </button>
        ) : (
          <button
            onClick={() => onToggleAlternative(false)}
            className="min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 touch-target"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Revert to Original (Dangerous)</span>
          </button>
        )}
      </div>
    </div>
  );
}
