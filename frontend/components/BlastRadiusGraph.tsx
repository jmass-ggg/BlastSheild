"use client";

import React, { useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
} from "@xyflow/react";
import {
  CheckCircle2,
  Eye,
  GitBranch,
  Layers3,
  LockKeyhole,
  Network,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  DatabaseNodeData,
  DatabaseTableNode,
  type DatabaseImpactType,
} from "./GraphCustomNodes";
import type { AnalysisRecord, TableRowDiff } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

const nodeTypes = {
  databaseTable: DatabaseTableNode,
};

interface BlastRadiusGraphProps {
  analysis: AnalysisRecord;
  isSafeMode?: boolean;
}

type TopologyNode = Node<DatabaseNodeData, "databaseTable">;
type EdgeTone = "danger" | "safe" | "restrict" | "neutral";
type SourcePort = "left" | "center" | "right";

const TABLE_ROW_COUNTS: Record<string, number> = {
  users: 50_000,
  orders: 100_000,
  payments: 90_000,
  subscriptions: 15_000,
  sessions: 120_000,
  invoices: 30_000,
};

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function compact(value: number) {
  return compactFormatter.format(Math.abs(value));
}

function alternativeAction(analysis: AnalysisRecord) {
  return analysis.recommendedAlternative.sql.trim().match(/^([A-Za-z]+)/)?.[1]?.toUpperCase() ?? "UPDATE";
}

function tableRowCount(analysis: AnalysisRecord, tableName: string) {
  const diff = analysis.tableDiffs.find((item) => item.tableName === tableName);
  if (diff) return diff.beforeCount;
  if (TABLE_ROW_COUNTS[tableName]) return TABLE_ROW_COUNTS[tableName];
  if (tableName === analysis.targetTable) {
    return Math.max(analysis.directRows, analysis.recommendedAlternative.directRows);
  }
  return 0;
}

function directImpactLabel(action: string, affectedRows: number, isSafeMode: boolean) {
  if (action === "SELECT") return "0 changed";
  if (action === "ALTER" || action === "RENAME") return "schema kept";
  if (action === "DROP") return "schema at risk";
  if (action === "UPDATE") return `${formatNumber(affectedRows)} updated`;
  if (action === "DELETE" && isSafeMode) return `−${formatNumber(affectedRows)} scoped`;
  return affectedRows > 0 ? `−${formatNumber(affectedRows)}` : "0 changed";
}

function safeStatusLabel(analysis: AnalysisRecord, action: string) {
  if (analysis.operationType === "DELETE" && action === "UPDATE") return "SOFT UPDATE";
  if (action === "UPDATE") return "SCOPED UPDATE";
  if (action === "DELETE") return "SCOPED DELETE";
  if (action === "ALTER" || action === "RENAME") return "SAFE ALTER";
  if (action === "SELECT") return "READ ONLY";
  return `SAFE ${action}`;
}

function originalStatusLabel(action: string) {
  if (action === "SELECT") return "READ ONLY";
  if (action === "TRUNCATE") return "TABLE TRUNCATE";
  if (action === "DROP") return "SCHEMA DROP";
  return `DIRECT ${action}`;
}

function rootStatusText(
  analysis: AnalysisRecord,
  action: string,
  affectedRows: number,
  isSafeMode: boolean,
) {
  if (action === "SELECT") return "Read path leaves persisted state unchanged.";
  if (isSafeMode && analysis.operationType === "DELETE" && action === "UPDATE") {
    return "Row flags change; delete hooks stay idle.";
  }
  if (isSafeMode) return "Verified alternative limits the mutation scope.";
  if (action === "DROP") return "Schema object is scheduled for removal.";
  if (action === "TRUNCATE") return `${formatNumber(affectedRows)} rows are scheduled for removal.`;
  if (action === "UPDATE") return `${formatNumber(affectedRows)} rows are scheduled for mutation.`;
  return `${formatNumber(affectedRows)} rows are scheduled for deletion.`;
}

