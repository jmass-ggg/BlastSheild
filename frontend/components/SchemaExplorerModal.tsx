"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Database,
  GitBranch,
  Key,
  Link2,
  Rows3,
  ShieldCheck,
  Table2,
  X,
} from "lucide-react";
import { DEMO_SCHEMA_TABLES } from "@/lib/mockData";
import { formatNumber } from "@/lib/utils";

interface SchemaExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCHEMA_RECORD_COUNT = 405_000;

export function SchemaExplorerModal({ isOpen, onClose }: SchemaExplorerModalProps) {
  const [selectedTable, setSelectedTable] = useState("users");
  const dialogRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTable =
    DEMO_SCHEMA_TABLES.find((table) => table.name === selectedTable) ??
    DEMO_SCHEMA_TABLES[0];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6"
      style={{
        background: "rgba(1, 2, 3, 0.82)",
        backdropFilter: "blur(18px) saturate(80%)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schema-explorer-title"
        aria-describedby="schema-explorer-description"
        tabIndex={-1}
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.975, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.985, y: 10 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex min-h-0 w-full max-w-[1120px] flex-col overflow-hidden rounded-[20px] outline-none"
        style={{
          height: "min(780px, calc(100dvh - 24px))",
          border: "1px solid var(--line-strong)",
          background:
            "linear-gradient(145deg, rgba(20, 24, 27, 0.995), rgba(8, 11, 13, 0.995) 62%)",
          boxShadow:
            "0 38px 120px rgba(0, 0, 0, 0.76), inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 1px rgba(155, 167, 255, 0.035)",
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(155, 167, 255, 0.7), rgba(114, 219, 232, 0.52), transparent)",
          }}
        />

        <header
          className="relative z-10 flex shrink-0 items-start justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5"
          style={{
            borderBottom: "1px solid var(--line)",
            background: "rgba(12, 15, 18, 0.86)",
          }}
        >
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div
              className="relative grid size-11 shrink-0 place-items-center rounded-xl"
              style={{
                color: "var(--brand-bright)",
                border: "1px solid rgba(155, 167, 255, 0.25)",
                background:
                  "radial-gradient(circle at 50% 45%, rgba(114, 219, 232, 0.16), transparent 58%), rgba(155, 167, 255, 0.07)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
              }}
            >
              <Database className="size-5" strokeWidth={1.7} aria-hidden="true" />
              <span
                className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full"
                style={{
                  border: "2px solid var(--surface)",
                  background: "var(--safe)",
                  boxShadow: "0 0 9px rgba(104, 227, 179, 0.6)",
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className="font-mono text-[8px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: "var(--cyan)" }}
                >
                  Containment chamber / topology
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    color: "var(--safe-soft)",
                    border: "1px solid rgba(104, 227, 179, 0.18)",
                    background: "rgba(104, 227, 179, 0.055)",
                  }}
                >
                  <Activity className="size-3" aria-hidden="true" /> Live snapshot
                </span>
              </div>
              <h2
                id="schema-explorer-title"
                className="truncate text-[17px] font-semibold tracking-[-0.025em] sm:text-xl"
                style={{ color: "var(--ink)" }}
              >
                Production schema atlas
              </h2>
              <p
                id="schema-explorer-description"
                className="mt-1 max-w-2xl text-[10px] leading-5 sm:text-[11px]"
                style={{ color: "var(--muted)" }}
              >
                Inspect relational boundaries and deletion propagation before a statement crosses the production gate.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px]" style={{ color: "var(--faint)" }}>
                <span className="inline-flex items-center gap-1.5">
                  <Table2 className="size-3.5" aria-hidden="true" />
                  {DEMO_SCHEMA_TABLES.length} entities
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Rows3 className="size-3.5" aria-hidden="true" />
                  {formatNumber(SCHEMA_RECORD_COUNT)} records
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GitBranch className="size-3.5" aria-hidden="true" />
                  4 cascade paths
                </span>
                <span className="hidden sm:inline">PostgreSQL 16</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-xl transition duration-150 hover:-translate-y-px"
            style={{
              color: "var(--muted)",
              border: "1px solid var(--line)",
              background: "rgba(255,255,255,0.025)",
            }}
            aria-label="Close schema explorer"
          >
            <X className="size-[18px]" aria-hidden="true" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <aside
            className="max-h-[188px] shrink-0 overflow-y-auto p-3 md:max-h-none md:w-[278px] md:p-4"
            style={{
              borderBottom: "1px solid var(--line)",
              background: "rgba(4, 6, 7, 0.34)",
            }}
            aria-label="Database tables"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--faint)" }}>
                Entity index
              </span>
              <span className="font-mono text-[8px]" style={{ color: "var(--faint)" }}>
                ROWS
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-1" role="list">
              {DEMO_SCHEMA_TABLES.map((table) => {
                const isSelected = table.name === currentTable.name;
                const hasCascade = table.foreignKeys.some(
                  (foreignKey) => foreignKey.cascadeAction === "CASCADE",
                );

                return (
                  <button
                    key={table.name}
                    type="button"
                    onClick={() => setSelectedTable(table.name)}
                    aria-pressed={isSelected}
                    className="group flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-left transition duration-150"
                    style={{
                      color: isSelected ? "var(--ink)" : "var(--ink-soft)",
                      border: isSelected
                        ? "1px solid rgba(155, 167, 255, 0.22)"
                        : "1px solid transparent",
                      background: isSelected
                        ? "linear-gradient(90deg, rgba(155, 167, 255, 0.115), rgba(114, 219, 232, 0.035))"
                        : "transparent",
                      boxShadow: isSelected ? "inset 2px 0 0 var(--brand)" : "none",
                    }}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Table2
                        className="size-3.5 shrink-0"
                        style={{ color: isSelected ? "var(--brand-bright)" : "var(--faint)" }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-mono text-[10px] font-semibold">{table.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {hasCascade && (
                        <span
                          className="size-1.5 rounded-full"
                          style={{
                            background: "var(--danger)",
                            boxShadow: "0 0 7px rgba(255, 107, 97, 0.48)",
                          }}
                          title="Contains an ON DELETE CASCADE rule"
                        />
                      )}
                      <span className="font-mono text-[8px]" style={{ color: "var(--faint)" }}>
                        {formatNumber(table.rowCount)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6" aria-live="polite">
            <div className="mx-auto max-w-[760px] space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="mb-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--cyan)" }}>
                    Selected relation
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-mono text-xl font-semibold tracking-[-0.03em]" style={{ color: "var(--ink)" }}>
                      public.{currentTable.name}
                    </h3>
                    <span
                      className="rounded-full px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em]"
                      style={{
                        color: "var(--ink-soft)",
                        border: "1px solid var(--line)",
                        background: "rgba(255,255,255,0.025)",
                      }}
                    >
                      {formatNumber(currentTable.rowCount)} rows
                    </span>
                  </div>
                  <p className="mt-2 max-w-xl text-[11px] leading-5" style={{ color: "var(--muted)" }}>
                    {currentTable.description}
                  </p>
                </div>
                <div
                  className="flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    color: "var(--safe)",
                    border: "1px solid rgba(104, 227, 179, 0.15)",
                    background: "rgba(104, 227, 179, 0.045)",
                  }}
                >
                  <ShieldCheck className="size-3.5" aria-hidden="true" /> Metadata verified
                </div>
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--ink-soft)" }}>
                    <Table2 className="size-3.5" style={{ color: "var(--brand)" }} aria-hidden="true" />
                    Column registry
                  </h4>
                  <span className="font-mono text-[8px]" style={{ color: "var(--faint)" }}>
                    {currentTable.columns.length} fields
                  </span>
                </div>
                <div
                  className="overflow-x-auto rounded-xl"
                  style={{ border: "1px solid var(--line)", background: "rgba(0,0,0,0.2)" }}
                >
                  <table className="w-full min-w-[560px] border-collapse text-left">
                    <thead style={{ background: "rgba(255,255,255,0.025)" }}>
                      <tr style={{ borderBottom: "1px solid var(--line)" }}>
                        <th scope="col" className="px-4 py-3 font-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--faint)" }}>
                          Field
                        </th>
                        <th scope="col" className="px-4 py-3 font-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--faint)" }}>
                          Data type
                        </th>
                        <th scope="col" className="px-4 py-3 font-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--faint)" }}>
                          Boundary
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTable.columns.map((column) => (
                        <tr key={column.name} style={{ borderBottom: "1px solid var(--line)" }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold" style={{ color: "var(--ink-soft)" }}>
                              {column.isPrimary && <Key className="size-3.5" style={{ color: "var(--amber)" }} aria-hidden="true" />}
                              {column.isForeign && <Link2 className="size-3.5" style={{ color: "var(--brand)" }} aria-hidden="true" />}
                              {!column.isPrimary && !column.isForeign && <span className="size-3.5" aria-hidden="true" />}
                              {column.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[9px]" style={{ color: "var(--cyan)" }}>
                            {column.type}
                          </td>
                          <td className="px-4 py-3 font-mono text-[8px]">
                            {column.isPrimary ? (
                              <span className="rounded-md px-2 py-1 font-bold" style={{ color: "var(--amber)", border: "1px solid rgba(239, 196, 110, 0.18)", background: "rgba(239, 196, 110, 0.05)" }}>
                                PRIMARY KEY
                              </span>
                            ) : column.isForeign ? (
                              <span className="rounded-md px-2 py-1" style={{ color: "var(--brand-bright)", border: "1px solid rgba(155, 167, 255, 0.18)", background: "rgba(155, 167, 255, 0.05)" }}>
                                FK → {column.foreignTo}
                              </span>
                            ) : (
                              <span style={{ color: "var(--faint)" }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--ink-soft)" }}>
                    <GitBranch className="size-3.5" style={{ color: "var(--danger-soft)" }} aria-hidden="true" />
                    Propagation policy
                  </h4>
                  <span className="font-mono text-[8px]" style={{ color: "var(--faint)" }}>
                    {currentTable.foreignKeys.length || "No"} {currentTable.foreignKeys.length === 1 ? "rule" : "rules"}
                  </span>
                </div>

                {currentTable.foreignKeys.length > 0 ? (
                  <div className="space-y-2">
                    {currentTable.foreignKeys.map((foreignKey) => {
                      const isCascade = foreignKey.cascadeAction === "CASCADE";
                      return (
                        <article
                          key={`${foreignKey.sourceTable}-${foreignKey.sourceColumn}-${foreignKey.targetTable}`}
                          className="rounded-xl p-3.5 sm:p-4"
                          style={{
                            border: `1px solid ${isCascade ? "rgba(255, 107, 97, 0.16)" : "rgba(239, 196, 110, 0.16)"}`,
                            background: isCascade
                              ? "linear-gradient(90deg, rgba(255, 107, 97, 0.052), rgba(0,0,0,0.14))"
                              : "linear-gradient(90deg, rgba(239, 196, 110, 0.045), rgba(0,0,0,0.14))",
                          }}
                        >
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                            <code className="break-all font-mono text-[9px] font-semibold sm:text-[10px]" style={{ color: "var(--ink-soft)" }}>
                              {foreignKey.sourceTable}.{foreignKey.sourceColumn}
                              <span className="mx-2" style={{ color: "var(--faint)" }}>→</span>
                              {foreignKey.targetTable}.{foreignKey.targetColumn}
                            </code>
                            <span
                              className="w-fit shrink-0 rounded-md px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.08em]"
                              style={{
                                color: isCascade ? "var(--danger-soft)" : "var(--amber)",
                                border: `1px solid ${isCascade ? "rgba(255, 107, 97, 0.23)" : "rgba(239, 196, 110, 0.22)"}`,
                                background: isCascade ? "rgba(255, 107, 97, 0.065)" : "rgba(239, 196, 110, 0.06)",
                              }}
                            >
                              ON DELETE {foreignKey.cascadeAction}
                            </span>
                          </div>
                          <p className="mt-2 text-[10px] leading-5" style={{ color: "var(--muted)" }}>
                            {foreignKey.description}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="flex min-h-20 items-center gap-3 rounded-xl px-4"
                    style={{ border: "1px solid var(--line)", background: "rgba(104, 227, 179, 0.025)" }}
                  >
                    <ShieldCheck className="size-5 shrink-0" style={{ color: "var(--safe)" }} aria-hidden="true" />
                    <div>
                      <p className="text-[10px] font-semibold" style={{ color: "var(--ink-soft)" }}>No outbound deletion rule</p>
                      <p className="mt-1 text-[9px]" style={{ color: "var(--muted)" }}>This relation does not cascade deletes into another table.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <footer
          className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6"
          style={{ borderTop: "1px solid var(--line)", background: "rgba(4, 6, 7, 0.46)" }}
        >
          <span className="flex min-w-0 items-center gap-2 font-mono text-[8px]" style={{ color: "var(--faint)" }}>
            <span className="size-1.5 shrink-0 rounded-full" style={{ background: "var(--safe)", boxShadow: "0 0 7px rgba(104, 227, 179, 0.45)" }} />
            <span className="truncate">Snapshot synchronized · checksum 9F:2A:7C</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[10px] px-5 text-[10px] font-semibold transition duration-150 hover:-translate-y-px"
            style={{
              color: "var(--ink)",
              border: "1px solid var(--line-strong)",
              background: "rgba(255,255,255,0.045)",
            }}
          >
            Close atlas
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
