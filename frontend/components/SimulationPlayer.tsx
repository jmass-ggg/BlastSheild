"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import type { AnalysisRecord } from "@/lib/types";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface SimulationPlayerProps {
  analysis: AnalysisRecord;
  isSafeMode: boolean;
}

export function SimulationPlayer({ analysis, isSafeMode }: SimulationPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const isReadOnly = analysis.operationType === "SELECT";
  const contained = isSafeMode || isReadOnly;

  const steps = analysis.steps || [];

  useEffect(() => {
    setProgress(0);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  }, [analysis.id, isSafeMode]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        const next = prev + 2;
        const stepIdx = Math.min(
          Math.floor((next / 100) * steps.length),
          steps.length - 1
        );
        setCurrentStepIndex(stepIdx);
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <div className="sim-player-card">
      {/* Top Player Controls */}
      <div className="sim-player-header">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="sim-control-btn"
            aria-label={isPlaying ? "Pause Simulation" : "Play Simulation"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setProgress(0);
              setCurrentStepIndex(0);
              setIsPlaying(true);
            }}
            className="sim-control-btn sim-control-btn--secondary"
            aria-label="Restart Simulation"
          >
            <RotateCcw size={13} />
          </button>
          <span className="text-xs font-semibold text-slate-300">
            {contained ? "Contained Execution Simulation" : "Full Impact Trace Simulation"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            {Math.round(progress)}%
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              contained
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {contained ? "Sandbox Isolated" : "Cascade Warning"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="sim-progress-track">
        <motion.div
          className={`sim-progress-fill ${contained ? "bg-emerald-500" : "bg-rose-500"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Live Visual Flow Canvas */}
      <div className="sim-visual-canvas">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Agent & Input */}
          <div
            className={`sim-step-card ${
              currentStepIndex >= 0 ? "is-active" : ""
            }`}
          >
            <div className="sim-step-header">
              <span className="sim-step-badge">1. Agent Request</span>
              <Sparkles size={14} className="text-indigo-400" />
            </div>
            <div className="sim-step-body">
              <span className="text-xs text-slate-400 font-mono">
                {analysis.operationType} {analysis.targetTable}
              </span>
              <p className="text-xs text-slate-200 font-medium line-clamp-2 mt-1">
                “{analysis.prompt}”
              </p>
            </div>
          </div>

          {/* Step 2: BlastShield Gate Analysis */}
          <div
            className={`sim-step-card ${
              currentStepIndex >= 1 ? "is-active" : ""
            }`}
          >
            <div className="sim-step-header">
              <span className="sim-step-badge">2. Safety Gate Intercept</span>
              {contained ? (
                <ShieldCheck size={15} className="text-emerald-400" />
              ) : (
                <ShieldAlert size={15} className="text-rose-400" />
              )}
            </div>
            <div className="sim-step-body">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Risk Assessment</span>
                <strong
                  className={`text-sm font-mono ${
                    contained ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {contained
                    ? `${analysis.recommendedAlternative.riskScore}/100`
                    : `${analysis.riskScore}/100`}
                </strong>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {contained
                  ? "Replaced with soft-delete alternative"
                  : `${analysis.cascadesCount} cascade tables detected`}
              </p>
            </div>
          </div>

          {/* Step 3: Production State Protection */}
          <div
            className={`sim-step-card ${
              currentStepIndex >= 2 ? "is-active" : ""
            }`}
          >
            <div className="sim-step-header">
              <span className="sim-step-badge">3. Target Impact</span>
              <Database size={14} className="text-cyan-400" />
            </div>
            <div className="sim-step-body">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Affected Records</span>
                <strong className="text-sm font-mono text-white">
                  {contained
                    ? formatNumber(
                        isReadOnly
                          ? 0
                          : analysis.recommendedAlternative.directRows
                      )
                    : formatNumber(analysis.totalAffectedRows)}
                </strong>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {contained
                  ? "$0 ARR at risk · Instant rollback"
                  : `${formatCurrency(
                      analysis.businessImpact.arrAtRisk
                    )} exposed revenue`}
              </p>
            </div>
          </div>
        </div>

        {/* Live Step Description */}
        {steps[currentStepIndex] && (
          <div className="sim-current-step-box">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">
                {steps[currentStepIndex].title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {steps[currentStepIndex].subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
