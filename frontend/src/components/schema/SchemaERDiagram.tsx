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
    <div className="w-full bg-[#070b12] rounded-2xl border border-[#1e293b] p-4 relative overflow-x-auto shadow-inner">
      <div className="min-w-[980px] h-[580px] relative select-none">
        
        {/* SVG ER Connecting Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker id="er-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#475569" />
            </marker>
            <marker id="er-arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker id="er-arrow-safe" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
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
              ? '#10b981'
              : isAffected
              ? '#f59e0b'
              : isHighlight
              ? '#06b6d4'
              : '#334155';

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
                    stroke="rgba(245, 158, 11, 0.2)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                )}

                {/* Main Connection Curve */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isAffected ? '2.5' : '1.5'}
                  strokeDasharray={isAffected ? '6,4' : 'none'}
                  className={isAffected ? 'animate-flow-dash' : undefined}
                  markerEnd={markerId}
                />

                {/* Relationship Cardinality Badge on Line */}
                <foreignObject
                  x={(startX + endX) / 2 - 45}
                  y={midY - 10}
                  width="90"
                  height="24"
                >
                  <div className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-center border shadow-sm ${
                    isSaferMode
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
                      : isAffected
                      ? 'bg-amber-950/90 text-amber-300 border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-[#0b0f19] text-slate-400 border-[#1e293b]'
                  }`}>
                    {isSaferMode ? 'PROTECTED' : 'CASCADE'}
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

          let borderStyle = 'border-[#1e293b] hover:border-[#334155] bg-[#0d1424]';
          let headerBg = 'bg-[#131d31] text-slate-200 border-b border-[#1e293b]';
          let badgePill = (
            <span className="text-[10px] font-mono font-medium text-slate-500 bg-[#070b12] px-1.5 py-0.2 rounded">
              UNAFFECTED
            </span>
          );

          if (isSaferMode && impact) {
            borderStyle = 'border-emerald-500/70 bg-[#091515] ring-1 ring-emerald-500/30';
            headerBg = 'bg-emerald-950/70 text-emerald-300 border-b border-emerald-800/50';
            badgePill = (
              <span className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-600">
                SAFEGUARDED
              </span>
            );
          } else if (impact?.role === 'DIRECT') {
            borderStyle = 'border-rose-500/80 bg-[#140b12] ring-1 ring-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.3)]';
            headerBg = 'bg-rose-950/70 text-rose-300 border-b border-rose-800/50';
            badgePill = (
              <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-600">
                DIRECT ({formatNumber(impact.count)})
              </span>
            );
          } else if (impact?.role === 'CASCADE') {
            borderStyle = 'border-amber-500/80 bg-[#16120b] ring-1 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.25)]';
            headerBg = 'bg-amber-950/70 text-amber-300 border-b border-amber-800/50';
            badgePill = (
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded border border-amber-600">
                CASCADE ({formatNumber(impact.count)})
              </span>
            );
          }

          if (isSelected) {
            borderStyle += ' ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]';
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
              className={`absolute z-20 rounded-xl border transition-all cursor-pointer shadow-sm overflow-hidden flex flex-col ${borderStyle}`}
            >
              {/* Card Header: Table Name + Row Count */}
              <div className={`px-3 py-2 flex items-center justify-between ${headerBg}`}>
                <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-100">{tblName}</span>
                </div>
                {badgePill}
              </div>

              {/* Column list preview */}
              <div className="p-2.5 space-y-1 text-xs font-mono bg-[#090d16]">
                {table.columns.slice(0, 4).map((col) => (
                  <div key={col.name} className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      {col.isPk && <Key className="w-2.5 h-2.5 text-amber-400" />}
                      {col.isFk && <Link2 className="w-2.5 h-2.5 text-purple-400" />}
                      <span className={col.isPk ? 'font-semibold text-slate-200' : 'font-normal text-slate-300'}>{col.name}</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-normal">{col.type.split('(')[0].toLowerCase()}</span>
                  </div>
                ))}

                {table.columns.length > 4 && (
                  <div className="text-[10px] text-slate-600 text-center pt-0.5 font-normal">
                    + {table.columns.length - 4} more columns
                  </div>
                )}
              </div>

              {/* Table Total Rows Footnote */}
              <div className="px-3 py-1 bg-[#070b12] border-t border-[#1e293b] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>{formatNumber(table.rowCount)} rows</span>
                {isRoot && <span className="font-bold text-slate-400">ROOT ENTITY</span>}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
