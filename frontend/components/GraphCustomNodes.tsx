"use client";

import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Sparkles, 
  FileText, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert 
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export interface DatabaseNodeData {
  tableName: string;
  totalRows: number;
  affectedRows: number;
  impactType: "DIRECT" | "CASCADE_L1" | "CASCADE_L2" | "RESTRICT" | "SAFE" | "NONE";
  action: "DELETE" | "UPDATE" | "TRUNCATE" | "DROP" | "NONE";
  columnsPreview?: string[];
  isRoot?: boolean;
  isSafeMode?: boolean;
}

const tableIcons: Record<string, React.ReactNode> = {
  users: <Users className="w-4 h-4" />,
  orders: <ShoppingBag className="w-4 h-4" />,
  payments: <CreditCard className="w-4 h-4" />,
  subscriptions: <Sparkles className="w-4 h-4" />,
  invoices: <FileText className="w-4 h-4" />,
  sessions: <Activity className="w-4 h-4" />,
};

export function DatabaseTableNode({ data }: NodeProps) {
  const nodeData = data as unknown as DatabaseNodeData;
  const isDirect = nodeData.impactType === "DIRECT";
  const isCascade = nodeData.impactType === "CASCADE_L1" || nodeData.impactType === "CASCADE_L2";
  const isRestrict = nodeData.impactType === "RESTRICT";
  const isSafeMode = nodeData.isSafeMode;

  let borderColor = "border-slate-800";
  let glowColor = "";
  let badgeBg = "bg-slate-800 text-slate-400 border-slate-700";
  let badgeLabel = "UNCHANGED";

  if (isSafeMode) {
    if (isDirect) {
      borderColor = "border-emerald-500/60";
      glowColor = "shadow-[0_0_18px_rgba(16,185,129,0.25)]";
      badgeBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      badgeLabel = "SOFT DELETED (SAFE)";
    } else {
      borderColor = "border-slate-800";
      badgeBg = "bg-emerald-950/40 text-emerald-400 border-emerald-800/40";
      badgeLabel = "SHIELDED (0 DELETIONS)";
    }
  } else {
    if (isDirect) {
      borderColor = "border-rose-500/80 ring-1 ring-rose-500/50";
      glowColor = "shadow-[0_0_24px_rgba(244,63,94,0.35)]";
      badgeBg = "bg-rose-500/20 text-rose-300 border-rose-500/50";
      badgeLabel = "DIRECT TARGET";
    } else if (isCascade) {
      borderColor = "border-rose-500/50";
      glowColor = "shadow-[0_0_16px_rgba(244,63,94,0.2)]";
      badgeBg = "bg-rose-950/80 text-rose-400 border-rose-600/40";
      badgeLabel = nodeData.impactType === "CASCADE_L2" ? "CASCADE LVL 2" : "CASCADE LVL 1";
    } else if (isRestrict) {
      borderColor = "border-amber-500/40";
      badgeBg = "bg-amber-950/50 text-amber-400 border-amber-500/30";
      badgeLabel = "FK RESTRICT (PROTECTED)";
    }
  }

  return (
    <div
      className={`min-w-[210px] rounded-xl bg-[#0b101b]/95 border ${borderColor} ${glowColor} backdrop-blur-xl shadow-2xl transition-all duration-500 select-none overflow-hidden`}
    >
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900 !rounded-full"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700">
            {tableIcons[nodeData.tableName] || <FileText className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-mono text-sm font-bold text-white tracking-wide">
              {nodeData.tableName}
            </span>
          </div>
        </div>

        <span
          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeBg}`}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Body Stats */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Total Records:</span>
          <span className="font-mono font-semibold text-slate-300">
            {formatNumber(nodeData.totalRows)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-850">
          <span className="text-slate-400">Impact Delta:</span>
          {nodeData.affectedRows !== 0 ? (
            <span
              className={`font-mono font-black text-sm ${
                isSafeMode
                  ? "text-emerald-400"
                  : isDirect
                  ? "text-rose-400"
                  : isCascade
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
            >
              {isSafeMode
                ? isDirect
                  ? `~${formatNumber(nodeData.affectedRows)} soft-del`
                  : "0 (Shielded)"
                : `-${formatNumber(nodeData.affectedRows)}`}
            </span>
          ) : (
            <span className="font-mono text-xs text-slate-500">0 rows (None)</span>
          )}
        </div>

        {/* Status Callout */}
        <div className="mt-1 pt-1.5">
          {!isSafeMode && (isDirect || isCascade) ? (
            <div className="flex items-center gap-1.5 text-[10px] text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-900/50">
              <ShieldAlert className="w-3 h-3 flex-shrink-0 text-rose-400" />
              <span className="leading-tight">
                {isDirect ? "Primary deletion root" : "Automatic cascade deletion"}
              </span>
            </div>
          ) : isSafeMode && isDirect ? (
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-900/50">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-400" />
              <span className="leading-tight">Updates deleted_at timestamp only</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-900/50 p-1.5 rounded border border-slate-800">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-emerald-400" />
              <span className="leading-tight">Safe from row destruction</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-indigo-400 !border-2 !border-slate-900 !rounded-full"
      />
    </div>
  );
}
