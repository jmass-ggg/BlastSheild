'use client';

import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { ImpactResult } from '../../types';
import { formatNumber } from '../../lib/formatters';

interface SaferActionCardProps {
  impact: ImpactResult;
  onExecute: () => void;
}

export const SaferActionCard: React.FC<SaferActionCardProps> = ({ impact, onExecute }) => {
  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-400 p-5 sm:p-6 shadow-sm flex flex-col justify-between ring-1 ring-emerald-100">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-body-sm font-bold text-slate-900 uppercase tracking-wider">
                BlastShield Safer Alternative
              </h3>
              <p className="text-caption text-emerald-600 font-medium">Recommended Safe Mutation</p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-caption font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Risk {impact.saferRisk} / 100 ({impact.saferRiskLevel})
          </span>
        </div>

        {/* Recommended Safe SQL Box */}
        <div className="my-3 p-3.5 bg-slate-950 rounded-xl font-mono text-caption text-emerald-300 overflow-x-auto border border-slate-900">
          <div className="text-badge text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between">
            <span>Recommended Safe SQL:</span>
            <span className="text-emerald-400">Non-Destructive Update</span>
          </div>
          <code className="leading-relaxed">{impact.saferSql}</code>
        </div>

        {/* Consequence Metrics List */}
        <div className="space-y-2.5 mt-4">
          
          {/* Direct Rows */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-body-sm text-slate-600 font-normal">Direct Target Rows:</span>
            <span className="text-h4 font-bold text-slate-900 font-mono tracking-tight">
              {formatNumber(impact.saferDirectRows)} <span className="text-caption font-medium text-emerald-600">(Soft-Deleted)</span>
            </span>
          </div>

          {/* Cascading Rows */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-body-sm text-emerald-800 font-semibold block">Cascading Deletions:</span>
              <span className="text-caption text-slate-500 font-normal">Zero records purged downstream</span>
            </div>
            <span className="text-h4 font-bold text-emerald-700 font-mono tracking-tight">
              0 records (Protected)
            </span>
          </div>

          {/* Safety Guarantees List */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
            <span className="text-emerald-900 font-semibold block text-badge uppercase tracking-wider">
              Safety Guarantees:
            </span>
            {impact.saferBenefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-700 font-normal text-caption">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Rollback Ease */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-body-sm text-slate-600 font-normal">Reversibility:</span>
            <span className="text-body-sm font-semibold text-emerald-700 font-mono">
              {impact.saferRollback}
            </span>
          </div>

        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <button
          onClick={onExecute}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-body-sm rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>Execute Safer (Recommended) Action (Risk {impact.saferRisk})</span>
        </button>
      </div>
    </div>
  );
};
