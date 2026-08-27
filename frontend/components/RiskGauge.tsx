"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiskBreakdown, RiskLevel } from "@/lib/types";
import { getRiskColorClass } from "@/lib/utils";
import { Info, ShieldAlert, Sparkles, X } from "lucide-react";

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  breakdown?: RiskBreakdown;
  size?: number;
}

export function RiskGauge({ score, level, breakdown, size = 130 }: RiskGaugeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const styles = getRiskColorClass(level);

  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270° arc (¾ of circle), starting from bottom-left
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;
  const rotation = 135; // rotates SVG so arc starts at bottom-left

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowDetails(false); };
    if (showDetails) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showDetails]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Gauge */}
      <button
        className="relative flex items-center justify-center group select-none outline-none"
        style={{ width: size, height: size }}
        onClick={() => setShowDetails(true)}
        aria-label={`Risk score ${score}/100 — click to see breakdown`}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-25 pointer-events-none transition-opacity duration-700 group-hover:opacity-40"
          style={{ backgroundColor: styles.accent }}
        />

        <svg width={size} height={size} className="absolute">
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "50% 50%" }}
          />
          {/* Progress arc */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={styles.accent}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: "50% 50%",
              filter: `drop-shadow(0 0 8px ${styles.accent}) drop-shadow(0 0 16px ${styles.accent}60)`,
            }}
          />
        </svg>

        {/* Score readout */}
        <div className="relative flex flex-col items-center justify-center text-center z-10 pointer-events-none">
          <motion.span
            key={score}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="font-black leading-none"
            style={{
              fontSize: size * 0.24,
              color: styles.accent,
              fontFamily: "var(--font-mono)",
              filter: `drop-shadow(0 0 6px ${styles.accent}80)`,
            }}
          >
            {score}
          </motion.span>
          <span className="font-bold tracking-[0.1em] mt-0.5"
            style={{ fontSize: size * 0.08, color: `${styles.accent}99`, fontFamily: "var(--font-mono)" }}>
            /100
          </span>
          <span className={`text-[9px] font-black tracking-[0.14em] px-2 py-0.5 rounded-full mt-1 ${styles.badge}`}
            style={{ fontFamily: "var(--font-mono)" }}>
            {level}
          </span>
        </div>

        {/* Info icon */}
        <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Info className="w-3 h-3" style={{ color: "#94a3b8" }} />
        </div>
      </button>

      <button
        onClick={() => setShowDetails(true)}
        className="mt-2 text-[11px] font-medium underline decoration-dotted underline-offset-3 transition-colors"
        style={{ color: "#475569" }}
      >
        5-factor formula
      </button>

      {/* Breakdown Modal */}
      <AnimatePresence>
        {showDetails && breakdown && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(16px)" }}
            onClick={(e) => e.target === e.currentTarget && setShowDetails(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg rounded-2xl p-6 overflow-hidden"
              style={{
                background: "rgba(6,9,18,0.95)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Top shine */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${styles.badge}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      Deterministic Risk Formula
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${styles.badge}`}
                        style={{ fontFamily: "var(--font-mono)" }}>
                        {score}/100
                      </span>
                    </h3>
                    <p className="text-[11px]" style={{ color: "#475569" }}>
                      No LLM — pure code calculation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                  style={{ color: "#64748b" }}
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Factors */}
              <div className="mt-4 space-y-3">
                {[
                  breakdown.operationSeverity,
                  breakdown.rowsAffected,
                  breakdown.cascadeImpact,
                  breakdown.businessCriticalData,
                  breakdown.reversibility,
                ].map((factor, idx) => {
                  const ratio = factor.score / factor.max;
                  const barColor = ratio > 0.75 ? "#ef4444" : ratio > 0.4 ? "#f59e0b" : "#10b981";
                  return (
                    <div key={idx}
                      className="rounded-xl p-3.5"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-semibold text-white">{factor.label}</span>
                        <span style={{ color: barColor, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                          {factor.score} / {factor.max}
                        </span>
                      </div>
                      <div className="progress-track mb-2">
                        <motion.div
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${ratio * 100}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                          style={{ background: barColor, boxShadow: `0 0 6px ${barColor}60` }}
                        />
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#475569" }}>
                        {factor.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 flex items-center justify-between border-t"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <span className="text-[11px] flex items-center gap-1.5" style={{ color: "#475569" }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
                  Deterministic engine — no hallucination
                </span>
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn btn-ghost text-xs"
                  style={{ minHeight: 38, padding: "8px 16px" }}>
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
