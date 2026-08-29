'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, DollarSign } from 'lucide-react';
import { ImpactResult } from '../../types';
import { formatNumber, formatCurrency } from '../../lib/formatters';

interface ProposedActionCardProps {
  impact: ImpactResult;
  onExecute: () => void;
}

export const ProposedActionCard: React.FC<ProposedActionCardProps> = ({ impact, onExecute }) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-rose-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-body-sm font-bold text-slate-900 uppercase tracking-wider">
                Proposed Destructive Action
              </h3>
              <p className="text-caption text-rose-600 font-medium">Intercepted & Simulated by BlastShield</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-caption font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            Risk {impact.originalRisk} / 100 ({impact.originalRiskLevel})
          </span>
        </div>

        {/* Intercepted SQL Box */}
        <div className="my-3 p-3.5 bg-slate-950 rounded-xl font-mono text-caption text-rose-300 overflow-x-auto border border-slate-900">
          <div className="text-badge text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
            <span>Generated SQL:</span>
            <span className="text-rose-400">Blocked from Prod</span>
          </div>
          <code className="leading-relaxed">{impact.originalSql}</code>
        </div>

        {/* Consequences Metrics List */}
        <div className="space-y-2.5 mt-4">
          
          {/* Direct Rows */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-body-sm text-slate-600 font-normal">Direct Target Rows:</span>
            <span className="text-h4 font-bold text-slate-900 font-mono tracking-tight">
              {formatNumber(impact.originalDirectRows)} <span className="text-caption font-normal text-slate-500">({impact.targetTable})</span>
            </span>
          </div>

          {/* Cascading Rows */}
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-body-sm text-rose-800 font-semibold block">Cascading Deletions:</span>
              <span className="text-caption text-slate-500 font-normal">Purged via ON DELETE CASCADE</span>
            </div>
            <span className="text-h4 font-bold text-rose-700 font-mono tracking-tight">
              {formatNumber(impact.originalCascadeRows)} records
            </span>
          </div>

          {/* Business Revenue Impact */}
          {impact.arrLost > 0 && (
            <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-body-sm text-rose-800 font-semibold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                  Revenue at Immediate Risk:
                </span>
                <span className="text-caption text-slate-500 font-normal">
                  {impact.activeSubsLost} active recurring customer accounts
                </span>
              </div>
              <div className="text-right">
                <div className="text-h4 font-bold text-rose-700 font-mono tracking-tight">
                  {formatCurrency(impact.arrLost)} ARR
                </div>
                <div className="text-caption text-slate-500 font-normal">
                  ({formatCurrency(impact.mrrLost)} MRR)
                </div>
              </div>
            </div>
          )}

          {/* Rollback Difficulty */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-body-sm text-slate-600 font-normal">Reversibility:</span>
            <span className="text-body-sm font-semibold text-rose-700 font-mono">
              {impact.originalRollback}
            </span>
          </div>

        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <button
          onClick={onExecute}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-body-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Execute Original (Non-Safer) Action</span>
        </button>
      </div>
    </div>
  );
};
