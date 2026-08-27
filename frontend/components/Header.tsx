"use client";

import React from "react";
import { 
  Shield, 
  Database, 
  RotateCcw, 
  FileText, 
  Server
} from "lucide-react";
import { DEMO_SCENARIOS } from "@/lib/mockData";

interface HeaderProps {
  currentScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onOpenSchema: () => void;
  onOpenAudit: () => void;
  onResetSandbox: () => void;
  isResettingSandbox?: boolean;
}

export function Header({
  currentScenarioId,
  onSelectScenario,
  onOpenSchema,
  onOpenAudit,
  onResetSandbox,
  isResettingSandbox = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800 bg-[#070b13]/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14 max-w-[1600px] mx-auto">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-base tracking-tight text-white font-mono">
              BlastShield<span className="text-cyan-400">AI</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-mono">
              TrueForge Gate
            </span>
          </div>
        </div>

        {/* Center: Live Environment Monitors */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-400">PROD:</span>
            <span className="text-slate-200 font-bold">blastshield_prod</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">SANDBOX:</span>
            <span className="text-cyan-300 font-bold">Isolated Clone</span>
          </div>
        </div>

        {/* Right: Quick Tools (Schema, Audit, Reset) */}
        <div className="flex items-center gap-2">
          {/* Quick Scenario Selector Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-mono">Scenario:</span>
            <select
              value={currentScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="min-h-[38px] px-3 py-1 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer touch-target"
            >
              {DEMO_SCENARIOS.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.title} ({sc.expectedRiskLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Schema Explorer */}
          <button
            onClick={onOpenSchema}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 touch-target"
            title="Inspect Database Schema"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Schema</span>
          </button>

          {/* Audit Log */}
          <button
            onClick={onOpenAudit}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 touch-target"
            title="View Compliance Audit Log"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Audit</span>
          </button>

          {/* Reset Sandbox */}
          <button
            onClick={onResetSandbox}
            disabled={isResettingSandbox}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 touch-target"
            title="Reset Sandbox to clean snapshot"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${isResettingSandbox ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Reset Sandbox</span>
          </button>
        </div>
      </div>
    </header>
  );
}
