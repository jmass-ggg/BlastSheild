"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  Clock3,
  Code2,
  Command,
  Copy,
  Database,
  Eye,
  FileCheck2,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  Network,
  Pencil,
  Play,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Table2,
  Terminal,
  Waypoints,
  X,
  Zap,
} from "lucide-react";
import {
  DEMO_SCENARIOS,
  generateAnalysisForScenario,
  getInitialPrimaryAnalysis,
} from "@/lib/mockData";
import type { AnalysisRecord, DemoScenario } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

const BlastRadiusGraph = dynamic(
  () =>
    import("@/components/BlastRadiusGraph").then(
      (module) => module.BlastRadiusGraph,
    ),
  { ssr: false, loading: () => <GraphSkeleton /> },
);

const ExecutionModal = dynamic(
  () =>
    import("@/components/ExecutionModal").then(
      (module) => module.ExecutionModal,
    ),
  { ssr: false },
);

const SchemaExplorerModal = dynamic(
  () =>
    import("@/components/SchemaExplorerModal").then(
      (module) => module.SchemaExplorerModal,
    ),
  { ssr: false },
);

const AuditLogDrawer = dynamic(
  () =>
    import("@/components/AuditLogDrawer").then(
      (module) => module.AuditLogDrawer,
    ),
  { ssr: false },
);

const ModifySqlModal = dynamic(
  () =>
    import("@/components/ModifySqlModal").then(
      (module) => module.ModifySqlModal,
    ),
  { ssr: false },
);

type EvidenceView = "topology" | "table" | "trace";

const SQL_KEYWORDS = new Set([
  "ALTER",
  "AND",
  "AS",
  "DELETE",
  "DROP",
  "FROM",
  "GROUP",
  "INTERVAL",
  "NOW",
  "ORDER",
  "SELECT",
  "SET",
  "TABLE",
  "TRUNCATE",
  "UPDATE",
  "WHERE",
]);

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function ContainmentMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`containment-mark ${compact ? "is-compact" : ""}`} aria-hidden="true">
      <span className="containment-mark__orbit" />
      <Shield className="containment-mark__shield" strokeWidth={1.65} />
      <span className="containment-mark__core" />
    </span>
  );
}

