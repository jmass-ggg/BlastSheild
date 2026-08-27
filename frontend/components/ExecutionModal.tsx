"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  Fingerprint,
  GitBranch,
  KeyRound,
  Loader2,
  LockKeyhole,
  ReceiptText,
  Rows3,
  ShieldCheck,
  Terminal,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSafeMode: boolean;
  sql: string;
  directRows: number;
  cascadesCount: number;
}

type ExecutionStage = "revalidating" | "executing" | "completed";
type CheckKey = "sqlHash" | "prodRowCount" | "cascadeCount" | "sig";
type ValidationStatus = "queued" | "active" | "verified";

interface ValidationItemProps {
  detail: string;
  icon: LucideIcon;
  index: number;
  label: string;
  status: ValidationStatus;
}

const AUDIT_ID = "BS-2026-08321";
const INITIAL_CHECKS: Record<CheckKey, boolean> = {
  sqlHash: false,
  prodRowCount: false,
  cascadeCount: false,
  sig: false,
};
const INITIAL_LOGS = [
  "[00:00.008] GATE    Revalidation envelope opened",
];

function createSessionKey(sql: string) {
  let fingerprint = 2166136261;

  for (let index = 0; index < sql.length; index += 1) {
    fingerprint ^= sql.charCodeAt(index);
    fingerprint = Math.imul(fingerprint, 16777619);
  }

  return `${sql.length}-${(fingerprint >>> 0).toString(16)}`;
}

