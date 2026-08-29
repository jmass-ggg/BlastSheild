'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  XCircle,
  Loader2,
  CheckCircle2,
  Check,
  Copy,
  RefreshCw,
  Terminal,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisView } from '../../types';
import type { ExecutionResponse } from '../../types/api';
import {
  ApiError,
  approveAnalysis,
  executeAnalysis,
  isStale,
} from '../../lib/apiClient';
import { formatNumber, formatTimestamp } from '../../lib/formatters';

type Phase = 'confirm' | 'running' | 'success' | 'stale' | 'error';

interface ExecutionModalProps {
  open: boolean;
  view: AnalysisView;
  onClose: () => void;
  /** Fired after any transition that changes the analysis status server-side. */
  onStatusChange: (status: string) => void;
}

export const ExecutionModal: React.FC<ExecutionModalProps> = ({
  open,
  view,
  onClose,
  onStatusChange,
}) => {
  const [phase, setPhase] = useState<Phase>('confirm');
  const [step, setStep] = useState('');
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setPhase('confirm');
      setStep('');
      setResult(null);
      setError(null);
    }
  }, [open, view.analysisId]);

  const run = useCallback(async () => {
    setPhase('running');
    setError(null);
    try {
      if (view.status === 'PENDING_APPROVAL') {
        setStep('RECORDING_HUMAN_APPROVAL...');
        const approval = await approveAnalysis(view.analysisId, { actor: 'ui' });
        onStatusChange(approval.status);
      }

      setStep('REVALIDATING_PROD_STATE & COMMITTING_TRANSACTION...');
      const execution = await executeAnalysis(view.analysisId);

      if (isStale(execution)) {
        setPhase('stale');
        onStatusChange('STALE');
        return;
      }

      setResult(execution);
      setPhase('success');
      onStatusChange(execution.status);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Confetti is decorative
      }
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? `${caught.code}: ${caught.message}`
          : 'An unexpected error occurred.'
      );
      setPhase('error');
    }
  }, [view.analysisId, view.status, onStatusChange]);

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(view.analysisId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#05080e]/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#0b0f19] rounded-2xl max-w-lg w-full border border-rose-900/60 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5 sm:p-6 space-y-5 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-400 flex items-center justify-center font-bold shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                EXECUTE ORIGINAL ACTION
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Approve, revalidate lock state, then commit to production
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={phase === 'running'}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-[#131d31] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {phase === 'confirm' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-950/30 rounded-xl border border-rose-900/60 text-xs text-rose-200 font-sans leading-relaxed">
              This permanently deletes{' '}
              <strong className="font-bold text-rose-100 font-mono">{formatNumber(view.directRows)}</strong> rows
              from <span className="font-mono text-rose-300">{view.targetTable}</span> and{' '}
              <strong className="font-bold text-rose-100 font-mono">{formatNumber(view.dependentRows)}</strong>{' '}
              cascading rows. This action cannot be rolled back after commit.
            </div>
            <div className="text-xs text-rose-300 font-mono bg-[#070b12] p-3 rounded-lg border border-rose-900/40 break-all leading-relaxed">
              {view.sql}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={run}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.35)] cursor-pointer"
              >
                CONFIRM &amp; EXECUTE
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-5 bg-[#131d31] hover:bg-[#1e293b] text-slate-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-[#1e293b] transition-all cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {phase === 'running' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">{step}</div>
            <div className="text-xs text-slate-400 font-mono bg-[#070b12] p-2.5 rounded-lg border border-[#1e293b] break-all">
              {view.sql}
            </div>
          </div>
        )}

        {phase === 'success' && result && (
          <div className="space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-bold text-slate-100 tracking-tight uppercase">
                TRANSACTION COMMITTED
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                PostgreSQL reported{' '}
                <strong className="font-bold text-emerald-400 font-mono">
                  {formatNumber(result.affected_rows)}
                </strong>{' '}
                rows affected.
              </p>
            </div>

            <div className="p-3.5 bg-[#070b12] rounded-xl border border-[#1e293b] space-y-2 text-xs font-mono">
              <Row label="STATUS">
                <span className="text-emerald-400 font-bold">{result.status}</span>
              </Row>
              <Row label="EXECUTED_AT">
                <span className="text-slate-200">{formatTimestamp(result.executed_at)}</span>
              </Row>
              <Row label="ANALYSIS_ID">
                <span className="flex items-center gap-1 text-slate-200 font-semibold bg-[#131d31] px-2 py-0.5 rounded border border-[#1e293b]">
                  <span className="truncate max-w-[12rem]">{result.analysis_id}</span>
                  <button
                    onClick={handleCopyId}
                    className="text-slate-400 hover:text-slate-200 cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </span>
              </Row>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#131d31] hover:bg-[#1e293b] text-slate-100 font-bold text-xs sm:text-sm rounded-xl border border-[#334155] transition-all cursor-pointer"
            >
              CLOSE &amp; RETURN TO COCKPIT
            </button>
          </div>
        )}

        {phase === 'stale' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-600 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-100 tracking-tight uppercase">
                ANALYSIS IS STALE
              </h4>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Production state mutated after approval was generated. Transaction was safely aborted.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#131d31] hover:bg-[#1e293b] text-slate-100 font-bold text-xs sm:text-sm rounded-xl border border-[#334155] transition-all cursor-pointer"
            >
              RE-RUN ANALYSIS
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-600 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-100 tracking-tight uppercase">
                EXECUTION FAILED
              </h4>
              <p className="text-xs text-rose-400 mt-1 font-sans break-words">
                {error}
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={run}
                className="flex-1 py-2.5 bg-[#131d31] hover:bg-[#1e293b] text-slate-100 font-bold text-xs sm:text-sm rounded-xl border border-[#334155] transition-all cursor-pointer"
              >
                RETRY
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-5 bg-[#070b12] hover:bg-[#131d31] text-slate-400 hover:text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-[#1e293b] transition-all cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex justify-between items-center gap-3">
    <span className="text-slate-500 font-normal shrink-0">{label}:</span>
    {children}
  </div>
);
