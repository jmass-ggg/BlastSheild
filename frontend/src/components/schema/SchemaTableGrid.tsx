'use client';

import React from 'react';
import { Database, Link2 } from 'lucide-react';
import { TableSchema, TableImpactInfo } from '../../types';
import { formatNumber } from '../../lib/formatters';

interface SchemaTableGridProps {
  tables: Record<string, TableSchema>;
  affectedMap: Record<string, TableImpactInfo>;
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
}

export const SchemaTableGrid: React.FC<SchemaTableGridProps> = ({
  tables,
  affectedMap,
  selectedTable,
  onSelectTable,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Object.entries(tables).map(([tblName, table]) => {
        const impact = affectedMap[tblName];
        const isSelected = selectedTable === tblName;

        return (
          <button
            key={tblName}
            onClick={() => onSelectTable(tblName)}
            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              isSelected
                ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-slate-100'
                : 'bg-[#0d1424] hover:bg-[#131d31] border-[#1e293b] text-slate-300 hover:border-[#334155]'
            }`}
          >
            <div>
              {/* Status Badge */}
              <div className="mb-2">
                {impact?.role === 'DIRECT' ? (
                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700">
                    DIRECT TARGET
                  </span>
                ) : impact?.role === 'CASCADE' ? (
                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700">
                    CASCADE ({formatNumber(impact.count)})
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-[#070b12] text-slate-500 border border-[#1e293b]">
                    UNAFFECTED
                  </span>
                )}
              </div>

              <div className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1.5 truncate">
                <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{tblName}</span>
              </div>

              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                {formatNumber(table.rowCount)} rows
              </div>
            </div>

            {table.parentTable && (
              <div className="mt-2.5 pt-2 border-t border-[#1e293b] text-[10px] text-amber-400 font-mono flex items-center gap-1 truncate">
                <Link2 className="w-3 h-3 shrink-0" />
                <span className="truncate">FK ➔ {table.parentTable}</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
