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

  // Styles based on state
  let cardBorder = 'border-slate-200 hover:border-slate-300';
  let headerBg = 'bg-slate-100 text-slate-800';
  let headerBadge = (
    <span className="text-badge font-medium text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded font-mono">
      UNAFFECTED
    </span>
  );

  if (isSaferMode) {
    if (isDirect) {
      cardBorder = 'border-emerald-500 ring-2 ring-emerald-100 shadow-md';
      headerBg = 'bg-emerald-50 text-emerald-950 border-b border-emerald-200';
      headerBadge = (
        <span className="text-badge font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-mono border border-emerald-300 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          SOFT-DELETE ({formatNumber(rowsAffected)})
        </span>
      );
    } else {
      cardBorder = 'border-emerald-400 ring-1 ring-emerald-100 bg-emerald-50/20';
      headerBg = 'bg-emerald-50 text-emerald-900 border-b border-emerald-200';
      headerBadge = (
        <span className="text-badge font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-mono border border-emerald-300 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          PROTECTED (0 purged)
        </span>
      );
    }
  } else if (isDirect) {
    cardBorder = 'border-rose-500 ring-2 ring-rose-200 shadow-lg';
    headerBg = 'bg-rose-50 text-rose-950 border-b border-rose-200';
    headerBadge = (
      <span className="text-badge font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full font-mono border border-rose-300 flex items-center gap-1">
        <ShieldAlert className="w-3 h-3 text-rose-600" />
        DIRECT ({formatNumber(rowsAffected)})
      </span>
    );
  } else if (isCascade) {
    cardBorder = 'border-amber-500 ring-2 ring-amber-100 shadow-md';
    headerBg = 'bg-amber-50 text-amber-950 border-b border-amber-200';
    headerBadge = (
      <span className="text-badge font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-mono border border-amber-300 flex items-center gap-1">
        <ArrowDown className="w-3 h-3 text-amber-600" />
        DEPENDENT ({formatNumber(rowsAffected)})
      </span>
    );
  }

  if (isSelected) {
    cardBorder += ' ring-2 ring-blue-600 shadow-xl';
  }

  return (
    <div
      onClick={() => onSelectTable(tableName)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelectTable(tableName);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Inspect table ${tableName}, ${formatNumber(rowsAffected)} rows affected`}
      title={tableName}
      className={`w-[250px] bg-white rounded-xl border text-left cursor-pointer transition-all duration-200 select-none overflow-hidden ${cardBorder}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
      />

      {/* Header */}
      <div className={`px-3 py-2 flex items-center justify-between gap-1.5 ${headerBg}`}>
        <div className="flex items-center gap-1.5 font-mono font-bold text-caption truncate">
          <Database className="w-3.5 h-3.5 shrink-0 text-slate-700" />
          <span className="truncate">{tableName}</span>
        </div>
        {headerBadge}
      </div>

      {/* Impact Status Banner */}
      <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-badge font-mono">
        <span className="text-slate-500">
          {isSaferMode ? (
            isDirect ? (
              <span className="text-emerald-700 font-semibold">marked deleted_at</span>
            ) : (
              <span className="text-emerald-700 font-medium">0 deletions</span>
            )
          ) : rowsAffected > 0 ? (
            <span className="text-rose-700 font-semibold">
              {formatNumber(rowsAffected)} rows affected
            </span>
          ) : (
            <span className="text-slate-400">0 rows affected</span>
          )}
        </span>
        {(totalRows > 0 || (tableSchema?.rowCount ?? 0) > 0) && (
          <span className="text-slate-400">
            of {formatNumber(totalRows || tableSchema?.rowCount || 0)} fixture total
          </span>
        )}
      </div>

      {/* Columns Preview */}
      {tableSchema && tableSchema.columns.length > 0 && (
        <div className="p-2.5 space-y-1 text-caption font-mono bg-white">
          {tableSchema.columns.slice(0, 3).map((col) => (
            <div
              key={col.name}
              className="flex items-center justify-between text-slate-600 text-badge"
            >
              <span className="flex items-center gap-1 truncate max-w-[150px]">
                {col.isPk && <Key className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                {col.isFk && <Link2 className="w-2.5 h-2.5 text-purple-500 shrink-0" />}
                <span className={col.isPk ? 'font-semibold text-slate-900 truncate' : 'font-normal truncate'}>
                  {col.name}
                </span>
              </span>
              <span className="text-slate-400 font-normal shrink-0">
                {col.type.split('(')[0].toLowerCase()}
              </span>
            </div>
          ))}
          {tableSchema.columns.length > 3 && (
            <div className="text-badge text-slate-400 text-center pt-0.5 font-normal">
              + {tableSchema.columns.length - 3} more columns
            </div>
          )}
        </div>
      )}

      {/* Footer Pill */}
      {isSaferMode && !isDirect && rowsAffected > 0 && (
        <div className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border-t border-emerald-100 text-badge font-mono font-medium text-center">
          ✓ {formatNumber(rowsAffected)} records kept intact
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
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
  const action = (edgeData?.onDelete || 'NO ACTION').toUpperCase();
  const isRestricted = action === 'RESTRICT' || action === 'NO ACTION';
  const isSetAction = action === 'SET NULL' || action === 'SET_NULL' || action === 'SET DEFAULT';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const strokeColor = isSafer
    ? '#10b981' // emerald-500
    : isRestricted
    ? '#7c3aed' // violet-600
    : isSetAction
    ? '#0284c7' // sky-600
    : isAffected
    ? '#f97316' // orange-500
    : '#cbd5e1'; // slate-300

  return (
    <>
      {/* Background Glow when affected */}
      {isAffected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#ffedd5" // orange-100
          strokeWidth={8}
          strokeLinecap="round"
          className="opacity-80"
        />
      )}

      {/* Main Connection Path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isAffected || isSafer ? 2.5 : 1.75}
          strokeDasharray={isAffected && !isRestricted ? '6,4' : undefined}
          className={isAffected && !isRestricted ? 'animate-flow-dash' : undefined}
      />

      {/* Edge Cascade Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`px-2 py-0.5 rounded text-badge font-mono font-bold shadow-2xs border ${
            isSafer
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : isRestricted
              ? 'bg-violet-50 text-violet-800 border-violet-300'
              : isSetAction
              ? 'bg-sky-50 text-sky-800 border-sky-300'
              : isAffected
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          {isSafer ? 'PROJECTED UPDATE' : action}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Custom Types registry for React Flow
const nodeTypes = {
  blastNode: BlastRadiusCustomNode,
};
const edgeTypes = {
  blastEdge: BlastRadiusCustomEdge,
};

// --- DAGRE LAYOUT HELPER ---

const NODE_WIDTH = 250;
const NODE_HEIGHT = 160;

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
    ranksep: 70,
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

  // Construct raw nodes and edges from API graph
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    // If graph has nodes from API
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

    return { nodes: [], edges: [] };
  }, [graph, tables, affectedMap, selectedTable, isSaferMode, targetTable, onSelectTable]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state whenever initial elements change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
    return () => clearTimeout(timer);
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950/5 sm:h-[520px]">
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
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        <Controls className="!bg-white !border-slate-200 !shadow-sm !rounded-lg" />
        <MiniMap
          nodeColor={(n) => {
            const data = n.data as unknown as BlastNodeData;
            if (data?.isSaferMode) return '#10b981';
            if (data?.isRoot) return '#f43f5e';
            if (data?.impact?.role === 'CASCADE') return '#f59e0b';
            return '#e2e8f0';
          }}
          className="!bg-white/90 !border !border-slate-200 !rounded-lg !shadow-xs hidden sm:block"
        />
      </ReactFlow>

      {/* Graph Legend Overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 text-badge font-mono shadow-xs space-y-1.5 pointer-events-none z-10">
        <div className="font-semibold text-slate-700 uppercase tracking-wider">
          {isSaferMode ? 'Safeguard Simulation Active' : 'Blast Radius Dependency Graph'}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
          {isSaferMode ? (
            <>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Soft-Delete Root
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" /> Protected (0 Cascade)
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Direct Target
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Dependent Impact
              </span>
              <span className="flex items-center gap-1 text-violet-700">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600" /> Restricted
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Reference only
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- WRAPPER WITH REACTFLOW PROVIDER ---

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
