'use client';

import React from 'react';
import { Database, Key, Link2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TableSchema, TableImpactInfo } from '../../types';
import { formatNumber } from '../../lib/formatters';

interface TableDetailInspectorProps {
  table: TableSchema;
  impactInfo?: TableImpactInfo;
}

export const TableDetailInspector: React.FC<TableDetailInspectorProps> = ({ table, impactInfo }) => {
  return (
    <div className="bg-[#070b12] rounded-xl p-4 border border-[#1e293b] space-y-3 font-mono">
      {/* Inspector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-slate-100 font-mono">{table.name}</span>
            <span className="text-xs text-slate-500 font-mono">({formatNumber(table.rowCount)} total records)</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">{table.description}</p>
        </div>

        {impactInfo ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-sans">Current Impact:</span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-rose-950/80 text-rose-300 border border-rose-700 shadow-[0_0_10px_rgba(244,63,94,0.25)] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              {formatNumber(impactInfo.count)} rows ({impactInfo.role})
            </span>
          </div>
        ) : (
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            0 rows affected in current query
          </span>
        )}
      </div>

      {/* Columns Schema Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-slate-500 border-b border-[#1e293b] text-[10px] font-bold tracking-wider uppercase">
              <th className="pb-2">COLUMN NAME</th>
              <th className="pb-2">DATA TYPE</th>
              <th className="pb-2">KEY / RELATIONSHIP</th>
              <th className="pb-2">CASCADE BEHAVIOR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/70 text-slate-300">
            {table.columns.map((col) => (
              <tr key={col.name} className="hover:bg-[#0d1424]/80 transition-colors">
                <td className="py-2.5 font-semibold text-slate-100 flex items-center gap-1.5">
                  {col.isPk && <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {col.isFk && <Link2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  <span>{col.name}</span>
                </td>
                <td className="py-2.5 text-cyan-400 font-medium">{col.type}</td>
                <td className="py-2.5">
                  {col.isPk && (
                    <span className="text-amber-300 font-semibold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/80 text-[11px]">
                      PRIMARY KEY
                    </span>
                  )}
                  {col.isFk && (
                    <span className="text-purple-300 font-semibold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-700/80 text-[11px]">
                      FOREIGN KEY ➔ {col.fkTarget}
                    </span>
                  )}
                  {!col.isPk && !col.isFk && <span className="text-slate-600">—</span>}
                </td>
                <td className="py-2.5">
                  {col.cascade ? (
                    <span className="text-rose-300 font-semibold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700/80 text-[11px]">
                      ON DELETE CASCADE
                    </span>
                  ) : (
                    <span className="text-slate-500 font-normal">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
