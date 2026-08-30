'use client';

import React from 'react';
import {
  AlertTriangle,
  Bot,
  Clock3,
  Database,
  GitBranch,
  Layers3,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react';
import { AnalysisView, ReportOrigin, RiskLevel } from '../../types';
import { formatNumber } from '../../lib/formatters';

const RISK_STYLE: Record<RiskLevel, string> = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-900',
  HIGH: 'border-orange-200 bg-orange-50 text-orange-900',
  CRITICAL: 'border-rose-300 bg-rose-50 text-rose-900',
};

const STATUS_STYLE: Record<string, string> = {
  PENDING_APPROVAL: 'border-amber-200 bg-amber-50 text-amber-900',
  APPROVED: 'border-blue-200 bg-blue-50 text-blue-800',
  EXECUTED: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  REJECTED: 'border-slate-300 bg-slate-100 text-slate-700',
  STALE: 'border-amber-300 bg-amber-100 text-amber-950',
  FAILED: 'border-rose-300 bg-rose-50 text-rose-900',
};

interface AnalysisSummaryProps {
  view: AnalysisView;
  origin: ReportOrigin;
  receivedAt: Date;
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  view,
  origin,
  receivedAt,
}) => {
  const dependentTables = new Set(view.dependencies.map((item) => item.table)).size;
  const maxDepth = view.dependencies.reduce(
    (current, dependency) => Math.max(current, dependency.depth),
    0
  );
  const highRisk = view.riskLevel === 'HIGH' || view.riskLevel === 'CRITICAL';
  const sourceLabel = origin === 'TRUEFORGE_MCP' ? 'TrueForge / MCP' : 'Dashboard';

  return (
    <section
      id="analysis-summary"
      aria-labelledby="analysis-summary-title"
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 bg-slate-950 px-5 py-5 text-white sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200">
                {origin === 'TRUEFORGE_MCP' ? (
                  <Bot className="h-3.5 w-3.5 text-sky-300" />
                ) : (
                  <TerminalSquare className="h-3.5 w-3.5 text-sky-300" />
                )}
                Source: {sourceLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                Received {receivedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 id="analysis-summary-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Review required: {view.operation} on{' '}
              <span className="font-mono text-amber-300">{view.targetTable}</span>
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              BlastShield measured this statement against live PostgreSQL rows and foreign-key metadata.
              No domain rows have been changed by analysis.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${RISK_STYLE[view.riskLevel]}`}
            >
              {view.riskLevel} RISK · {view.riskScore}/100
            </span>
            <span
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-semibold ${
                STATUS_STYLE[view.status] ?? 'border-slate-300 bg-slate-100 text-slate-700'
              }`}
            >
              {view.status.replaceAll('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Metric label="Direct rows" value={formatNumber(view.directRows)} icon={Database} tone="rose" />
          <Metric label="Dependent rows" value={formatNumber(view.dependentRows)} icon={GitBranch} tone="amber" />
          <Metric label="Total potential" value={formatNumber(view.totalRows)} icon={AlertTriangle} tone="rose" />
          <Metric label="Dependent tables" value={formatNumber(dependentTables)} icon={Layers3} tone="slate" />
          <Metric label="Maximum depth" value={formatNumber(maxDepth)} icon={GitBranch} tone="slate" />
          <Metric label="Policy score" value={`${view.riskScore}/100`} icon={ShieldCheck} tone="amber" />
        </div>

        <div
          className={`mt-4 flex flex-col gap-2 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
            highRisk
              ? 'border-orange-200 bg-orange-50 text-orange-950'
              : 'border-emerald-200 bg-emerald-50 text-emerald-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {highRisk ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            )}
            <p className="text-sm font-medium">
              {highRisk
                ? 'Recommendation: reject this DELETE or review the projected safer alternative.'
                : 'Recommendation: review the evidence and approval path before continuing.'}
            </p>
          </div>
          <code className="truncate text-xs text-slate-500" title={view.analysisId}>
            ID {view.analysisId}
          </code>
        </div>
      </div>
    </section>
  );
};

const TONE_STYLE = {
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
};

interface MetricProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONE_STYLE;
}

const Metric: React.FC<MetricProps> = ({ label, value, icon: Icon, tone }) => (
  <div className={`rounded-2xl border p-3.5 ${TONE_STYLE[tone]}`}>
    <div className="flex items-center gap-1.5 text-xs font-medium">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    <div className="mt-2 font-mono text-xl font-bold tracking-tight text-slate-950">{value}</div>
  </div>
);
