'use client';

import React from 'react';
import { DependencyImpact, TableSchema, TableImpactInfo } from '../../types';
import { formatNumber } from '../../lib/formatters';

interface TableDetailInspectorProps {
  tableName: string;
  table?: TableSchema;
  impactInfo?: TableImpactInfo;
  dependency?: DependencyImpact;
}

export const TableDetailInspector: React.FC<TableDetailInspectorProps> = ({
  tableName,
  table,
  impactInfo,
  dependency,
}) => {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
      {/* Inspector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-body font-bold text-slate-900 font-mono">{tableName}</span>
            {table && table.rowCount > 0 && (
              <span className="text-body-sm text-slate-500 font-normal">({formatNumber(table.rowCount)} fixture records)</span>
            )}
          </div>
          <p className="text-body-sm text-slate-600 mt-0.5 font-normal">
            {table?.description ?? 'Discovered by live foreign-key analysis.'}
          </p>
          {dependency && (
            <p className="mt-1 font-mono text-xs text-slate-500">
              Path: {dependency.path.join(' → ')} · ON DELETE {dependency.on_delete}
            </p>
          )}
        </div>

        {impactInfo ? (
          <div className="flex items-center gap-2">
            <span className="text-body-sm text-slate-600 font-medium">Impact in Current Query:</span>
            <span className="px-2.5 py-1 rounded text-caption font-semibold font-mono bg-rose-100 text-rose-800 border border-rose-300">
              {formatNumber(impactInfo.count)} rows ({impactInfo.role})
            </span>
          </div>
        ) : (
          <span className="text-caption text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            ✓ 0 rows affected in current query
          </span>
        )}
      </div>

      {table && table.columns.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-caption font-mono">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200 text-badge font-semibold tracking-wider">
              <th className="pb-2">COLUMN NAME</th>
              <th className="pb-2">DATA TYPE</th>
              <th className="pb-2">KEY / RELATIONSHIP</th>
              <th className="pb-2">CASCADE BEHAVIOR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
            {table.columns.map((col) => (
              <tr key={col.name} className="hover:bg-slate-100/60">
                <td className="py-2.5 font-semibold text-slate-900">{col.name}</td>
                <td className="py-2.5 text-blue-700 font-medium">{col.type}</td>
                <td className="py-2.5">
                  {col.isPk && (
                    <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      PRIMARY KEY
                    </span>
                  )}
                  {col.isFk && (
                    <span className="text-purple-800 font-semibold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                      FOREIGN KEY ➔ {col.fkTarget}
                    </span>
                  )}
                  {!col.isPk && !col.isFk && <span className="text-slate-400">—</span>}
                </td>
                <td className="py-2.5">
                  {col.cascade ? (
                    <span className="text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      ON DELETE CASCADE
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
          Column metadata is not included in the current analysis response. BlastShield is showing only measured row and relationship evidence for this table.
        </div>
      )}
    </div>
  );
};
