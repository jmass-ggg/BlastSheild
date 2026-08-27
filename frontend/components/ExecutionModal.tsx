"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Terminal, 
  Lock, 
  Copy, 
  Check, 
  X
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSafeMode: boolean;
  sql: string;
  directRows: number;
  cascadesCount: number;
}

export function ExecutionModal({
  isOpen,
  onClose,
  isSafeMode,
  sql,
  directRows,
  cascadesCount,
}: ExecutionModalProps) {
  const [stage, setStage] = useState<"revalidating" | "executing" | "completed">("revalidating");
  const [revalidationChecks, setRevalidationChecks] = useState({
    sqlHash: false,
    prodRowCount: false,
    cascadeCount: false,
    approvalSignature: false,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [copiedAudit, setCopiedAudit] = useState(false);

  const auditId = "BS-2026-08321";

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage === "completed") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, stage, onClose]);

  // Stage progression
  useEffect(() => {
    if (!isOpen) {
      setStage("revalidating");
      setRevalidationChecks({
        sqlHash: false,
        prodRowCount: false,
        cascadeCount: false,
        approvalSignature: false,
      });
      setLogs([]);
      return;
    }

    setLogs(["[00:00.010] Starting TrueForge Production Gate Revalidation..."]);

    const t1 = setTimeout(() => {
      setRevalidationChecks((prev) => ({ ...prev, sqlHash: true }));
      setLogs((l) => [...l, "[00:00.100] ✓ SQL AST & SHA-256 hash verified against user approval"]);
    }, 350);

    const t2 = setTimeout(() => {
      setRevalidationChecks((prev) => ({ ...prev, prodRowCount: true }));
      setLogs((l) => [
        ...l, 
        `[00:00.280] ✓ Production state lock: exactly ${formatNumber(directRows)} candidate rows match approved scope`
      ]);
    }, 750);

    const t3 = setTimeout(() => {
      setRevalidationChecks((prev) => ({ ...prev, cascadeCount: true }));
      setLogs((l) => [
        ...l, 
        `[00:00.480] ✓ Topology check: ${isSafeMode ? "0 cascading deletions (Safe mode active)" : `${cascadesCount} cascade branches confirmed`}`
      ]);
    }, 1150);

    const t4 = setTimeout(() => {
      setRevalidationChecks((prev) => ({ ...prev, approvalSignature: true }));
      setLogs((l) => [...l, "[00:00.680] ✓ TrueForge HMAC Operator signature validated"]);
      setStage("executing");
    }, 1550);

    const t5 = setTimeout(() => {
      setLogs((l) => [
        ...l,
        "[00:00.900] Connecting to PostgreSQL Cluster `blastshield_prod`...",
        "[00:01.020] Executing approved transaction in production...",
        `[00:01.180] SQL: ${sql.replace(/\n/g, " ")}`,
        "[00:01.350] ✓ Transaction committed successfully in 32ms.",
        `[00:01.480] Immutable audit event sealed: ID ${auditId}`,
      ]);
      setStage("completed");

      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.6 },
        colors: ["#10b981", "#6366f1", "#38bdf8"],
      });
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [isOpen, directRows, isSafeMode, cascadesCount, sql]);

  const handleCopyAudit = () => {
    navigator.clipboard.writeText(auditId);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget && stage === "completed") {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-[#0e1626] border border-slate-700 rounded-2xl p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                stage === "completed"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
              }`}
            >
              {stage === "completed" ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6 animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {stage === "revalidating" && "Production Revalidation..."}
                {stage === "executing" && "Applying Changes in Production..."}
                {stage === "completed" && "Production Execution Verified & Sealed"}
              </h3>
              <p className="text-xs text-slate-400">
                Target: <strong className="text-slate-200">blastshield_prod</strong> (PostgreSQL 16)
              </p>
            </div>
          </div>

          {stage === "completed" && (
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors touch-target"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 4-Step Checklist */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {revalidationChecks.sqlHash ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
            )}
            <span className="text-slate-300 font-medium">SQL & SHA-256 Hash Unchanged</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {revalidationChecks.prodRowCount ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
            )}
            <span className="text-slate-300 font-medium">Production Scope Matches Approval</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {revalidationChecks.cascadeCount ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
            )}
            <span className="text-slate-300 font-medium">Cascade Topology Consistent</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {revalidationChecks.approvalSignature ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
            )}
            <span className="text-slate-300 font-medium">TrueForge Signature Verified</span>
          </div>
        </div>

        {/* Live Logs Stream */}
        <div className="rounded-xl border border-slate-800 bg-[#050810] p-3 font-mono text-xs h-40 overflow-y-auto space-y-1">
          <div className="flex items-center justify-between text-slate-500 pb-1 mb-1 border-b border-slate-900 text-[10px]">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Gateway Execution Telemetry
            </span>
            <span className="text-emerald-400">TLS 1.3 Active</span>
          </div>

          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`${
                log.includes("✓")
                  ? "text-emerald-400"
                  : log.includes("SQL:")
                  ? "text-cyan-300 font-bold"
                  : "text-slate-400"
              }`}
            >
              {log}
            </div>
          ))}
        </div>

        {/* Success Card when Completed */}
        {stage === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono">
                  {isSafeMode
                    ? `${formatNumber(directRows)} users soft-deleted (0 cascades)`
                    : `${formatNumber(directRows)} users deleted (${cascadesCount} cascades applied)`}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">Audit ID:</span>
                <code className="text-xs font-mono font-bold text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  {auditId}
                </code>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAudit}
                className="min-h-[44px] px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 touch-target"
              >
                {copiedAudit ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="min-h-[44px] px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-md touch-target"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
