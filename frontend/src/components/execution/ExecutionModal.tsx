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
} from 'lucide-react';
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
  const [errorRemediation, setErrorRemediation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const requiresTypedConfirmation = view.riskLevel === 'HIGH' || view.riskLevel === 'CRITICAL';
  const confirmationPhrase = `EXECUTE ${view.targetTable}`;
  const canExecute = !requiresTypedConfirmation || confirmation === confirmationPhrase;

  const targetAnalysisIdRef = useRef<string | null>(null);
  if (open && targetAnalysisIdRef.current === null) {
    targetAnalysisIdRef.current = view.analysisId;
  } else if (!open && targetAnalysisIdRef.current !== null) {
    targetAnalysisIdRef.current = null;
  }

  useEffect(() => {
    if (open) {
      setPhase('confirm');
      setStep('');
      setResult(null);
      setError(null);
      setConfirmation('');
      setErrorRemediation(null);
    }
  }, [open, view.analysisId]);

  // If the active analysis changes while the modal is open, immediately close to protect against target swap
  useEffect(() => {
    if (open && targetAnalysisIdRef.current && view.analysisId !== targetAnalysisIdRef.current) {
      onClose();
    }
  }, [open, view.analysisId, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && phase !== 'running') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, phase, onClose]);

  const run = useCallback(async () => {
    const targetId = targetAnalysisIdRef.current ?? view.analysisId;
    setPhase('running');
    setError(null);
    setErrorRemediation(null);
    try {
      // A retry after a failed execute finds the analysis already APPROVED;
      // approving twice is a 409, so only transition when still pending.
      if (view.status === 'PENDING_APPROVAL') {
        setStep('Recording human approval...');
        const approval = await approveAnalysis(targetId, { actor: 'ui' });
        onStatusChange(approval.status);
      }

      setStep('Revalidating against production, then committing...');
      const execution = await executeAnalysis(targetId);

      if (isStale(execution)) {
        setPhase('stale');
        onStatusChange('STALE');
        return;
      }

      setResult(execution);
      setPhase('success');
      onStatusChange(execution.status);
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(`${caught.code}: ${caught.message}`);
        setErrorRemediation(caught.remediation ?? null);
      } else {
        setError('An unexpected error occurred.');
        setErrorRemediation(null);
      }
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="execution-dialog-title"
        className="max-h-[92vh] w-full max-w-xl space-y-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 id="execution-dialog-title" className="text-h4 font-bold text-slate-900 tracking-tight">
                Execute Original Action
              </h3>
              <p className="text-caption text-slate-500 font-normal">
                Dashboard approval path · revalidate before commit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={phase === 'running'}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Close execution review"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {phase === 'confirm' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-body-sm text-rose-900 font-normal">
              This can permanently delete{' '}
              <strong className="font-semibold">{formatNumber(view.directRows)}</strong> rows
              from <span className="font-mono">{view.targetTable}</span> and{' '}
              <strong className="font-semibold">{formatNumber(view.dependentRows)}</strong>{' '}
              dependent rows. The original action cannot be undone from the dashboard.
            </div>
            <dl className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-3">
              <Detail label="Risk" value={`${view.riskScore}/100 ${view.riskLevel}`} />
              <Detail label="Direct rows" value={formatNumber(view.directRows)} />
              <Detail label="Dependent rows" value={formatNumber(view.dependentRows)} />
              <Detail label="Total potential" value={formatNumber(view.totalRows)} />
              <div className="col-span-2 sm:col-span-2">
                <dt className="text-slate-500">Analysis ID</dt>
                <dd className="mt-0.5 break-all font-mono font-semibold text-slate-900">{view.analysisId}</dd>
              </div>
            </dl>
            <div className="text-caption text-slate-600 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all">
              {view.sql}
            </div>
            {requiresTypedConfirmation && (
              <div className="space-y-2">
                <label htmlFor="execution-confirmation" className="block text-sm font-medium text-slate-800">
                  Type <code className="rounded bg-slate-100 px-1.5 py-0.5 text-rose-700">{confirmationPhrase}</code> to confirm this {view.riskLevel.toLowerCase()}-risk action.
                </label>
                <input
                  id="execution-confirmation"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  autoComplete="off"
                  autoFocus
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                  placeholder={confirmationPhrase}
                />
              </div>
            )}
            <div className="flex gap-2.5">
              <button
                onClick={run}
                disabled={!canExecute}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-body-sm rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
              >
                Approve &amp; Execute
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-body-sm rounded-xl border border-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {phase === 'running' && (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <div className="text-body-sm font-semibold text-slate-900">{step}</div>
            <div className="text-caption text-slate-600 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all">
              {view.sql}
            </div>
          </div>
        )}

        {phase === 'success' && result && (
          <div className="space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center">
              <h4 className="text-h3 font-bold text-slate-900 tracking-tight">
                Execution Committed
              </h4>
              <p className="text-body-sm text-slate-600 mt-1 font-normal">
                The database reported{' '}
                <strong className="font-semibold">
                  {formatNumber(result.affected_rows)}
                </strong>{' '}
                affected rows.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-caption font-mono">
              <Row label="Status">
                <span className="text-emerald-700 font-semibold">{result.status}</span>
              </Row>
              <Row label="Executed At">
                <span className="text-slate-900">{formatTimestamp(result.executed_at)}</span>
              </Row>
              <Row label="Analysis ID">
                <span className="flex items-center gap-1 text-slate-900 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  <span className="truncate max-w-[13rem]">{result.analysis_id}</span>
                  <button
                    onClick={handleCopyId}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </span>
              </Row>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-body-sm rounded-xl transition-colors cursor-pointer"
            >
              Close &amp; Return to Dashboard
            </button>
          </div>
        )}

        {phase === 'stale' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <RefreshCw className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h4 className="text-h3 font-bold text-slate-900 tracking-tight">
                Analysis Is Stale
              </h4>
              <p className="text-body-sm text-slate-600 mt-1 font-normal">
                Production changed after this report was approved, so nothing was executed.
                Re-run the analysis to get fresh numbers.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-body-sm rounded-xl transition-colors cursor-pointer"
            >
              Close &amp; Re-Analyze
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h4 className="text-h3 font-bold text-slate-900 tracking-tight">
                Execution Failed
              </h4>
              <p className="text-body-sm text-slate-600 mt-1 font-normal break-words">
                {error}
              </p>
              {errorRemediation && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-caption text-amber-900 text-left">
                  <strong className="font-semibold text-amber-950">Action required:</strong> {errorRemediation}
                </div>
              )}
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={run}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-body-sm rounded-xl transition-colors cursor-pointer"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-body-sm rounded-xl border border-slate-300 transition-colors cursor-pointer"
              >
                Close
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

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <dt className="text-slate-500">{label}</dt>
    <dd className="mt-0.5 font-mono font-semibold text-slate-900">{value}</dd>
  </div>
);
