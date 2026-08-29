"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Database,
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock,
  RefreshCw,
  Layers,
  AlertTriangle,
} from "lucide-react";
import type { AnalysisRecord } from "@/lib/types";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface ContainmentVisualizerProps {
  analysis: AnalysisRecord;
  isSafeMode: boolean;
}

export function ContainmentVisualizer({
  analysis,
  isSafeMode,
}: ContainmentVisualizerProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const isReadOnly = analysis.operationType === "SELECT";
  const contained = isSafeMode || isReadOnly;

  // Auto-pulse simulation steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 3) + 1);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="containment-visualizer" aria-label="Interactive Safety Gate Visualization">
      {/* Visual Header */}
      <div className="containment-visualizer__top">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                contained ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                contained ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </span>
          <span className="visualizer-title">
            {contained ? "Sandbox Containment Active" : "Destructive Impact Intercepted"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-[10px] text-slate-300">
            {analysis.operationType} · {analysis.targetTable}
          </span>
        </div>
      </div>

      {/* Interactive Architecture Flow */}
      <div className="containment-visualizer__canvas">
        {/* Ambient background glow */}
        <div
          className="canvas-ambient"
          style={{
            background: contained
              ? "radial-gradient(ellipse at 70% 50%, rgba(16, 185, 129, 0.12), transparent 60%)"
              : "radial-gradient(ellipse at 50% 50%, rgba(244, 63, 94, 0.14), transparent 65%)",
          }}
        />

        {/* Dynamic Interactive Stages */}
        <div className="flow-grid">
          {/* Stage 1: AI Agent Intent */}
          <motion.div
            className={`flow-node ${activeStep === 1 ? "is-focused" : ""}`}
            onClick={() => setActiveStep(1)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="node-icon bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
              <Sparkles size={16} />
            </div>
            <div className="node-content">
              <span className="node-step">01. Agent Action</span>
              <strong className="node-title">TrueForge Bot</strong>
              <p className="node-desc truncate max-w-[140px]">
                {analysis.operationType} on {analysis.targetTable}
              </p>
            </div>
          </motion.div>

          {/* Connection Line 1 -> 2 */}
          <div className="flow-connector">
            <svg className="connector-svg" width="100%" height="24">
              <line
                x1="0"
                y1="12"
                x2="100%"
                y2="12"
                stroke={contained ? "rgba(16, 185, 129, 0.3)" : "rgba(244, 63, 94, 0.35)"}
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <motion.circle
                r="3"
                cy="12"
                fill={contained ? "#10B981" : "#F43F5E"}
                animate={{ cx: ["0%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>

          {/* Stage 2: BlastShield Gate */}
          <motion.div
            className={`flow-node flow-node--shield ${
              contained ? "is-safe" : "is-blocked"
            } ${activeStep === 2 ? "is-focused" : ""}`}
            onClick={() => setActiveStep(2)}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div
              className={`node-icon ${
                contained
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-400"
              }`}
            >
              {contained ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            </div>
            <div className="node-content">
              <span className="node-step">02. Safety Gate</span>
              <strong className="node-title">
                {contained ? "Contained Plan" : "Write Intercepted"}
              </strong>
              <span className="node-badge">
                {contained ? "Zero Cascades" : `Risk Index ${analysis.riskScore}/100`}
              </span>
            </div>
          </motion.div>

          {/* Connection Line 2 -> 3 */}
          <div className="flow-connector">
            <svg className="connector-svg" width="100%" height="24">
              <line
                x1="0"
                y1="12"
                x2="100%"
                y2="12"
                stroke={contained ? "rgba(16, 185, 129, 0.4)" : "rgba(148, 163, 184, 0.2)"}
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <motion.circle
                r="3"
                cy="12"
                fill={contained ? "#10B981" : "#64748B"}
                animate={{ cx: ["0%", "100%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: 0.9 }}
              />
            </svg>
          </div>

          {/* Stage 3: Isolated Sandbox & DB */}
          <motion.div
            className={`flow-node ${activeStep === 3 ? "is-focused" : ""}`}
            onClick={() => setActiveStep(3)}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="node-icon bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
              <Database size={16} />
            </div>
            <div className="node-content">
              <span className="node-step">03. Production DB</span>
              <strong className="node-title">
                {contained ? "Safely Updated" : "100% Protected"}
              </strong>
              <p className="node-desc">
                {contained
                  ? `${formatNumber(
                      isReadOnly
                        ? 0
                        : analysis.recommendedAlternative.directRows
                    )} rows touched`
                  : "0 writes leaked"}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Live Simulation Metrics Bar */}
        <div className="simulation-preview-bar">
          <div className="sim-metric">
            <span className="sim-label">Target Entity</span>
            <span className="sim-val text-slate-200">
              public.<strong>{analysis.targetTable}</strong>
            </span>
          </div>

          <div className="sim-divider" />

          <div className="sim-metric">
            <span className="sim-label">Cascade Exposure</span>
            <span
              className={`sim-val font-semibold ${
                contained ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {contained ? "0 tables (contained)" : `${analysis.cascadesCount} related tables`}
            </span>
          </div>

          <div className="sim-divider" />

          <div className="sim-metric">
            <span className="sim-label">Revenue at Risk</span>
            <span
              className={`sim-val font-semibold ${
                contained ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {contained
                ? "$0 (Preserved)"
                : formatCurrency(analysis.businessImpact.arrAtRisk)}
            </span>
          </div>

          <div className="sim-divider" />

          <div className="sim-metric">
            <span className="sim-label">Replica Verification</span>
            <span className="sim-val text-cyan-300 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-cyan-400" />
              100% Deterministic
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