function makeRootData(
  analysis: AnalysisRecord,
  isSafeMode: boolean,
  sourcePorts?: SourcePort[],
): DatabaseNodeData {
  const action = isSafeMode ? alternativeAction(analysis) : analysis.operationType;
  const affectedRows = isSafeMode
    ? analysis.recommendedAlternative.directRows
    : analysis.directRows;
  const isReadOnly = action === "SELECT";

  return {
    tableName: analysis.targetTable,
    totalRows: tableRowCount(analysis, analysis.targetTable),
    affectedRows,
    impactType: isSafeMode ? "SAFE" : isReadOnly ? "NONE" : "DIRECT",
    action,
    isRoot: true,
    isSafeMode,
    statusLabel: isSafeMode
      ? safeStatusLabel(analysis, action)
      : originalStatusLabel(action),
    statusText: rootStatusText(analysis, action, affectedRows, isSafeMode),
    impactLabel: directImpactLabel(action, affectedRows, isSafeMode),
    roleLabel: "operation target",
    relationshipRule:
      isSafeMode && analysis.operationType === "DELETE" && action === "UPDATE"
        ? "UPDATE · no delete event"
        : `${action} statement`,
    sourcePorts,
  };
}

function makeDependencyData({
  analysis,
  tableName,
  level,
  relationshipRule,
  isSafeMode,
  sourcePorts,
}: {
  analysis: AnalysisRecord;
  tableName: string;
  level: 1 | 2;
  relationshipRule: string;
  isSafeMode: boolean;
  sourcePorts?: SourcePort[];
}): DatabaseNodeData {
  const diff = analysis.tableDiffs.find((item) => item.tableName === tableName);
  const affectedRows = isSafeMode ? 0 : Math.abs(diff?.delta ?? 0);

  return {
    tableName,
    totalRows: tableRowCount(analysis, tableName),
    affectedRows,
    impactType: isSafeMode ? "SAFE" : level === 2 ? "CASCADE_L2" : "CASCADE_L1",
    action: isSafeMode ? "NONE" : diff?.action ?? "DELETE",
    isSafeMode,
    statusLabel: isSafeMode ? "CONTAINED" : `CASCADE L${level}`,
    statusText: isSafeMode
      ? "Cascade event never reaches this table."
      : `${formatNumber(affectedRows)} rows follow the parent delete.`,
    impactLabel: isSafeMode ? "0 changed" : `−${formatNumber(affectedRows)}`,
    roleLabel: level === 2 ? "dependent · level 2" : "direct dependent",
    relationshipRule,
    sourcePorts,
  };
}

function makeRestrictData(
  analysis: AnalysisRecord,
  tableName: string,
  relationshipRule: string,
  isSafeMode: boolean,
): DatabaseNodeData {
  return {
    tableName,
    totalRows: tableRowCount(analysis, tableName),
    affectedRows: 0,
    impactType: "RESTRICT",
    action: "NONE",
    isSafeMode,
    statusLabel: "POLICY HOLD",
    statusText: "Constraint blocks destructive propagation.",
    impactLabel: "0 protected",
    roleLabel: "policy boundary",
    relationshipRule,
  };
}

function createEdge({
  id,
  source,
  target,
  label,
  tone,
  sourceHandle = "center",
}: {
  id: string;
  source: string;
  target: string;
  label: string;
  tone: EdgeTone;
  sourceHandle?: SourcePort;
}): Edge {
  const colors: Record<EdgeTone, string> = {
    danger: "#d86a62",
    safe: "#68c7a2",
    restrict: "#caa65d",
    neutral: "#8f98d6",
  };
  const color = colors[tone];
  const dashed = tone === "safe" || tone === "restrict";

  return {
    id,
    source,
    target,
    sourceHandle: `source-${sourceHandle}`,
    targetHandle: "target",
    type: "smoothstep",
    animated: false,
    label,
    ariaLabel: `${source} to ${target}: ${label}`,
    style: {
      stroke: color,
      strokeWidth: tone === "danger" ? 1.65 : 1.35,
      strokeDasharray: dashed ? "5 5" : undefined,
      opacity: tone === "safe" ? 0.72 : 0.86,
    },
    labelStyle: {
      fill: color,
      fontFamily: "var(--font-mono, monospace)",
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: "0.025em",
    },
    labelBgStyle: {
      fill: "#0a0d0f",
      fillOpacity: 0.96,
      stroke: color,
      strokeOpacity: 0.22,
    },
    labelBgPadding: [4, 5],
    labelBgBorderRadius: 5,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color,
      width: 13,
      height: 13,
    },
  };
}

