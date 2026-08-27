"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SqlAlternative } from "@/lib/types";
import { SqlViewer } from "./SqlViewer";
import {
  ShieldCheck, ShieldAlert, Sparkles, Check,
  TrendingDown, RotateCcw, CheckCircle2,
  ArrowRight,
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

function MetricRow({
  label,
  danger,
  safe,
  isUsingSafer,
}: {
  label: string;
  danger: string;
  safe: string;
  isUsingSafer: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-2 border-b"
      style={{ borderColor: "rgba(255,255,255,0.05)" }}
    >
      <span className="text-[11px]" style={{ color: "#475569", minWidth: 130 }}>
        {label}
      </span>
      <div className="flex items-center gap-4 flex-1">
        <span
          className="text-[11px] font-mono font-bold flex-1 text-right"
          style={{ color: !isUsingSafer ? "#f87171" : "#64748b" }}
        >
          {danger}
        </span>
        <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: "#334155" }} />
        <span
          className="text-[11px] font-mono font-bold flex-1"
          style={{ color: isUsingSafer ? "#34d399" : "#64748b" }}
        >
          {safe}
        </span>
      </div>
    </div>
  );
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
    <div className="card p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: "#818cf8" }} />
            Decision Engine
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
            Compare and select the action to route to the production gate
          </p>
        </div>

        {/* Segmented switcher */}
        <div className="switcher self-start sm:self-auto">
          <button
            onClick={() => onToggleAlternative(false)}
            className={`switcher-tab ${!isUsingSafer ? "active-danger" : ""}`}
          >
            <ShieldAlert className="w-3 h-3 inline mr-1" />
            Original ({originalRiskScore})
          </button>
          <button
            onClick={() => onToggleAlternative(true)}
            className={`switcher-tab ${isUsingSafer ? "active-safe" : ""}`}
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            Safe ({alternative.riskScore}) ★
          </button>
        </div>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original */}
        <motion.div
          onClick={() => onToggleAlternative(false)}
          className="rounded-xl p-4 cursor-pointer transition-all duration-200"
          style={{
            background: !isUsingSafer ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.015)",
            border: `1px solid ${!isUsingSafer ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.06)"}`,
            boxShadow: !isUsingSafer ? "0 0 30px rgba(239,68,68,0.08)" : "none",
            opacity: isUsingSafer ? 0.65 : 1,
          }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" style={{ color: "#f87171" }} />
              <span className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#f87171", fontFamily: "var(--font-mono)" }}>
                Hard Delete
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "var(--font-mono)" }}>
              {originalRiskScore}/100 CRITICAL
            </span>
          </div>
          <div className="mb-3">
            <SqlViewer sql={originalSql} title="Destructive SQL" variant="danger" />
          </div>
          <div className="space-y-1 text-[11px]" style={{ color: "#64748b", fontFamily: "var(--font-mono)" }}>
            <div className="flex justify-between py-1"><span>Rows destroyed:</span><span style={{ color: "#f87171" }}>{formatNumber(totalOriginalAffected)}</span></div>
            <div className="flex justify-between py-1"><span>Cascades:</span><span style={{ color: "#f87171" }}>3 tables</span></div>
            <div className="flex justify-between py-1"><span>ARR at risk:</span><span style={{ color: "#f87171" }}>{formatCurrency(originalArrRisk)}</span></div>
            <div className="flex justify-between py-1"><span>Rollback:</span><span style={{ color: "#f87171" }}>Backup restore only</span></div>
          </div>
        </motion.div>

        {/* Safe */}
        <motion.div
          onClick={() => onToggleAlternative(true)}
          className="rounded-xl p-4 cursor-pointer transition-all duration-200"
          style={{
            background: isUsingSafer ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.015)",
            border: `1px solid ${isUsingSafer ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)"}`,
            boxShadow: isUsingSafer ? "0 0 30px rgba(16,185,129,0.08)" : "none",
            opacity: !isUsingSafer ? 0.65 : 1,
          }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" style={{ color: "#34d399" }} />
              <span className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#34d399", fontFamily: "var(--font-mono)" }}>
                {alternative.title}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: "rgba(16,185,129,0.1)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.22)", fontFamily: "var(--font-mono)" }}>
              <TrendingDown className="w-2.5 h-2.5" />
              {alternative.riskScore}/100
            </span>
          </div>
          <div className="mb-3">
            <SqlViewer sql={alternative.sql} title="Safe Alternative SQL" variant="safe" />
          </div>
          <div className="space-y-1 text-[11px]" style={{ color: "#64748b", fontFamily: "var(--font-mono)" }}>
            <div className="flex justify-between py-1"><span>Rows mutated:</span><span style={{ color: "#34d399" }}>{formatNumber(alternative.directRows)} (soft)</span></div>
            <div className="flex justify-between py-1"><span>Cascades:</span><span style={{ color: "#34d399" }} className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />0 blocked</span></div>
            <div className="flex justify-between py-1"><span>ARR at risk:</span><span style={{ color: "#34d399" }}>$0.00 protected</span></div>
            <div className="flex justify-between py-1"><span>Rollback:</span><span style={{ color: "#34d399" }} className="flex items-center gap-1"><Check className="w-3 h-3" />100% via SQL</span></div>
          </div>
        </motion.div>
      </div>

      {/* Metrics comparison table */}
      <div className="rounded-xl p-4"
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3"
          style={{ color: "#334155", fontFamily: "var(--font-mono)" }}>
          Side-by-Side Impact Comparison
        </p>
        <MetricRow label="Total rows affected"    danger={formatNumber(totalOriginalAffected)} safe={formatNumber(alternative.directRows)} isUsingSafer={isUsingSafer} />
        <MetricRow label="ARR exposure"           danger={formatCurrency(originalArrRisk)}     safe="$0.00" isUsingSafer={isUsingSafer} />
        <MetricRow label="Cascade deletions"      danger="3 table chains"                      safe="None (shielded)" isUsingSafer={isUsingSafer} />
        <MetricRow label="Reversibility"          danger="Backup restore"                      safe={alternative.reversibility} isUsingSafer={isUsingSafer} />
        <MetricRow label="Risk score"             danger={`${originalRiskScore}/100`}          safe={`${alternative.riskScore}/100`} isUsingSafer={isUsingSafer} />
      </div>

      {/* CTA row */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs" style={{ color: "#475569" }}>
          {isUsingSafer
            ? "✓ BlastShield safe alternative active — risk reduced by " + (originalRiskScore - alternative.riskScore) + " points"
            : "⚠ Original hard deletion selected — 3 cascade branches active"
          }
        </p>

        <AnimatePresence mode="wait">
          {!isUsingSafer ? (
            <motion.button
              key="apply"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onClick={() => onToggleAlternative(true)}
              className="btn btn-safe"
              style={{ fontSize: 12, minHeight: 38, padding: "9px 18px" }}
              whileHover={{ scale: 1.02 }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Apply Safer Alternative
            </motion.button>
          ) : (
            <motion.button
              key="revert"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              onClick={() => onToggleAlternative(false)}
              className="btn btn-ghost"
              style={{ fontSize: 12, minHeight: 38, padding: "9px 16px" }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Revert to Original
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
