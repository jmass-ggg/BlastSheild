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
  Database,
  Layers,
  Sparkle,
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
      <div className="bg-[#0b0f19] rounded-2xl border border-[#1e293b] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#131d31] text-slate-500 border border-[#1e293b] flex items-center justify-center">
          <ShieldOff className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
            NO SAFE ALTERNATIVE AVAILABLE
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-1.5 max-w-sm">
            <span className="font-mono text-amber-300">{view.targetTable}</span> lacks a{' '}
            <span className="font-mono text-slate-200">deleted_at</span> or{' '}
            <span className="font-mono text-slate-200">is_deleted</span> column. Automated soft-delete rewrite requires schema migration.
          </p>
        </div>
      </div>
    );
  }

  const savedRows = view.dependentRows;

  return (
    <div
      className={`bg-[#0b0f19] rounded-2xl border p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.6)] flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
        isPreviewing
          ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
          : 'border-emerald-500/40 ring-1 ring-emerald-500/20'
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-950/70 border border-emerald-600 text-emerald-400 flex items-center justify-center font-bold shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-4 h-4 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                AUTOMATED ZERO-LOSS SAFEGUARD
              </h3>
              <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                REVERSIBLE SOFT-DELETE · ZERO DOWNSTREAM CASCADE LOSS
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.25)] shrink-0">
            RISK {safer.riskScore}/100 ({safer.riskLevel})
          </span>
        </div>

        {/* Recommended Safe SQL Terminal */}
        <div className="my-3 rounded-xl font-mono text-xs overflow-hidden border border-emerald-800/50 bg-[#070b12] shadow-inner">
          <div className="bg-[#0d1e1c] px-3 py-1.5 border-b border-emerald-900/40 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-200 font-semibold">SAFEGUARD_REWRITE.SQL</span>
              <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded text-[10px]">
                NON-DESTRUCTIVE UPDATE
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy Safe SQL"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all selection:bg-emerald-950 selection:text-emerald-100">
            <code>{safer.sql}</code>
          </div>
        </div>

        {/* Consequence Breakdown Metrics */}
        <div className="space-y-2.5 mt-4 text-xs font-mono">
          {/* Direct Rows Marked Deleted */}
          <div className="p-3 bg-[#070b12] rounded-xl border border-[#1e293b] flex items-center justify-between gap-3">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Direct Records Handled:
            </span>
            <span className="text-sm font-bold text-slate-100 font-mono">
              {formatNumber(view.directRows)}{' '}
              <span className="text-xs font-semibold text-emerald-400">(Soft-Deleted via deleted_at)</span>
            </span>
          </div>

          {/* Cascading Purge Prevented */}
          <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-800/50 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" /> Cascading Purge Prevention:
              </span>
              <span className="text-[11px] text-emerald-400/80 font-sans mt-0.5 block">
                Foreign-key CASCADE triggers completely bypassed
              </span>
            </div>
            <span className="text-sm font-bold text-emerald-400 font-mono shrink-0">
              0 rows purged
            </span>
          </div>

          {/* Safety Guarantees Checklist */}
          <div className="p-3 bg-emerald-950/15 rounded-xl border border-emerald-800/40 space-y-1.5">
            <span className="text-emerald-400 font-semibold block text-[10px] uppercase tracking-wider">
              DETERMINISTIC SAFETY GUARANTEES:
            </span>
            <Guarantee>
              Drops risk score from <strong className="text-rose-300">{view.riskScore} {view.riskLevel}</strong> ➔{' '}
              <strong className="text-emerald-300">{safer.riskScore} {safer.riskLevel}</strong>
            </Guarantee>
            <Guarantee>
              <strong className="text-emerald-300">{formatNumber(savedRows)}</strong> cascading records preserved across{' '}
              {view.dependencies.length} dependent {view.dependencies.length === 1 ? 'table' : 'tables'}
            </Guarantee>
            {view.arrAtRisk > 0 && (
              <Guarantee>
                <strong className="text-emerald-300">{formatNumber(view.activeSubscriptions)}</strong> active recurring subscriptions intact (
                {formatCurrency(view.arrAtRisk)} ARR preserved)
              </Guarantee>
            )}
            <Guarantee>100% Reversible by clearing <span className="font-mono text-emerald-200">deleted_at = NULL</span></Guarantee>
          </div>
        </div>
      </div>

      {/* Action Decision Buttons */}
      <div className="mt-5 pt-4 border-t border-[#1e293b] space-y-2.5 font-mono">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {onTogglePreview && (
            <button
              onClick={onTogglePreview}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isPreviewing
                  ? 'bg-[#131d31] hover:bg-[#1e293b] text-slate-200 border border-[#334155]'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
              }`}
            >
              {isPreviewing ? (
                <>
                  <EyeOff className="w-4 h-4 text-emerald-400" />
                  <span>EXIT SAFE PREVIEW</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>SIMULATE SAFEGUARD</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="py-2.5 px-5 bg-[#131d31] hover:bg-[#1e293b] text-slate-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-[#1e293b] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'COPIED' : 'COPY SAFE SQL'}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 font-sans flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>
            Safeguard simulation mode: graph &amp; risk meter dynamically reflect zero-loss consequence.
          </span>
        </p>
      </div>
    </div>
  );
};

const Guarantee: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-1.5 text-slate-300 font-sans text-xs">
    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);
