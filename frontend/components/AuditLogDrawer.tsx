"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Copy,
  FileCheck2,
  Fingerprint,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { INITIAL_AUDIT_EVENTS } from "@/lib/mockData";

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnalysisId?: string;
}

function eventTone(eventType: string) {
  if (eventType.includes("INTERCEPTED")) {
    return {
      color: "var(--danger-soft)",
      border: "rgba(255, 107, 97, 0.2)",
      background: "rgba(255, 107, 97, 0.055)",
    };
  }

  if (eventType.includes("COMPLETED")) {
    return {
      color: "var(--safe)",
      border: "rgba(104, 227, 179, 0.18)",
      background: "rgba(104, 227, 179, 0.05)",
    };
  }

  return {
    color: "var(--brand-bright)",
    border: "rgba(155, 167, 255, 0.19)",
    background: "rgba(155, 167, 255, 0.05)",
  };
}

export function AuditLogDrawer({
  isOpen,
  onClose,
  currentAnalysisId,
}: AuditLogDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();

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
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEvents = INITIAL_AUDIT_EVENTS.filter((event) => {
    if (!normalizedSearch) return true;

    return [
      event.id,
      event.analysisId,
      event.eventType,
      event.description,
      event.actor,
    ].some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopiedId(null), 1800);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-end"
      style={{
        background: "rgba(1, 2, 3, 0.76)",
        backdropFilter: "blur(15px) saturate(78%)",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-log-title"
        aria-describedby="audit-log-description"
        tabIndex={-1}
        initial={shouldReduceMotion ? false : { x: "100%", opacity: 0.65 }}
        animate={{ x: 0, opacity: 1 }}
        exit={shouldReduceMotion ? undefined : { x: "100%", opacity: 0.6 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: "spring", damping: 34, stiffness: 340, mass: 0.82 }
        }
        className="relative flex h-[100dvh] min-h-0 w-full max-w-[620px] flex-col overflow-hidden outline-none"
        style={{
          borderLeft: "1px solid var(--line-strong)",
          background:
            "linear-gradient(155deg, rgba(18, 22, 25, 0.995), rgba(7, 10, 12, 0.995) 68%)",
          boxShadow:
            "-40px 0 110px rgba(0, 0, 0, 0.62), inset 1px 0 0 rgba(255,255,255,0.025)",
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-10 left-0 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent, rgba(114, 219, 232, 0.45) 22%, rgba(155, 167, 255, 0.45) 68%, transparent)",
          }}
        />

        <header
          className="relative z-10 flex shrink-0 items-start justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6"
          style={{
            borderBottom: "1px solid var(--line)",
            background: "rgba(12, 15, 18, 0.8)",
          }}
        >
          <div className="flex min-w-0 items-start gap-3.5">
            <div
              className="relative grid size-11 shrink-0 place-items-center rounded-xl"
              style={{
                color: "var(--safe-soft)",
                border: "1px solid rgba(104, 227, 179, 0.2)",
                background:
                  "radial-gradient(circle at 50% 50%, rgba(104, 227, 179, 0.12), transparent 60%), rgba(104, 227, 179, 0.035)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.07)",
              }}
            >
              <FileCheck2 className="size-5" strokeWidth={1.7} aria-hidden="true" />
              <span
                className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full"
                style={{ color: "#07100d", background: "var(--safe)" }}
              >
                <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--cyan)" }}>
                  Trust ledger / append only
                </span>
                <span
                  className="rounded-full px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    color: "var(--safe)",
                    border: "1px solid rgba(104, 227, 179, 0.18)",
                    background: "rgba(104, 227, 179, 0.05)",
                  }}
                >
                  Immutable
                </span>
              </div>
              <h2 id="audit-log-title" className="text-[17px] font-semibold tracking-[-0.03em] sm:text-xl" style={{ color: "var(--ink)" }}>
                Compliance event stream
              </h2>
              <p id="audit-log-description" className="mt-1 max-w-md text-[10px] leading-5 sm:text-[11px]" style={{ color: "var(--muted)" }}>
                Signed evidence for every interception, sandbox transition, and risk decision.
              </p>
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
            aria-label="Close audit log"
          >
            <X className="size-[18px]" aria-hidden="true" />
          </button>
        </header>

        <section
          className="shrink-0 px-4 py-4 sm:px-6"
          style={{ borderBottom: "1px solid var(--line)", background: "rgba(4, 6, 7, 0.3)" }}
          aria-label="Audit log controls"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2"
              style={{ color: "var(--faint)" }}
              aria-hidden="true"
            />
            <label htmlFor="audit-search" className="sr-only">Search compliance events</label>
            <input
              id="audit-search"
              type="search"
              placeholder="Search ID, actor, analysis, or payload event…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="min-h-11 w-full rounded-[10px] py-2 pl-10 pr-12 font-mono text-[10px] outline-none transition"
              style={{
                color: "var(--ink)",
                caretColor: "var(--cyan)",
                border: "1px solid var(--line-strong)",
                background: "rgba(0,0,0,0.24)",
              }}
              aria-controls="audit-event-list"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-0 top-0 grid size-11 place-items-center rounded-[10px]"
                style={{ color: "var(--faint)" }}
                aria-label="Clear audit search"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[8px] uppercase tracking-[0.09em]" style={{ color: "var(--faint)" }}>
            <span aria-live="polite">
              {filteredEvents.length} of {INITIAL_AUDIT_EVENTS.length} events
            </span>
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="size-1.5 shrink-0 rounded-full" style={{ background: "var(--brand)", boxShadow: "0 0 7px rgba(155,167,255,.45)" }} />
              <span className="truncate">{currentAnalysisId ?? "All analyses"}</span>
            </span>
          </div>
        </section>

        <section id="audit-event-list" className="min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-5" aria-label="Signed audit events">
          {filteredEvents.length > 0 ? (
            <div className="relative space-y-2.5 before:absolute before:bottom-5 before:left-[17px] before:top-5 before:w-px before:bg-[var(--line)]">
              {filteredEvents.map((event, index) => {
                const isExpanded = expandedEvent === event.id;
                const tone = eventTone(event.eventType);
                const payloadId = `audit-payload-${event.id}`;
                const time = new Intl.DateTimeFormat(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(event.createdAt));

                return (
                  <article
                    key={event.id}
                    className="relative ml-8 overflow-hidden rounded-xl transition duration-150"
                    style={{
                      border: `1px solid ${isExpanded ? "var(--line-strong)" : "var(--line)"}`,
                      background: isExpanded ? "rgba(17, 21, 25, 0.92)" : "rgba(12, 15, 18, 0.7)",
                      boxShadow: isExpanded ? "0 16px 38px rgba(0,0,0,.2)" : "none",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute -left-[25px] top-[19px] z-10 grid size-[18px] place-items-center rounded-full font-mono text-[7px] font-bold"
                      style={{ color: tone.color, border: `1px solid ${tone.border}`, background: "var(--surface)" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <button
                      type="button"
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      aria-expanded={isExpanded}
                      aria-controls={payloadId}
                      className="w-full min-h-11 px-4 py-3.5 pr-[68px] text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold" style={{ color: "var(--ink-soft)" }}>
                          {event.id}
                        </span>
                        <span
                          className="rounded-md px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.08em]"
                          style={{ color: tone.color, border: `1px solid ${tone.border}`, background: tone.background }}
                        >
                          {event.eventType.replaceAll("_", " ")}
                        </span>
                      </div>

                      <p className="mt-2.5 text-[10px] font-medium leading-[1.65] sm:text-[11px]" style={{ color: "var(--ink-soft)" }}>
                        {event.description}
                      </p>

                      <div className="mt-3 flex flex-col gap-1.5 border-t pt-2.5 font-mono text-[8px] sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--faint)", borderColor: "var(--line)" }}>
                        <span className="flex min-w-0 items-center gap-1.5">
                          <UserRound className="size-3 shrink-0" aria-hidden="true" />
                          <span className="truncate">{event.actor}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          <Clock3 className="size-3" aria-hidden="true" />
                          {time}
                          <ChevronDown
                            className={`ml-1 size-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            style={{ color: "var(--brand)" }}
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleCopy(event.id)}
                      className="absolute right-3 top-3 grid size-11 place-items-center rounded-[10px] transition"
                      style={{
                        color: copiedId === event.id ? "var(--safe)" : "var(--muted)",
                        border: "1px solid var(--line)",
                        background: "rgba(255,255,255,0.022)",
                      }}
                      aria-label={copiedId === event.id ? `${event.id} copied` : `Copy audit ID ${event.id}`}
                    >
                      {copiedId === event.id ? (
                        <Check className="size-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="size-3.5" aria-hidden="true" />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          id={payloadId}
                          initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-t p-3.5" style={{ borderColor: "var(--line)", background: "rgba(0,0,0,0.2)" }}>
                            <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[8px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--faint)" }}>
                              <span className="flex items-center gap-1.5">
                                <Code2 className="size-3.5" style={{ color: "var(--cyan)" }} aria-hidden="true" />
                                Sealed payload
                              </span>
                              <span>JSON / read only</span>
                            </div>
                            <pre
                              className="max-h-64 overflow-auto rounded-[10px] p-3 font-mono text-[9px] leading-[1.7]"
                              style={{ color: "var(--safe-soft)", border: "1px solid var(--line)", background: "rgba(2,4,5,.66)" }}
                            >
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center px-5 text-center">
              <div>
                <div
                  className="mx-auto grid size-11 place-items-center rounded-xl"
                  style={{ color: "var(--faint)", border: "1px solid var(--line)", background: "rgba(255,255,255,.02)" }}
                >
                  <Search className="size-4" aria-hidden="true" />
                </div>
                <p className="mt-4 text-[11px] font-semibold" style={{ color: "var(--ink-soft)" }}>No matching evidence</p>
                <p className="mt-1 text-[9px] leading-5" style={{ color: "var(--muted)" }}>Try an event ID, actor, or analysis identifier.</p>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-4 min-h-11 rounded-[10px] px-4 text-[10px] font-semibold"
                  style={{ color: "var(--ink)", border: "1px solid var(--line-strong)", background: "rgba(255,255,255,.035)" }}
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </section>

        <footer
          className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6"
          style={{ borderTop: "1px solid var(--line)", background: "rgba(4, 6, 7, 0.48)" }}
        >
          <span className="flex min-w-0 items-center gap-2 font-mono text-[8px]" style={{ color: "var(--faint)" }}>
            <Fingerprint className="size-3.5 shrink-0" style={{ color: "var(--safe)" }} aria-hidden="true" />
            <span className="truncate">SHA-256 chain verified · 4/4 signatures</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] px-5 text-[10px] font-semibold transition duration-150 hover:-translate-y-px"
            style={{ color: "#07110d", border: "1px solid rgba(104,227,179,.24)", background: "var(--safe)" }}
          >
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Seal viewer
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
