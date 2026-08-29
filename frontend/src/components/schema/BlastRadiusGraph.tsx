'use client';

import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Node,
  Edge,
  NodeProps,
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import dagre from 'dagre';
import { Database, Key, Link2, ShieldAlert, ShieldCheck, CheckCircle2, ArrowDown } from 'lucide-react';
import { ReportGraph, TableImpactInfo, TableSchema } from '../../types';
import { formatNumber } from '../../lib/formatters';

// --- NODE COMPONENT ---

interface BlastNodeData {
  tableName: string;
  tableSchema?: TableSchema;
  impact?: TableImpactInfo;
  isRoot: boolean;
  isSelected: boolean;
  isSaferMode: boolean;
  rowsAffected: number;
  totalRows: number;
  depth: number;
  onSelectTable: (name: string) => void;
}

const BlastRadiusCustomNode: React.FC<NodeProps> = ({ data }) => {
  const nodeData = data as unknown as BlastNodeData;
  const {
    tableName,
    tableSchema,
    impact,
    isRoot,
    isSelected,
    isSaferMode,
    rowsAffected,
    totalRows,
    onSelectTable,
  } = nodeData;

  const isCascade = !isRoot && impact && impact.role === 'CASCADE';
  const isDirect = isRoot || (impact && impact.role === 'DIRECT');

  // Node Dark Cyber Card Styling
  let cardBorder = 'border-[#1e293b] hover:border-[#334155] bg-[#0d1424]/95 shadow-[0_4px_16px_rgba(0,0,0,0.5)]';
  let headerBg = 'bg-[#131d31] text-slate-200 border-b border-[#1e293b]';
  let headerBadge = (
    <span className="text-[10px] font-mono font-medium text-slate-500 bg-[#070b12] border border-[#1e293b] px-1.5 py-0.5 rounded">
      UNAFFECTED
    </span>
  );

  if (isSaferMode) {
    if (isDirect) {
      cardBorder = 'border-emerald-500/80 bg-[#091515]/95 ring-1 ring-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]';
      headerBg = 'bg-emerald-950/60 text-emerald-200 border-b border-emerald-800/60';
      headerBadge = (
        <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-600 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          SOFT-DELETE ({formatNumber(rowsAffected)})
        </span>
      );
    } else {
      cardBorder = 'border-emerald-700/50 bg-[#091515]/90 ring-1 ring-emerald-700/30';
      headerBg = 'bg-emerald-950/40 text-emerald-300 border-b border-emerald-800/40';
      headerBadge = (
        <span className="text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          PROTECTED (0)
        </span>
      );
    }
  } else if (isDirect) {
    cardBorder = 'border-rose-500/90 bg-[#140b12]/95 ring-1 ring-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.3)]';
    headerBg = 'bg-rose-950/70 text-rose-200 border-b border-rose-800/60';
    headerBadge = (
      <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-950/90 px-2 py-0.5 rounded-md border border-rose-600 flex items-center gap-1 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
        <ShieldAlert className="w-3 h-3 text-rose-400" />
        DIRECT ({formatNumber(rowsAffected)})
      </span>
    );
  } else if (isCascade) {
    cardBorder = 'border-amber-500/80 bg-[#16120b]/95 ring-1 ring-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
    headerBg = 'bg-amber-950/70 text-amber-200 border-b border-amber-800/60';
    headerBadge = (
      <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-600 flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
        <ArrowDown className="w-3 h-3 text-amber-400" />
        CASCADE ({formatNumber(rowsAffected)})
      </span>
    );
  }

  if (isSelected) {
    cardBorder += ' ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]';
  }

  return (
    <div
      onClick={() => onSelectTable(tableName)}
      className={`w-[260px] rounded-xl border text-left cursor-pointer transition-all duration-200 select-none overflow-hidden ${cardBorder}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-cyan-400 !border-2 !border-[#070b12]"
      />

      {/* Header */}
      <div className={`px-3 py-2 flex items-center justify-between gap-1.5 ${headerBg}`}>
        <div className="flex items-center gap-1.5 font-mono font-bold text-xs truncate">
          <Database className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-slate-100">{tableName}</span>
        </div>
        {headerBadge}
      </div>

      {/* Impact Status Banner */}
      <div className="px-3 py-1.5 border-b border-[#1e293b] bg-[#070b12]/80 flex items-center justify-between text-[11px] font-mono">
        <span>
          {isSaferMode ? (
            isDirect ? (
              <span className="text-emerald-400 font-semibold">marked deleted_at</span>
            ) : (
              <span className="text-emerald-400 font-medium">0 purge loss</span>
            )
          ) : rowsAffected > 0 ? (
            <span className="text-rose-400 font-semibold">
              {formatNumber(rowsAffected)} rows affected
            </span>
          ) : (
            <span className="text-slate-500">0 rows affected</span>
          )}
        </span>
        <span className="text-slate-500">
          of {formatNumber(totalRows || tableSchema?.rowCount || 0)} total
        </span>
      </div>

      {/* Columns Preview */}
      {tableSchema && (
        <div className="p-2.5 space-y-1 text-xs font-mono bg-[#090d16]">
          {tableSchema.columns.slice(0, 3).map((col) => (
            <div
              key={col.name}
              className="flex items-center justify-between text-slate-400 text-[11px]"
            >
              <span className="flex items-center gap-1.5 truncate max-w-[155px]">
                {col.isPk && <Key className="w-3 h-3 text-amber-400 shrink-0" />}
                {col.isFk && <Link2 className="w-3 h-3 text-purple-400 shrink-0" />}
                <span className={col.isPk ? 'font-semibold text-slate-200 truncate' : 'font-normal text-slate-300 truncate'}>
                  {col.name}
                </span>
              </span>
              <span className="text-cyan-400/80 font-normal shrink-0 text-[10px]">
                {col.type.split('(')[0].toLowerCase()}
              </span>
            </div>
          ))}
          {tableSchema.columns.length > 3 && (
            <div className="text-[10px] text-slate-600 text-center pt-0.5 font-normal">
              + {tableSchema.columns.length - 3} more columns
            </div>
          )}
        </div>
      )}

      {/* Footer Pill */}
      {isSaferMode && !isDirect && rowsAffected > 0 && (
        <div className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border-t border-emerald-800/40 text-[10px] font-mono font-medium text-center">
          ✓ {formatNumber(rowsAffected)} records kept intact
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-[#070b12]"
      />
    </div>
  );
};

// --- CUSTOM EDGE COMPONENT ---

interface BlastEdgeData {
  onDelete: string;
  isSaferMode: boolean;
  isAffected: boolean;
}

const BlastRadiusCustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const edgeData = data as unknown as BlastEdgeData;
  const isSafer = edgeData?.isSaferMode;
  const isAffected = edgeData?.isAffected && !isSafer;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = isSafer
    ? '#10b981' // emerald
    : isAffected
    ? '#f59e0b' // amber
    : '#334155'; // slate-700

  return (
    <>
      {/* Background Glow when affected */}
      {isAffected && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(245, 158, 11, 0.2)"
          strokeWidth={10}
          strokeLinecap="round"
        />
      )}

      {/* Main Connection Path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isAffected || isSafer ? 2.5 : 1.5}
        strokeDasharray={isAffected ? '6,4' : undefined}
        className={isAffected ? 'animate-flow-dash' : undefined}
      />

      {/* Edge Cascade Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shadow-[0_2px_8px_rgba(0,0,0,0.6)] ${
            isSafer
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700'
              : isAffected
              ? 'bg-amber-950/90 text-amber-300 border-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-[#0b0f19] text-slate-400 border-[#1e293b]'
          }`}
        >
          {isSafer ? 'SAFEGUARDED' : edgeData?.onDelete || 'FK CASCADE'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const nodeTypes = {
  blastNode: BlastRadiusCustomNode,
};
const edgeTypes = {
  blastEdge: BlastRadiusCustomEdge,
};

// --- DAGRE LAYOUT HELPER ---

const NODE_WIDTH = 260;
const NODE_HEIGHT = 165;

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 75,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes: Node[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition ? nodeWithPosition.x - NODE_WIDTH / 2 : 0,
        y: nodeWithPosition ? nodeWithPosition.y - NODE_HEIGHT / 2 : 0,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// --- INNER GRAPH CANVAS COMPONENT ---

interface BlastRadiusGraphInnerProps {
  graph: ReportGraph;
  tables: Record<string, TableSchema>;
  affectedMap: Record<string, TableImpactInfo>;
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
  isSaferMode?: boolean;
  targetTable?: string;
}

const BlastRadiusGraphInner: React.FC<BlastRadiusGraphInnerProps> = ({
  graph,
  tables,
  affectedMap,
  selectedTable,
  onSelectTable,
  isSaferMode = false,
  targetTable = 'users',
}) => {
  const { fitView } = useReactFlow();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (graph && graph.nodes && graph.nodes.length > 0) {
      const rawNodes: Node[] = graph.nodes.map((n) => {
        const tableSchema = tables[n.table];
        const impact = affectedMap[n.table];
        const isRoot = n.table === targetTable || n.depth === 0;

        return {
          id: n.id,
          type: 'blastNode',
          data: {
            tableName: n.table,
            tableSchema,
            impact,
            isRoot,
            isSelected: selectedTable === n.table,
            isSaferMode,
            rowsAffected: n.rows,
            totalRows: tableSchema?.rowCount || 0,
            depth: n.depth,
            onSelectTable,
          },
          position: { x: 0, y: 0 },
        };
      });

      const rawEdges: Edge[] = (graph.edges || []).map((e) => {
        const isAffected = !!affectedMap[e.target];
        return {
          id: e.id || `${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          type: 'blastEdge',
          data: {
            onDelete: e.on_delete || 'CASCADE',
            isSaferMode,
            isAffected,
          },
        };
      });

      return getLayoutedElements(rawNodes, rawEdges, 'TB');
    }

    const schemaNodes: Node[] = Object.entries(tables).map(([name, table]) => {
      const impact = affectedMap[name];
      const isRoot = name === 'users';
      return {
        id: name,
        type: 'blastNode',
        data: {
          tableName: name,
          tableSchema: table,
          impact,
          isRoot,
          isSelected: selectedTable === name,
          isSaferMode,
          rowsAffected: impact?.count || 0,
          totalRows: table.rowCount,
          depth: isRoot ? 0 : 1,
          onSelectTable,
        },
        position: { x: 0, y: 0 },
      };
    });

    const schemaEdges: Edge[] = [
      { id: 'users-orders', source: 'users', target: 'orders', type: 'blastEdge', data: { onDelete: 'CASCADE', isSaferMode, isAffected: !!affectedMap['orders'] } },
      { id: 'orders-payments', source: 'orders', target: 'payments', type: 'blastEdge', data: { onDelete: 'CASCADE', isSaferMode, isAffected: !!affectedMap['payments'] } },
      { id: 'users-subscriptions', source: 'users', target: 'subscriptions', type: 'blastEdge', data: { onDelete: 'CASCADE', isSaferMode, isAffected: !!affectedMap['subscriptions'] } },
      { id: 'users-sessions', source: 'users', target: 'sessions', type: 'blastEdge', data: { onDelete: 'CASCADE', isSaferMode, isAffected: !!affectedMap['sessions'] } },
    ];

    return getLayoutedElements(schemaNodes, schemaEdges, 'TB');
  }, [graph, tables, affectedMap, selectedTable, isSaferMode, targetTable, onSelectTable]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
    return () => clearTimeout(timer);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  return (
    <div className="w-full h-[600px] bg-[#070b12] rounded-xl border border-[#1e293b] relative overflow-hidden shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.3}
        maxZoom={1.6}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#1e293b" />
        <Controls className="!bg-[#0d1424] !border-[#1e293b] !text-slate-300" />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as unknown as BlastNodeData;
            if (data?.isSaferMode) return '#10b981';
            if (data?.isRoot) return '#f43f5e';
            if (data?.impact?.role === 'CASCADE') return '#f59e0b';
            return '#1e293b';
          }}
          className="!bg-[#0d1424]/90 !border !border-[#1e293b] !rounded-lg hidden sm:block"
        />
      </ReactFlow>

      {/* Graph Legend Overlay */}
      <div className="absolute top-3 left-3 bg-[#0b0f19]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[#1e293b] text-xs font-mono shadow-[0_4px_16px_rgba(0,0,0,0.5)] space-y-1 pointer-events-none z-10">
        <div className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">
          {isSaferMode ? 'SAFEGUARD SIMULATION GRAPH' : 'BLAST RADIUS CASCADE DAG'}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {isSaferMode ? (
            <>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" /> Soft-Delete Root
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" /> Protected (0 Cascade)
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" /> Direct Target
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" /> Cascade Purge
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Unaffected
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export interface BlastRadiusGraphProps {
  graph: ReportGraph;
  tables: Record<string, TableSchema>;
  affectedMap: Record<string, TableImpactInfo>;
  selectedTable: string;
  onSelectTable: (tableName: string) => void;
  isSaferMode?: boolean;
  targetTable?: string;
}

export const BlastRadiusGraph: React.FC<BlastRadiusGraphProps> = (props) => (
  <ReactFlowProvider>
    <BlastRadiusGraphInner {...props} />
  </ReactFlowProvider>
);
