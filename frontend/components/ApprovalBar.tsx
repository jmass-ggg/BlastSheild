"use client";

import React from "react";
import { motion } from "framer-motion";
import { RiskBadge } from "./RiskBadge";
import { RiskLevel } from "@/lib/types";
import {
  ShieldAlert, ShieldCheck, Play, XOctagon, Edit3, Lock,
  AlertTriangle,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface ApprovalBarProps {
  riskScore: number;
  riskLevel: RiskLevel;
  isUsingSafer: boolean;
  totalAffectedRows: number;
  onCancel: () => void;
  onModify: () => void;
  onApproveAndExecute: () => void;
}

export function ApprovalBar({
  riskScore,
  riskLevel,
  isUsingSafer,
  totalAffectedRows,
  onCancel,
  onModify,
  onApproveAndExecute,
}: ApprovalBarProps) {
  return (
    <nav
      aria-label="Action Execution Bar"
      className="action-bar"
    >
      {/* Progress indicator strip */}
      <div
        className="h-[2px] w-full"
        style={{
          background: isUsingSafer
            ? "linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)"
            : "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)",
        }}
      />

      <div className="max-w-[1500px] mx-auto px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Left: Status summary */}
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
          <motion.div
            className="p-2 rounded-xl flex-shrink-0"
            style={{
              background: isUsingSafer ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${isUsingSafer ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}
            animate={!isUsingSafer ? { boxShadow: ["0 0 0 0 rgba(239,68,68,0.3)", "0 0 0 8px rgba(239,68,68,0)"] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isUsingSafer
              ? <ShieldCheck className="w-4 h-4" style={{ color: "#34d399" }} />
              : <ShieldAlert className="w-4 h-4" style={{ color: "#f87171" }} />
            }
          </motion.div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge level={riskLevel} score={riskScore} size="sm" />
              <span className="text-xs font-bold text-white truncate">
                {isUsingSafer ? "Safe Soft-Delete Configured" : "Dangerous Hard Deletion Selected"}
              </span>
            </div>
            <p className="text-[11px] mt-0.5 truncate" style={{ color: "#475569" }}>
              {isUsingSafer
                ? "0 Cascades · 0 Cascaded Rows · $0 ARR Risk"
                : `${formatNumber(totalAffectedRows)} records in blast radius`
              }
            </p>
          </div>

          {/* Danger warning chip */}
          {!isUsingSafer && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
              }}>
              <AlertTriangle className="w-3 h-3" style={{ color: "#f87171" }} />
              <span className="text-[10px] font-bold" style={{ color: "#f87171", fontFamily: "var(--font-mono)" }}>
                IRREVERSIBLE
              </span>
            </div>
          )}
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onCancel}
            className="btn btn-ghost text-xs"
            style={{ minHeight: 42, padding: "10px 16px" }}
          >
            <XOctagon className="w-3.5 h-3.5" style={{ color: "#64748b" }} />
            Cancel
          </button>

          <button
            onClick={onModify}
            className="btn btn-ghost text-xs"
            style={{ minHeight: 42, padding: "10px 16px" }}
          >
            <Edit3 className="w-3.5 h-3.5" style={{ color: "#818cf8" }} />
            <span className="hidden sm:inline">Modify SQL</span>
          </button>

          <motion.button
            onClick={onApproveAndExecute}
            className={`btn ${isUsingSafer ? "btn-safe btn-safe-pulse" : "btn-danger btn-danger-pulse"}`}
            style={{ minHeight: 42, padding: "10px 22px", gap: 8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Lock className="w-3.5 h-3.5" />
            {isUsingSafer ? "Approve & Execute (Safe)" : "Execute Anyway (Danger)"}
            <Play className="w-3 h-3 fill-current" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
