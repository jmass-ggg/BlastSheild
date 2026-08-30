'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Check,
} from 'lucide-react';
import { TimelineItem } from '../../types/api';

interface ActionTimelineProps {
  isAnalyzing: boolean;
  timeline?: TimelineItem[];
  status?: string;
}

const STAGED_ANALYSIS_STEPS = [
  { key: 'intercepted', label: 'SQL statement intercepted & verified', delay: 100 },
  { key: 'parsed', label: 'AST parsed & target table detected', delay: 250 },
  { key: 'graph', label: 'Foreign-key dependency graph traversed', delay: 450 },
  { key: 'impact', label: 'Blast radius & cascade rows measured', delay: 700 },
  { key: 'risk', label: 'Deterministic risk factors scored', delay: 900 },
  { key: 'alternative', label: 'Safer alternative synthesized', delay: 1100 },
];

export const ActionTimeline: React.FC<ActionTimelineProps> = ({
  isAnalyzing,
  timeline = [],
  status,
}) => {
  const [activeSimIndex, setActiveSimIndex] = useState(0);

  // When analyzing starts, step through stages
  useEffect(() => {
    if (!isAnalyzing) {
      setActiveSimIndex(0);
      return;
    }

    const timers = STAGED_ANALYSIS_STEPS.map((step, idx) => {
      return setTimeout(() => {
        setActiveSimIndex(idx);
      }, step.delay);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isAnalyzing]);

  if (isAnalyzing) {
    return (
      <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-body-sm font-bold text-white font-mono uppercase tracking-wider">
              BlastShield Production Analysis Active
            </span>
          </div>
          <span className="text-badge font-mono text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-full">
            Read-only Live Measurement
          </span>
        </div>

        <div className="space-y-2 font-mono text-caption">
          {STAGED_ANALYSIS_STEPS.map((step, idx) => {
            const isDone = idx < activeSimIndex;
            const isCurrent = idx === activeSimIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-2.5 transition-all duration-150 ${
                  isDone
                    ? 'text-emerald-400'
                    : isCurrent
                    ? 'text-amber-300 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-700 shrink-0" />
                )}
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // After analysis completes: show backend authoritative timeline
  type RenderTimelineItem = {
    key: string;
    label: string;
    status: 'complete' | 'current' | 'pending' | 'rejected';
  };

  const sourceItems: RenderTimelineItem[] =
    timeline && timeline.length > 0
      ? timeline.map((item) => ({
          key: item.key,
          label: item.label,
          status: item.status as RenderTimelineItem['status'],
        }))
      : [
          { key: 'intercepted', label: 'SQL intercepted', status: 'complete' },
          { key: 'parsed', label: 'SQL parsed', status: 'complete' },
          { key: 'measured', label: 'Impact measured', status: 'complete' },
          { key: 'approval', label: 'Waiting for human approval', status: 'current' },
        ];

  // Persisted reports may already include status-specific steps. Normalize by
  // key before applying the live status so React identity stays deterministic.
  let items = sourceItems.filter(
    (item, index, allItems) =>
      allItems.findIndex((candidate) => candidate.key === item.key) === index
  );

  const upsertItem = (nextItem: RenderTimelineItem) => {
    const index = items.findIndex((item) => item.key === nextItem.key);
    if (index >= 0) {
      items[index] = nextItem;
    } else {
      items.push(nextItem);
    }
  };

  // If status indicates transition
  if (status === 'APPROVED') {
    upsertItem({
      key: 'approval',
      label: 'Approved by human operator',
      status: 'complete',
    });
    upsertItem({
      key: 'ready_execute',
      label: 'Ready for execution & revalidation',
      status: 'current',
    });
  } else if (status === 'EXECUTED') {
    upsertItem({
      key: 'approval',
      label: 'Approved by human operator',
      status: 'complete',
    });
    items = items.filter(
      (item) => !['ready_execute', 'revalidated', 'execution', 'executed'].includes(item.key)
    );
    items.push({
      key: 'revalidated',
      label: 'Revalidated against live database',
      status: 'complete',
    });
    items.push({
      key: 'execution',
      label: 'Executed in isolated transaction',
      status: 'complete',
    });
  } else if (status === 'REJECTED') {
    upsertItem({
      key: 'approval',
      label: 'Human operator rejected action',
      status: 'rejected',
    });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 text-badge font-bold text-slate-700 uppercase tracking-wider font-mono">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Gateway Action Timeline</span>
        </div>
        <span className="text-badge font-mono text-slate-500">
          Status: <strong className="font-semibold text-slate-800">{status || 'PENDING_APPROVAL'}</strong>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-caption">
        {items.map((item, idx) => {
          const isComplete = item.status === 'complete';
          const isCurrent = item.status === 'current';
          const isRejected = item.status === 'rejected';

          return (
            <React.Fragment key={item.key}>
              {idx > 0 && <span className="text-slate-300">➔</span>}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-badge ${
                  isComplete
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium'
                    : isCurrent
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold'
                    : isRejected
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 font-bold'
                    : 'bg-slate-50 text-slate-500 border border-slate-200'
                }`}
              >
                {isComplete && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                {isCurrent && <Clock className="w-3 h-3 text-amber-600 shrink-0 animate-pulse" />}
                {isRejected && <Ban className="w-3 h-3 text-rose-600 shrink-0" />}
                <span>{item.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
