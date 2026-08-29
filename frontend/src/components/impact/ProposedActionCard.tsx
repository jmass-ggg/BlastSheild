'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  Ban,
  Copy,
  Check,
  CornerDownRight,
  Database,
  Layers,
} from 'lucide-react';
import { AnalysisView, RiskLevel } from '../../types';
import { formatNumber, formatCurrency } from '../../lib/formatters';
import { describeReversibility } from '../../lib/adaptAnalysis';

const RISK_BADGE: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-950/70 text-emerald-300 border-emerald-700',
  MEDIUM: 'bg-amber-950/70 text-amber-300 border-amber-700',
  HIGH: 'bg-orange-950/70 text-orange-300 border-orange-700',
  CRITICAL: 'bg-rose-950/70 text-rose-300 border-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
};

const TERMINAL_STATUSES = ['EXECUTED', 'REJECTED', 'STALE', 'FAILED'];

interface ProposedActionCardProps {
  view: AnalysisView;
  onExecute: () => void;
  onReject: () => void;
  isRejecting: boolean;
}

export const ProposedActionCard: React.FC<ProposedActionCardProps> = ({
  view,
  onExecute,
  onReject,
  isRejecting,
}) => {
  const isSettled = TERMINAL_STATUSES.includes(view.status);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(view.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0b0f19] rounded-2xl border border-rose-900/50 shadow-[0_4px_24px_rgba(0,0,0,0.6)] p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden ring-1 ring-rose-500/20">
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-950/70 border border-rose-700 text-rose-400 flex items-center justify-center font-bold shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <ShieldAlert className="w-4 h-4 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                PROPOSED DESTRUCTIVE ACTION
              </h3>
              <p className="text-[11px] text-rose-400 font-mono mt-0.5">
                INTERCEPTED &amp; QUARANTINED · STATUS: {view.status}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border shrink-0 ${RISK_BADGE[view.riskLevel]}`}
          >
            RISK {view.riskScore}/100 ({view.riskLevel})
          </span>
        </div>

        {/* Intercepted SQL Terminal Window */}
        <div className="my-3 rounded-xl font-mono text-xs overflow-hidden border border-rose-900/40 bg-[#070b12] shadow-inner">
          <div className="bg-[#0f172a] px-3 py-1.5 border-b border-rose-900/30 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3 h-3 text-rose-400" />
              <span className="text-slate-200 font-semibold">INTERCEPTED_QUERY.SQL</span>
              <span className="text-rose-400 bg-rose-950/80 border border-rose-800/80 px-1.5 py-0.2 rounded text-[10px]">
                BLOCKED FROM PROD
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy intercepted SQL"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 text-rose-300 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all selection:bg-rose-950 selection:text-rose-100">
            <code>{view.sql}</code>
          </div>
        </div>

        {/* Consequence Breakdown Metrics */}
        <div className="space-y-2.5 mt-4 text-xs font-mono">
          {/* Direct Target Rows */}
          <div className="p-3 bg-[#070b12] rounded-xl border border-[#1e293b] flex items-center justify-between gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Direct Target Entity:
            </span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              {formatNumber(view.directRows)}{' '}
              <span className="text-xs font-normal text-slate-500">({view.targetTable})</span>
            </span>
          </div>

          {/* Cascading Purge */}
          <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-900/50 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-rose-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-rose-400" /> Cascading Purge Blast:
              </span>
              <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
                {view.dependencies.length} dependent {view.dependencies.length === 1 ? 'path' : 'paths'} via ON DELETE CASCADE
              </span>
            </div>
            <span className="text-sm font-bold text-rose-400 font-mono shrink-0">
              {formatNumber(view.dependentRows)} rows
            </span>
          </div>

          {/* Cascade Path Tree */}
          {view.dependencies.length > 0 && (
            <div className="p-3 bg-[#070b12] rounded-xl border border-[#1e293b] space-y-1.5 text-[11px]">
              <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] pb-1 border-b border-[#1e293b]/60">
                CASCADE PURGE TRAVERSAL TREE:
              </div>
              {view.dependencies.map((dependency, idx) => (
                <div
                  key={`${dependency.table}-${dependency.depth}-${idx}`}
                  className="flex items-center justify-between gap-2 text-slate-300 pl-1"
                >
                  <span className="flex items-center gap-1.5 text-slate-400 truncate">
                    <CornerDownRight className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="text-slate-200">{dependency.path.join(' ➔ ')}</span>
                  </span>
                  <span className="font-semibold text-rose-300 shrink-0">
                    {formatNumber(dependency.rows)}{' '}
                    <span className="text-slate-600 font-normal text-[10px]">
                      {dependency.measurement === 'ESTIMATED' ? '~est' : 'exact'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Revenue at Risk */}
          {view.arrAtRisk > 0 && (
            <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-900/50 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-rose-300 font-bold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-rose-400" /> Revenue Loss at Risk:
                </span>
                <span className="text-[11px] text-slate-400 font-sans mt-0.5 block">
                  {formatNumber(view.activeSubscriptions)} active recurring subscriptions
                </span>
              </div>
              <div className="text-right shrink-0 font-mono">
                <div className="text-sm font-bold text-rose-400">
                  {formatCurrency(view.arrAtRisk)} ARR
                </div>
                <div className="text-[10px] text-slate-500">
                  ({formatCurrency(view.mrrAtRisk)} MRR)
                </div>
              </div>
            </div>
          )}

          {/* Reversibility */}
          <div className="p-3 bg-[#070b12] rounded-xl border border-[#1e293b] flex items-center justify-between gap-3">
            <span className="text-slate-400">Reversibility:</span>
            <span className="text-rose-400 font-semibold text-right">
              {describeReversibility(view)}
            </span>
          </div>

          {/* Why this score reasons */}
          {view.riskReasons.length > 0 && (
            <div className="p-3 bg-[#070b12] rounded-xl border border-[#1e293b] space-y-1 text-[11px]">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                RISK FACTOR EXPLANATION:
              </span>
              {view.riskReasons.map((reason, idx) => (
                <div key={idx} className="text-slate-300 font-sans">
                  · {reason}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Decision Buttons */}
      <div className="mt-5 pt-4 border-t border-[#1e293b] flex flex-col sm:flex-row gap-2.5 font-mono">
        <button
          onClick={onExecute}
          disabled={isSettled}
          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>APPROVE &amp; EXECUTE ORIGINAL</span>
        </button>
        <button
          onClick={onReject}
          disabled={isSettled || isRejecting}
          className="py-2.5 px-5 bg-[#131d31] hover:bg-[#1e293b] text-slate-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-[#1e293b] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Ban className="w-4 h-4 text-rose-400" />
          <span>{isRejecting ? 'REJECTING...' : 'REJECT'}</span>
        </button>
      </div>
    </div>
  );
};
