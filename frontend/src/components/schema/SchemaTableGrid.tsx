'use client';

import React from 'react';
import { Database } from 'lucide-react';
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
            className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              isSelected
                ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-200 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
            }`}
          >
            <div>
              {/* Status Badge */}
              <div className="mb-1.5">
                {impact?.role === 'DIRECT' ? (
                  <span className="text-badge font-semibold uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300 font-mono">
                    DIRECT TARGET
                  </span>
                ) : impact?.role === 'CASCADE' ? (
                  <span className="text-badge font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 font-mono">
                    CASCADE ({formatNumber(impact.count)})
                  </span>
                ) : (
                  <span className="text-badge font-medium uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-mono">
                    UNAFFECTED
                  </span>
                )}
              </div>

              <div className="font-mono text-body-sm font-semibold text-slate-900 flex items-center gap-1" title={tblName}>
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{tblName}</span>
              </div>

              <div className="text-caption text-slate-500 mt-0.5 font-normal">
                {table.rowCount > 0 ? `${formatNumber(table.rowCount)} fixture rows` : 'Live total unavailable'}
              </div>
            </div>

            {table.parentTable && (
              <div className="mt-2 pt-1.5 border-t border-slate-200 text-badge text-amber-700 font-mono font-medium">
                FK ➔ {table.parentTable}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
