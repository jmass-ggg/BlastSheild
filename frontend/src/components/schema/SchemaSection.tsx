'use client';

import React, { useState } from 'react';
import { Layers, GitFork, LayoutGrid } from 'lucide-react';
import { TableSchema, TableImpactInfo } from '../../types';
import { SchemaERDiagram } from './SchemaERDiagram';
import { SchemaTableGrid } from './SchemaTableGrid';
import { TableDetailInspector } from './TableDetailInspector';

interface SchemaSectionProps {
  tables: Record<string, TableSchema>;
  affectedMap: Record<string, TableImpactInfo>;
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
}

export const SchemaSection: React.FC<SchemaSectionProps> = ({
  tables,
  affectedMap,
  selectedTable,
  onSelectTable,
}) => {
  const [viewMode, setViewMode] = useState<'er' | 'grid'>('er');

  const selectedTableData = tables[selectedTable] || tables['users'];
  const tableImpactInfo = affectedMap[selectedTable];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-caption font-semibold text-slate-700 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>3. Interactive Database Schema (ER Connected Graph)</span>
          </div>
          <p className="text-body-sm text-slate-500 font-normal mt-0.5">
            Trace foreign key hierarchy and ON DELETE CASCADE impact lines from root entity
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('er')}
            className={`px-3 py-1.5 rounded-lg text-caption flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'er'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-blue-600" />
            <span>ER Diagram (Connected Lines)</span>
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

      {/* Main View: Connected Lines or Grid */}
      {viewMode === 'er' ? (
        <SchemaERDiagram
          tables={tables}
          affectedMap={affectedMap}
          selectedTable={selectedTable}
          onSelectTable={onSelectTable}
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