function SqlSnippet({
  sql,
  tone = "danger",
  compact = false,
  label,
}: {
  sql: string;
  tone?: "danger" | "safe" | "neutral";
  compact?: boolean;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  const copySql = useCallback(async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [sql]);

  return (
    <div className={`sql-block sql-block--${tone} ${compact ? "is-compact" : ""}`}>
      <div className="sql-block__bar">
        <span className="sql-block__label">
          <Terminal size={13} aria-hidden="true" />
          {label}
        </span>
        <button type="button" className="copy-button" onClick={copySql} aria-label="Copy SQL">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="sql-block__code" aria-label={label}>
        {sql.trim().split("\n").map((line, lineIndex) => {
          const tokens = line.split(/(\b[A-Za-z_]+\b|'[^']*'|\d+|[(),;=*<>.-])/g);
          return (
            <span className="sql-line" key={`${line}-${lineIndex}`}>
              <span className="sql-line__number" aria-hidden="true">{lineIndex + 1}</span>
              <code>
                {tokens.map((token, tokenIndex) => {
                  const upper = token.toUpperCase();
                  const tokenClass = SQL_KEYWORDS.has(upper)
                    ? "sql-token--keyword"
                    : token.startsWith("'")
                      ? "sql-token--string"
                      : /^\d+$/.test(token)
                        ? "sql-token--number"
                        : "";
                  return (
                    <span className={tokenClass} key={`${token}-${tokenIndex}`}>
                      {token}
                    </span>
                  );
                })}
              </code>
            </span>
          );
        })}
      </pre>
    </div>
  );
}

function ImpactMetric({
  eyebrow,
  value,
  detail,
  tone = "neutral",
}: {
  eyebrow: string;
  value: string;
  detail: string;
  tone?: "danger" | "safe" | "neutral";
}) {
  return (
    <div className={`impact-metric impact-metric--${tone}`}>
      <span className="impact-metric__eyebrow">{eyebrow}</span>
      <motion.strong
        key={value}
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        {value}
      </motion.strong>
      <span className="impact-metric__detail">{detail}</span>
    </div>
  );
}

function AmbientMedia({ contained }: { contained: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div className={`hero-media ${contained ? "is-contained" : "is-blocked"}`} aria-hidden="true">
      {prefersReducedMotion ? (
        <Image
          src="/media/blastshield-containment-poster.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 900px) 100vw, 760px"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/blastshield-containment-poster.jpg"
          tabIndex={-1}
        >
          <source src="/media/blastshield-containment.mp4" type="video/mp4" />
        </video>
      )}
      <div className="hero-media__wash" />
      <div className="hero-media__scan" />
    </div>
  );
}

function DecisionHero({
  analysis,
  safePlanActive,
}: {
  analysis: AnalysisRecord;
  safePlanActive: boolean;
}) {
  const isReadOnly = analysis.operationType === "SELECT";
  const contained = safePlanActive || isReadOnly;
  const affectedRows = safePlanActive
    ? analysis.recommendedAlternative.directRows
    : analysis.totalAffectedRows;
  const cascadeRows = safePlanActive ? 0 : analysis.indirectRows;
  const arrAtRisk = safePlanActive ? 0 : analysis.businessImpact.arrAtRisk;
  const payingUsers = safePlanActive ? 0 : analysis.businessImpact.activePayingUsers;
  const tablesTouched = safePlanActive
    ? 1
    : Math.max(1, analysis.tableDiffs.filter((diff) => diff.delta !== 0).length);
  const riskScore = safePlanActive
    ? analysis.recommendedAlternative.riskScore
    : analysis.riskScore;

  const headline = isReadOnly
    ? "Read-only intent verified."
    : safePlanActive
      ? "Blast radius contained."
      : "Production write contained before impact.";

  const consequence = isReadOnly
    ? "The statement reads aggregate data without changing production state. Policy permits direct execution."
    : safePlanActive
      ? `The safer ${analysis.recommendedAlternative.title.toLowerCase()} touches ${formatNumber(affectedRows)} rows without deleting dependent records or exposing revenue.`
      : analysis.businessImpact.arrAtRisk > 0
        ? `This ${analysis.operationType} would affect ${formatNumber(analysis.totalAffectedRows)} rows across ${tablesTouched} ${tablesTouched === 1 ? "table" : "tables"} and expose ${formatCurrency(analysis.businessImpact.arrAtRisk)} in annual revenue.`
        : analysis.businessImpact.summary;

  return (
    <section className={`decision-hero ${contained ? "is-contained" : "is-blocked"}`} aria-labelledby="decision-title">
      <AmbientMedia contained={contained} />

      <div className="decision-hero__content">
        <div className="decision-hero__meta">
          <span className={`verdict-chip ${contained ? "verdict-chip--safe" : "verdict-chip--blocked"}`}>
            {contained ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            {isReadOnly ? "Policy pass" : safePlanActive ? "Contained plan" : "Write blocked"}
          </span>
          <span className="mono-id">{analysis.id}</span>
          <span className="hero-separator" aria-hidden="true" />
          <span className="hero-proof">
            <CheckCircle2 size={13} /> Sandbox verified
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${analysis.id}-${contained}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="decision-hero__copy"
          >
            <p className="section-kicker">Decision brief</p>
            <h1 id="decision-title">{headline}</h1>
            <p>{consequence}</p>
          </motion.div>
        </AnimatePresence>

        <div className="agent-intent">
          <span className="agent-intent__icon"><Sparkles size={14} /></span>
          <div>
            <span>Agent intent · TrueForge DB Operator</span>
            <p>“{analysis.prompt}”</p>
          </div>
        </div>

        <SqlSnippet
          sql={safePlanActive ? analysis.recommendedAlternative.sql : analysis.originalSql}
          tone={contained ? "safe" : "danger"}
          label={safePlanActive ? "Contained candidate" : isReadOnly ? "Verified query" : "Intercepted SQL"}
        />
      </div>

      <div className="risk-readout" aria-label={`Risk index ${riskScore} out of 100`}>
        <div className="risk-readout__top">
          <span>Risk index</span>
          <span className={`risk-readout__state ${contained ? "is-safe" : "is-danger"}`}>
            {isReadOnly ? "PASS" : contained ? "CONTAINED" : "BLOCK"}
          </span>
        </div>
        <div className="risk-readout__value">
          <motion.strong key={riskScore} initial={{ opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1 }}>
            {riskScore}
          </motion.strong>
          <span>/100</span>
        </div>
        <div className="risk-readout__meter" aria-hidden="true">
          <motion.span
            animate={{ width: `${riskScore}%` }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="risk-readout__facts">
          <span><Fingerprint size={12} /> deterministic</span>
          <span><Eye size={12} /> 100% replica</span>
        </div>
      </div>

      <div className="impact-strip">
        <ImpactMetric
          eyebrow={safePlanActive ? "Rows touched" : "Rows at risk"}
          value={formatCompact(affectedRows)}
          detail={safePlanActive ? "contained scope" : `${formatCompact(cascadeRows)} via cascade`}
          tone={contained ? "safe" : "danger"}
        />
        <ImpactMetric
          eyebrow="Tables touched"
          value={String(tablesTouched)}
          detail={safePlanActive ? "target only" : `${analysis.cascadesCount} cascade branches`}
          tone={contained ? "safe" : "danger"}
        />
        <ImpactMetric
          eyebrow="ARR exposed"
          value={formatCurrency(arrAtRisk)}
          detail={arrAtRisk ? "annual recurring revenue" : "revenue preserved"}
          tone={contained ? "safe" : "danger"}
        />
        <ImpactMetric
          eyebrow="Paying accounts"
          value={formatNumber(payingUsers)}
          detail={payingUsers ? "active subscriptions" : "accounts protected"}
          tone={contained ? "safe" : "danger"}
        />
      </div>
    </section>
  );
}

function GraphSkeleton() {
  return (
    <div className="graph-skeleton" aria-label="Loading topology">
      <span className="graph-skeleton__node graph-skeleton__node--root" />
      <span className="graph-skeleton__line graph-skeleton__line--left" />
      <span className="graph-skeleton__line graph-skeleton__line--right" />
      <span className="graph-skeleton__node graph-skeleton__node--left" />
      <span className="graph-skeleton__node graph-skeleton__node--right" />
    </div>
  );
}

function ImpactTable({ analysis, safePlanActive }: { analysis: AnalysisRecord; safePlanActive: boolean }) {
  return (
    <div className="impact-table-wrap">
      <table className="impact-table">
        <caption className="sr-only">Database table impact from the simulated SQL statement</caption>
        <thead>
          <tr>
            <th>Table</th>
            <th>Relationship</th>
            <th className="align-right">Before</th>
            <th className="align-right">After</th>
            <th className="align-right">Change</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {analysis.tableDiffs.map((diff) => {
            const isTarget = diff.tableName === analysis.targetTable;
            const safeRemovesRows = analysis.recommendedAlternative.sql.trimStart().toUpperCase().startsWith("DELETE");
            const safeDelta = safePlanActive && isTarget && safeRemovesRows
              ? -analysis.recommendedAlternative.directRows
              : 0;
            const afterCount = safePlanActive ? diff.beforeCount + safeDelta : diff.afterCount;
            const delta = safePlanActive ? safeDelta : diff.delta;
            return (
              <tr key={diff.tableName}>
                <td>
                  <span className="table-name"><Database size={14} />{diff.tableName}</span>
                </td>
                <td><span className="relationship-label">{diff.cascadeType.replace("_", " ")}</span></td>
                <td className="align-right mono-number">{formatNumber(diff.beforeCount)}</td>
                <td className="align-right mono-number">{formatNumber(afterCount)}</td>
                <td className={`align-right mono-number ${delta < 0 ? "text-danger" : "text-safe"}`}>
                  {delta === 0 ? "—" : formatNumber(delta)}
                </td>
                <td>
                  <span className={`row-status ${safePlanActive ? "is-safe" : diff.delta === 0 ? "is-restricted" : "is-danger"}`}>
                    {safePlanActive
                      ? isTarget && safeRemovesRows
                        ? "Scoped delete"
                        : isTarget
                          ? "Contained change"
                          : "Shielded"
                      : diff.delta === 0
                        ? "Protected"
                        : diff.action}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SimulationTrace({ analysis }: { analysis: AnalysisRecord }) {
  return (
    <ol className="simulation-trace" aria-label="Sandbox simulation trace">
      {analysis.steps.map((step, index) => (
        <motion.li
          key={step.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.025 }}
        >
          <span className="trace-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="trace-rail" aria-hidden="true"><Check size={11} /></span>
          <div className="trace-copy">
            <strong>{step.title}</strong>
            <p>{step.subtitle}</p>
          </div>
          <time>{step.timestamp ?? `+${index * 104}ms`}</time>
        </motion.li>
      ))}
    </ol>
  );
}

function EvidencePanel({
  analysis,
  safePlanActive,
  view,
  onViewChange,
  simulating,
  onOpenAudit,
}: {
  analysis: AnalysisRecord;
  safePlanActive: boolean;
  view: EvidenceView;
  onViewChange: (view: EvidenceView) => void;
  simulating: boolean;
  onOpenAudit: () => void;
}) {
  const views: Array<{ id: EvidenceView; label: string; icon: React.ReactNode }> = [
    { id: "topology", label: "Topology", icon: <Waypoints size={14} /> },
    { id: "table", label: "Table impact", icon: <Table2 size={14} /> },
    { id: "trace", label: "Simulation trace", icon: <Activity size={14} /> },
  ];

  return (
    <section className="evidence-panel" id="evidence" aria-labelledby="evidence-title">
      <header className="evidence-panel__header">
        <div>
          <p className="section-kicker">Sandbox evidence</p>
          <h2 id="evidence-title">See exactly where the action travels.</h2>
        </div>
        <div className="evidence-proof">
          <span><span className="live-dot" /> Simulation complete</span>
          <span>824ms</span>
          <span>snapshot 47s old</span>
        </div>
      </header>

      <div className="evidence-toolbar">
        <div className="segmented-control" role="tablist" aria-label="Evidence views">
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              className={view === item.id ? "is-active" : ""}
              onClick={() => onViewChange(item.id)}
            >
              {item.icon}{item.label}
            </button>
          ))}
        </div>
        <button type="button" className="quiet-action" onClick={onOpenAudit}>
          <FileCheck2 size={14} /> Open audit trail
        </button>
      </div>

      <div className="evidence-panel__body" aria-live="polite">
        <AnimatePresence mode="wait">
          {simulating ? (
            <motion.div key="simulating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="simulation-loading">
              <GraphSkeleton />
              <div className="simulation-loading__status">
                <span className="simulation-loader" />
                <div><strong>Restoring isolated snapshot</strong><span>Tracing foreign keys and measuring row deltas…</span></div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${view}-${safePlanActive}-${analysis.id}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className="evidence-view"
            >
              {view === "topology" && <BlastRadiusGraph analysis={analysis} isSafeMode={safePlanActive} />}
              {view === "table" && <ImpactTable analysis={analysis} safePlanActive={safePlanActive} />}
              {view === "trace" && <SimulationTrace analysis={analysis} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="evidence-panel__footer">
        <span><GitBranch size={13} /> branch <code>bs-sbx/{analysis.id.toLowerCase()}</code></span>
        <span><LockKeyhole size={13} /> production never touched</span>
        <span><Fingerprint size={13} /> deterministic score · no LLM in the loop</span>
      </footer>
    </section>
  );
}

function RiskEvidence({ analysis }: { analysis: AnalysisRecord }) {
  const factors = Object.values(analysis.riskBreakdown);
  return (
    <div className="risk-evidence">
      {factors.map((factor) => (
        <div className="risk-factor" key={factor.label} title={factor.desc}>
          <div className="risk-factor__label">
            <span>{factor.label}</span>
            <strong>{factor.score}<small>/{factor.max}</small></strong>
          </div>
          <div className="risk-factor__track" role="progressbar" aria-label={factor.label} aria-valuemin={0} aria-valuemax={factor.max} aria-valuenow={factor.score}>
            <span style={{ width: `${(factor.score / factor.max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SafePlanRail({
  analysis,
  safePlanActive,
  onApply,
  onUndo,
  onEdit,
  onExecute,
  onRequestException,
}: {
  analysis: AnalysisRecord;
  safePlanActive: boolean;
  onApply: () => void;
  onUndo: () => void;
  onEdit: () => void;
  onExecute: () => void;
  onRequestException: () => void;
}) {
  const [showRiskEvidence, setShowRiskEvidence] = useState(false);
  const isReadOnly = analysis.operationType === "SELECT";
  const improvement = Math.max(0, analysis.riskScore - analysis.recommendedAlternative.riskScore);

  if (isReadOnly) {
    return (
      <aside className="decision-rail" aria-label="Decision controls">
        <section className="safe-plan-card is-selected">
          <div className="safe-plan-card__halo" aria-hidden="true" />
          <span className="recommendation-chip"><ShieldCheck size={13} /> Automatically cleared</span>
          <h2>Read-only query</h2>
          <p>The verified statement changes no production data and needs no exception workflow.</p>
          <SqlSnippet sql={analysis.originalSql} tone="safe" compact label="Approved statement" />
          <div className="plan-deltas">
            <div><span>Rows changed</span><strong>0</strong></div>
            <div><span>Revenue exposure</span><strong>$0</strong></div>
            <div><span>Rollback needed</span><strong>No</strong></div>
          </div>
          <button type="button" className="primary-decision" onClick={onExecute}>
            <Play size={15} fill="currentColor" /> Execute read-only query
          </button>
        </section>
      </aside>
    );
  }

  return (
    <aside className="decision-rail" aria-label="Decision controls">
      <section className={`safe-plan-card ${safePlanActive ? "is-selected" : ""}`}>
        <div className="safe-plan-card__halo" aria-hidden="true" />
        <div className="safe-plan-card__heading">
          <span className="recommendation-chip"><Sparkles size={13} /> Recommended plan</span>
          <span className="risk-drop">−{improvement} risk</span>
        </div>

        <h2>{analysis.recommendedAlternative.title}</h2>
        <p>{analysis.recommendedAlternative.explanation}</p>

        <SqlSnippet sql={analysis.recommendedAlternative.sql} tone="safe" compact label="Safer SQL" />

        <div className="plan-deltas" aria-label="Safer plan impact changes">
          <div>
            <span>Cascade deletes</span>
            <strong><s>{formatCompact(analysis.indirectRows)}</s><ArrowRight size={13} />0</strong>
          </div>
          <div>
            <span>ARR exposed</span>
            <strong><s>{formatCurrency(analysis.businessImpact.arrAtRisk)}</s><ArrowRight size={13} />$0</strong>
          </div>
          <div>
            <span>Recovery</span>
            <strong>Instant</strong>
          </div>
        </div>

        {safePlanActive ? (
          <div className="safe-plan-card__actions">
            <button type="button" className="primary-decision" onClick={onExecute}>
              <ShieldCheck size={16} /> Approve contained plan
            </button>
            <button type="button" className="text-action" onClick={onUndo}>
              <RotateCcw size={13} /> Restore original candidate
            </button>
          </div>
        ) : (
          <div className="safe-plan-card__actions">
            <button type="button" className="primary-decision" onClick={onApply}>
              Use safer plan <ArrowRight size={15} />
            </button>
            <button type="button" className="secondary-decision" onClick={onEdit}>
              <Pencil size={14} /> Edit candidate SQL
            </button>
          </div>
        )}
      </section>

      <section className="assurance-card">
        <button type="button" className="assurance-card__toggle" onClick={() => setShowRiskEvidence((current) => !current)} aria-expanded={showRiskEvidence}>
          <span><CircleGauge size={15} /> Why policy blocked this</span>
          <ChevronDown size={15} className={showRiskEvidence ? "is-open" : ""} />
        </button>
        <AnimatePresence initial={false}>
          {showRiskEvidence && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="assurance-card__details">
              <RiskEvidence analysis={analysis} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="assurance-grid">
          <div><span>Policy</span><strong><LockKeyhole size={13} /> Human approval</strong></div>
          <div><span>Replica coverage</span><strong><CheckCircle2 size={13} /> 100%</strong></div>
          <div><span>Recovery point</span><strong><Clock3 size={13} /> 47s old</strong></div>
          <div><span>Database</span><strong><Database size={13} /> PostgreSQL 16</strong></div>
        </div>
        {!safePlanActive && (
          <button type="button" className="exception-action" onClick={onRequestException}>
            Request production exception…
          </button>
        )}
      </section>
    </aside>
  );
}

function ScenarioMenu({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (scenario: DemoScenario) => void;
}) {
  return (
    <motion.div className="scenario-menu" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}>
      <div className="scenario-menu__label">Intercept queue</div>
      {DEMO_SCENARIOS.map((scenario) => (
        <button key={scenario.id} type="button" className={scenario.id === activeId ? "is-active" : ""} onClick={() => onSelect(scenario)}>
          <span className={`scenario-severity ${scenario.expectedRiskScore === 0 ? "is-safe" : scenario.expectedRiskScore >= 80 ? "is-critical" : "is-high"}`} />
          <span className="scenario-copy"><strong>{scenario.title}</strong><small>{scenario.operation} · {scenario.targetTable}</small></span>
          <span className="scenario-score">{scenario.expectedRiskScore || "PASS"}</span>
          {scenario.id === activeId && <Check size={14} />}
        </button>
      ))}
    </motion.div>
  );
}

function CommandPalette({
  onClose,
  onSelectScenario,
  onSchema,
  onAudit,
}: {
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
  onSchema: () => void;
  onAudit: () => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = DEMO_SCENARIOS.filter((scenario) =>
    `${scenario.title} ${scenario.operation} ${scenario.targetTable}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <motion.div className="palette-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.div className="command-palette" role="dialog" aria-modal="true" aria-labelledby="palette-title" initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }}>
        <div className="command-palette__search">
          <Search size={17} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Jump to an incident or tool…" aria-label="Search commands" />
          <kbd>esc</kbd>
        </div>
        <div className="command-palette__body">
          <p id="palette-title">Intercept queue</p>
          {filtered.map((scenario) => (
            <button key={scenario.id} type="button" onClick={() => onSelectScenario(scenario)}>
              <span className="palette-icon"><Braces size={15} /></span>
              <span><strong>{scenario.title}</strong><small>{scenario.operation} on {scenario.targetTable}</small></span>
              <span className={scenario.expectedRiskScore === 0 ? "palette-risk is-safe" : "palette-risk"}>{scenario.expectedRiskScore || "PASS"}</span>
            </button>
          ))}
          <p>Tools</p>
          <button type="button" onClick={onSchema}><span className="palette-icon"><Database size={15} /></span><span><strong>Schema explorer</strong><small>Inspect tables and constraints</small></span></button>
          <button type="button" onClick={onAudit}><span className="palette-icon"><FileText size={15} /></span><span><strong>Audit ledger</strong><small>Open immutable evidence</small></span></button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ExceptionDialog({
  analysis,
  onClose,
  onConfirm,
}: {
  analysis: AnalysisRecord;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmation, setConfirmation] = useState("");
  const expected = "blastshield_prod";
  const canConfirm = confirmation === expected;

  return (
    <motion.div className="palette-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.div className="exception-dialog" role="dialog" aria-modal="true" aria-labelledby="exception-title" initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}>
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Close exception dialog"><X size={17} /></button>
        <span className="exception-dialog__icon"><AlertTriangle size={20} /></span>
        <p className="section-kicker">Production exception</p>
        <h2 id="exception-title">A second approval is required.</h2>
        <p>This bypass preserves the original {analysis.operationType} and can permanently affect {formatNumber(analysis.totalAffectedRows)} rows. The request will be recorded with operator identity and scope.</p>
        <div className="exception-impact">
          <div><span>Rows at risk</span><strong>{formatNumber(analysis.totalAffectedRows)}</strong></div>
          <div><span>Revenue exposed</span><strong>{formatCurrency(analysis.businessImpact.arrAtRisk)}</strong></div>
          <div><span>Recovery</span><strong>Point-in-time restore</strong></div>
        </div>
        <label htmlFor="production-confirmation">Type <code>{expected}</code> to confirm the target environment.</label>
        <input id="production-confirmation" autoFocus value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" spellCheck={false} placeholder={expected} />
        <div className="dialog-actions">
          <button type="button" className="secondary-decision" onClick={onClose}>Cancel</button>
          <button type="button" className="danger-decision" disabled={!canConfirm} onClick={onConfirm}><LockKeyhole size={14} /> Continue to revalidation</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BlastShieldDashboard({
  initialScenarioId,
}: {
  initialScenarioId?: string;
} = {}) {
  const initialSelected = useMemo(() => {
    if (initialScenarioId) {
      const match = DEMO_SCENARIOS.find((s) => s.id === initialScenarioId);
      if (match) return match;
    }
    return DEMO_SCENARIOS[0];
  }, [initialScenarioId]);

  const [scenarioId, setScenarioId] = useState(initialSelected.id);
  const [analysis, setAnalysis] = useState<AnalysisRecord>(() => {
    if (initialScenarioId) {
      const match = DEMO_SCENARIOS.find((s) => s.id === initialScenarioId);
      if (match) return generateAnalysisForScenario(match);
    }
    return getInitialPrimaryAnalysis();
  });
  const [safePlanActive, setSafePlanActive] = useState(false);
  const [evidenceView, setEvidenceView] = useState<EvidenceView>("topology");
  const [simulating, setSimulating] = useState(false);
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [modifyOpen, setModifyOpen] = useState(false);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const simulationTimer = useRef<number | null>(null);

  const [prevInitialId, setPrevInitialId] = useState(initialScenarioId);

  if (initialScenarioId !== prevInitialId) {
    setPrevInitialId(initialScenarioId);
    if (initialScenarioId) {
      const target = DEMO_SCENARIOS.find((s) => s.id === initialScenarioId);
      if (target) {
        setScenarioId(target.id);
        setAnalysis(generateAnalysisForScenario(target));
        setSafePlanActive(false);
      }
    }
  }

  const activeScenario = useMemo(
    () => DEMO_SCENARIOS.find((scenario) => scenario.id === scenarioId) ?? DEMO_SCENARIOS[0],
    [scenarioId],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const selectScenario = useCallback((scenario: DemoScenario) => {
    setScenarioMenuOpen(false);
    setCommandOpen(false);
    if (scenario.id === scenarioId) return;
    if (simulationTimer.current) window.clearTimeout(simulationTimer.current);
    setScenarioId(scenario.id);
    setSafePlanActive(false);
    setEvidenceView("topology");
    setSimulating(true);
    simulationTimer.current = window.setTimeout(() => {
      setAnalysis(generateAnalysisForScenario(scenario));
      setSimulating(false);
      simulationTimer.current = null;
    }, 520);
  }, [scenarioId]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setScenarioMenuOpen(false);
        setCommandOpen(false);
        setExceptionOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  useEffect(() => () => {
    if (simulationTimer.current) window.clearTimeout(simulationTimer.current);
  }, []);

  const applySafePlan = useCallback(() => {
    setSafePlanActive(true);
    setEvidenceView("topology");
    showToast(`Contained · ${formatNumber(analysis.indirectRows)} cascade deletions prevented`);
  }, [analysis.indirectRows, showToast]);

  const isReadOnly = analysis.operationType === "SELECT";
  const executionSql = safePlanActive ? analysis.recommendedAlternative.sql : analysis.originalSql;
  const executionRows = safePlanActive ? analysis.recommendedAlternative.directRows : analysis.directRows;

  return (
    <MotionConfig reducedMotion="user">
      <div className="blastshield-app">
        <header className="topbar">
          <div className="topbar__brand">
            <ContainmentMark compact />
            <div><strong>BLAST<span>SHIELD</span></strong><small>PRODUCTION SAFETY GATE</small></div>
          </div>

          <div className="topbar__center" aria-label="Environment status">
            <span className="environment-badge"><span /> PRODUCTION</span>
            <span className="context-divider" />
            <span><LockKeyhole size={13} /> writes gated</span>
            <span className="context-divider" />
            <span className="hide-small"><CheckCircle2 size={13} /> replica healthy</span>
          </div>

          <div className="topbar__actions">
            <button type="button" className="command-trigger" onClick={() => setCommandOpen(true)} aria-label="Open command menu">
              <Search size={14} /><span>Search</span><kbd>⌘ K</kbd>
            </button>
            <button type="button" className="icon-button" onClick={() => setAuditOpen(true)} aria-label="Open audit ledger"><FileText size={16} /></button>
            <span className="operator-avatar" title="Signed in as Maya Chen">MC</span>
          </div>
        </header>

        <div className="app-shell">
          <aside className="navigation-rail" aria-label="Primary tools">
            <button type="button" className="rail-button is-active" data-label="Decision" aria-label="Decision overview" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><LayoutDashboard size={18} /></button>
            <button type="button" className="rail-button" data-label="Topology" aria-label="Jump to topology" onClick={() => document.getElementById("evidence")?.scrollIntoView({ behavior: "smooth" })}><Network size={18} /></button>
            <button type="button" className="rail-button" data-label="Schema" aria-label="Open schema explorer" onClick={() => setSchemaOpen(true)}><Database size={18} /></button>
            <button type="button" className="rail-button" data-label="Audit" aria-label="Open audit ledger" onClick={() => setAuditOpen(true)}><FileCheck2 size={18} /></button>
            <span className="rail-spacer" />
            <button type="button" className="rail-button" data-label="Commands" aria-label="Open command menu" onClick={() => setCommandOpen(true)}><Command size={18} /></button>
            <div className="rail-health" title="All safety systems operational"><span /></div>
          </aside>

          <main className="workspace">
            <section className="context-bar" aria-label="Current incident">
              <div className="scenario-switcher">
                <button type="button" className="scenario-switcher__button" onClick={() => setScenarioMenuOpen((current) => !current)} aria-expanded={scenarioMenuOpen}>
                  <span className={`scenario-severity ${activeScenario.expectedRiskScore === 0 ? "is-safe" : activeScenario.expectedRiskScore >= 80 ? "is-critical" : "is-high"}`} />
                  <span><small>Intercept queue · 05</small><strong>{activeScenario.title}</strong></span>
                  <ChevronDown size={15} className={scenarioMenuOpen ? "is-open" : ""} />
                </button>
                <AnimatePresence>{scenarioMenuOpen && <ScenarioMenu activeId={scenarioId} onSelect={selectScenario} />}</AnimatePresence>
              </div>
              <div className="context-bar__facts">
                <span><Code2 size={13} /> {analysis.operationType}</span>
                <span><Database size={13} /> public.{analysis.targetTable}</span>
                <span className="hide-mobile"><Zap size={13} /> trueforge-db-operator</span>
                <span className="hide-mobile"><Clock3 size={13} /> intercepted 47s ago</span>
              </div>
              <button type="button" className="quiet-action hide-tablet" onClick={() => setSchemaOpen(true)}><Layers3 size={14} /> Inspect schema</button>
            </section>

            <div className="cockpit-grid">
              <div className="primary-column">
                <DecisionHero analysis={analysis} safePlanActive={safePlanActive} />
                <EvidencePanel
                  analysis={analysis}
                  safePlanActive={safePlanActive}
                  view={evidenceView}
                  onViewChange={setEvidenceView}
                  simulating={simulating}
                  onOpenAudit={() => setAuditOpen(true)}
                />
              </div>

              <SafePlanRail
                analysis={analysis}
                safePlanActive={safePlanActive}
                onApply={applySafePlan}
                onUndo={() => { setSafePlanActive(false); showToast("Original intercepted candidate restored"); }}
                onEdit={() => setModifyOpen(true)}
                onExecute={() => setExecutionOpen(true)}
                onRequestException={() => setExceptionOpen(true)}
              />
            </div>

            <footer className="workspace-footer">
              <span><ContainmentMark compact /> BlastShield safety layer for TrueForge agents</span>
              <span>Policy BS-PROD-017 · PostgreSQL 16 · TLS 1.3</span>
            </footer>
          </main>
        </div>

        <nav className="mobile-dock" aria-label="Mobile tools">
          <button type="button" className="is-active"><LayoutDashboard size={18} /><span>Decision</span></button>
          <button type="button" onClick={() => document.getElementById("evidence")?.scrollIntoView({ behavior: "smooth" })}><Network size={18} /><span>Impact</span></button>
          <button type="button" onClick={() => setSchemaOpen(true)}><Database size={18} /><span>Schema</span></button>
          <button type="button" onClick={() => setAuditOpen(true)}><FileText size={18} /><span>Audit</span></button>
        </nav>

        <div className="toast-region" aria-live="polite" aria-atomic="true">
          <AnimatePresence>
            {toast && (
              <motion.div className="app-toast" initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}>
                <ShieldCheck size={15} />{toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {commandOpen && (
            <CommandPalette
              onClose={() => setCommandOpen(false)}
              onSelectScenario={selectScenario}
              onSchema={() => { setCommandOpen(false); setSchemaOpen(true); }}
              onAudit={() => { setCommandOpen(false); setAuditOpen(true); }}
            />
          )}
          {exceptionOpen && (
            <ExceptionDialog
              key={analysis.id}
              analysis={analysis}
              onClose={() => setExceptionOpen(false)}
              onConfirm={() => { setExceptionOpen(false); setExecutionOpen(true); }}
            />
          )}
        </AnimatePresence>

        {schemaOpen && <SchemaExplorerModal isOpen={schemaOpen} onClose={() => setSchemaOpen(false)} />}
        {auditOpen && <AuditLogDrawer isOpen={auditOpen} onClose={() => setAuditOpen(false)} currentAnalysisId={analysis.id} />}
        {modifyOpen && (
          <ModifySqlModal
            isOpen={modifyOpen}
            onClose={() => setModifyOpen(false)}
            currentSql={executionSql}
            onApplySql={(sql) => {
              setAnalysis((current) => ({ ...current, originalSql: sql, activeAlternativeSql: sql }));
              setSafePlanActive(false);
              setModifyOpen(false);
              setSimulating(true);
              showToast("Candidate updated · sandbox simulation queued");
              window.setTimeout(() => setSimulating(false), 620);
            }}
          />
        )}
        {executionOpen && (
          <ExecutionModal
            isOpen={executionOpen}
            onClose={() => setExecutionOpen(false)}
            isSafeMode={safePlanActive || isReadOnly}
            sql={executionSql}
            directRows={executionRows}
            cascadesCount={safePlanActive ? 0 : analysis.cascadesCount}
          />
        )}
      </div>
    </MotionConfig>
  );
}
