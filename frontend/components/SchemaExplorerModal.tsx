"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DEMO_SCHEMA_TABLES } from "@/lib/mockData";
import { Database, Table, Key, Link2, X } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface SchemaExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SchemaExplorerModal({ isOpen, onClose }: SchemaExplorerModalProps) {
  const [selectedTable, setSelectedTable] = useState<string>("users");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTable = DEMO_SCHEMA_TABLES.find((t) => t.name === selectedTable) || DEMO_SCHEMA_TABLES[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#0c121e] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                Production Database Schema & Cascade Rules
                <span className="text-xs font-sans px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  PostgreSQL 16
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                SaaS Demo Database: 6 Tables • 305,000 Seed Records • 4 Foreign Key Cascades
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors touch-target"
            aria-label="Close Schema Explorer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Tables List + Right Column Details */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Tables List */}
          <div className="w-full md:w-60 border-r border-slate-800 bg-slate-950/60 p-3 space-y-1 overflow-y-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 block mb-2">
              Database Tables
            </span>
            {DEMO_SCHEMA_TABLES.map((table) => {
              const isSelected = table.name === selectedTable;
              const hasCascade = table.foreignKeys.some((fk) => fk.cascadeAction === "CASCADE");

              return (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table.name)}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-mono transition-all touch-target ${
                    isSelected
                      ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 font-bold"
                      : "text-slate-300 hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Table className="w-3.5 h-3.5 text-slate-400" />
                    <span>{table.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasCascade && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Contains ON DELETE CASCADE" />
                    )}
                    <span className="text-xs text-slate-500 font-sans">
                      {formatNumber(table.rowCount)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Table Schema Details */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black font-mono text-white">
                    {currentTable.name}
                  </h4>
                  <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {formatNumber(currentTable.rowCount)} rows
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {currentTable.description}
                </p>
              </div>
            </div>

            {/* Columns Table */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-mono flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-indigo-400" />
                Columns & Types
              </h5>
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Column Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Constraints</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {currentTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200 flex items-center gap-2">
                          {col.isPrimary && <Key className="w-3.5 h-3.5 text-amber-400" />}
                          {col.isForeign && <Link2 className="w-3.5 h-3.5 text-indigo-400" />}
                          {col.name}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-400 text-xs">
                          {col.type}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-xs">
                          {col.isPrimary ? (
                            <span className="text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                              PRIMARY KEY
                            </span>
                          ) : col.isForeign ? (
                            <span className="text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/30">
                              FK → {col.foreignTo}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Foreign Key Cascades */}
            {currentTable.foreignKeys.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-mono flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-rose-400" />
                  Foreign Key Cascade Rules
                </h5>
                <div className="space-y-2">
                  {currentTable.foreignKeys.map((fk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-950/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-200">
                          {fk.sourceTable}.{fk.sourceColumn} ➔ {fk.targetTable}.{fk.targetColumn}
                        </span>
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                            fk.cascadeAction === "CASCADE"
                              ? "bg-rose-950 text-rose-300 border-rose-500/40"
                              : "bg-amber-950 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          ON DELETE {fk.cascadeAction}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {fk.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Schema snapshot: Synchronized with PostgreSQL prod</span>
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors touch-target"
          >
            Close Explorer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
