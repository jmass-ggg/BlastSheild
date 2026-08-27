"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationStep } from "@/lib/types";
import { CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";

interface ActionTimelineProps {
  steps: SimulationStep[];
  currentStepId?: string;
  isSimulating?: boolean;
}

export function ActionTimeline({ steps, isSimulating = false }: ActionTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const done = steps.filter(s => s.status === "completed").length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
              Sandbox Simulation Pipeline
            </h4>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              {done}/{steps.length} steps · 100% isolated · no prod touch
            </p>
          </div>
        </div>
        <span className="tag tag-green text-[9px]">ISOLATED</span>
      </div>

      {/* Steps */}
      <div className="divide-y divide-white/[0.04]">
        {steps.map((step, idx) => {
          const isCompleted = step.status === "completed";
          const isRunning   = step.status === "running" || (isSimulating && idx === steps.length - 1);
          const isExpanded  = expandedStep === step.id;

          return (
            <div key={step.id}>
              <button
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
                style={{ minHeight: 44 }}
              >
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {isCompleted
                    ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                    : isRunning
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#818cf8" }} />
                    : (
                      <div className="w-3.5 h-3.5 rounded-full border"
                        style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                    )
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold"
                      style={{ color: isCompleted ? "#e2e8f0" : isRunning ? "#c7d2fe" : "#475569" }}>
                      {idx + 1}. {step.title}
                    </span>
                    {step.timestamp && (
                      <span className="text-[10px]"
                        style={{ color: "#334155", fontFamily: "var(--font-mono)" }}>
                        {step.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: "#475569" }}>
                    {step.subtitle}
                  </p>
                </div>

                {step.details && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#334155" }} />
                  </motion.div>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && step.details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-4 pb-3 pt-1 border-t"
                      style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      <div className="rounded-lg p-2.5 text-[11px]"
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          fontFamily: "var(--font-mono)",
                          color: "#10b981",
                        }}>
                        {typeof step.details === "string"
                          ? step.details
                          : <pre className="overflow-x-auto">{JSON.stringify(step.details, null, 2)}</pre>
                        }
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
