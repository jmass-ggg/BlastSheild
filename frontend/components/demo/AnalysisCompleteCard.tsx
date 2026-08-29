"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Download,
  Shield,
  AlertTriangle,
  ArrowRight,
  Database,
  ShoppingCart,
  CreditCard,
  FileText,
  Clock,
  Calendar,
  Check,
  ChevronRight,
  Network,
} from "lucide-react";
import { SchemaImpactTree } from "@/components/visuals/SchemaImpactTree";
import { formatNumber } from "@/lib/utils";

interface AnalysisCompleteCardProps {
  onOpenReport?: () => void;
}

const tableBreakdown = [
  { name: "users", count: 12481, direct: true },
  { name: "orders", count: 21003, direct: true },
  { name: "payments", count: 18201, direct: false },
  { name: "invoices", count: 5102, direct: false },
  { name: "sessions", count: 9682, direct: false },
  { name: "subscriptions", count: 347, direct: false },
];

function ImpactSummaryPanel() {
  return (
    <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
      {/* Header & Risk Tag */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800">Impact Summary</h4>
        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-extrabold font-mono uppercase">
          HIGH RISK
        </span>
      </div>

      {/* Big Number */}
      <div className="pt-1">
        <span className="text-[10px] text-slate-400 font-mono block">Total Impact</span>
        <span className="text-3xl font-extrabold text-[#4F46E5] font-mono leading-none block my-1">
          66,816
        </span>
        <span className="text-xs text-slate-500">rows across 6 tables</span>
      </div>

      {/* Table-by-table list */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {tableBreakdown.map((row) => (
          <div key={row.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  row.direct ? "bg-rose-500" : "bg-amber-500"
                }`}
              />
              <span className="font-mono text-slate-700">{row.name}</span>
            </div>
            <span className="font-mono font-semibold text-slate-900">
              {formatNumber(row.count)}
            </span>
          </div>
        ))}
      </div>

      {/* Risk Level Gauge */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <span className="text-slate-600">Risk Level</span>
          <span className="text-rose-600 font-mono">HIGH</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          <div className="h-1.5 rounded-full bg-rose-500" />
          <div className="h-1.5 rounded-full bg-rose-500" />
          <div className="h-1.5 rounded-full bg-rose-500" />
          <div className="h-1.5 rounded-full bg-rose-500" />
          <div className="h-1.5 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Confidence Score */}
      <div>
        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
          <span>Confidence Score</span>
          <span className="font-mono font-bold text-indigo-600">98%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full w-[98%]" />
        </div>
      </div>

      {/* Downtime & Business Impact */}
      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Estimated Downtime</span>
          <span className="font-mono font-semibold text-slate-800">12–18 min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Business Impact</span>
          <span className="font-semibold text-rose-600">Severe</span>
        </div>
      </div>

      {/* Blue Info Box */}
      <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-2.5 text-left">
        <Shield size={15} className="text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-indigo-900 leading-tight">
          <strong className="block font-semibold mb-0.5">This is a simulated analysis.</strong>
          <span className="text-indigo-700">No real data has been changed.</span>
        </div>
      </div>
    </div>
  );
}

function BlastRadiusTab() {
  const nodes = [
    { id: "users", label: "users", count: "12,481", type: "direct", x: 50, y: 10, icon: Database },
    { id: "orders", label: "orders", count: "21,003", type: "cascade", x: 15, y: 55, icon: ShoppingCart },
    { id: "payments", label: "payments", count: "18,201", type: "cascade2", x: 50, y: 80, icon: CreditCard },
    { id: "sessions", label: "sessions", count: "9,682", type: "cascade", x: 85, y: 55, icon: Clock },
    { id: "invoices", label: "invoices", count: "5,102", type: "cascade", x: 50, y: 55, icon: FileText },
    { id: "subscriptions", label: "subscriptions", count: "347", type: "cascade", x: 15, y: 10, icon: Calendar },
  ];

  const impactLevels = [
    { label: "Direct Deletion", count: "12,481 rows", pct: 19, color: "bg-rose-500", textColor: "text-rose-600" },
    { label: "Cascade Level 1", count: "36,032 rows", pct: 54, color: "bg-amber-500", textColor: "text-amber-600" },
    { label: "Cascade Level 2", count: "18,201 rows", pct: 27, color: "bg-orange-400", textColor: "text-orange-600" },
  ];

  return (
    <div className="lg:col-span-8 space-y-4">
      {/* Blast Radius Visual: Concentric Rings */}
      <div className="relative rounded-2xl bg-[#FAFBFF] border border-slate-200/80 overflow-hidden p-8 min-h-[300px] flex flex-col items-center justify-center">
        <h4 className="text-sm font-bold text-slate-800 mb-1 self-start">Blast Radius Visualization</h4>
        <p className="text-xs text-slate-500 mb-6 self-start">Concentric impact zones from the DELETE operation</p>

        {/* SVG Blast Radius rings */}
        <svg viewBox="0 0 400 300" className="w-full max-w-[420px] h-auto">
          {/* Outer ring - Cascade L2 */}
          <ellipse cx="200" cy="150" rx="180" ry="120" fill="rgba(251,146,60,0.08)" stroke="#FB923C" strokeWidth="1.5" strokeDasharray="5 3" />
          {/* Mid ring - Cascade L1 */}
          <ellipse cx="200" cy="150" rx="120" ry="80" fill="rgba(245,158,11,0.1)" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5 3" />
          {/* Core ring - Direct */}
          <ellipse cx="200" cy="150" rx="60" ry="40" fill="rgba(239,68,68,0.15)" stroke="#EF4444" strokeWidth="2.5" />

          {/* Center Node - users */}
          <rect x="167" y="130" width="66" height="40" rx="8" fill="white" stroke="#F43F5E" strokeWidth="2" />
          <text x="200" y="147" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1E293B">users</text>
          <text x="200" y="160" textAnchor="middle" fontSize="8" fontWeight="600" fill="#6366F1" fontFamily="monospace">12,481</text>

          {/* Cascade L1 Nodes */}
          {/* orders - left */}
          <rect x="25" y="125" width="70" height="38" rx="7" fill="white" stroke="#F97316" strokeWidth="1.5" />
          <text x="60" y="141" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1E293B">orders</text>
          <text x="60" y="154" textAnchor="middle" fontSize="8" fill="#F97316" fontFamily="monospace">21,003</text>
          <line x1="95" y1="144" x2="167" y2="150" stroke="#F97316" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* sessions - right */}
          <rect x="305" y="125" width="68" height="38" rx="7" fill="white" stroke="#F97316" strokeWidth="1.5" />
          <text x="339" y="141" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1E293B">sessions</text>
          <text x="339" y="154" textAnchor="middle" fontSize="8" fill="#F97316" fontFamily="monospace">9,682</text>
          <line x1="305" y1="144" x2="233" y2="150" stroke="#F97316" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* invoices - top */}
          <rect x="163" y="38" width="72" height="38" rx="7" fill="white" stroke="#F97316" strokeWidth="1.5" />
          <text x="199" y="54" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1E293B">invoices</text>
          <text x="199" y="67" textAnchor="middle" fontSize="8" fill="#F97316" fontFamily="monospace">5,102</text>
          <line x1="199" y1="76" x2="199" y2="130" stroke="#F97316" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* subscriptions - top-left */}
          <rect x="20" y="30" width="88" height="38" rx="7" fill="white" stroke="#F97316" strokeWidth="1.5" />
          <text x="64" y="46" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1E293B">subscriptions</text>
          <text x="64" y="59" textAnchor="middle" fontSize="8" fill="#F97316" fontFamily="monospace">347</text>
          <line x1="108" y1="55" x2="167" y2="140" stroke="#F97316" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* payments - bottom (cascade L2) */}
          <rect x="163" y="225" width="72" height="38" rx="7" fill="white" stroke="#FB923C" strokeWidth="1.5" />
          <text x="199" y="241" textAnchor="middle" fontSize="9" fontWeight="600" fill="#1E293B">payments</text>
          <text x="199" y="254" textAnchor="middle" fontSize="8" fill="#FB923C" fontFamily="monospace">18,201</text>
          <line x1="60" y1="163" x2="199" y2="225" stroke="#FB923C" strokeWidth="1.5" strokeDasharray="4 2" />

          {/* Zone labels */}
          <text x="380" y="40" textAnchor="end" fontSize="8" fill="#FB923C" opacity="0.7">Cascade L2</text>
          <text x="320" y="80" textAnchor="end" fontSize="8" fill="#F59E0B" opacity="0.8">Cascade L1</text>
          <text x="268" y="140" textAnchor="start" fontSize="8" fill="#EF4444" opacity="0.9">Direct</text>
        </svg>

        {/* Impact breakdown bars */}
        <div className="w-full max-w-[420px] mt-2 space-y-2">
          {impactLevels.map((level) => (
            <div key={level.label} className="flex items-center gap-3 text-xs">
              <span className="w-28 text-slate-600 flex-shrink-0">{level.label}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${level.color} rounded-full`} style={{ width: `${level.pct}%` }} />
              </div>
              <span className={`w-24 text-right font-mono font-semibold ${level.textColor}`}>{level.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tables Impacted", val: "6", sub: "out of 18 total", color: "text-rose-600" },
          { label: "Total Rows at Risk", val: "66,816", sub: "permanent deletion", color: "text-amber-600" },
          { label: "Cascade Depth", val: "2 levels", sub: "FK dependency chain", color: "text-indigo-600" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white border border-slate-200 text-left">
            <span className="text-[10px] text-slate-400 block font-mono uppercase tracking-wide">{s.label}</span>
            <span className={`text-xl font-extrabold font-mono ${s.color} block mt-0.5`}>{s.val}</span>
            <span className="text-[10px] text-slate-500">{s.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SaferAlternativesTab() {
  const [chosen, setChosen] = useState<null | "soft-delete" | "archive" | "batch">(null);

  const alternatives = [
    {
      id: "soft-delete" as const,
      title: "Soft Delete (Recommended)",
      risk: "LOW RISK",
      riskColor: "text-emerald-600",
      riskBg: "bg-emerald-50 border-emerald-200",
      borderColor: "border-emerald-400/60",
      sql: `UPDATE users
SET status = 'inactive',
    deleted_at = NOW()
WHERE last_login < NOW() - INTERVAL '2 years'
  AND status = 'active';`,
      impact: "0 rows deleted • Preserves all history",
      impactColor: "text-emerald-600",
      checkItems: [
        "Preserves audit history & referential integrity",
        "Reversible — can be undone anytime",
        "Zero cascade impact on child tables",
        "Maintains financial records & subscriptions",
      ],
    },
    {
      id: "archive" as const,
      title: "Archive to Cold Storage",
      risk: "LOW RISK",
      riskColor: "text-emerald-600",
      riskBg: "bg-emerald-50 border-emerald-200",
      borderColor: "border-blue-400/50",
      sql: `INSERT INTO users_archive
SELECT *, NOW() as archived_at FROM users
WHERE last_login < NOW() - INTERVAL '2 years';

DELETE FROM users
WHERE last_login < NOW() - INTERVAL '2 years'
  AND id IN (SELECT id FROM users_archive);`,
      impact: "12,481 rows archived, not deleted",
      impactColor: "text-blue-600",
      checkItems: [
        "Creates archive copy before deletion",
        "Reduces primary table size",
        "Data retained for compliance",
        "Requires archive table setup",
      ],
    },
    {
      id: "batch" as const,
      title: "Batch Delete with Checkpoint",
      risk: "MEDIUM RISK",
      riskColor: "text-amber-600",
      riskBg: "bg-amber-50 border-amber-200",
      borderColor: "border-amber-400/50",
      sql: `DO $$
DECLARE batch_size INT := 1000;
BEGIN
  LOOP
    DELETE FROM users WHERE id IN (
      SELECT id FROM users
      WHERE last_login < NOW() - INTERVAL '2 years'
      LIMIT batch_size
    );
    EXIT WHEN NOT FOUND;
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;`,
      impact: "Staged deletion in 13 batches",
      impactColor: "text-amber-600",
      checkItems: [
        "Reduces lock contention",
        "Minimises downtime risk",
        "Still permanently deletes rows",
        "Slower but safer execution",
      ],
    },
  ];

  return (
    <div className="lg:col-span-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Safer Alternatives</h4>
          <p className="text-xs text-slate-500 mt-0.5">BlastShield recommends these safer approaches for your operation.</p>
        </div>
        {chosen && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all hover:scale-105">
            <Check size={14} />
            Apply Selected Alternative
          </button>
        )}
      </div>

      <div className="space-y-3">
        {alternatives.map((alt) => (
          <div
            key={alt.id}
            onClick={() => setChosen(alt.id)}
            className={`rounded-2xl border-2 bg-white transition-all cursor-pointer hover:shadow-md ${
              chosen === alt.id
                ? `${alt.borderColor} shadow-md`
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  chosen === alt.id ? "border-indigo-500 bg-indigo-500" : "border-slate-300"
                }`}>
                  {chosen === alt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-sm font-bold text-slate-800">{alt.title}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-mono ${alt.riskBg} ${alt.riskColor}`}>
                {alt.risk}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              {/* SQL Preview */}
              <div>
                <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.06] font-mono text-[11px] leading-relaxed overflow-x-auto">
                  <pre className="text-slate-300 whitespace-pre-wrap">{alt.sql}</pre>
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-mono mt-2 ${alt.impactColor}`}>
                  <CheckCircle2 size={12} />
                  <span>{alt.impact}</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-1.5">
                {alt.checkItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={10} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalysisCompleteCard({ onOpenReport }: AnalysisCompleteCardProps) {
  const [activeTab, setActiveTab] = useState<"schema" | "radius" | "safer">("schema");

  const tabs = [
    { id: "schema" as const, label: "Schema Impact" },
    { id: "radius" as const, label: "Blast Radius" },
    { id: "safer" as const, label: "Safer Alternatives" },
  ];

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 shadow-sm p-6 lg:p-7 text-left select-none relative transition-all">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-md">
            3
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Analysis Complete
              </h3>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review the impact and decide the safest path forward.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs transition-colors self-start md:self-auto"
        >
          <Download size={14} className="text-purple-600" />
          <span>Download Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 transition-all relative ${
              activeTab === tab.id
                ? "text-[#6366F1] font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#6366F1] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column content changes per tab */}
        {activeTab === "schema" && (
          <div className="lg:col-span-8">
            <SchemaImpactTree />
          </div>
        )}
        {activeTab === "radius" && <BlastRadiusTab />}
        {activeTab === "safer" && <SaferAlternativesTab />}

        {/* Right Column: Impact Summary — always shown */}
        <ImpactSummaryPanel />
      </div>
    </div>
  );
}