function knownUsersDeleteTopology(analysis: AnalysisRecord, isSafeMode: boolean) {
  const nodes: TopologyNode[] = [
    {
      id: "users",
      type: "databaseTable",
      position: { x: 300, y: 28 },
      data: makeRootData(analysis, isSafeMode, ["left", "center", "right"]),
      ariaLabel: "users operation target",
    },
    {
      id: "orders",
      type: "databaseTable",
      position: { x: 30, y: 215 },
      data: makeDependencyData({
        analysis,
        tableName: "orders",
        level: 1,
        relationshipRule: "users.id → orders.user_id",
        isSafeMode,
        sourcePorts: ["center"],
      }),
      ariaLabel: "orders direct dependency",
    },
    {
      id: "subscriptions",
      type: "databaseTable",
      position: { x: 300, y: 215 },
      data: makeDependencyData({
        analysis,
        tableName: "subscriptions",
        level: 1,
        relationshipRule: "users.id → subscriptions.user_id",
        isSafeMode,
      }),
      ariaLabel: "subscriptions direct dependency",
    },
    {
      id: "sessions",
      type: "databaseTable",
      position: { x: 570, y: 215 },
      data: makeDependencyData({
        analysis,
        tableName: "sessions",
        level: 1,
        relationshipRule: "users.id → sessions.user_id",
        isSafeMode,
      }),
      ariaLabel: "sessions direct dependency",
    },
    {
      id: "payments",
      type: "databaseTable",
      position: { x: 30, y: 400 },
      data: makeDependencyData({
        analysis,
        tableName: "payments",
        level: 2,
        relationshipRule: "orders.id → payments.order_id",
        isSafeMode,
      }),
      ariaLabel: "payments second-level dependency",
    },
    {
      id: "invoices",
      type: "databaseTable",
      position: { x: 570, y: 400 },
      data: makeRestrictData(
        analysis,
        "invoices",
        "ON DELETE RESTRICT",
        isSafeMode,
      ),
      ariaLabel: "invoices policy boundary",
    },
  ];

  const dependencyTone: EdgeTone = isSafeMode ? "safe" : "danger";
  const label = (rows: number, suffix = "cascade") =>
    isSafeMode ? "contained" : `${compact(rows)} · ${suffix}`;
  const diffRows = (tableName: string) =>
    Math.abs(analysis.tableDiffs.find((item) => item.tableName === tableName)?.delta ?? 0);

  const edges: Edge[] = [
    createEdge({
      id: "users-orders",
      source: "users",
      target: "orders",
      sourceHandle: "left",
      label: label(diffRows("orders")),
      tone: dependencyTone,
    }),
    createEdge({
      id: "orders-payments",
      source: "orders",
      target: "payments",
      label: label(diffRows("payments"), "level 2"),
      tone: dependencyTone,
    }),
    createEdge({
      id: "users-subscriptions",
      source: "users",
      target: "subscriptions",
      sourceHandle: "center",
      label: label(diffRows("subscriptions")),
      tone: dependencyTone,
    }),
    createEdge({
      id: "users-sessions",
      source: "users",
      target: "sessions",
      sourceHandle: "right",
      label: label(diffRows("sessions")),
      tone: dependencyTone,
    }),
    createEdge({
      id: "users-invoices",
      source: "users",
      target: "invoices",
      sourceHandle: "right",
      label: "RESTRICT",
      tone: "restrict",
    }),
  ];

  return { nodes, edges };
}

function portsForChildren(count: number): SourcePort[] | undefined {
  if (count <= 0) return undefined;
  if (count === 1) return ["center"];
  if (count === 2) return ["left", "right"];
  return ["left", "center", "right"];
}

function portForChild(index: number, count: number): SourcePort {
  if (count === 1) return "center";
  if (count === 2) return index === 0 ? "left" : "right";
  if (index === 0) return "left";
  if (index === 1) return "center";
  return "right";
}

function genericDependencyData(
  analysis: AnalysisRecord,
  diff: TableRowDiff,
  isSafeMode: boolean,
): DatabaseNodeData {
  const isRestrict = diff.cascadeType === "RESTRICT";
  const isCascade = diff.cascadeType === "CASCADE";
  const impactType: DatabaseImpactType = isRestrict
    ? "RESTRICT"
    : isSafeMode
      ? "SAFE"
      : isCascade || diff.cascadeType === "SET_NULL"
        ? "CASCADE_L1"
        : "NONE";
  const affectedRows = isSafeMode || isRestrict ? 0 : Math.abs(diff.delta);
  const relationshipRule =
    diff.cascadeType === "CASCADE"
      ? "ON DELETE CASCADE"
      : diff.cascadeType === "SET_NULL"
        ? "ON DELETE SET NULL"
        : diff.cascadeType === "RESTRICT"
          ? "ON DELETE RESTRICT"
          : "related table";

  return {
    tableName: diff.tableName,
    totalRows: diff.beforeCount,
    affectedRows,
    impactType,
    action: isSafeMode ? "NONE" : diff.action,
    isSafeMode,
    statusLabel: isRestrict
      ? "POLICY HOLD"
      : isSafeMode
        ? "CONTAINED"
        : diff.cascadeType === "SET_NULL"
          ? "SET NULL"
          : "CASCADE L1",
    statusText: isRestrict
      ? "Constraint blocks destructive propagation."
      : isSafeMode
        ? "No downstream mutation is emitted."
        : `${formatNumber(affectedRows)} rows change through this dependency.`,
    impactLabel: isRestrict
      ? "0 protected"
      : isSafeMode
        ? "0 changed"
        : diff.action === "UPDATE"
          ? `${formatNumber(affectedRows)} updated`
          : `−${formatNumber(affectedRows)}`,
    roleLabel: isRestrict ? "policy boundary" : "direct dependent",
    relationshipRule,
  };
}

