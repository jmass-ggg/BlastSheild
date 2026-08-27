"use client";

import React from "react";
import { RiskBadge } from "./RiskBadge";
import { RiskLevel } from "@/lib/types";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Play, 
  XOctagon, 
  Edit3, 
  Lock 
} from "lucide-react";

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
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c121e]/95 border-t border-slate-700/80 backdrop-blur-xl shadow-2xl"
    >
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Summary Status & Risk Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0">
            {isUsingSafer ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <RiskBadge level={riskLevel} score={riskScore} size="sm" />
              <span className="text-xs font-mono font-bold text-white">
                {isUsingSafer ? "Safe Soft-Delete Configured" : "Dangerous Hard Deletion Selected"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isUsingSafer
                ? "0 Cascades • 12,481 users updated • $0 ARR Risk"
                : `${totalAffectedRows.toLocaleString()} records in blast radius across 3 cascading tables`}
            </p>
          </div>
        </div>

        {/* Right: Actions Group with 1 Obvious Primary CTA (Hick's Law) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Secondary Action: Cancel */}
          <button
            onClick={onCancel}
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 touch-target"
          >
            <XOctagon className="w-4 h-4 text-slate-400" />
            <span>Cancel</span>
          </button>

          {/* Secondary Action: Modify */}
          <button
            onClick={onModify}
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 touch-target"
          >
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span>Modify SQL</span>
          </button>

          {/* Primary Action (Hick's Law: 1 Key High-Impact Button) */}
          <button
            onClick={onApproveAndExecute}
            className={`min-h-[44px] px-6 rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-lg transition-all duration-200 flex items-center gap-2 touch-target ${
              isUsingSafer
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_24px_rgba(16,185,129,0.35)] ring-2 ring-emerald-300"
                : "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.35)] ring-1 ring-rose-400"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>
              {isUsingSafer ? "Approve & Execute (Safe Mode)" : "Execute Anyway (Danger)"}
            </span>
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
