'use client';

import React, { useState } from 'react';
import { Layers, Network, LayoutGrid } from 'lucide-react';
import { TableSchema, TableImpactInfo, ReportGraph } from '../../types';
import { BlastRadiusGraph } from './BlastRadiusGraph';
import { SchemaTableGrid } from './SchemaTableGrid';
import { TableDetailInspector } from './TableDetailInspector';

interface SchemaSectionProps {
  tables: Record<string, TableSchema>;
  affectedMap: Record<string, TableImpactInfo>;
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
  graph?: ReportGraph;
  isSaferMode?: boolean;
  targetTable?: string;
}

export const SchemaSection: React.FC<SchemaSectionProps> = ({
  tables,
  affectedMap,
  selectedTable,
  onSelectTable,
  graph = { nodes: [], edges: [] },
  isSaferMode = false,
  targetTable = 'users',
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'grid'>('graph');

  const selectedTableData = tables[selectedTable] || tables['users'];
  const tableImpactInfo = affectedMap[selectedTable];

  return (
    <section className="bg-[#0b0f19] rounded-2xl border border-[#1e293b] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.6)] space-y-4">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>3. INTERACTIVE BLAST RADIUS &amp; SCHEMA GRAPH</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Trace foreign key hierarchy and ON DELETE CASCADE impact lines from root entity
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex p-1 bg-[#070b12] rounded-xl border border-[#1e293b]">
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'graph'
                ? 'bg-[#131d31] text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-bold border border-cyan-800/60'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>BLAST RADIUS DAG</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#131d31] text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)] font-bold border border-cyan-800/60'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
            <span>TABLE CARDS GRID</span>
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

      {/* Table Detail Inspector */}
      <TableDetailInspector table={selectedTableData} impactInfo={tableImpactInfo} />
    </section>
  );
};
