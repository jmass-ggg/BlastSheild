'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, DollarSign, Ban } from 'lucide-react';
import { AnalysisView, RiskLevel } from '../../types';
import { formatNumber, formatCurrency } from '../../lib/formatters';
import { describeReversibility } from '../../lib/adaptAnalysis';

const RISK_BADGE: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  MEDIUM: 'bg-amber-100 text-amber-900 border-amber-300',
  HIGH: 'bg-orange-100 text-orange-900 border-orange-300',
  CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300',
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

  return (
    <div className="bg-white rounded-2xl border-2 border-rose-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-body-sm font-bold text-slate-900 uppercase tracking-wider">
                Proposed Destructive Action
              </h3>
              <p className="text-caption text-rose-600 font-medium">
                Intercepted &amp; measured by BlastShield · {view.status}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg text-caption font-semibold border shrink-0 ${RISK_BADGE[view.riskLevel]}`}
          >
            Risk {view.riskScore} / 100 ({view.riskLevel})
          </span>
        </div>

        <div className="my-3 p-3.5 bg-slate-950 rounded-xl font-mono text-caption text-rose-300 overflow-x-auto border border-slate-900">
          <div className="text-badge text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between gap-3">
            <span>Intercepted SQL:</span>
            <span className="text-rose-400 shrink-0">Blocked from Prod</span>
          </div>
          <code className="leading-relaxed whitespace-pre-wrap break-all">{view.sql}</code>
        </div>

        <div className="space-y-2.5 mt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <span className="text-body-sm text-slate-600 font-normal">Direct Target Rows:</span>
            <span className="text-h4 font-bold text-slate-900 font-mono tracking-tight">
              {formatNumber(view.directRows)}{' '}
              <span className="text-caption font-normal text-slate-500">({view.targetTable})</span>
            </span>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-body-sm text-rose-800 font-semibold block">
                Cascading Deletions:
              </span>
              <span className="text-caption text-slate-500 font-normal">
                {view.dependencies.length} dependent{' '}
                {view.dependencies.length === 1 ? 'path' : 'paths'} via ON DELETE CASCADE
              </span>
            </div>
            <span className="text-h4 font-bold text-rose-700 font-mono tracking-tight shrink-0">
              {formatNumber(view.dependentRows)} rows
            </span>
          </div>

          {/* Per-table cascade breakdown, straight from report.dependencies */}
          {view.dependencies.length > 0 && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
              {view.dependencies.map((dependency, idx) => (
                <div
                  key={`${dependency.table}-${dependency.depth}-${idx}`}
                  className="flex items-center justify-between gap-3 text-caption"
                >
                  <span className="font-mono text-slate-600 truncate">
                    {dependency.path.join(' ➔ ')}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 shrink-0">
                    {formatNumber(dependency.rows)}
                    <span className="text-slate-400 font-normal ml-1">
                      {dependency.measurement === 'ESTIMATED' ? '~est' : 'exact'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {view.arrAtRisk > 0 && (
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-body-sm text-rose-800 font-semibold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                  Revenue at Immediate Risk:
                </span>
                <span className="text-caption text-slate-500 font-normal">
                  {formatNumber(view.activeSubscriptions)} active recurring accounts
                </span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-h4 font-bold text-rose-700 font-mono tracking-tight">
                  {formatCurrency(view.arrAtRisk)} ARR
                </div>
                <div className="text-caption text-slate-500 font-normal">
                  ({formatCurrency(view.mrrAtRisk)} MRR)
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <span className="text-body-sm text-slate-600 font-normal">Reversibility:</span>
            <span className="text-body-sm font-semibold text-rose-700 text-right">
              {describeReversibility(view)}
            </span>
          </div>

          {view.riskReasons.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-badge font-semibold text-slate-500 uppercase tracking-wider">
                Why this score:
              </span>
              {view.riskReasons.map((reason, idx) => (
                <div key={idx} className="text-caption text-slate-600 font-normal">
                  · {reason}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={onExecute}
          disabled={isSettled}
          className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-body-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Dashboard Review &amp; Execute</span>
        </button>
        <button
          onClick={onReject}
          disabled={isSettled || isRejecting}
          className="py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-body-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Ban className="w-4 h-4" />
          <span>{isRejecting ? 'Rejecting...' : 'Reject'}</span>
        </button>
      </div>
    </div>
  );
};