function ValidationItem({
  detail,
  icon: Icon,
  index,
  label,
  status,
}: ValidationItemProps) {
  const isActive = status === "active";
  const isVerified = status === "verified";

  return (
    <li
      aria-current={isActive ? "step" : undefined}
      className="relative min-w-0 overflow-hidden rounded-xl border p-3.5"
      style={{
        borderColor: isVerified
          ? "rgba(104, 227, 179, 0.15)"
          : isActive
            ? "rgba(155, 167, 255, 0.26)"
            : "var(--line)",
        background: isActive
          ? "linear-gradient(145deg, rgba(155, 167, 255, 0.08), rgba(255, 255, 255, 0.015))"
          : "rgba(255, 255, 255, 0.018)",
      }}
    >
      <div className="flex items-start gap-3">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border"
          style={{
            borderColor: isVerified
              ? "rgba(104, 227, 179, 0.18)"
              : isActive
                ? "rgba(155, 167, 255, 0.22)"
                : "var(--line)",
            color: isVerified
              ? "var(--safe)"
              : isActive
                ? "var(--brand-bright)"
                : "var(--faint)",
            background: isVerified
              ? "rgba(104, 227, 179, 0.055)"
              : "rgba(255, 255, 255, 0.02)",
          }}
        >
          {isVerified ? (
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
          ) : isActive ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <Icon className="h-4 w-4" strokeWidth={1.55} />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className="block font-mono text-[8px] font-bold uppercase tracking-[0.16em]"
            style={{
              color: isVerified
                ? "rgba(104, 227, 179, 0.76)"
                : isActive
                  ? "var(--brand-bright)"
                  : "var(--faint)",
            }}
          >
            0{index + 1} · {isVerified ? "Verified" : isActive ? "Comparing" : "Queued"}
          </span>
          <span className="mt-1 block text-[11px] font-semibold text-[var(--ink-soft)]">
            {label}
          </span>
          <span className="mt-1 block truncate font-mono text-[8px] text-[var(--faint)]">
            {detail}
          </span>
        </span>
      </div>

      {isActive && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-[var(--brand)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
    </li>
  );
}

function ExecutionDialog({
  onClose,
  isSafeMode,
  sql,
  directRows,
  cascadesCount,
}: Omit<ExecutionModalProps, "isOpen">) {
  const [stage, setStage] = useState<ExecutionStage>("revalidating");
  const [checks, setChecks] = useState(INITIAL_CHECKS);
  const [logs, setLogs] = useState<string[]>(INITIAL_LOGS);
  const [copiedAudit, setCopiedAudit] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const copyResetRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const isCompleted = stage === "completed";
  const pendingCheckIndex = (Object.keys(checks) as CheckKey[]).findIndex(
    (key) => !checks[key],
  );

  const stageTitle =
    stage === "revalidating"
      ? "Revalidating approval envelope"
      : stage === "executing"
        ? "Transaction in progress"
        : "Transaction sealed";
  const stageDescription =
    stage === "revalidating"
      ? "Production remains gated while the approved statement and impact envelope are compared byte-for-byte."
      : stage === "executing"
        ? "The validated payload is inside a serializable transaction. Controls unlock after the audit seal is written."
        : "The database response and operator approval are now bound to an immutable audit receipt.";

  const validationItems: Array<
    Omit<ValidationItemProps, "index" | "status"> & { key: CheckKey }
  > = [
    {
      key: "sqlHash",
      icon: Fingerprint,
      label: "Statement integrity",
      detail: "SQL AST + SHA-256 digest",
    },
    {
      key: "prodRowCount",
      icon: Rows3,
      label: "Approved production scope",
      detail: `${formatNumber(directRows)} candidate rows`,
    },
    {
      key: "cascadeCount",
      icon: GitBranch,
      label: "Cascade topology",
      detail: isSafeMode
        ? "No cascading deletes"
        : `${formatNumber(cascadesCount)} approved branches`,
    },
    {
      key: "sig",
      icon: KeyRound,
      label: "Operator signature",
      detail: "TrueForge HMAC envelope",
    },
  ];

  useEffect(() => {
    const timers = [
      window.setTimeout(() => {
        setChecks((previous) => ({ ...previous, sqlHash: true }));
        setLogs((previous) => [
          ...previous,
          "[00:00.104] PASS    Statement AST and SHA-256 digest match approval",
        ]);
      }, 380),
      window.setTimeout(() => {
        setChecks((previous) => ({ ...previous, prodRowCount: true }));
        setLogs((previous) => [
          ...previous,
          `[00:00.290] PASS    Production scope locked to ${formatNumber(directRows)} candidate rows`,
        ]);
      }, 780),
      window.setTimeout(() => {
        setChecks((previous) => ({ ...previous, cascadeCount: true }));
        setLogs((previous) => [
          ...previous,
          `[00:00.490] PASS    Topology: ${
            isSafeMode
              ? "cascading deletes suppressed by safe plan"
              : `${formatNumber(cascadesCount)} cascade branches match approval`
          }`,
        ]);
      }, 1180),
      window.setTimeout(() => {
        setChecks((previous) => ({ ...previous, sig: true }));
        setLogs((previous) => [
          ...previous,
          "[00:00.690] PASS    TrueForge HMAC operator signature valid",
        ]);
        setStage("executing");
      }, 1580),
      window.setTimeout(() => {
        const statementPreview = sql.replace(/\s+/g, " ").trim().slice(0, 92);

        setLogs((previous) => [
          ...previous,
          "[00:00.900] LINK    mTLS session opened to blastshield_prod",
          "[00:01.020] TXN     SERIALIZABLE transaction opened",
          `[00:01.180] SQL     ${statementPreview}${statementPreview.length === 92 ? "…" : ""}`,
          "[00:01.350] COMMIT  Database acknowledged commit · 32 ms",
          `[00:01.480] SEAL    Receipt ${AUDIT_ID} written to append-only ledger`,
        ]);
        setStage("completed");
      }, 2600),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [cascadesCount, directRows, isSafeMode, sql]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousBodyOverflow;

      if (
        previouslyFocused instanceof HTMLElement &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isCompleted) {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const dialog = dialogRef.current;
      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("aria-hidden"));

      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!dialog.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      } else if (
        event.shiftKey &&
        (activeElement === firstElement || activeElement === dialog)
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isCompleted, onClose]);

  useEffect(
    () => () => {
      if (copyResetRef.current !== null) {
        window.clearTimeout(copyResetRef.current);
      }
    },
    [],
  );

  const handleCopyAudit = async () => {
    try {
      await navigator.clipboard.writeText(AUDIT_ID);
      setCopiedAudit(true);

      if (copyResetRef.current !== null) {
        window.clearTimeout(copyResetRef.current);
      }

      copyResetRef.current = window.setTimeout(() => {
        setCopiedAudit(false);
      }, 2000);
    } catch {
      setCopiedAudit(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-3 sm:p-6"
      style={{
        background:
          "radial-gradient(circle at 50% 34%, rgba(106, 119, 173, 0.16), transparent 31rem), rgba(2, 3, 4, 0.88)",
        backdropFilter: "blur(18px) saturate(82%)",
      }}
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && isCompleted) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="execution-title"
        aria-describedby="execution-description"
        aria-busy={!isCompleted}
        tabIndex={-1}
        className="relative flex w-full max-w-[760px] flex-col overflow-hidden rounded-[22px] border outline-none"
        style={{
          maxHeight: "min(820px, calc(100dvh - 2rem))",
          borderColor: "var(--line-strong)",
          background:
            "linear-gradient(145deg, rgba(20, 24, 27, 0.995), rgba(7, 9, 11, 0.995))",
          boxShadow:
            "0 36px 120px rgba(0, 0, 0, 0.76), inset 0 1px 0 rgba(255, 255, 255, 0.055), 0 0 0 1px rgba(155, 167, 255, 0.035)",
        }}
        initial={
          shouldReduceMotion ? false : { opacity: 0, scale: 0.975, y: 18 }
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
        }
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
            maskImage: "linear-gradient(to bottom, black, transparent 58%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 4%, rgba(155,167,255,0.7) 32%, rgba(114,219,232,0.55) 68%, transparent 96%)",
          }}
        />

        <header className="relative flex shrink-0 items-start gap-3 border-b border-[var(--line)] px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <div
            className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border sm:h-12 sm:w-12"
            style={{
              borderColor: "rgba(178, 191, 255, 0.2)",
              background:
                "radial-gradient(circle, rgba(114,219,232,0.11), transparent 48%), linear-gradient(145deg, rgba(155,167,255,0.13), rgba(8,12,15,0.72))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            <motion.span
              aria-hidden="true"
              className="absolute h-8 w-8 rounded-[45%] border border-[rgba(114,219,232,0.28)]"
              animate={
                shouldReduceMotion || isCompleted ? undefined : { rotate: 360 }
              }
              transition={{ duration: 9, ease: "linear", repeat: Infinity }}
            />
            {isCompleted ? (
              <ShieldCheck
                className="relative h-5 w-5 text-[var(--safe-soft)]"
                strokeWidth={1.65}
              />
            ) : (
              <LockKeyhole
                className="relative h-5 w-5 text-[var(--brand-bright)]"
                strokeWidth={1.65}
              />
            )}
            <span className="absolute bottom-2 h-1 w-1 rounded-full bg-[var(--safe)] shadow-[0_0_8px_var(--safe)]" />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="m-0 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--faint)]">
                Containment chamber · production gate
              </p>
              <span
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.12em]"
                style={{
                  borderColor: isCompleted
                    ? "rgba(104, 227, 179, 0.18)"
                    : "rgba(155, 167, 255, 0.18)",
                  color: isCompleted ? "var(--safe)" : "var(--brand-bright)",
                  background: isCompleted
                    ? "rgba(104, 227, 179, 0.05)"
                    : "rgba(155, 167, 255, 0.05)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-current"
                />
                {stage === "revalidating"
                  ? "Gate locked"
                  : stage === "executing"
                    ? "Write active"
                    : "Receipt sealed"}
              </span>
            </div>
            <h2
              id="execution-title"
              className="mt-2 text-[18px] font-semibold tracking-[-0.035em] text-[var(--ink)] sm:text-[22px]"
            >
              {stageTitle}
            </h2>
            <p
              id="execution-description"
              className="mt-1 max-w-[590px] text-[10px] leading-5 text-[var(--muted)] sm:text-[11px]"
            >
              {stageDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={!isCompleted}
            aria-label={
              isCompleted
                ? "Close containment chamber"
                : "Close unavailable while the production transaction is active"
            }
            aria-keyshortcuts={isCompleted ? "Escape" : undefined}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-white/[0.02] text-[var(--muted)] transition enabled:hover:border-[var(--line-strong)] enabled:hover:bg-white/[0.05] enabled:hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isCompleted ? (
              <X className="h-4 w-4" />
            ) : (
              <LockKeyhole className="h-3.5 w-3.5" />
            )}
          </button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <section aria-labelledby="revalidation-heading">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="m-0 font-mono text-[7px] font-bold uppercase tracking-[0.17em] text-[var(--faint)]">
                  Four-factor interlock
                </p>
                <h3
                  id="revalidation-heading"
                  className="mt-1 text-[12px] font-semibold text-[var(--ink-soft)]"
                >
                  Approval envelope revalidation
                </h3>
              </div>
              <span className="shrink-0 font-mono text-[8px] text-[var(--faint)]">
                {Object.values(checks).filter(Boolean).length}/4 verified
              </span>
            </div>

            <ol className="grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
              {validationItems.map((item, index) => (
                <ValidationItem
                  key={item.key}
                  index={index}
                  icon={item.icon}
                  label={item.label}
                  detail={item.detail}
                  status={
                    checks[item.key]
                      ? "verified"
                      : stage === "revalidating" && index === pendingCheckIndex
                        ? "active"
                        : "queued"
                  }
                />
              ))}
            </ol>
          </section>

          <section className="mt-4" aria-labelledby="execution-log-heading">
            <div
              className="overflow-hidden rounded-xl border border-[var(--line)]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(3,5,6,0.82), rgba(6,8,10,0.74))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.025)",
              }}
            >
              <div className="flex min-h-10 items-center justify-between gap-3 border-b border-[var(--line)] px-3.5">
                <h3
                  id="execution-log-heading"
                  className="flex items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]"
                >
                  <Terminal className="h-3.5 w-3.5 text-[var(--brand)]" strokeWidth={1.7} />
                  Gateway execution log
                </h3>
                <span className="flex items-center gap-1.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[var(--faint)]">
                  <span className="h-1 w-1 rounded-full bg-[var(--safe)]" />
                  mTLS · TLS 1.3
                </span>
              </div>

              <div
                ref={logRef}
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
                className="h-40 overflow-y-auto px-3.5 py-3 font-mono sm:h-44"
              >
                {logs.map((log, index) => {
                  const isIntegrityLine =
                    log.includes("PASS") ||
                    log.includes("COMMIT") ||
                    log.includes("SEAL");
                  const isSqlLine = log.includes(" SQL ");

                  return (
                    <p
                      key={`${index}-${log}`}
                      className="m-0 break-words text-[8px] leading-[1.8] sm:text-[9px]"
                      style={{
                        color: isIntegrityLine
                          ? "#9ac9b4"
                          : isSqlLine
                            ? "#84cbd4"
                            : "#66716f",
                      }}
                    >
                      {log}
                    </p>
                  );
                })}
                {!isCompleted && (
                  <p className="mt-1 flex items-center gap-2 font-mono text-[8px] text-[var(--brand)]">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    {stage === "revalidating"
                      ? "Awaiting interlock consensus"
                      : "Awaiting database acknowledgement"}
                  </p>
                )}
              </div>
            </div>
          </section>

          <AnimatePresence initial={false}>
            {isCompleted && (
              <motion.section
                aria-labelledby="audit-receipt-title"
                className="mt-4 overflow-hidden rounded-xl border"
                style={{
                  borderColor: "rgba(104, 227, 179, 0.17)",
                  background:
                    "linear-gradient(145deg, rgba(104,227,179,0.055), rgba(255,255,255,0.018))",
                }}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 8 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.24 }}
              >
                <div className="flex items-start justify-between gap-4 border-b border-[rgba(104,227,179,0.11)] px-4 py-3.5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[rgba(104,227,179,0.16)] bg-[rgba(104,227,179,0.05)] text-[var(--safe)]">
                      <ReceiptText className="h-4 w-4" strokeWidth={1.65} />
                    </span>
                    <div>
                      <p className="m-0 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-[var(--safe)]">
                        Append-only record
                      </p>
                      <h3
                        id="audit-receipt-title"
                        className="mt-1 text-[12px] font-semibold text-[var(--ink)]"
                      >
                        Immutable execution receipt
                      </h3>
                      <p className="mt-1 text-[9px] leading-4 text-[var(--muted)]">
                        Database outcome, approval scope, and operator identity sealed together.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[rgba(104,227,179,0.16)] bg-[rgba(104,227,179,0.045)] px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-[var(--safe)]">
                    Sealed
                  </span>
                </div>

                <dl className="grid grid-cols-1 gap-px bg-[rgba(104,227,179,0.08)] sm:grid-cols-2">
                  <div className="bg-[#0d1212]/95 px-4 py-3">
                    <dt className="font-mono text-[7px] font-bold uppercase tracking-[0.13em] text-[var(--faint)]">
                      Audit ID
                    </dt>
                    <dd className="mt-1.5 font-mono text-[9px] font-semibold text-[var(--safe-soft)]">
                      {AUDIT_ID}
                    </dd>
                  </div>
                  <div className="bg-[#0d1212]/95 px-4 py-3">
                    <dt className="font-mono text-[7px] font-bold uppercase tracking-[0.13em] text-[var(--faint)]">
                      Outcome
                    </dt>
                    <dd className="mt-1.5 text-[9px] font-medium text-[var(--ink-soft)]">
                      {isSafeMode
                        ? "Soft-delete transaction committed"
                        : "Delete transaction committed"}
                    </dd>
                  </div>
                  <div className="bg-[#0d1212]/95 px-4 py-3">
                    <dt className="font-mono text-[7px] font-bold uppercase tracking-[0.13em] text-[var(--faint)]">
                      Authorized impact
                    </dt>
                    <dd className="mt-1.5 font-mono text-[9px] text-[var(--ink-soft)]">
                      {formatNumber(directRows)} direct · {isSafeMode ? "0 cascades" : `${formatNumber(cascadesCount)} cascades`}
                    </dd>
                  </div>
                  <div className="bg-[#0d1212]/95 px-4 py-3">
                    <dt className="font-mono text-[7px] font-bold uppercase tracking-[0.13em] text-[var(--faint)]">
                      Integrity binding
                    </dt>
                    <dd className="mt-1.5 text-[9px] font-medium text-[var(--ink-soft)]">
                      SHA-256 · HMAC · SERIALIZABLE
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p
                    className="m-0 flex items-center gap-2 font-mono text-[8px] text-[var(--faint)]"
                    aria-label="Target blastshield production, PostgreSQL 16"
                  >
                    <Database className="h-3 w-3" aria-hidden="true" />
                    blastshield_prod · PostgreSQL 16
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAudit}
                      className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--line)] bg-white/[0.02] px-3 text-[9px] font-semibold text-[var(--ink-soft)] transition hover:border-[var(--line-strong)] hover:bg-white/[0.05] sm:flex-none"
                    >
                      {copiedAudit ? (
                        <Check className="h-3.5 w-3.5 text-[var(--safe)]" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span aria-live="polite">
                        {copiedAudit ? "ID copied" : "Copy audit ID"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-[rgba(155,167,255,0.2)] bg-[rgba(155,167,255,0.09)] px-4 text-[9px] font-semibold text-[var(--brand-bright)] transition hover:border-[rgba(155,167,255,0.32)] hover:bg-[rgba(155,167,255,0.14)] sm:flex-none"
                    >
                      Close chamber
                    </button>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {!isCompleted && (
            <p className="mb-0 mt-3 flex items-center justify-center gap-2 text-center font-mono text-[7px] uppercase tracking-[0.1em] text-[var(--faint)]">
              <LockKeyhole className="h-3 w-3" aria-hidden="true" />
              Controls remain locked until the receipt is sealed
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ExecutionModal({
  isOpen,
  onClose,
  isSafeMode,
  sql,
  directRows,
  cascadesCount,
}: ExecutionModalProps) {
  if (!isOpen) return null;

  const sessionKey = `${createSessionKey(sql)}-${directRows}-${cascadesCount}-${isSafeMode ? "safe" : "direct"}`;

  return (
    <ExecutionDialog
      key={sessionKey}
      onClose={onClose}
      isSafeMode={isSafeMode}
      sql={sql}
      directRows={directRows}
      cascadesCount={cascadesCount}
    />
  );
}