function genericTopology(analysis: AnalysisRecord, isSafeMode: boolean) {
  const dependencies = analysis.tableDiffs.filter(
    (diff) => diff.tableName !== analysis.targetTable,
  );
  const sourcePorts = portsForChildren(dependencies.length);

  const nodes: TopologyNode[] = [
    {
      id: analysis.targetTable,
      type: "databaseTable",
      position: { x: 300, y: dependencies.length > 0 ? 55 : 150 },
      data: makeRootData(analysis, isSafeMode, sourcePorts),
      ariaLabel: `${analysis.targetTable} operation target`,
    },
  ];

  const columns = Math.min(3, dependencies.length);
  const startX = 300 - ((columns - 1) * 250) / 2;

  dependencies.forEach((diff, index) => {
    nodes.push({
      id: diff.tableName,
      type: "databaseTable",
      position: {
        x: startX + (index % columns) * 250,
        y: 260 + Math.floor(index / columns) * 185,
      },
      data: genericDependencyData(analysis, diff, isSafeMode),
      ariaLabel: `${diff.tableName} dependency`,
    });
  });

  const edges = dependencies.map((diff, index) => {
    const isRestrict = diff.cascadeType === "RESTRICT";
    const label = isRestrict
      ? "RESTRICT"
      : isSafeMode
        ? "contained"
        : diff.cascadeType === "SET_NULL"
          ? "SET NULL"
          : `${compact(diff.delta)} · cascade`;

    return createEdge({
      id: `${analysis.targetTable}-${diff.tableName}`,
      source: analysis.targetTable,
      target: diff.tableName,
      sourceHandle: portForChild(index, dependencies.length),
      label,
      tone: isRestrict ? "restrict" : isSafeMode ? "safe" : "danger",
    });
  });

  return { nodes, edges };
}

function buildTopology(analysis: AnalysisRecord, isSafeMode: boolean) {
  const isKnownCascade =
    analysis.targetTable === "users" &&
    analysis.operationType === "DELETE" &&
    analysis.cascadesCount > 0;

  return isKnownCascade
    ? knownUsersDeleteTopology(analysis, isSafeMode)
    : genericTopology(analysis, isSafeMode);
}

function statusSummary(analysis: AnalysisRecord, isSafeMode: boolean) {
  if (analysis.operationType === "SELECT") return "Read-only · no persisted change";
  if (isSafeMode && analysis.indirectRows > 0) {
    return `${formatNumber(analysis.indirectRows)} dependent rows contained`;
  }
  if (isSafeMode) {
    return `${formatNumber(analysis.recommendedAlternative.directRows)} rows in safer scope`;
  }
  if (analysis.cascadesCount > 0) {
    const pathLabel = analysis.cascadesCount === 1 ? "cascade path" : "cascade paths";
    return `${analysis.cascadesCount} ${pathLabel} · ${compact(analysis.indirectRows)} rows`;
  }
  return `${analysis.operationType} · ${formatNumber(analysis.directRows)} row scope`;
}

function inspectorAccent(data: DatabaseNodeData) {
  if (data.impactType === "RESTRICT") return "#efc46e";
  if (data.isSafeMode) return "#68e3b3";
  if (data.action === "SELECT" || data.impactType === "NONE") return "#9ba7ff";
  return "#ff6b61";
}

