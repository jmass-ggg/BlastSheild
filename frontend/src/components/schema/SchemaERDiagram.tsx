'use client';

import React, { useState } from 'react';
import { Database, Key, Link2 } from 'lucide-react';
import { TableSchema, TableImpactInfo } from '../../types';
import { ER_NODE_POSITIONS, ER_RELATIONSHIPS } from '../../constants/erLayout';
import { formatNumber } from '../../lib/formatters';

interface SchemaERDiagramProps {
  tables: Record<string, TableSchema>;
  affectedMap: Record<string, TableImpactInfo>;
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
  isSaferMode?: boolean;
}

export const SchemaERDiagram: React.FC<SchemaERDiagramProps> = ({
  tables,
  affectedMap,
  selectedTable,
  onSelectTable,
  isSaferMode = false,
}) => {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);

  return (
    <div className="w-full bg-slate-50/70 rounded-2xl border border-slate-200 p-4 relative overflow-x-auto shadow-inner">
      <div className="min-w-[980px] h-[580px] relative select-none">
        
        {/* SVG ER Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker id="er-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#94a3b8" />
            </marker>
            <marker id="er-arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#ea580c" />
            </marker>
            <marker id="er-arrow-safe" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#16a34a" />
            </marker>
          </defs>

          {ER_RELATIONSHIPS.map((rel, idx) => {
            const src = ER_NODE_POSITIONS[rel.from];
            const dst = ER_NODE_POSITIONS[rel.to];

            if (!src || !dst) return null;

            const startX = src.x + src.w / 2;
            const startY = src.y + src.h;
            const endX = dst.x + dst.w / 2;
            const endY = dst.y;

            // Curvature control points
            const midY = (startY + endY) / 2;
            const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

            const isAffected = affectedMap[rel.to] && !isSaferMode;
            const isHighlight = selectedTable === rel.from || selectedTable === rel.to;

            const strokeColor = isSaferMode
              ? '#16a34a'
              : isAffected
              ? '#ea580c'
              : isHighlight
              ? '#3b82f6'
              : '#cbd5e1';

            const markerId = isSaferMode
              ? 'url(#er-arrow-safe)'
              : isAffected
              ? 'url(#er-arrow-active)'
              : 'url(#er-arrow)';

            return (
              <g key={idx}>
                {/* Glow Background for Active Cascade Path */}
                {isAffected && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#fed7aa"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                )}

                {/* Main Connection Curve */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isAffected ? '2.5' : '1.75'}
                  strokeDasharray={isAffected ? '6,4' : 'none'}
                  markerEnd={markerId}
                />

                {/* Relationship Cardinality Badge on Line */}
                <foreignObject
                  x={(startX + endX) / 2 - 45}
                  y={midY - 10}
                  width="90"
                  height="22"
                >
                  <div className={`text-badge font-mono font-semibold px-1.5 py-0.5 rounded text-center shadow-2xs border ${
                    isSaferMode
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : isAffected
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}>
                    CASCADE
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Entity Table Cards */}
        {Object.entries(tables).map(([tblName, table]) => {
          const pos = ER_NODE_POSITIONS[tblName] || { x: 100, y: 100, w: 200, h: 120 };
          const impact = affectedMap[tblName];
          const isSelected = selectedTable === tblName;
          const isRoot = tblName === 'users';

          let borderStyle = 'border-slate-200 hover:border-slate-300';
          let headerBg = 'bg-slate-100 text-slate-800';
          let badgePill = (
            <span className="text-badge font-medium text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded font-mono">
              UNAFFECTED
            </span>
          );

          if (isSaferMode && impact) {
            borderStyle = 'border-emerald-400 ring-2 ring-emerald-100';
            headerBg = 'bg-emerald-50 text-emerald-900 border-b border-emerald-200';
            badgePill = (
              <span className="text-badge font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-mono border border-emerald-300">
                SAFEGUARDED
              </span>
            );
          } else if (impact?.role === 'DIRECT') {
            borderStyle = 'border-rose-400 ring-2 ring-rose-100 shadow-md';
            headerBg = 'bg-rose-50 text-rose-900 border-b border-rose-200';
            badgePill = (
              <span className="text-badge font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded font-mono border border-rose-300">
                DIRECT ({formatNumber(impact.count)})
              </span>
            );
          } else if (impact?.role === 'CASCADE') {
            borderStyle = 'border-amber-400 ring-2 ring-amber-100 shadow-sm';
            headerBg = 'bg-amber-50 text-amber-900 border-b border-amber-200';
            badgePill = (
              <span className="text-badge font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-mono border border-amber-300">
                CASCADE ({formatNumber(impact.count)})
              </span>
            );
          }

          if (isSelected) {
            borderStyle += ' ring-2 ring-blue-500 shadow-lg';
          }

          return (
            <div
              key={tblName}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${pos.w}px`,
              }}
              onClick={() => onSelectTable(tblName)}
              onMouseEnter={() => setHoveredTable(tblName)}
              onMouseLeave={() => setHoveredTable(null)}
              className={`absolute z-20 bg-white rounded-xl border transition-all cursor-pointer shadow-sm overflow-hidden flex flex-col ${borderStyle}`}
            >
              {/* Card Header: Table Name + Row Count */}
              <div className={`px-3 py-2 flex items-center justify-between ${headerBg}`}>
                <div className="flex items-center gap-1.5 font-mono font-semibold text-caption">
                  <Database className="w-3.5 h-3.5" />
                  <span>{tblName}</span>
                </div>
                {badgePill}
              </div>

              {/* Column list preview */}
              <div className="p-2.5 space-y-1 text-caption font-mono bg-white">
                {table.columns.slice(0, 4).map((col) => (
                  <div key={col.name} className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      {col.isPk && <Key className="w-2.5 h-2.5 text-amber-500" />}
                      {col.isFk && <Link2 className="w-2.5 h-2.5 text-purple-500" />}
                      <span className={col.isPk ? 'font-semibold text-slate-900' : 'font-normal'}>{col.name}</span>
                    </span>
                    <span className="text-badge text-slate-400 font-normal">{col.type.split('(')[0]}</span>
                  </div>
                ))}

                {table.columns.length > 4 && (
                  <div className="text-badge text-slate-400 text-center pt-0.5 font-normal">
                    + {table.columns.length - 4} more columns
                  </div>
                )}
              </div>

              {/* Table Total Rows Footnote */}
              <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-badge text-slate-500 font-mono font-normal">
                <span>{formatNumber(table.rowCount)} rows</span>
                {isRoot && <span className="font-semibold text-slate-700">ROOT ENTITY</span>}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
