"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Layers,
  ShoppingCart,
  CreditCard,
  FileText,
  Clock,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Table as TableIcon,
  GitBranch,
} from "lucide-react";

interface SchemaImpactTreeProps {
  onNodeClick?: (tableName: string) => void;
  selectedTable?: string;
  isCompact?: boolean;
}

export function SchemaImpactTree({
  onNodeClick,
  selectedTable,
  isCompact = false,
}: SchemaImpactTreeProps) {
  const [viewMode, setViewMode] = useState<"graph" | "table">("graph");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.8), 1.3));
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none">
      {/* Top Header Controls */}
      {!isCompact && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/80">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Database Schema Impact</span>
            </h4>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("graph")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "graph"
                    ? "bg-[#6366F1] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Graph View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-[#6366F1] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {!isCompact && viewMode === "graph" && (
        <div className="flex items-center gap-4 mb-3 text-[11px] text-slate-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            Directly Affected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Indirectly Affected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            Not Affected
          </span>
        </div>
      )}

      {/* Main Canvas Area */}
      {viewMode === "graph" ? (
        <div
          className={`relative w-full rounded-2xl overflow-hidden bg-[#FAFBFF] border border-slate-200/80 p-6 flex flex-col items-center justify-center transition-all ${
            isCompact ? "min-h-[220px]" : "min-h-[360px]"
          }`}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
        >
          {/* Zoom controls floating on right */}
          {!isCompact && (
            <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20 bg-white/90 backdrop-blur rounded-lg p-1 border border-slate-200 shadow-sm">
              <button
                onClick={() => handleZoom(0.1)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-sm font-bold"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => handleZoom(-0.1)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-sm font-bold"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-xs"
                title="Reset View"
              >
                <Maximize2 size={12} />
              </button>
            </div>
          )}

          {/* Root Node: users */}
          <div className="relative z-10 mb-6">
            <motion.div
              whileHover={{ scale: 1.04 }}
              onClick={() => onNodeClick?.("users")}
              className="w-[150px] p-3 rounded-2xl bg-white border-2 border-rose-400/90 shadow-[0_10px_25px_rgba(244,63,94,0.22)] cursor-pointer text-center flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                <span className="p-1 rounded-md bg-rose-100 text-rose-600">
                  <Database size={12} />
                </span>
                <span>users</span>
              </div>
              <span className="text-base font-extrabold text-slate-900 font-mono">12,481</span>
              <span className="text-[10px] text-slate-500">rows affected</span>
            </motion.div>
          </div>

          {/* SVG Connecting Dashed Cascade Lines */}
          <div className="relative w-full max-w-[520px] h-[50px] pointer-events-none">
            <svg viewBox="0 0 520 50" className="w-full h-full overflow-visible">
              <defs>
                <marker
                  id="arrow-cascade"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#F97316" />
                </marker>
              </defs>

              {/* Branch to Subscriptions (Left: x=65) */}
              <path
                d="M 260,0 L 65,45"
                stroke="#F97316"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                markerEnd="url(#arrow-cascade)"
                fill="none"
              />
              {/* Branch to Orders (Center-Left: x=195) */}
              <path
                d="M 260,0 L 195,45"
                stroke="#F97316"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                markerEnd="url(#arrow-cascade)"
                fill="none"
              />
              {/* Branch to Invoices (Center-Right: x=325) */}
              <path
                d="M 260,0 L 325,45"
                stroke="#F97316"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                markerEnd="url(#arrow-cascade)"
                fill="none"
              />
              {/* Branch to Sessions (Right: x=455) */}
              <path
                d="M 260,0 L 455,45"
                stroke="#F97316"
                strokeWidth="1.8"
                strokeDasharray="4 3"
                markerEnd="url(#arrow-cascade)"
                fill="none"
              />
            </svg>
          </div>

          {/* Child Nodes Row */}
          <div className="relative z-10 w-full max-w-[560px] grid grid-cols-4 gap-3 text-center mt-1">
            {/* 1. Subscriptions */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              onClick={() => onNodeClick?.("subscriptions")}
              className="p-2.5 rounded-xl bg-white border border-rose-200 shadow-[0_4px_12px_rgba(244,63,94,0.1)] cursor-pointer flex flex-col items-center"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                <span className="p-0.5 rounded bg-rose-50 text-rose-500">
                  <Calendar size={11} />
                </span>
                <span className="truncate">subscriptions</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900 font-mono">347</span>
              <span className="text-[9px] text-slate-400">rows affected</span>
            </motion.div>

            {/* 2. Orders & child Payments */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.04 }}
                onClick={() => onNodeClick?.("orders")}
                className="w-full p-2.5 rounded-xl bg-white border border-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.1)] cursor-pointer flex flex-col items-center"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span className="p-0.5 rounded bg-amber-50 text-amber-500">
                    <ShoppingCart size={11} />
                  </span>
                  <span>orders</span>
                </div>
                <span className="text-sm font-extrabold text-slate-900 font-mono">21,003</span>
                <span className="text-[9px] text-slate-400">rows affected</span>
              </motion.div>

              {/* Vertical connector down to payments */}
              <div className="w-0.5 h-4 border-l-2 border-dashed border-amber-400 my-1" />

              {/* Payments Child Node */}
              <motion.div
                whileHover={{ scale: 1.04 }}
                onClick={() => onNodeClick?.("payments")}
                className="w-full p-2.5 rounded-xl bg-white border border-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.1)] cursor-pointer flex flex-col items-center"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                  <span className="p-0.5 rounded bg-amber-50 text-amber-500">
                    <CreditCard size={11} />
                  </span>
                  <span>payments</span>
                </div>
                <span className="text-sm font-extrabold text-slate-900 font-mono">18,201</span>
                <span className="text-[9px] text-slate-400">rows affected</span>
              </motion.div>
            </div>

            {/* 3. Invoices */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              onClick={() => onNodeClick?.("invoices")}
              className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.1)] cursor-pointer flex flex-col items-center h-fit"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                <span className="p-0.5 rounded bg-amber-50 text-amber-500">
                  <FileText size={11} />
                </span>
                <span>invoices</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900 font-mono">5,102</span>
              <span className="text-[9px] text-slate-400">rows affected</span>
            </motion.div>

            {/* 4. Sessions */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              onClick={() => onNodeClick?.("sessions")}
              className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-[0_4px_12px_rgba(245,158,11,0.1)] cursor-pointer flex flex-col items-center h-fit"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-0.5">
                <span className="p-0.5 rounded bg-amber-50 text-amber-500">
                  <Clock size={11} />
                </span>
                <span>sessions</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900 font-mono">9,682</span>
              <span className="text-[9px] text-slate-400">rows affected</span>
            </motion.div>
          </div>

          {/* Bottom Cascade Legend Tag */}
          {!isCompact && (
            <div className="mt-5 text-[11px] font-mono text-slate-500 flex items-center gap-2">
              <span className="w-6 border-b-2 border-dashed border-amber-500 inline-block" />
              <span>Cascading (ON DELETE CASCADE)</span>
            </div>
          )}
        </div>
      ) : (
        /* Table View Mode */
        <div className="w-full rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm p-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                <th className="pb-2">Target Table</th>
                <th className="pb-2">Impact Type</th>
                <th className="pb-2">Rows Deleted</th>
                <th className="pb-2">Cascade Relationship</th>
                <th className="pb-2 text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr className="hover:bg-slate-50/80">
                <td className="py-2.5 font-bold text-slate-800">public.users</td>
                <td><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">DIRECT</span></td>
                <td className="font-bold text-slate-900">12,481</td>
                <td className="text-slate-500">Target of DELETE mutation</td>
                <td className="text-right text-rose-600 font-bold">CRITICAL</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-2.5 font-bold text-slate-800">public.orders</td>
                <td><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">CASCADE</span></td>
                <td className="font-bold text-slate-900">21,003</td>
                <td className="text-slate-500">FK user_id → users.id</td>
                <td className="text-right text-amber-600 font-bold">HIGH</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-2.5 font-bold text-slate-800">public.payments</td>
                <td><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">CASCADE L2</span></td>
                <td className="font-bold text-slate-900">18,201</td>
                <td className="text-slate-500">FK order_id → orders.id</td>
                <td className="text-right text-amber-600 font-bold">HIGH</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-2.5 font-bold text-slate-800">public.sessions</td>
                <td><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">CASCADE</span></td>
                <td className="font-bold text-slate-900">9,682</td>
                <td className="text-slate-500">FK user_id → users.id</td>
                <td className="text-right text-amber-600 font-bold">MEDIUM</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-2.5 font-bold text-slate-800">public.invoices</td>
                <td><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">CASCADE</span></td>
                <td className="font-bold text-slate-900">5,102</td>
                <td className="text-slate-500">FK user_id → users.id</td>
                <td className="text-right text-amber-600 font-bold">HIGH</td>
              </tr>
              <tr className="hover:bg-slate-50/80">
                <td className="py-2.5 font-bold text-slate-800">public.subscriptions</td>
                <td><span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">CASCADE</span></td>
                <td className="font-bold text-slate-900">347</td>
                <td className="text-slate-500">FK user_id → users.id (Active MRR)</td>
                <td className="text-right text-rose-600 font-bold">CRITICAL</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