export function BlastRadiusGraph({
  analysis,
  isSafeMode = false,
}: BlastRadiusGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const topology = useMemo(
    () => buildTopology(analysis, isSafeMode),
    [analysis, isSafeMode],
  );
  const nodes = useMemo(
    () =>
      topology.nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    [selectedNodeId, topology.nodes],
  );
  const selectedNode = selectedNodeId
    ? topology.nodes.find((node) => node.id === selectedNodeId)
    : undefined;
  const selectedData = selectedNode?.data;
  const selectedAccent = selectedData ? inspectorAccent(selectedData) : "#9ba7ff";
  const isReadOnly = analysis.operationType === "SELECT";
  const summaryAccent = isSafeMode || isReadOnly ? "#68e3b3" : "#ff9a91";

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: 460 }}
      aria-label={`Dependency topology for ${analysis.operationType} on ${analysis.targetTable}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(119, 137, 170, 0.085), transparent 42%), linear-gradient(180deg, rgba(13, 17, 20, 0.2), rgba(4, 6, 7, 0.58))",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(rgba(238, 244, 240, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(238, 244, 240, 0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "linear-gradient(to bottom, black, rgba(0,0,0,0.5) 72%, transparent)",
        }}
      />

      <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 flex flex-wrap items-start justify-between gap-2 max-sm:flex-col">
        <div
          className="pointer-events-auto flex min-h-9 items-center gap-2 rounded-[9px] border px-3 backdrop-blur-xl"
          style={{
            borderColor: "rgba(238, 244, 240, 0.1)",
            color: "#ccd1ce",
            background: "rgba(10, 13, 15, 0.82)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035), 0 10px 28px rgba(0,0,0,0.2)",
          }}
        >
          <Network size={14} color="#9ba7ff" aria-hidden="true" />
          <span className="font-mono text-[8px] font-bold tracking-[0.08em] text-[#cbd1ce] uppercase">
            Dependency topology
          </span>
          <span className="h-3 w-px bg-white/10" aria-hidden="true" />
          <span className="font-mono text-[7px] text-[#626d6a] uppercase">sandbox model</span>
        </div>

        <div
          className="pointer-events-auto flex min-h-9 items-center gap-2 rounded-[9px] border px-3 font-mono text-[8px] font-semibold backdrop-blur-xl"
          style={{
            borderColor: `${summaryAccent}2b`,
            color: summaryAccent,
            background: isSafeMode || isReadOnly
              ? "rgba(17, 31, 26, 0.78)"
              : "rgba(31, 19, 18, 0.78)",
          }}
        >
          {isSafeMode ? (
            <ShieldCheck size={13} aria-hidden="true" />
          ) : isReadOnly ? (
            <Eye size={13} aria-hidden="true" />
          ) : (
            <ShieldAlert size={13} aria-hidden="true" />
          )}
          <span>{statusSummary(analysis, isSafeMode)}</span>
        </div>
      </div>

      {topology.nodes.length > 1 && (
        <div
          className="pointer-events-none absolute bottom-3 left-14 z-10 hidden min-h-8 items-center gap-3 rounded-[8px] border px-2.5 font-mono text-[7px] text-[#697370] backdrop-blur-lg sm:flex"
          style={{
            borderColor: "rgba(238, 244, 240, 0.08)",
            background: "rgba(9, 12, 14, 0.8)",
          }}
          aria-label="Topology legend"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6b61]" /> operation target
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-px w-3 ${isSafeMode ? "border-t border-dashed border-[#68e3b3]" : "bg-[#d86a62]"}`} />
            {isSafeMode ? "contained path" : "cascade path"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#efc46e]" /> policy hold
          </span>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={topology.edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        fitViewOptions={{ padding: 0.24, maxZoom: 1.08 }}
        minZoom={0.45}
        maxZoom={1.45}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={0.7}
          color="rgba(208, 218, 214, 0.105)"
        />
        <Controls
          showInteractive={false}
          className="!bottom-3 !left-3 !border-white/[0.08] !bg-[#0d1114]/90"
        />
        {topology.nodes.length > 1 && (
          <MiniMap
            pannable
            zoomable
            nodeStrokeWidth={2}
            nodeColor={(node) => inspectorAccent(node.data as DatabaseNodeData)}
            nodeStrokeColor="rgba(244, 242, 236, 0.25)"
            className="!right-3 !bottom-3 !hidden !h-[76px] !w-[118px] sm:!block"
            maskColor="rgba(5, 7, 8, 0.74)"
          />
        )}
      </ReactFlow>

      {selectedData && (
        <aside
          role="dialog"
          aria-label={`${selectedData.tableName} topology inspector`}
          className="absolute z-30 flex flex-col overflow-y-auto rounded-xl border backdrop-blur-2xl max-sm:inset-x-3 max-sm:bottom-3 max-sm:max-h-[68%] max-sm:w-auto sm:top-3 sm:right-3 sm:bottom-3 sm:w-[292px]"
          style={{
            borderColor: "rgba(238, 244, 240, 0.13)",
            background: "linear-gradient(155deg, rgba(18, 22, 24, 0.97), rgba(9, 12, 14, 0.98))",
            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          <header
            className="flex min-h-[58px] items-center justify-between gap-3 border-b px-3 pl-4"
            style={{ borderColor: "rgba(238, 244, 240, 0.08)" }}
          >
            <div className="min-w-0">
              <span className="mb-1 flex items-center gap-1.5 font-mono text-[7px] font-bold tracking-[0.08em] text-[#626d6a] uppercase">
                <Layers3 size={11} color={selectedAccent} aria-hidden="true" /> node inspector
              </span>
              <strong className="block truncate font-mono text-[12px] font-semibold text-[#f4f2ec]">
                public.{selectedData.tableName}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="grid h-11 w-11 flex-none place-items-center rounded-[9px] border border-white/[0.08] bg-white/[0.025] text-[#8e9896] transition-colors hover:border-white/[0.16] hover:bg-white/[0.055] hover:text-[#f4f2ec]"
              aria-label="Close node inspector"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-2 p-3">
            <div
              className="rounded-[9px] border p-3"
              style={{
                borderColor: `${selectedAccent}24`,
                background: `${selectedAccent}0d`,
              }}
            >
              <span className="mb-2 flex items-center gap-1.5 font-mono text-[7px] font-bold tracking-[0.06em] text-[#66716e] uppercase">
                {selectedData.isSafeMode || selectedData.action === "SELECT" ? (
                  <CheckCircle2 size={11} color={selectedAccent} aria-hidden="true" />
                ) : selectedData.impactType === "RESTRICT" ? (
                  <LockKeyhole size={11} color={selectedAccent} aria-hidden="true" />
                ) : (
                  <ShieldAlert size={11} color={selectedAccent} aria-hidden="true" />
                )}
                simulation result
              </span>
              <strong
                className="block font-mono text-[10px] font-semibold"
                style={{ color: selectedAccent }}
              >
                {selectedData.statusLabel}
              </strong>
              <p className="mt-1.5 text-[9px] leading-relaxed text-[#8a9491]">
                {selectedData.statusText}
              </p>
            </div>

            <dl className="overflow-hidden rounded-[9px] border border-white/[0.08] bg-black/10">
              <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-white/[0.06] px-3 py-2.5">
                <dt className="font-mono text-[7px] font-semibold tracking-[0.04em] text-[#596360] uppercase">Role</dt>
                <dd className="m-0 text-[9px] font-medium text-[#cbd1ce]">{selectedData.roleLabel}</dd>
              </div>
              <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-white/[0.06] px-3 py-2.5">
                <dt className="font-mono text-[7px] font-semibold tracking-[0.04em] text-[#596360] uppercase">Route / policy</dt>
                <dd className="m-0 break-words font-mono text-[8px] leading-relaxed text-[#aab2af]">{selectedData.relationshipRule}</dd>
              </div>
              <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-white/[0.06] px-3 py-2.5">
                <dt className="font-mono text-[7px] font-semibold tracking-[0.04em] text-[#596360] uppercase">Measured impact</dt>
                <dd className="m-0 font-mono text-[9px] font-semibold" style={{ color: selectedAccent }}>{selectedData.impactLabel}</dd>
              </div>
              <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 px-3 py-2.5">
                <dt className="font-mono text-[7px] font-semibold tracking-[0.04em] text-[#596360] uppercase">Table volume</dt>
                <dd className="m-0 font-mono text-[9px] text-[#aab2af]">
                  {selectedData.totalRows > 0 ? `${formatNumber(selectedData.totalRows)} rows` : "Schema object"}
                </dd>
              </div>
            </dl>

            <p className="flex items-center gap-1.5 px-1 font-mono text-[7px] leading-relaxed text-[#596360]">
              <GitBranch size={11} aria-hidden="true" /> Select another node to compare its verified path.
            </p>
          </div>

          <div className="border-t border-white/[0.07] p-3">
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="flex min-h-11 w-full items-center justify-center rounded-[9px] border border-white/[0.1] bg-white/[0.035] text-[9px] font-semibold text-[#ccd1ce] transition-colors hover:border-white/[0.17] hover:bg-white/[0.065]"
            >
              Return to topology
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
