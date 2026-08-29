"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Database,
  Layers,
  DollarSign,
  Users,
  Copy,
  Check,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import type { AnalysisRecord } from "@/lib/types";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface InteractiveBeforeAfterSliderProps {
  analysis: AnalysisRecord;
  safePlanActive: boolean;
  onToggleSafePlan: () => void;
}

export function InteractiveBeforeAfterSlider({
  analysis,
  safePlanActive,
  onToggleSafePlan,
}: InteractiveBeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedSafer, setCopiedSafer] = useState(false);

  const copySql = async (sql: string, isSafer: boolean) => {
    await navigator.clipboard.writeText(sql);
    if (isSafer) {
      setCopiedSafer(true);
      setTimeout(() => setCopiedSafer(false), 1600);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 1600);
    }
  };

  return (
    <div className="before-after-container">
      {/* Top Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <SlidersHorizontal size={12} /> Interactive Plan Comparison
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Original Destructive Action vs. BlastShield AI Safe Plan
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onToggleSafePlan}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
              safePlanActive
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                : "bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08]"
            }`}
          >
            {safePlanActive ? (
              <>
                <ShieldCheck size={15} /> Safe Plan Active
              </>
            ) : (
              <>
                <ShieldAlert size={15} /> Preview Safe Plan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side by Side Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Original Intercepted SQL */}
        <motion.div
          className="plan-card plan-card--original"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="plan-card__header">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <span className="font-semibold text-xs text-rose-300 uppercase tracking-wider">
                Intercepted Raw Action
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Risk: {analysis.riskScore}/100
            </span>
          </div>

          <div className="plan-card__body">
            <p className="text-xs text-slate-300 mb-3">
              Direct hard mutation that triggers cascade foreign key deletions across dependent tables.
            </p>

            <div className="sql-preview-box sql-preview-box--danger">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-[11px] text-slate-400 font-mono">
                <span>query.sql</span>
                <button
                  type="button"
                  onClick={() => copySql(analysis.originalSql, false)}
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedOriginal ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedOriginal ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {analysis.originalSql}
              </pre>
            </div>

            {/* Impact Metrics Pill Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.06]">
              <div className="impact-pill impact-pill--danger">
                <span className="label">Rows Deleted</span>
                <strong className="val">{formatNumber(analysis.totalAffectedRows)}</strong>
              </div>
              <div className="impact-pill impact-pill--danger">
                <span className="label">Cascade Tables</span>
                <strong className="val">{analysis.cascadesCount} tables</strong>
              </div>
              <div className="impact-pill impact-pill--danger">
                <span className="label">ARR at Risk</span>
                <strong className="val">{formatCurrency(analysis.businessImpact.arrAtRisk)}</strong>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Recommended Safe Alternative */}
        <motion.div
          className={`plan-card plan-card--safer ${
            safePlanActive ? "ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-500/10" : ""
          }`}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <div className="plan-card__header">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="font-semibold text-xs text-emerald-300 uppercase tracking-wider">
                AI Recommended Plan
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              −{analysis.riskScore - analysis.recommendedAlternative.riskScore} Risk Score
            </span>
          </div>

          <div className="plan-card__body">
            <h3 className="text-sm font-bold text-white mb-1">
              {analysis.recommendedAlternative.title}
            </h3>
            <p className="text-xs text-slate-300 mb-3 line-clamp-2">
              {analysis.recommendedAlternative.explanation}
            </p>

            <div className="sql-preview-box sql-preview-box--safe">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-[11px] text-slate-400 font-mono">
                <span>safe_plan.sql</span>
                <button
                  type="button"
                  onClick={() => copySql(analysis.recommendedAlternative.sql, true)}
                  className="hover:text-white flex items-center gap-1 transition-colors"
                >
                  {copiedSafer ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedSafer ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {analysis.recommendedAlternative.sql}
              </pre>
            </div>

            {/* Impact Metrics Pill Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/[0.06]">
              <div className="impact-pill impact-pill--safe">
                <span className="label">Rows Scoped</span>
                <strong className="val">
                  {formatNumber(analysis.recommendedAlternative.directRows)}
                </strong>
              </div>
              <div className="impact-pill impact-pill--safe">
                <span className="label">Cascades</span>
                <strong className="val">0 (None)</strong>
              </div>
              <div className="impact-pill impact-pill--safe">
                <span className="label">ARR Preserved</span>
                <strong className="val">
                  {formatCurrency(analysis.businessImpact.arrAtRisk)}
                </strong>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
