"use client";

import React from "react";
import { TableRowDiff } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Database, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";

interface BeforeAfterTableProps {
  diffs: TableRowDiff[];
  isSafeMode?: boolean;
}

export function BeforeAfterTable({ diffs, isSafeMode = false }: BeforeAfterTableProps) {
  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Sandbox Impact Simulation: Before vs. After Row Diff
          </h4>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Snapshot: <strong className="text-slate-200">blastshield_sandbox</strong>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800/80 font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Database Table</th>
              <th className="py-2.5 px-4 text-right">Before Simulation</th>
              <th className="py-2.5 px-4 text-center"></th>
              <th className="py-2.5 px-4 text-right">After Simulation</th>
              <th className="py-2.5 px-4 text-right">Delta</th>
              <th className="py-2.5 px-4">Relationship & Cascade Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {diffs.map((diff) => {
              const deltaCount = isSafeMode
                ? diff.cascadeType === "DIRECT"
                  ? diff.delta
                  : 0
                : diff.delta;

              const afterCount = isSafeMode
                ? diff.cascadeType === "DIRECT"
                  ? diff.beforeCount
                  : diff.beforeCount
                : diff.afterCount;

              const isAffected = deltaCount !== 0;

              return (
                <tr
                  key={diff.tableName}
                  className={`hover:bg-slate-900/40 transition-colors ${
                    isAffected && !isSafeMode
                      ? "bg-rose-950/10"
                      : isSafeMode && diff.cascadeType === "DIRECT"
                      ? "bg-emerald-950/10"
                      : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {diff.tableName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {formatNumber(diff.beforeCount)}
                  </td>
                  <td className="py-3 px-1 text-center text-slate-600">
                    <ArrowRight className="w-3.5 h-3.5 inline" />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                    {formatNumber(afterCount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {isSafeMode ? (
                      diff.cascadeType === "DIRECT" ? (
                        <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                          {formatNumber(Math.abs(deltaCount))} updated
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          0 deleted
                        </span>
                      )
                    ) : deltaCount < 0 ? (
                      <span className="text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
                        {formatNumber(deltaCount)}
                      </span>
                    ) : deltaCount > 0 ? (
                      <span className="text-amber-400 font-bold">
                        +{formatNumber(deltaCount)}
                      </span>
                    ) : (
                      <span className="text-slate-500">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono border ${
                          diff.cascadeType === "DIRECT"
                            ? isSafeMode
                              ? "bg-emerald-950 text-emerald-400 border-emerald-600/40"
                              : "bg-rose-950 text-rose-300 border-rose-600/40"
                            : diff.cascadeType === "CASCADE"
                            ? isSafeMode
                              ? "bg-slate-900 text-slate-400 border-slate-700"
                              : "bg-rose-950/60 text-rose-400 border-rose-700/40"
                            : diff.cascadeType === "RESTRICT"
                            ? "bg-amber-950/60 text-amber-400 border-amber-700/40"
                            : "bg-slate-900 text-slate-400 border-slate-800"
                        }`}
                      >
                        {diff.cascadeType}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-xs">
                        {isSafeMode && diff.cascadeType === "CASCADE"
                          ? "Cascades prevented — table untouched"
                          : diff.description}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
