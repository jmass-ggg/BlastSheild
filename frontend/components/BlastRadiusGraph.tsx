"use client";

import React, { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Edge,
  Node,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import { DatabaseTableNode } from "./GraphCustomNodes";
import { AnalysisRecord } from "@/lib/types";
import { 
  Network, 
  Layers, 
  Maximize2, 
  Info, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  ShieldAlert,
  X 
} from "lucide-react";

const nodeTypes = {
  databaseTable: DatabaseTableNode,
};

interface BlastRadiusGraphProps {
  analysis: AnalysisRecord;
  isSafeMode?: boolean;
}

export function BlastRadiusGraph({ analysis, isSafeMode = false }: BlastRadiusGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Compute graph nodes according to current scenario and safe mode
  const nodes: Node[] = useMemo(() => {
    const isDeleteUsers = analysis.targetTable === "users" && analysis.operationType === "DELETE";

    if (isDeleteUsers) {
      return [
        {
          id: "users",
          type: "databaseTable",
          position: { x: 280, y: 20 },
          data: {
            tableName: "users",
            totalRows: 50000,
            affectedRows: 12481,
            impactType: isSafeMode ? "SAFE" : "DIRECT",
            action: isSafeMode ? "UPDATE" : "DELETE",
            isRoot: true,
            isSafeMode,
          },
        },
        {
          id: "orders",
          type: "databaseTable",
          position: { x: 40, y: 190 },
          data: {
            tableName: "orders",
            totalRows: 100000,
            affectedRows: isSafeMode ? 0 : 21003,
            impactType: isSafeMode ? "SAFE" : "CASCADE_L1",
            action: isSafeMode ? "NONE" : "DELETE",
            isSafeMode,
          },
        },
        {
          id: "subscriptions",
          type: "databaseTable",
          position: { x: 280, y: 190 },
          data: {
            tableName: "subscriptions",
            totalRows: 15000,
            affectedRows: isSafeMode ? 0 : 347,
            impactType: isSafeMode ? "SAFE" : "CASCADE_L1",
            action: isSafeMode ? "NONE" : "DELETE",
            isSafeMode,
          },
        },
        {
          id: "sessions",
          type: "databaseTable",
          position: { x: 520, y: 190 },
          data: {
            tableName: "sessions",
            totalRows: 120000,
            affectedRows: isSafeMode ? 0 : 9682,
            impactType: isSafeMode ? "SAFE" : "CASCADE_L1",
            action: isSafeMode ? "NONE" : "DELETE",
            isSafeMode,
          },
        },
        {
          id: "payments",
          type: "databaseTable",
          position: { x: 40, y: 360 },
          data: {
            tableName: "payments",
            totalRows: 90000,
            affectedRows: isSafeMode ? 0 : 18201,
            impactType: isSafeMode ? "SAFE" : "CASCADE_L2",
            action: isSafeMode ? "NONE" : "DELETE",
            isSafeMode,
          },
        },
        {
          id: "invoices",
          type: "databaseTable",
          position: { x: 520, y: 360 },
          data: {
            tableName: "invoices",
            totalRows: 30000,
            affectedRows: 0,
            impactType: "RESTRICT",
            action: "NONE",
            isSafeMode,
          },
        },
      ];
    }

    // Default / Single table target (e.g. sessions, subscriptions)
    return [
      {
        id: analysis.targetTable,
        type: "databaseTable",
        position: { x: 280, y: 100 },
        data: {
          tableName: analysis.targetTable,
          totalRows: analysis.targetTable === "sessions" ? 120000 : 15000,
          affectedRows: isSafeMode ? 0 : analysis.directRows,
          impactType: isSafeMode ? "SAFE" : "DIRECT",
          action: isSafeMode ? "UPDATE" : analysis.operationType,
          isRoot: true,
          isSafeMode,
        },
      },
    ];
  }, [analysis, isSafeMode]);

  // Compute graph edges with dynamic glowing and status
  const edges: Edge[] = useMemo(() => {
    const isDeleteUsers = analysis.targetTable === "users" && analysis.operationType === "DELETE";

    if (!isDeleteUsers) {
      return [];
    }

    const dangerEdgeStyle = {
      stroke: "#ef4444",
      strokeWidth: 2.5,
    };

    const safeEdgeStyle = {
      stroke: "#334155",
      strokeWidth: 1.5,
      strokeDasharray: "4 4",
    };

    return [
      {
        id: "e-users-orders",
        source: "users",
        target: "orders",
        animated: !isSafeMode,
        label: isSafeMode ? "CASCADE BLOCKED" : "ON DELETE CASCADE (21k rows)",
        labelStyle: { fill: isSafeMode ? "#94a3b8" : "#f87171", fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.9, stroke: isSafeMode ? "#334155" : "#ef4444" },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
        style: isSafeMode ? safeEdgeStyle : dangerEdgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSafeMode ? "#64748b" : "#ef4444",
        },
      },
      {
        id: "e-orders-payments",
        source: "orders",
        target: "payments",
        animated: !isSafeMode,
        label: isSafeMode ? "LEVEL 2 BLOCKED" : "CASCADE LVL 2 (18k rows)",
        labelStyle: { fill: isSafeMode ? "#94a3b8" : "#f87171", fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.9, stroke: isSafeMode ? "#334155" : "#ef4444" },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
        style: isSafeMode ? safeEdgeStyle : dangerEdgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSafeMode ? "#64748b" : "#ef4444",
        },
      },
      {
        id: "e-users-subscriptions",
        source: "users",
        target: "subscriptions",
        animated: !isSafeMode,
        label: isSafeMode ? "SHIELDED" : "CASCADE: 347 ACTIVE SUBS ($73K ARR)",
        labelStyle: { fill: isSafeMode ? "#10b981" : "#f43f5e", fontSize: 10, fontWeight: 800 },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.95, stroke: isSafeMode ? "#10b981" : "#f43f5e" },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
        style: isSafeMode ? safeEdgeStyle : { stroke: "#f43f5e", strokeWidth: 3 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSafeMode ? "#10b981" : "#f43f5e",
        },
      },
      {
        id: "e-users-sessions",
        source: "users",
        target: "sessions",
        animated: !isSafeMode,
        label: isSafeMode ? "BLOCKED" : "CASCADE: 9.6k SESSIONS",
        labelStyle: { fill: isSafeMode ? "#94a3b8" : "#f87171", fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.9, stroke: isSafeMode ? "#334155" : "#ef4444" },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
        style: isSafeMode ? safeEdgeStyle : dangerEdgeStyle,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSafeMode ? "#64748b" : "#ef4444",
        },
      },
      {
        id: "e-users-invoices",
        source: "users",
        target: "invoices",
        animated: false,
        label: "FK RESTRICT (PROTECTED)",
        labelStyle: { fill: "#eab308", fontSize: 9, fontWeight: 600 },
        labelBgStyle: { fill: "#0f172a", fillOpacity: 0.8, stroke: "#eab308" },
        labelBgPadding: [3, 5] as [number, number],
        labelBgBorderRadius: 4,
        style: { stroke: "#ca8a04", strokeWidth: 1.5, strokeDasharray: "5 5" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#ca8a04",
        },
      },
    ];
  }, [analysis, isSafeMode]);

  return (
    <div className="relative w-full rounded-2xl border border-slate-800/90 bg-[#080d18] overflow-hidden shadow-2xl" style={{ height: 460 }}>
      {/* Top Overlay Badge & Graph Legend */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md">
          <Network className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Cascade Blast Radius Graph
          </span>
        </div>

        {isSafeMode ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold backdrop-blur-md animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>0 Cascading Deletions (Protected)</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-400 text-xs font-bold backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span>3 Active Cascade Branches (High Risk)</span>
          </div>
        )}
      </div>

      {/* Legend at bottom left */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>ON DELETE CASCADE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>RESTRICT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>SOFT-DELETE SHIELD</span>
        </div>
      </div>

      {/* React Flow Core Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node.id)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.2}
          color="rgba(255, 255, 255, 0.08)"
        />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300 [&>button]:!border-slate-800 hover:[&>button]:!bg-slate-800" />
        <MiniMap
          nodeColor={(n) => {
            if (isSafeMode) return "#10b981";
            if (n.id === "users") return "#ef4444";
            if (n.id === "subscriptions") return "#f43f5e";
            return "#64748b";
          }}
          className="!bg-slate-950 !border !border-slate-800 !rounded-xl !bottom-3 !right-3"
          maskColor="rgba(8, 13, 24, 0.7)"
        />
      </ReactFlow>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="absolute top-3 right-3 bottom-3 w-72 z-20 bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 backdrop-blur-xl shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-sm font-bold text-white uppercase">
                  Table: {selectedNode}
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Relationship Role:</span>
                <span className="font-semibold text-slate-200">
                  {selectedNode === "users"
                    ? "Target Root Table (Direct DELETE)"
                    : selectedNode === "subscriptions"
                    ? "Direct Foreign Key (ON DELETE CASCADE) — Paying MRR"
                    : selectedNode === "payments"
                    ? "Secondary Foreign Key (orders → payments CASCADE)"
                    : selectedNode === "invoices"
                    ? "Protected Legal Record (ON DELETE RESTRICT)"
                    : "Cascading Child Dependent"}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Status in Simulation:</span>
                {isSafeMode ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Protected by Soft Delete
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Destructive Deletion Scheduled
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px] mb-1">Cascade Rule:</span>
                <code className="text-amber-400 font-mono text-[10px] block">
                  {selectedNode === "invoices" ? "ON DELETE RESTRICT" : "ON DELETE CASCADE"}
                </code>
              </div>
            </div>
          </div>

          <button
            onClick={() => setSelectedNode(null)}
            className="w-full mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      )}
    </div>
  );
}
