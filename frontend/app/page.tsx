"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExecutionModal } from "@/components/ExecutionModal";
import { SchemaExplorerModal } from "@/components/SchemaExplorerModal";
import { AuditLogDrawer } from "@/components/AuditLogDrawer";
import { ModifySqlModal } from "@/components/ModifySqlModal";
import { BlastRadiusGraph } from "@/components/BlastRadiusGraph";
import { BeforeAfterTable } from "@/components/BeforeAfterTable";
import {
  DEMO_SCENARIOS,
  DEMO_SCHEMA_TABLES,
  getInitialPrimaryAnalysis,
  generateAnalysisForScenario,
} from "@/lib/mockData";
import { AnalysisRecord } from "@/lib/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Database,
  FileText,
  RotateCcw,
  ChevronRight,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Users,
  DollarSign,
  Layers,
  ArrowRight,
  Code2,
  Network,
  Table,
  X,
  Copy,
  Check,
  ChevronDown,
  Bot,
  Lock,
  Unlock,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   SVG Illustrations (inline, no images needed)
───────────────────────────────────────────────────────── */

function InterceptIllustration({ safe }: { safe: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="danger-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={safe ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
          <stop offset="100%" stopColor={safe ? "#10b981" : "#ef4444"} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={safe ? "#10b981" : "#6366f1"} />
          <stop offset="100%" stopColor={safe ? "#059669" : "#4f46e5"} />
        </linearGradient>
      </defs>
      {/* Glow */}
      <circle cx="60" cy="60" r="55" fill="url(#danger-glow)" />
      {/* Outer ring */}
      <circle cx="60" cy="60" r="48" fill="none" stroke={safe ? "#10b981" : "#6366f1"} strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
      {/* DB cylinder */}
      <ellipse cx="60" cy="28" rx="18" ry="6" fill="none" stroke={safe ? "#10b981" : "#ef4444"} strokeWidth="1.5" opacity="0.8" />
      <rect x="42" y="28" width="36" height="26" fill="none" stroke={safe ? "#10b981" : "#ef4444"} strokeWidth="1.5" opacity="0.8" />
      <ellipse cx="60" cy="54" rx="18" ry="6" fill={safe ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"} stroke={safe ? "#10b981" : "#ef4444"} strokeWidth="1.5" opacity="0.8" />
      {/* Horizontal lines in DB */}
      <line x1="44" y1="36" x2="76" y2="36" stroke={safe ? "#10b981" : "#ef4444"} strokeWidth="1" opacity="0.4" />
      <line x1="44" y1="44" x2="76" y2="44" stroke={safe ? "#10b981" : "#ef4444"} strokeWidth="1" opacity="0.4" />
      {/* Shield */}
      <path
        d="M60 65 L46 72 L46 86 Q46 96 60 102 Q74 96 74 86 L74 72 Z"
        fill="url(#shield-grad)"
        opacity="0.9"
      />
      <path
        d="M60 70 L50 75.5 L50 86 Q50 93.5 60 98 Q70 93.5 70 86 L70 75.5 Z"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      {/* Check / Alert */}
      {safe ? (
        <path d="M54 84 L58 88 L67 78" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <line x1="60" y1="76" x2="60" y2="87" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="92" r="1.5" fill="white" />
        </>
      )}
      {/* Spark particles */}
      {!safe && (
        <>
          <circle cx="36" cy="60" r="2" fill="#ef4444" opacity="0.6" />
          <circle cx="84" cy="52" r="1.5" fill="#f59e0b" opacity="0.5" />
          <circle cx="78" cy="70" r="2.5" fill="#ef4444" opacity="0.4" />
        </>
      )}
      {safe && (
        <>
          <circle cx="36" cy="58" r="2" fill="#10b981" opacity="0.5" />
          <circle cx="84" cy="50" r="1.5" fill="#10b981" opacity="0.4" />
          <circle cx="78" cy="72" r="2" fill="#6ee7b7" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

function CascadeIllustration() {
  return (
    <svg viewBox="0 0 200 80" className="w-full" aria-hidden="true">
      {/* Root node: users */}
      <rect x="4" y="24" width="50" height="32" rx="8" fill="rgba(239,68,68,0.12)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
      <text x="29" y="43" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">users</text>

      {/* Connector lines */}
      <line x1="54" y1="40" x2="72" y2="28" stroke="rgba(239,68,68,0.35)" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="54" y1="40" x2="72" y2="52" stroke="rgba(239,68,68,0.35)" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="54" y1="40" x2="136" y2="28" stroke="rgba(239,68,68,0.20)" strokeWidth="1" strokeDasharray="3 2" />

      {/* Level 1 nodes */}
      <rect x="72" y="14" width="62" height="28" rx="8" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.35)" strokeWidth="1.2" />
      <text x="103" y="27" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">orders</text>
      <text x="103" y="37" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="var(--font-mono)">-21,003</text>

      <rect x="72" y="48" width="62" height="28" rx="8" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.35)" strokeWidth="1.2" />
      <text x="103" y="61" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">subs</text>
      <text x="103" y="71" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="var(--font-mono)">-347</text>

      <rect x="136" y="14" width="60" height="28" rx="8" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.25)" strokeWidth="1" />
      <text x="166" y="27" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">sessions</text>
      <text x="166" y="37" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="var(--font-mono)">-9,682</text>

      {/* Level 2 */}
      <line x1="134" y1="28" x2="152" y2="52" stroke="rgba(239,68,68,0.25)" strokeWidth="1" strokeDasharray="3 2" />
      <rect x="136" y="48" width="60" height="28" rx="8" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.2)" strokeWidth="1" />
      <text x="166" y="61" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="600" fontFamily="var(--font-mono)">payments</text>
      <text x="166" y="71" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="var(--font-mono)">-18,201</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   Step Progress Header
───────────────────────────────────────────────────────── */
function StepProgress({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`step-dot ${step === 1 ? "active" : "done"}`}>
        {step > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
      </div>
      <span className={`text-xs font-semibold ${step === 1 ? "text-white" : "text-slate-400"}`}>
        Review Impact
      </span>
      <div className={`step-connector ${step > 1 ? "done" : ""} hidden sm:block`} style={{ width: 32 }} />
      <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
      <div className={`step-dot ${step === 2 ? "active" : step > 2 ? "done" : "pending"}`}>2</div>
      <span className={`text-xs font-semibold ${step === 2 ? "text-white" : "text-slate-500"}`}>
        Choose & Execute
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Risk Score Badge
───────────────────────────────────────────────────────── */
function RiskOrb({ score, level }: { score: number; level: string }) {
  const color =
    level === "CRITICAL" ? "#ef4444"
    : level === "HIGH" ? "#f97316"
    : level === "MEDIUM" ? "#f59e0b"
    : "#10b981";
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
      <svg width="100" height="100" viewBox="0 0 100 100" className="rotate-[-90deg]">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black" style={{ color, lineHeight: 1 }}>{score}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{level}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Metric Card
───────────────────────────────────────────────────────── */
function MetricCard({
  label,
  value,
  sub,
  variant = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "danger" | "safe" | "neutral" | "warning";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const colors = {
    danger: { val: "text-red-400", bg: "bg-red-950/30 border-red-900/50" },
    safe: { val: "text-emerald-400", bg: "bg-emerald-950/25 border-emerald-900/40" },
    warning: { val: "text-amber-400", bg: "bg-amber-950/20 border-amber-900/30" },
    neutral: { val: "text-slate-200", bg: "bg-[#0f1623] border-slate-800" },
  }[variant];

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-2 ${colors.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={`w-4 h-4 opacity-60 ${colors.val}`} />}
      </div>
      <span className={`text-2xl font-bold leading-none tracking-tight ${colors.val}`}>
        {typeof value === "number" ? formatNumber(value) : value}
      </span>
      {sub && <span className="text-xs text-slate-500 leading-tight">{sub}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SQL Diff Display (simplified)
───────────────────────────────────────────────────────── */
function SqlBlock({
  sql,
  label,
  variant,
}: {
  sql: string;
  label: string;
  variant: "danger" | "safe";
}) {
  const [copied, setCopied] = useState(false);
  const lines = sql.trim().split("\n");
  const color = variant === "danger" ? "text-red-400" : "text-emerald-400";
  const bg = variant === "danger" ? "bg-red-950/20 border-red-900/40" : "bg-emerald-950/15 border-emerald-900/30";

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border ${bg} overflow-hidden`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50">
        <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${color}`}>{label}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors text-[11px]">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-3">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-slate-700 text-xs font-mono select-none w-4 text-right flex-shrink-0">{i + 1}</span>
            <code className={`text-xs font-mono leading-relaxed ${color}`}>{line || " "}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Scenario Pill
───────────────────────────────────────────────────────── */
function ScenarioPill({
  scenario,
  isActive,
  onClick,
}: {
  scenario: typeof DEMO_SCENARIOS[0];
  isActive: boolean;
  onClick: () => void;
}) {
  const dangerLevel =
    scenario.expectedRiskLevel === "CRITICAL" ? "text-red-400 border-red-900/50 bg-red-950/25"
    : scenario.expectedRiskLevel === "HIGH" ? "text-orange-400 border-orange-900/50 bg-orange-950/20"
    : "text-emerald-400 border-emerald-900/50 bg-emerald-950/20";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all touch-target ${
        isActive
          ? "bg-indigo-950/50 border-indigo-500/50 ring-1 ring-indigo-500/20"
          : "bg-[#0f1623] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-sm font-semibold text-white leading-tight">{scenario.title}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${dangerLevel}`}>
          {scenario.expectedRiskScore > 0 ? scenario.expectedRiskScore : "SAFE"}
        </span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{scenario.description}</p>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────────────────── */
export default function BlastShieldDashboard() {
  const [currentScenarioId, setCurrentScenarioId] = useState("inactive_users_delete");
  const [analysis, setAnalysis] = useState<AnalysisRecord>(getInitialPrimaryAnalysis());
  const [isUsingSafer, setIsUsingSafer] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [activeTab, setActiveTab] = useState<"graph" | "table">("graph");
  const [showSidePanel, setShowSidePanel] = useState(false);

  // Modals
  const [isExecutionOpen, setIsExecutionOpen] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectScenario = (id: string) => {
    if (id === currentScenarioId) return;
    setCurrentScenarioId(id);
    setIsUsingSafer(false);
    setStep(1);
    setIsSimulating(true);
    const sc = DEMO_SCENARIOS.find((s) => s.id === id) || DEMO_SCENARIOS[0];
    setTimeout(() => {
      setAnalysis(generateAnalysisForScenario(sc));
      setIsSimulating(false);
    }, 320);
  };

  const handleToggleSafer = (useSafe: boolean) => {
    setIsUsingSafer(useSafe);
    if (useSafe) showToast("✓ Safe alternative applied. Risk dropped from 85 → 34.");
  };

  const displayRiskScore = isUsingSafer ? analysis.recommendedAlternative.riskScore : analysis.riskScore;
  const displayRiskLevel = isUsingSafer ? analysis.recommendedAlternative.riskLevel : analysis.riskLevel;
  const displayRows = isUsingSafer ? analysis.recommendedAlternative.directRows : analysis.totalAffectedRows;
  const displayCascades = isUsingSafer ? 0 : analysis.cascadesCount;
  const displayARR = isUsingSafer ? 0 : analysis.businessImpact.arrAtRisk;
  const displayPayingUsers = isUsingSafer ? 0 : analysis.businessImpact.activePayingUsers;
  const isSafe = analysis.riskLevel === "LOW";

  return (
    <div className="min-h-screen bg-[#07090e] bg-grid-subtle flex flex-col">
      {/* Ambient glow */}
      <div
        className={`fixed inset-0 pointer-events-none transition-all duration-1000 ${isUsingSafer ? "bg-safe-glow" : isSafe ? "bg-safe-glow" : "bg-danger-glow"}`}
      />

      {/* ── TOP NAV ── */}
      <header className="relative z-30 border-b border-slate-800/80 bg-[#07090e]/90 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-5 h-14">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-[15px] text-white tracking-tight">
                BlastShield<span className="text-cyan-400">AI</span>
              </span>
              <span className="pill-brand hidden sm:inline">TrueForge Gate</span>
            </div>
          </div>

          {/* Step progress (center) */}
          <div className="hidden md:block">
            <StepProgress step={step} />
          </div>

          {/* Right tools */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PROD: blastshield_prod</span>
            </div>
            <button onClick={() => setIsSchemaOpen(true)} className="btn-ghost text-xs py-2 px-3 min-h-[38px]">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Schema</span>
            </button>
            <button onClick={() => setIsAuditOpen(true)} className="btn-ghost text-xs py-2 px-3 min-h-[38px]">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Audit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-16 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/95 border border-emerald-700/60 text-emerald-300 text-sm font-medium shadow-xl backdrop-blur"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 flex max-w-[1440px] mx-auto w-full">
        {/* ── LEFT: Scenario Panel ── */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 border-r border-slate-800/60 py-5 px-4 space-y-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
              Agent Scenarios
            </p>
            <div className="space-y-2">
              {DEMO_SCENARIOS.map((sc) => (
                <ScenarioPill
                  key={sc.id}
                  scenario={sc}
                  isActive={sc.id === currentScenarioId}
                  onClick={() => handleSelectScenario(sc.id)}
                />
              ))}
            </div>
          </div>

          {/* Schema mini list */}
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Database</p>
              <button onClick={() => setIsSchemaOpen(true)} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                Explore →
              </button>
            </div>
            <div className="rounded-xl bg-[#0f1623] border border-slate-800 divide-y divide-slate-800/60 overflow-hidden">
              {DEMO_SCHEMA_TABLES.slice(0, 5).map((t) => (
                <div key={t.name} className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-mono text-slate-300">{t.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{formatNumber(t.rowCount)}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CENTER CONTENT ── */}
        <main className="flex-1 min-w-0 py-6 px-4 xl:px-8 pb-32">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: INTERCEPT REVIEW ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-3xl mx-auto"
              >
                {/* Hero intercept card */}
                <div className={`card-elevated rounded-2xl overflow-hidden ${isSimulating ? "opacity-60" : ""}`}>
                  <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-800/60">
                    {/* Illustration */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <InterceptIllustration safe={isSafe} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {isSafe ? (
                          <span className="pill-safe">Safe Query</span>
                        ) : (
                          <span className="pill-danger">🛡 Action Intercepted</span>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">{analysis.id}</span>
                      </div>
                      <h1 className="text-lg font-bold text-white leading-snug">
                        {isSafe
                          ? "Safe read-only query — no blast radius."
                          : `Destructive ${analysis.operationType} on \`${analysis.targetTable}\` detected`}
                      </h1>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                        {isSafe
                          ? "BlastShield determined this query is non-mutating. You may execute immediately."
                          : `TrueForge MCP intercepted this ${analysis.operationType} statement before production execution. BlastShield ran a safe sandbox simulation to measure consequences.`}
                      </p>
                    </div>
                    <RiskOrb score={analysis.riskScore} level={analysis.riskLevel} />
                  </div>

                  {/* Agent Prompt Row */}
                  <div className="px-6 py-3 bg-slate-900/40 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 mb-0.5 font-medium">Agent prompt received:</p>
                      <p className="text-sm text-slate-200 font-medium italic">&ldquo;{analysis.prompt}&rdquo;</p>
                    </div>
                  </div>

                  {/* Generated SQL */}
                  <div className="px-6 py-4 border-t border-slate-800/60">
                    <p className="text-xs font-medium text-slate-400 mb-2">Generated SQL (intercepted before execution):</p>
                    <SqlBlock sql={analysis.originalSql} label={`${analysis.operationType} — ${analysis.targetTable}`} variant="danger" />
                  </div>
                </div>

                {/* Key Findings — simplified, not overwhelming */}
                {!isSafe && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetricCard
                      label="Direct Impact"
                      value={analysis.directRows}
                      sub="rows targeted"
                      variant="danger"
                      icon={Users}
                    />
                    <MetricCard
                      label="Cascaded Rows"
                      value={analysis.indirectRows}
                      sub={`across ${analysis.cascadesCount} tables`}
                      variant="danger"
                      icon={Layers}
                    />
                    <MetricCard
                      label="Paying Accounts"
                      value={analysis.businessImpact.activePayingUsers}
                      sub="active subscriptions at risk"
                      variant="danger"
                      icon={Users}
                    />
                    <MetricCard
                      label="ARR at Risk"
                      value={formatCurrency(analysis.businessImpact.arrAtRisk)}
                      sub="annual recurring revenue"
                      variant="danger"
                      icon={DollarSign}
                    />
                  </div>
                )}

                {/* Cascade tree visualization */}
                {!isSafe && analysis.cascadesCount > 0 && (
                  <div className="card rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Network className="w-4 h-4 text-red-400" />
                        Cascade Dependency Tree
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono">{analysis.cascadesCount} levels deep</span>
                    </div>
                    <div className="overflow-x-auto py-1">
                      <CascadeIllustration />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Deleting from <code className="text-red-300 font-mono">users</code> triggers ON DELETE CASCADE to{" "}
                      <code className="text-red-300 font-mono">orders</code> →{" "}
                      <code className="text-red-300 font-mono">payments</code>, plus cascades to{" "}
                      <code className="text-red-300 font-mono">subscriptions</code> and{" "}
                      <code className="text-red-300 font-mono">sessions</code>.
                    </p>
                  </div>
                )}

                {/* Simulation steps — collapsed by default */}
                <SimulationStepsCollapsible steps={analysis.steps} />

                {/* Primary CTA: Proceed to Decision */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-slate-400">
                    {isSafe ? "No further review required." : "Review complete. Now choose how to proceed."}
                  </p>
                  {isSafe ? (
                    <button
                      onClick={() => setIsExecutionOpen(true)}
                      className="btn-primary"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Execute Safe Query
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep(2)}
                      className="btn-primary"
                    >
                      <span>Choose Action</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: DECISION & EXECUTE ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                {/* Back button + heading */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                    Back to Impact Review
                  </button>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Choose carefully — this action will touch production.</span>
                  </div>
                </div>

                {/* Comparison: 2 big cards side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ── Option A: Original (Dangerous) ── */}
                  <motion.div
                    layout
                    onClick={() => handleToggleSafer(false)}
                    className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                      !isUsingSafer
                        ? "bg-red-950/20 border-red-500/50 ring-2 ring-red-500/20 shadow-lg"
                        : "bg-[#0f1623] border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {!isUsingSafer && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                        Selected
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-red-500/15 border border-red-500/30">
                          <ShieldAlert className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="font-bold text-sm text-white">Original (Dangerous)</span>
                      </div>
                      <RiskOrb score={analysis.riskScore} level={analysis.riskLevel} />
                    </div>

                    <SqlBlock sql={analysis.originalSql} label={`Hard ${analysis.operationType}`} variant="danger" />

                    <div className="mt-4 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-red-950/30 border border-red-900/40 px-3 py-2">
                          <p className="text-slate-400 mb-0.5">Total Rows Wiped</p>
                          <p className="font-bold text-red-400">{formatNumber(analysis.totalAffectedRows)}</p>
                        </div>
                        <div className="rounded-xl bg-red-950/30 border border-red-900/40 px-3 py-2">
                          <p className="text-slate-400 mb-0.5">ARR Destroyed</p>
                          <p className="font-bold text-red-400">{formatCurrency(analysis.businessImpact.arrAtRisk)}</p>
                        </div>
                        <div className="col-span-2 rounded-xl bg-red-950/30 border border-red-900/40 px-3 py-2">
                          <p className="text-slate-400 mb-0.5">Reversibility</p>
                          <p className="font-semibold text-red-300">Requires full DB backup restore</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* ── Option B: Safe Alternative ── */}
                  <motion.div
                    layout
                    onClick={() => handleToggleSafer(true)}
                    className={`relative rounded-2xl border p-5 cursor-pointer transition-all duration-200 ${
                      isUsingSafer
                        ? "bg-emerald-950/20 border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-[0_0_32px_rgba(16,185,129,0.1)]"
                        : "bg-[#0f1623] border-slate-800 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {isUsingSafer && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                        ✓ Selected
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white">BlastShield Recommended</span>
                          <span className="ml-2 text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-full px-2 py-0.5 font-bold">★ SAFER</span>
                        </div>
                      </div>
                      <RiskOrb score={analysis.recommendedAlternative.riskScore} level={analysis.recommendedAlternative.riskLevel} />
                    </div>

                    <SqlBlock sql={analysis.recommendedAlternative.sql} label={analysis.recommendedAlternative.title} variant="safe" />

                    <div className="mt-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/30 px-3 py-2">
                          <p className="text-slate-400 mb-0.5">Rows Updated</p>
                          <p className="font-bold text-emerald-400">{formatNumber(analysis.recommendedAlternative.directRows)}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/30 px-3 py-2">
                          <p className="text-slate-400 mb-0.5">ARR Protected</p>
                          <p className="font-bold text-emerald-400">{formatCurrency(analysis.businessImpact.arrAtRisk)}</p>
                        </div>
                        <div className="col-span-2 rounded-xl bg-emerald-950/20 border border-emerald-900/30 px-3 py-2">
                          <p className="text-slate-400 mb-0.5">Reversibility</p>
                          <p className="font-semibold text-emerald-300">100% — SET deleted_at = NULL anytime</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {analysis.recommendedAlternative.benefits.map((b, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Detail tabs */}
                <div className="card rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-1 px-4 py-3 border-b border-slate-800/60 bg-slate-900/50">
                    <button
                      onClick={() => setActiveTab("graph")}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all touch-target flex items-center gap-1.5 ${
                        activeTab === "graph" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Network className="w-3.5 h-3.5" />
                      Blast Radius Graph
                    </button>
                    <button
                      onClick={() => setActiveTab("table")}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all touch-target flex items-center gap-1.5 ${
                        activeTab === "table" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      Row Impact Diff
                    </button>
                  </div>
                  <div className="p-4">
                    {activeTab === "graph" ? (
                      <BlastRadiusGraph analysis={analysis} isSafeMode={isUsingSafer} />
                    ) : (
                      <BeforeAfterTable diffs={analysis.tableDiffs} isSafeMode={isUsingSafer} />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ── BOTTOM ACTION BAR (Step 2 only) ── */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-[#07090e]/95 backdrop-blur-md"
          >
            <div className="max-w-[1440px] mx-auto px-5 py-4 flex items-center justify-between gap-4">
              {/* Status summary */}
              <div className="flex items-center gap-3 min-w-0">
                {isUsingSafer ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-700/40">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-300">Safe Alternative Selected</p>
                      <p className="text-[11px] text-slate-500 truncate">Risk: 34 MEDIUM · 0 Cascades · $0 ARR loss</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/40 border border-red-700/40">
                    <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-red-300">Dangerous Hard Delete Selected</p>
                      <p className="text-[11px] text-slate-500 truncate">{formatNumber(analysis.totalAffectedRows)} rows across {analysis.cascadesCount} cascades</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    showToast("Action cancelled by human operator.");
                    setStep(1);
                  }}
                  className="btn-ghost text-sm px-4 py-2.5"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={() => setIsModifyOpen(true)}
                  className="btn-ghost text-sm px-4 py-2.5"
                >
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Edit SQL
                </button>
                <button
                  onClick={() => setIsExecutionOpen(true)}
                  className={isUsingSafer ? "btn-primary" : "btn-danger"}
                >
                  {isUsingSafer ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Approve & Execute (Safe Mode)
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      Execute Anyway (Dangerous)
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ExecutionModal
        isOpen={isExecutionOpen}
        onClose={() => setIsExecutionOpen(false)}
        isSafeMode={isUsingSafer}
        sql={isUsingSafer ? analysis.recommendedAlternative.sql : analysis.originalSql}
        directRows={isUsingSafer ? analysis.recommendedAlternative.directRows : analysis.directRows}
        cascadesCount={displayCascades}
      />
      <SchemaExplorerModal isOpen={isSchemaOpen} onClose={() => setIsSchemaOpen(false)} />
      <AuditLogDrawer isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} currentAnalysisId={analysis.id} />
      <ModifySqlModal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        currentSql={isUsingSafer ? analysis.recommendedAlternative.sql : analysis.originalSql}
        onApplySql={(sql) => {
          setAnalysis((prev) => ({ ...prev, originalSql: sql }));
          showToast("SQL updated. Sandbox analysis refreshed.");
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Simulation Steps (collapsed accordion)
───────────────────────────────────────────────────────── */
function SimulationStepsCollapsible({ steps }: { steps: AnalysisRecord["steps"] }) {
  const [open, setOpen] = useState(false);
  const completedCount = steps.filter((s) => s.status === "completed").length;

  return (
    <div className="card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-colors touch-target"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/25">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Sandbox Simulation Pipeline</p>
            <p className="text-xs text-slate-400">{completedCount}/{steps.length} steps completed · 100% isolated</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2 border-t border-slate-800/60">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-start gap-3 py-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {step.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-200">{idx + 1}. {step.title}</p>
                      {step.timestamp && (
                        <span className="text-[10px] text-slate-600 font-mono">{step.timestamp}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{step.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
