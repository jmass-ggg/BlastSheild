"use client";

import React from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import {
  Activity,
  CreditCard,
  Eye,
  FileText,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export type DatabaseImpactType =
  | "DIRECT"
  | "CASCADE_L1"
  | "CASCADE_L2"
  | "RESTRICT"
  | "SAFE"
  | "NONE";

export interface DatabaseNodeData extends Record<string, unknown> {
  tableName: string;
  totalRows: number;
  affectedRows: number;
  impactType: DatabaseImpactType;
  action: string;
  isRoot?: boolean;
  isSafeMode?: boolean;
  statusLabel: string;
  statusText: string;
  impactLabel: string;
  roleLabel: string;
  relationshipRule: string;
  sourcePorts?: Array<"left" | "center" | "right">;
}

const tableIcons: Record<string, React.ReactNode> = {
  users: <Users size={15} aria-hidden="true" />,
  orders: <ShoppingBag size={15} aria-hidden="true" />,
  payments: <CreditCard size={15} aria-hidden="true" />,
  subscriptions: <Sparkles size={15} aria-hidden="true" />,
  invoices: <FileText size={15} aria-hidden="true" />,
  sessions: <Activity size={15} aria-hidden="true" />,
};

type NodeTone = {
  accent: string;
  border: string;
  badgeBackground: string;
  badgeColor: string;
  surface: string;
};

function getNodeTone(data: DatabaseNodeData): NodeTone {
  if (data.impactType === "RESTRICT") {
    return {
      accent: "#efc46e",
      border: "rgba(239, 196, 110, 0.27)",
      badgeBackground: "rgba(239, 196, 110, 0.075)",
      badgeColor: "#efc46e",
      surface: "linear-gradient(145deg, rgba(27, 24, 18, 0.98), rgba(12, 14, 14, 0.99))",
    };
  }

  if (data.isSafeMode) {
    return {
      accent: "#68e3b3",
      border: "rgba(104, 227, 179, 0.25)",
      badgeBackground: "rgba(104, 227, 179, 0.075)",
      badgeColor: "#a2f4d1",
      surface: "linear-gradient(145deg, rgba(17, 27, 23, 0.98), rgba(10, 15, 14, 0.99))",
    };
  }

  if (data.action === "SELECT" || data.impactType === "NONE") {
    return {
      accent: "#9ba7ff",
      border: "rgba(155, 167, 255, 0.23)",
      badgeBackground: "rgba(155, 167, 255, 0.075)",
      badgeColor: "#bec6ff",
      surface: "linear-gradient(145deg, rgba(20, 22, 30, 0.98), rgba(11, 14, 17, 0.99))",
    };
  }

  return {
    accent: "#ff6b61",
    border: "rgba(255, 107, 97, 0.3)",
    badgeBackground: "rgba(255, 107, 97, 0.075)",
    badgeColor: "#ff9a91",
    surface: "linear-gradient(145deg, rgba(30, 20, 19, 0.98), rgba(13, 14, 15, 0.99))",
  };
}

function getStatusIcon(data: DatabaseNodeData, color: string) {
  if (data.impactType === "RESTRICT" || data.isSafeMode) {
    return <ShieldCheck size={11} color={color} aria-hidden="true" />;
  }

  if (data.action === "SELECT" || data.impactType === "NONE") {
    return <Eye size={11} color={color} aria-hidden="true" />;
  }

  return <ShieldAlert size={11} color={color} aria-hidden="true" />;
}

const portPositions = {
  left: "25%",
  center: "50%",
  right: "75%",
};

export function DatabaseTableNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as DatabaseNodeData;
  const tone = getNodeTone(nodeData);
  const isContainedDependency = nodeData.isSafeMode && !nodeData.isRoot;

  return (
    <div
      role="group"
      aria-label={`${nodeData.tableName}: ${nodeData.statusLabel}. ${nodeData.statusText}`}
      style={{
        position: "relative",
        width: 210,
        paddingRight: 6,
        paddingBottom: 7,
        fontFamily: "var(--font-sans, sans-serif)",
        userSelect: "none",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "7px 0 0 7px",
          border: "1px solid rgba(238, 244, 240, 0.06)",
          borderRadius: 12,
          background: "rgba(3, 5, 6, 0.9)",
          boxShadow: "0 18px 30px rgba(0, 0, 0, 0.34)",
        }}
      />

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          border: `1px solid ${selected ? tone.accent : tone.border}`,
          borderRadius: 12,
          background: tone.surface,
          boxShadow: selected
            ? `0 0 0 3px ${tone.badgeBackground}, 0 18px 36px rgba(0, 0, 0, 0.38)`
            : "inset 0 1px 0 rgba(255, 255, 255, 0.045), 0 12px 30px rgba(0, 0, 0, 0.28)",
          transition: "border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${tone.accent}, ${tone.accent}55 44%, transparent 82%)`,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            minHeight: 27,
            padding: "5px 9px",
            borderBottom: "1px solid rgba(238, 244, 240, 0.065)",
            background: "rgba(255, 255, 255, 0.018)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              color: "#687270",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 7,
              fontWeight: 700,
              letterSpacing: "0.075em",
              textTransform: "uppercase",
            }}
          >
            <span
              aria-hidden="true"
              style={{ width: 4, height: 4, borderRadius: 999, background: tone.accent }}
            />
            {nodeData.roleLabel}
          </span>

          <span
            style={{
              overflow: "hidden",
              maxWidth: 96,
              padding: "3px 6px",
              border: `1px solid ${tone.border}`,
              borderRadius: 5,
              color: tone.badgeColor,
              background: tone.badgeBackground,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 7,
              fontWeight: 750,
              letterSpacing: "0.055em",
              textOverflow: "ellipsis",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {nodeData.statusLabel}
          </span>
        </div>

        <div style={{ padding: "9px 10px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              aria-hidden="true"
              style={{
                display: "inline-grid",
                width: 29,
                height: 29,
                flex: "0 0 auto",
                placeItems: "center",
                border: `1px solid ${tone.border}`,
                borderRadius: 8,
                color: tone.accent,
                background: tone.badgeBackground,
              }}
            >
              {tableIcons[nodeData.tableName] ?? <FileText size={15} />}
            </span>

            <div style={{ minWidth: 0, flex: 1 }}>
              <strong
                style={{
                  display: "block",
                  overflow: "hidden",
                  color: "#f4f2ec",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 12,
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                public.{nodeData.tableName}
              </strong>
              <span
                style={{
                  display: "block",
                  marginTop: 2,
                  color: "#64706d",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 7,
                }}
              >
                {nodeData.totalRows > 0 ? `${formatNumber(nodeData.totalRows)} rows indexed` : "schema object"}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              alignItems: "end",
              gap: 10,
              marginTop: 9,
              paddingTop: 8,
              borderTop: "1px solid rgba(238, 244, 240, 0.055)",
            }}
          >
            <span
              style={{
                overflow: "hidden",
                color: "#616b69",
                fontSize: 8,
                lineHeight: 1.35,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isContainedDependency ? "No delete event received" : nodeData.relationshipRule}
            </span>
            <strong
              style={{
                color: tone.badgeColor,
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              {nodeData.impactLabel}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 7,
              color: tone.badgeColor,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 7,
              fontWeight: 650,
              letterSpacing: "0.025em",
            }}
          >
            {getStatusIcon(nodeData, tone.accent)}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {nodeData.statusText}
            </span>
          </div>
        </div>
      </div>

      <Handle
        id="target"
        type="target"
        position={Position.Top}
        aria-label={`Incoming relationship to ${nodeData.tableName}`}
        style={{
          top: -4,
          width: 8,
          height: 8,
          border: "2px solid #090c0e",
          borderRadius: 999,
          background: tone.accent,
          boxShadow: `0 0 0 1px ${tone.border}`,
        }}
      />

      {nodeData.sourcePorts?.map((port) => (
        <Handle
          key={port}
          id={`source-${port}`}
          type="source"
          position={Position.Bottom}
          aria-label={`Outgoing ${port} relationship from ${nodeData.tableName}`}
          style={{
            bottom: 2,
            left: portPositions[port],
            width: 8,
            height: 8,
            border: "2px solid #090c0e",
            borderRadius: 999,
            background: tone.accent,
            boxShadow: `0 0 0 1px ${tone.border}`,
          }}
        />
      ))}
    </div>
  );
}
