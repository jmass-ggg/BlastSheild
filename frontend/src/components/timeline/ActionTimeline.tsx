'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Loader2,
  Clock,
  ShieldCheck,
  Ban,
  Check,
  Terminal,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { TimelineItem } from '../../types/api';

interface ActionTimelineProps {
  isAnalyzing: boolean;
  timeline?: TimelineItem[];
  status?: string;
}

const STAGED_ANALYSIS_STEPS = [
  { key: 'intercepted', tag: '+08ms', stage: 'AST_INTERCEPT', label: 'SQL statement intercepted & syntax validated', delay: 100 },
  { key: 'parsed', tag: '+24ms', stage: 'AST_RESOLVER', label: 'Target table resolved & WHERE clause isolated', delay: 280 },
  { key: 'graph', tag: '+52ms', stage: 'FK_GRAPH_TRAVERSAL', label: 'Foreign-key dependency graph traversed', delay: 500 },
  { key: 'impact', tag: '+86ms', stage: 'CASCADE_SIMULATION', label: 'Blast radius & cascading purge rows measured', delay: 750 },
  { key: 'business', tag: '+114ms', stage: 'REVENUE_RISK_CALC', label: 'ARR & active subscription risk evaluated', delay: 950 },
  { key: 'alternative', tag: '+142ms', stage: 'SAFEGUARD_SYNTHESIS', label: 'Zero-loss non-destructive safeguard synthesized', delay: 1150 },
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
      <div className="bg-[#0b0f19] rounded-2xl border border-[#1e293b] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.6)] space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider">
              REAL-TIME ANALYSIS TELEMETRY STREAM
            </span>
          </div>
          <span className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            SANDBOX EXECUTION ACTIVE
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          {STAGED_ANALYSIS_STEPS.map((step, idx) => {
            const isDone = idx < activeSimIndex;
            const isCurrent = idx === activeSimIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                    : isCurrent
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold'
                    : 'bg-[#070b12] border-[#1e293b]/60 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-700 shrink-0" />
                  )}
                  <span className="text-slate-500 text-[11px]">{step.tag}</span>
                  <span className="text-slate-400 text-[11px]">[{step.stage}]</span>
                  <span className="truncate">{step.label}</span>
                </div>

                <div className="shrink-0 text-[11px]">
                  {isDone && <span className="text-emerald-400 font-semibold">DONE</span>}
                  {isCurrent && <span className="text-amber-400 animate-pulse">MEASURING...</span>}
                  {!isDone && !isCurrent && <span className="text-slate-700">QUEUED</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // After analysis completes: show backend authoritative timeline
  const items: Array<{ key: string; label: string; tag: string; status: 'complete' | 'current' | 'pending' | 'rejected' }> =
    timeline && timeline.length > 0
      ? timeline.map((item, idx) => ({
          key: item.key,
          label: item.label,
          tag: `+${(idx + 1) * 22}ms`,
          status: item.status as any,
        }))
      : [
          { key: 'intercepted', label: 'AST_INTERCEPTED', tag: '+08ms', status: 'complete' },
          { key: 'parsed', label: 'GRAPH_RESOLVED', tag: '+32ms', status: 'complete' },
          { key: 'measured', label: 'CASCADE_CALCULATED', tag: '+78ms', status: 'complete' },
          { key: 'approval', label: 'AWAITING_OPERATOR_APPROVAL', tag: 'STAGE 4', status: 'current' },
        ];

  if (status === 'APPROVED') {
    items[items.length - 1] = {
      key: 'approval',
      label: 'OPERATOR_APPROVED',
      tag: 'APPROVED',
      status: 'complete',
    };
    items.push({
      key: 'ready_execute',
      label: 'TRANSACTION_READY',
      tag: 'STAGE 5',
      status: 'current',
    });
  } else if (status === 'EXECUTED') {
    items[items.length - 1] = {
      key: 'approval',
      label: 'OPERATOR_APPROVED',
      tag: 'APPROVED',
      status: 'complete',
    };
    items.push({
      key: 'revalidated',
      label: 'REVALIDATED_PROD',
      tag: 'VERIFIED',
      status: 'complete',
    });
    items.push({
      key: 'executed',
      label: 'TRANSACTION_COMMITTED',
      tag: 'COMMITTED',
      status: 'complete',
    });
  } else if (status === 'REJECTED') {
    items[items.length - 1] = {
      key: 'approval',
      label: 'OPERATOR_REJECTED',
      tag: 'REJECTED',
      status: 'rejected',
    };
  }

  return (
    <div className="bg-[#0b0f19] rounded-2xl border border-[#1e293b] p-3.5 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-3 font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">
            GATEWAY EVENT PIPELINE STREAM
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500">GATEWAY_STATUS:</span>
          <span
            className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
              status === 'EXECUTED'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : status === 'REJECTED'
                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                : status === 'APPROVED'
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-amber-950/60 text-amber-300 border-amber-800 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
            }`}
          >
            {status || 'PENDING_APPROVAL'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        {items.map((item, idx) => {
          const isComplete = item.status === 'complete';
          const isCurrent = item.status === 'current';
          const isRejected = item.status === 'rejected';

          return (
            <React.Fragment key={item.key}>
              {idx > 0 && <ArrowRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />}
              <div
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                  isComplete
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/60 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                    : isCurrent
                    ? 'bg-amber-950/40 text-amber-200 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold'
                    : isRejected
                    ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 font-bold'
                    : 'bg-[#0d1424] text-slate-500 border-[#1e293b]'
                }`}
              >
                {isComplete && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                {isCurrent && <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />}
                {isRejected && <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                <span className="text-[10px] text-slate-500">{item.tag}</span>
                <span className="truncate">{item.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
