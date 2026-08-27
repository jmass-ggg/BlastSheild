"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Database, RotateCcw, FileText } from "lucide-react";
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
    <header className="sticky top-0 z-40 nav-bar">
      <div className="flex items-center justify-between px-5 h-[54px] max-w-[1500px] mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}
            whileHover={{ scale: 1.08, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Shield className="w-4 h-4 text-white" />
          </motion.div>
          <div className="flex items-baseline gap-2">
            <span className="font-black text-[15px] tracking-tight text-white">
              BlastShield<span style={{ color: "#22d3ee" }}>AI</span>
            </span>
            <span className="tag tag-indigo hidden sm:flex">TrueForge Gate</span>
          </div>
        </div>

        {/* Center live status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#475569",
              fontFamily: "var(--font-mono)",
            }}>
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute w-full h-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative rounded-full w-2 h-2 bg-emerald-500" />
            </span>
            PROD: blastshield_prod
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "#475569",
              fontFamily: "var(--font-mono)",
            }}>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            SANDBOX: Isolated Clone
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-[11px]" style={{ color: "#475569", fontFamily: "var(--font-mono)" }}>Scenario:</span>
            <select
              value={currentScenarioId}
              onChange={e => onSelectScenario(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "#e2e8f0",
                fontFamily: "var(--font-mono)",
                minHeight: 36,
              }}
            >
              {DEMO_SCENARIOS.map(sc => (
                <option key={sc.id} value={sc.id} style={{ background: "#060912" }}>
                  {sc.title} ({sc.expectedRiskLevel})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenSchema}
            className="btn btn-ghost text-xs"
            style={{ minHeight: 36, padding: "8px 12px" }}
            title="Database Schema"
          >
            <Database className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
            <span className="hidden sm:inline">Schema</span>
          </button>
          <button
            onClick={onOpenAudit}
            className="btn btn-ghost text-xs"
            style={{ minHeight: 36, padding: "8px 12px" }}
            title="Audit Log"
          >
            <FileText className="w-3.5 h-3.5" style={{ color: "#22d3ee" }} />
            <span className="hidden sm:inline">Audit</span>
          </button>
          <button
            onClick={onResetSandbox}
            disabled={isResettingSandbox}
            className="btn btn-ghost text-xs disabled:opacity-50"
            style={{ minHeight: 36, padding: "8px 12px" }}
            title="Reset Sandbox"
          >
            <RotateCcw
              className={`w-3.5 h-3.5 ${isResettingSandbox ? "animate-spin" : ""}`}
              style={{ color: "#fbbf24" }}
            />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}
