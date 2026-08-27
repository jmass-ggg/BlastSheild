"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SimulationStep } from "@/lib/types";
import { CheckCircle2, ChevronDown, ChevronRight, Clock, Loader2, Sparkles } from "lucide-react";

interface ActionTimelineProps {
  steps: SimulationStep[];
  currentStepId?: string;
  isSimulating?: boolean;
}

export function ActionTimeline({ steps, isSimulating = false }: ActionTimelineProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0b101c] p-3.5 shadow-md">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Sandbox Simulation Pipeline
            </h4>
            <p className="text-[11px] text-slate-400">
              8 automated safety verification steps executed in isolation
            </p>
          </div>
        </div>
        
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
          100% ISOLATED
        </span>
      </div>

      <div className="space-y-1.5">
        {steps.map((step, idx) => {
          const isCompleted = step.status === "completed";
          const isRunning = step.status === "running" || (isSimulating && idx === steps.length - 1);
          const isExpanded = expandedStep === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-lg border transition-all duration-150 overflow-hidden ${
                isCompleted
                  ? "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  : isRunning
                  ? "bg-indigo-950/40 border-indigo-500/50 shadow-sm"
                  : "bg-slate-950/40 border-slate-900 opacity-60"
              }`}
            >
              <div
                onClick={() => toggleExpand(step.id)}
                className="flex items-center justify-between p-2 cursor-pointer select-none min-h-[36px]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isRunning ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {idx + 1}. {step.title}
                      </span>
                      {step.timestamp && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {step.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500 hover:text-slate-300">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>

              {/* Details Drawer */}
              <AnimatePresence>
                {isExpanded && step.details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-3 pb-2.5 pt-1 border-t border-slate-800/80 bg-black/30 text-xs"
                  >
                    <div className="rounded bg-slate-950 p-2 border border-slate-800 font-mono text-[11px] text-slate-300">
                      {typeof step.details === "string" ? (
                        step.details
                      ) : (
                        <pre className="overflow-x-auto text-emerald-400">
                          {JSON.stringify(step.details, null, 2)}
                        </pre>
                      )}
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
