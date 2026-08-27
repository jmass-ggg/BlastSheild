"use client";

import React from "react";
import { motion } from "framer-motion";
import { DEMO_SCENARIOS, DEMO_SCHEMA_TABLES } from "@/lib/mockData";
import { Database, History, Sparkles, Lock, CheckCircle2 } from "lucide-react";
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
    <aside className="w-full lg:w-[240px] flex-shrink-0 border-r flex flex-col overflow-y-auto p-4 gap-5"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "transparent" }}>

      {/* Scenarios */}
      <div>
        <div className="flex items-center gap-1.5 px-1 mb-3">
          <Sparkles className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "#334155", fontFamily: "var(--font-mono)" }}>
            Scenarios
          </span>
        </div>
        <div className="space-y-2">
          {DEMO_SCENARIOS.map((sc, idx) => {
            const isSelected = sc.id === currentScenarioId;
            const riskColor =
              sc.expectedRiskScore >= 80 ? "#f43f5e"
              : sc.expectedRiskScore >= 60 ? "#f97316"
              : sc.expectedRiskScore > 0  ? "#f59e0b"
              : "#10b981";

            return (
              <motion.button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`scenario-pill w-full ${isSelected ? "active" : ""}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{
                      background: sc.badge === "SAFE QUERY"
                        ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      color: sc.badge === "SAFE QUERY" ? "#6ee7b7" : "#fca5a5",
                      border: `1px solid ${sc.badge === "SAFE QUERY" ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)"}`,
                      fontFamily: "var(--font-mono)",
                    }}>
                    {sc.badge}
                  </span>
                  <span className="text-[10px] font-bold"
                    style={{ color: riskColor, fontFamily: "var(--font-mono)" }}>
                    {sc.expectedRiskScore > 0 ? sc.expectedRiskScore : "✓"}
                  </span>
                </div>
                <h5 className="text-[11px] font-bold text-left leading-tight"
                  style={{ color: isSelected ? "#e2e8f0" : "#94a3b8" }}>
                  {sc.title}
                </h5>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* DB Tables */}
      <div className="border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between px-1 mb-3">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" style={{ color: "#22d3ee" }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: "#334155", fontFamily: "var(--font-mono)" }}>
              Schema
            </span>
          </div>
          <button
            onClick={onOpenSchema}
            className="text-[10px] font-medium transition-colors"
            style={{ color: "#6366f1" }}
          >
            Explore →
          </button>
        </div>

        <div className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          {DEMO_SCHEMA_TABLES.map((t, i) => (
            <div key={t.name}
              className="db-row"
              style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              onClick={onOpenSchema}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#334155" }} />
                <span className="text-[11px] text-slate-300" style={{ fontFamily: "var(--font-mono)" }}>
                  {t.name}
                </span>
              </div>
              <span className="text-[10px]"
                style={{ color: "#334155", fontFamily: "var(--font-mono)" }}>
                {formatNumber(t.rowCount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit runs */}
      <div className="border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-1.5 px-1 mb-3">
          <History className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "#334155", fontFamily: "var(--font-mono)" }}>
            Audit Runs
          </span>
        </div>
        <div className="rounded-xl p-3 cursor-pointer hover:brightness-110 transition-all"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          onClick={onOpenAudit}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold" style={{ color: "#818cf8", fontFamily: "var(--font-mono)" }}>
              ANL-8821-SAAS
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "var(--font-mono)" }}>
              85 CRITICAL
            </span>
          </div>
          <p className="text-[10px] truncate" style={{ color: "#475569" }}>
            DELETE FROM users WHERE...
          </p>
        </div>
      </div>

      {/* Safety gate status */}
      <div className="mt-auto border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex justify-between text-[10px] mb-1.5"
            style={{ color: "#475569", fontFamily: "var(--font-mono)" }}>
            <span className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Prod Access
            </span>
            <span style={{ color: "#f87171" }}>GATED</span>
          </div>
          <div className="flex justify-between text-[10px]"
            style={{ color: "#475569", fontFamily: "var(--font-mono)" }}>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Simulation
            </span>
            <span style={{ color: "#34d399" }}>ENFORCED</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
