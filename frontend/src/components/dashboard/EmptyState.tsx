'use client';

import React from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDashed,
  Database,
  ScanSearch,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { ConnectionState } from '../../types';

interface EmptyStateProps {
  backendStatus: ConnectionState;
  mcpStatus: ConnectionState;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ backendStatus, mcpStatus }) => (
  <section
    aria-labelledby="empty-state-title"
    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
  >
    <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
      <div className="p-7 sm:p-10">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-300 shadow-sm">
          <CircleDashed className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Agent monitoring is active
        </p>
        <h2 id="empty-state-title" className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Waiting for an AI-proposed database action
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Run an analysis from TrueForge. BlastShield will receive the proposed SQL, measure its
          live foreign-key blast radius, and reveal the report here without executing the action.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-4" aria-label="BlastShield workflow">
          <FlowStep icon={Bot} label="TrueForge agent" />
          <FlowStep icon={ScanSearch} label="BlastShield analysis" arrow />
          <FlowStep icon={UserCheck} label="Human review" arrow />
          <FlowStep icon={ShieldCheck} label="Constrained execution" arrow />
        </div>
      </div>

      <aside className="border-t border-slate-200 bg-slate-50 p-7 sm:p-10 lg:border-l lg:border-t-0">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Connection readiness
        </p>
        <div className="mt-5 space-y-3">
          <ConnectionRow label="FastAPI gateway" state={backendStatus} />
          <ConnectionRow label="MCP transport" state={mcpStatus} />
          <ConnectionRow label="PostgreSQL analyzer" state={backendStatus} detail="Read-only role" />
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
          <div className="mb-1 flex items-center gap-2 font-semibold text-slate-900">
            <Database className="h-4 w-4 text-sky-600" />
            No report selected
          </div>
          Historical reports stay hidden on initial load. Only a new agent or developer analysis
          will populate this workspace.
        </div>
      </aside>
    </div>
  </section>
);

interface FlowStepProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  arrow?: boolean;
}

const FlowStep: React.FC<FlowStepProps> = ({ icon: Icon, label, arrow }) => (
  <div className="relative rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
    {arrow && (
      <ArrowRight className="absolute -left-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 sm:block" />
    )}
    <Icon className="mx-auto h-5 w-5 text-slate-700" aria-hidden="true" />
    <div className="mt-2 text-xs font-semibold text-slate-700">{label}</div>
  </div>
);

interface ConnectionRowProps {
  label: string;
  state: ConnectionState;
  detail?: string;
}

const ConnectionRow: React.FC<ConnectionRowProps> = ({ label, state, detail }) => {
  const online = state === 'online';
  const checking = state === 'checking';
  const text = checking ? 'Checking' : online ? 'Online' : 'Unavailable';

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        {detail && <div className="text-xs text-slate-500">{detail}</div>}
      </div>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
          checking ? 'text-slate-500' : online ? 'text-emerald-700' : 'text-rose-700'
        }`}
      >
        {online ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <span className={`h-2 w-2 rounded-full ${checking ? 'animate-pulse bg-slate-400' : 'bg-rose-500'}`} />
        )}
        {text}
      </span>
    </div>
  );
};
