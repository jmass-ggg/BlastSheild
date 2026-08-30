'use client';

import React, { useState } from 'react';
import { Layers, Network, LayoutGrid } from 'lucide-react';
import { DependencyImpact, TableSchema, TableImpactInfo, ReportGraph } from '../../types';
import { BlastRadiusGraph } from './BlastRadiusGraph';
import { SchemaTableGrid } from './SchemaTableGrid';
import { TableDetailInspector } from './TableDetailInspector';

interface SchemaSectionProps {
  tables: Record<string, TableSchema>;
  affectedMap: Record<string, TableImpactInfo>;
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
  graph?: ReportGraph;
  dependencies: DependencyImpact[];
  isSaferMode?: boolean;
  targetTable?: string;
}

export const SchemaSection: React.FC<SchemaSectionProps> = ({
  tables,
  affectedMap,
  selectedTable,
  onSelectTable,
  graph = { nodes: [], edges: [] },
  dependencies,
  isSaferMode = false,
  targetTable = 'users',
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'grid'>('graph');

  const selectedTableData = tables[selectedTable];
  const tableImpactInfo = affectedMap[selectedTable];
  const selectedDependency = dependencies.find((item) => item.table === selectedTable);

  return (
    <section aria-labelledby="schema-section-title" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-caption font-semibold text-slate-700 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-600" />
            <span id="schema-section-title">Interactive Blast Radius &amp; Schema Evidence</span>
          </div>
          <p className="text-body-sm text-slate-500 font-normal mt-0.5">
            Trace measured foreign-key paths from the target table. Select a node for available schema details.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-lg text-caption flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'graph'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-blue-600" />
            <span>Blast Radius DAG</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-caption flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-600" />
            <span>Table Cards Grid</span>
          </button>
        </div>
      </div>

      {/* Main View: Connected DAG or Grid */}
      {viewMode === 'graph' ? (
        <BlastRadiusGraph
          graph={graph}
          tables={tables}
          affectedMap={affectedMap}
          selectedTable={selectedTable}
          onSelectTable={onSelectTable}
          isSaferMode={isSaferMode}
          targetTable={targetTable}
        />
      ) : (
        <SchemaTableGrid
          tables={tables}
          affectedMap={affectedMap}
          selectedTable={selectedTable}
          onSelectTable={onSelectTable}
        />
      )}

      <details className="rounded-xl border border-slate-200 bg-slate-50">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          Accessible dependency list ({dependencies.length} paths)
        </summary>
        <div className="overflow-x-auto border-t border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Relationship path</th>
                <th className="px-4 py-2.5 font-semibold">Rows</th>
                <th className="px-4 py-2.5 font-semibold">ON DELETE</th>
                <th className="px-4 py-2.5 font-semibold">Measurement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dependencies.map((dependency, index) => (
                <tr key={`${dependency.path.join('-')}-${dependency.table}-${index}`}>
                  <td className="px-4 py-3 font-mono text-slate-800">{dependency.path.join(' → ')}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">{dependency.rows.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{dependency.on_delete}</td>
                  <td className="px-4 py-3 text-slate-600">{dependency.measurement}</td>
                </tr>
              ))}
              {dependencies.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-5 text-center text-slate-500">No dependent foreign-key paths were measured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </details>

      <TableDetailInspector
        tableName={selectedTable}
        table={selectedTableData}
        impactInfo={tableImpactInfo}
        dependency={selectedDependency}
      />
    </section>
  );
};
