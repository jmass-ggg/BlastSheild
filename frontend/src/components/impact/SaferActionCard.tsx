'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Info,
  ShieldOff,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { AnalysisView } from '../../types';
import { formatNumber, formatCurrency } from '../../lib/formatters';

interface SaferActionCardProps {
  view: AnalysisView;
  isPreviewing?: boolean;
  onTogglePreview?: () => void;
}

export const SaferActionCard: React.FC<SaferActionCardProps> = ({
  view,
  isPreviewing = false,
  onTogglePreview,
}) => {
  const [copied, setCopied] = useState(false);
  const { safer } = view;

  const handleCopy = async () => {
    if (!safer.sql) return;
    await navigator.clipboard.writeText(safer.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!safer.available) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col items-center justify-center text-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
          <ShieldOff className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-body-sm font-bold text-slate-900 uppercase tracking-wider">
            No Safer Alternative
          </h3>
          <p className="text-body-sm text-slate-500 font-normal mt-1 max-w-sm">
            <span className="font-mono text-slate-700">{view.targetTable}</span> has no{' '}
            <span className="font-mono">deleted_at</span> or{' '}
            <span className="font-mono">is_deleted</span> column, so BlastShield cannot
            rewrite this DELETE as a reversible soft delete.
          </p>
        </div>
      </div>
    );
  }

  const savedRows = view.dependentRows;

  return (
    <div
      className={`bg-white rounded-2xl border-2 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
        isPreviewing
          ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md'
          : 'border-emerald-300 ring-1 ring-emerald-100'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-body-sm font-bold text-slate-900 uppercase tracking-wider">
                BlastShield Safer Alternative
              </h3>
              <p className="text-caption text-emerald-600 font-medium">
                Reversible soft delete · Zero downstream cascades
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-caption font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
            Risk {safer.riskScore} / 100 ({safer.riskLevel})
          </span>
        </div>

        <div className="my-3 p-3.5 bg-slate-950 rounded-xl font-mono text-caption text-emerald-300 overflow-x-auto border border-slate-900">
          <div className="text-badge text-slate-400 uppercase font-semibold mb-1 flex items-center justify-between gap-3">
            <span>Recommended Safe SQL:</span>
            <span className="text-emerald-400 shrink-0">Non-Destructive Update</span>
          </div>
          <code className="leading-relaxed whitespace-pre-wrap break-all">{safer.sql}</code>
        </div>

        <div className="space-y-2.5 mt-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <span className="text-body-sm text-slate-600 font-normal">Rows Marked Deleted:</span>
            <span className="text-h4 font-bold text-slate-900 font-mono tracking-tight">
              {formatNumber(view.directRows)}{' '}
              <span className="text-caption font-medium text-emerald-600">(Soft-Deleted)</span>
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-body-sm text-emerald-800 font-semibold block">
                Cascading Deletions:
              </span>
              <span className="text-caption text-emerald-600 font-normal">
                Foreign-key triggers bypassed
              </span>
            </div>
            <span className="text-h4 font-bold text-emerald-700 font-mono tracking-tight shrink-0">
              0 rows purged
            </span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
            <span className="text-emerald-900 font-semibold block text-badge uppercase tracking-wider">
              Safety Guarantees:
            </span>
            <Guarantee>
              Drops risk score from <strong>{view.riskScore} {view.riskLevel}</strong> ➔{' '}
              <strong className="text-emerald-700">{safer.riskScore} {safer.riskLevel}</strong>
            </Guarantee>
            <Guarantee>
              {formatNumber(savedRows)} cascading rows preserved across{' '}
              {view.dependencies.length} dependent {view.dependencies.length === 1 ? 'table' : 'tables'}
            </Guarantee>
            {view.arrAtRisk > 0 && (
              <Guarantee>
                {formatNumber(view.activeSubscriptions)} active subscriptions intact (
                {formatCurrency(view.arrAtRisk)} ARR)
              </Guarantee>
            )}
            <Guarantee>100% Reversible by clearing the deleted_at column</Guarantee>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          {onTogglePreview && (
            <button
              onClick={onTogglePreview}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-body-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                isPreviewing
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isPreviewing ? (
                <>
                  <EyeOff className="w-4 h-4 text-emerald-400" />
                  <span>Exit Safe Preview</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Preview Safeguard Effect</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-body-sm rounded-xl border border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Safe SQL'}</span>
          </button>
        </div>

        <p className="text-caption text-slate-500 font-normal flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>
            BlastShield simulation mode: preview above shows graph and risk under soft delete. BlastShield executor commits DELETE only.
          </span>
        </p>
      </div>
    </div>
  );
};

const Guarantee: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-1.5 text-slate-700 font-normal text-caption">
    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);
