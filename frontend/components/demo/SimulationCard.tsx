"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, Circle } from "lucide-react";
import { WireframeMatrixHUD } from "@/components/visuals/WireframeMatrixHUD";

interface SimulationCardProps {
  onComplete?: () => void;
  isRunning?: boolean;
}

export function SimulationCard({ onComplete, isRunning = false }: SimulationCardProps) {
  const [seconds, setSeconds] = useState(8);
  const [activeStepIdx, setActiveStepIdx] = useState(4); // 0-indexed, step 5 (Running simulation) active

  const steps = [
    { title: "Parsing request", status: "done" },
    { title: "Generating SQL", status: "done" },
    { title: "Inspecting schema", status: "done" },
    { title: "Creating sandbox", status: "done" },
    { title: "Running simulation", status: "active" },
    { title: "Calculating blast radius", status: "pending" },
    { title: "Scoring risk", status: "pending" },
    { title: "Generating alternatives", status: "pending" },
  ];

  const logs = [
    { time: "10:21:34", text: "Request received from agent" },
    { time: "10:21:35", text: "Generated SQL detected: DELETE" },
    { time: "10:21:36", text: "Fetching database schema..." },
    { time: "10:21:37", text: "Creating isolated sandbox..." },
    { time: "10:21:41", text: "Cloning data snapshot..." },
    { time: "10:21:45", text: "Executing SQL in sandbox..." },
    { time: "10:21:49", text: "Analyzing cascading dependencies..." },
    { time: "10:21:52", text: "Calculating blast radius..." },
    { time: "10:21:54", text: "Estimating business impact..." },
    { time: "10:21:56", text: "Generating safer alternatives...", active: true },
  ];

  return (
    <div className="w-full rounded-3xl bg-[#090D16] border border-white/[0.08] shadow-2xl p-6 lg:p-7 text-left select-none relative overflow-hidden transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3.5">
          {/* Step Number Circle */}
          <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-md">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              BlastShield Analysis in Progress
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Please wait while we simulate and analyze the impact.
            </p>
          </div>
        </div>

        {/* Digital Clock Timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-white font-mono text-xs shadow-inner">
          <Clock size={13} className="text-purple-400" />
          <span className="font-bold tracking-widest">00:00:08</span>
        </div>
      </div>

      {/* 3 Columns Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Col 1: Stepper Checklist */}
        <div className="lg:col-span-3 space-y-2.5">
          {steps.map((st, idx) => {
            const isDone = st.status === "done";
            const isActive = st.status === "active";

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs font-medium transition-colors ${
                  isDone
                    ? "text-slate-200"
                    : isActive
                    ? "text-purple-300 font-bold"
                    : "text-slate-500"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={15} className="text-purple-400 flex-shrink-0" />
                ) : isActive ? (
                  <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <Circle size={15} className="text-slate-600 flex-shrink-0" />
                )}
                <span className="truncate">{st.title}</span>
              </div>
            );
          })}
        </div>

        {/* Col 2: Monospace Log Terminal */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#04060A] border border-white/[0.06] font-mono text-[11px] space-y-1.5 max-h-[220px] overflow-y-auto">
          {logs.map((lg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                lg.active ? "text-purple-400 font-bold" : "text-slate-400"
              }`}
            >
              <span className="text-slate-600 select-none flex-shrink-0">{lg.time}</span>
              <span className="leading-tight">{lg.text}</span>
            </div>
          ))}
        </div>

        {/* Col 3: Holographic 3D Wireframe HUD Radar */}
        <div className="lg:col-span-4 h-full flex items-center justify-center">
          <WireframeMatrixHUD />
        </div>
      </div>
    </div>
  );
}
