"use client";

import React from "react";
import { DEMO_SCENARIOS, DEMO_SCHEMA_TABLES } from "@/lib/mockData";
import { 
  Database, 
  History, 
  Sparkles
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface SidebarProps {
  currentScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onOpenSchema: () => void;
  onOpenAudit: () => void;
}

export function Sidebar({
  currentScenarioId,
  onSelectScenario,
  onOpenSchema,
  onOpenAudit,
}: SidebarProps) {
  return (
    <aside className="w-full lg:w-[220px] flex-shrink-0 border-r border-slate-800 bg-[#080c16] flex flex-col justify-between overflow-y-auto p-3.5 space-y-4">
      {/* Scenarios Preset Section */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Scenarios
            </span>
          </div>

          <div className="space-y-1.5">
            {DEMO_SCENARIOS.map((sc) => {
              const isSelected = sc.id === currentScenarioId;

              return (
                <button
                  key={sc.id}
                  onClick={() => onSelectScenario(sc.id)}
                  className={`w-full min-h-[44px] text-left p-2.5 rounded-xl border transition-all touch-target ${
                    isSelected
                      ? "bg-indigo-950/50 border-indigo-500/60 shadow-sm ring-1 ring-indigo-500/30"
                      : "bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded font-mono ${
                        sc.badge === "PRIMARY DEMO"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : sc.badge === "SAFE QUERY"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {sc.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {sc.operation}
                    </span>
                  </div>

                  <h5 className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {sc.title}
                  </h5>

                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {sc.targetTable} • {sc.expectedRiskScore} Risk
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Database Tables Overview */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Postgres Schema
              </span>
            </div>
            <button
              onClick={onOpenSchema}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono"
            >
              Explore
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2 space-y-1">
            {DEMO_SCHEMA_TABLES.map((t) => (
              <div
                key={t.name}
                onClick={onOpenSchema}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-900 text-xs font-mono cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="text-slate-300 text-[11px]">{t.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-sans">
                  {formatNumber(t.rowCount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Session Runs */}
        <div>
          <div className="flex items-center gap-1.5 px-1 mb-2">
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Audit Runs
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-indigo-300">
                ANL-8821-SAAS
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600/40">
                85 CRITICAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              DELETE FROM users WHERE...
            </p>
          </div>
        </div>
      </div>

      {/* Safety Gate Footer Note */}
      <div className="pt-2 border-t border-slate-800">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span>Prod Access:</span>
            <span className="text-rose-400 font-bold">GATED</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 font-mono">
            <span>Simulation:</span>
            <span className="text-emerald-400 font-bold">ENFORCED</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
