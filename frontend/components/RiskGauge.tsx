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

export function RiskGauge({ score, level, breakdown, size = 120 }: RiskGaugeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const styles = getRiskColorClass(level);
  
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference * 0.75;
  const rotation = 135;

  // Keyboard Escape listener to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDetails(false);
      }
    };
    if (showDetails) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDetails]);

  return (
    <div className="relative flex flex-col items-center">
      <div 
        className="relative flex items-center justify-center cursor-pointer group select-none"
        onClick={() => setShowDetails(true)}
        title="Click to view 5-factor risk score formula breakdown"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setShowDetails(true);
          }
        }}
      >
        {/* Subtle Ambient Glow behind gauge */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: styles.accent }}
        />

        <svg
          width={size}
          height={size}
          className="transform -rotate-90 transition-all duration-700"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "50% 50%" }}
          />

          {/* Animated Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={styles.accent}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ 
              transform: `rotate(${rotation}deg)`, 
              transformOrigin: "50% 50%",
              filter: `drop-shadow(0 0 5px ${styles.accent})`
            }}
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <motion.span 
            key={score}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="text-2xl lg:text-3xl font-black tracking-tight text-white font-mono"
          >
            {score}
          </motion.span>
          <span className="text-[11px] font-bold text-slate-400 font-mono">
            / 100
          </span>
        </div>

        {/* Quick info trigger badge */}
        <div className="absolute bottom-0 right-0 bg-slate-900 border border-slate-700 rounded-full p-1 text-slate-400 group-hover:text-white transition-colors shadow-md">
          <Info className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="mt-2 text-center">
        <button 
          onClick={() => setShowDetails(true)}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 underline decoration-slate-600 underline-offset-4 transition-colors min-h-[32px] flex items-center justify-center"
        >
          View 5-Factor Formula
        </button>
      </div>

      {/* 5-Factor Breakdown Popover Modal */}
      <AnimatePresence>
        {showDetails && breakdown && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDetails(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#0f172a] border border-slate-700 rounded-2xl p-6 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${styles.badge}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Deterministic Risk Formula
                      <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold border ${styles.badge}`}>
                        {score} / 100
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculated deterministically without LLM hallucination
                    </p>
                  </div>
                </div>
                
                {/* 44x44px accessible Close button */}
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors touch-target"
                  aria-label="Close formula modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Factors list */}
              <div className="mt-5 space-y-3">
                {[
                  breakdown.operationSeverity,
                  breakdown.rowsAffected,
                  breakdown.cascadeImpact,
                  breakdown.businessCriticalData,
                  breakdown.reversibility,
                ].map((factor, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200 text-sm">{factor.label}</span>
                      <span className="font-mono font-bold text-slate-300">
                        {factor.score} / {factor.max} pts
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(factor.score / factor.max) * 100}%` }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor:
                            factor.score / factor.max > 0.75
                              ? "#ef4444"
                              : factor.score / factor.max > 0.4
                              ? "#f59e0b"
                              : "#10b981",
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {factor.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Deterministic Code Engine
                </span>
                <button
                  onClick={() => setShowDetails(false)}
                  className="min-h-[44px] px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors touch-target"
                >
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
