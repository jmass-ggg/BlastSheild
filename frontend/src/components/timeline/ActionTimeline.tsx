'use client';

import React from 'react';
import {
  AlertTriangle,
  Ban,
  Check,
  Clock3,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { TimelineItem } from '../../types/api';

interface ActionTimelineProps {
  isAnalyzing: boolean;
  timeline?: TimelineItem[];
  status?: string;
}

type RenderState = 'complete' | 'current' | 'pending' | 'rejected' | 'failed' | 'stale';

interface RenderItem {
  key: string;
  label: string;
  state: RenderState;
}

const STATE_STYLE: Record<RenderState, string> = {
  complete: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  current: 'border-blue-200 bg-blue-50 text-blue-900',
  pending: 'border-slate-200 bg-slate-50 text-slate-500',
  rejected: 'border-slate-300 bg-slate-100 text-slate-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-800',
  stale: 'border-amber-300 bg-amber-50 text-amber-900',
};

const STATUS_EXPLANATION: Record<string, string> = {
  PENDING_APPROVAL: 'Analysis is complete. No domain rows have changed; a human decision is required.',
  APPROVED: 'Human approval is recorded. The stored SQL must still pass live revalidation before execution.',
  EXECUTING: 'BlastShield is revalidating the stored evidence and executing in an isolated transaction.',
  EXECUTED: 'Revalidation passed and the stored statement completed.',
  REJECTED: 'The action was rejected and cannot be executed.',
  STALE: 'The database changed after analysis. Nothing was executed; create a fresh report.',
  FAILED: 'The lifecycle stopped because an operation failed. Review the reported error before retrying.',
};

export const ActionTimeline: React.FC<ActionTimelineProps> = ({
  isAnalyzing,
  timeline = [],
  status = 'PENDING_APPROVAL',
}) => {
  if (isAnalyzing) {
    return (
      <section
        aria-live="polite"
        aria-label="Analysis progress"
        className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white shadow-sm"
      >
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-amber-300" />
          <div>
            <h2 className="text-sm font-semibold">Read-only analysis in progress</h2>
            <p className="mt-1 text-sm text-slate-400">
              Waiting for backend-authoritative SQL, row-impact, and foreign-key results. No stage is marked complete until the API confirms it.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const source: RenderItem[] = timeline.length
    ? timeline.map((item) => ({
        key: item.key,
        label: item.label,
        state: normalizeState(item.status),
      }))
    : [
        { key: 'received', label: 'Received', state: 'complete' },
        { key: 'validated', label: 'Validated', state: 'complete' },
        { key: 'measured', label: 'Impact measured', state: 'complete' },
        { key: 'approval', label: 'Waiting for approval', state: 'current' },
      ];

  const items = source.filter(
    (item, index, all) => all.findIndex((candidate) => candidate.key === item.key) === index
  );

  const upsert = (next: RenderItem) => {
    const index = items.findIndex((item) => item.key === next.key);
    if (index >= 0) items[index] = next;
    else items.push(next);
  };

  if (status === 'APPROVED') {
    upsert({ key: 'approval', label: 'Human approval recorded', state: 'complete' });
    upsert({ key: 'revalidation', label: 'Ready for revalidation', state: 'current' });
  } else if (status === 'EXECUTING') {
    upsert({ key: 'approval', label: 'Human approval recorded', state: 'complete' });
    upsert({ key: 'revalidation', label: 'Revalidating live state', state: 'current' });
    upsert({ key: 'execution', label: 'Execution pending', state: 'pending' });
  } else if (status === 'EXECUTED') {
    upsert({ key: 'approval', label: 'Human approval recorded', state: 'complete' });
    upsert({ key: 'revalidation', label: 'Live state revalidated', state: 'complete' });
    upsert({ key: 'execution', label: 'Executed in isolated transaction', state: 'complete' });
  } else if (status === 'REJECTED') {
    upsert({ key: 'approval', label: 'Action rejected by human', state: 'rejected' });
  } else if (status === 'STALE') {
    upsert({ key: 'approval', label: 'Human approval recorded', state: 'complete' });
    upsert({ key: 'revalidation', label: 'Analysis became stale', state: 'stale' });
  } else if (status === 'FAILED') {
    upsert({ key: 'failure', label: 'Lifecycle failed', state: 'failed' });
  }

  return (
    <section aria-labelledby="lifecycle-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="lifecycle-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock3 className="h-4 w-4 text-sky-600" />
            Action lifecycle
          </h2>
          <p className="mt-1 text-xs text-slate-500">Backend-authoritative state; analysis and execution remain separate.</p>
        </div>
        <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
          {status.replaceAll('_', ' ')}
        </span>
      </div>

      <ol className="mt-4 flex flex-col gap-2 lg:flex-row" aria-label="Analysis lifecycle stages">
        {items.map((item, index) => (
          <li key={item.key} className="flex min-w-0 flex-1 items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="hidden text-slate-300 lg:block">→</span>}
            <div className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold ${STATE_STYLE[item.state]}`}>
              <StateIcon state={item.state} />
              <span className="truncate" title={item.label}>{item.label}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
        {status === 'STALE' ? (
          <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        ) : status === 'FAILED' ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
        ) : (
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        )}
        <p>{STATUS_EXPLANATION[status] ?? 'BlastShield is waiting for the next lifecycle transition.'}</p>
      </div>
    </section>
  );
};

function normalizeState(value: string): RenderState {
  const normalized = value.toLowerCase();
  if (normalized === 'complete') return 'complete';
  if (normalized === 'current') return 'current';
  if (normalized === 'rejected') return 'rejected';
  if (normalized === 'failed') return 'failed';
  if (normalized === 'stale') return 'stale';
  return 'pending';
}

const StateIcon: React.FC<{ state: RenderState }> = ({ state }) => {
  if (state === 'complete') return <Check className="h-3.5 w-3.5 shrink-0" />;
  if (state === 'current') return <Clock3 className="h-3.5 w-3.5 shrink-0" />;
  if (state === 'rejected') return <Ban className="h-3.5 w-3.5 shrink-0" />;
  if (state === 'failed') return <XCircle className="h-3.5 w-3.5 shrink-0" />;
  if (state === 'stale') return <RefreshCw className="h-3.5 w-3.5 shrink-0" />;
  return <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-40" />;
};
