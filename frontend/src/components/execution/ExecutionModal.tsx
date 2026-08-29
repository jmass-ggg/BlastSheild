'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  CheckCircle2, 
  Check, 
  Copy 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ImpactResult, ExecutionMode } from '../../types';
import { generateAuditId, formatNumber } from '../../lib/formatters';

interface ExecutionModalProps {
  mode: ExecutionMode | null;
  impact: ImpactResult;
  onClose: () => void;
}

export const ExecutionModal: React.FC<ExecutionModalProps> = ({ mode, impact, onClose }) => {
  const [isExecuting, setIsExecuting] = useState(true);
  const [auditId, setAuditId] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!mode) return;

    setIsExecuting(true);
    const timer = setTimeout(() => {
      const id = generateAuditId();
      setAuditId(id);
      setIsExecuting(false);

      if (mode === 'SAFER') {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [mode]);

  if (!mode) return null;

  const handleCopyAudit = () => {
    navigator.clipboard.writeText(auditId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            {mode === 'SAFER' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
            )}
            <div>
              <h3 className="text-h4 font-bold text-slate-900 tracking-tight">
                {mode === 'SAFER' ? 'Executing Safer Action' : 'Executing Original Action'}
              </h3>
              <p className="text-caption text-slate-500 font-normal">blastshield_prod database commitment</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isExecuting ? (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <div className="text-body-sm font-semibold text-slate-900">Applying Verified Operation to Production...</div>
            <div className="text-caption text-slate-600 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {mode === 'SAFER' ? impact.saferSql : impact.originalSql}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center">
              <h4 className="text-h3 font-bold text-slate-900 tracking-tight">Production Execution Successful!</h4>
              <p className="text-body-sm text-slate-600 mt-1 font-normal">
                {mode === 'SAFER'
                  ? `Successfully soft-deleted ${formatNumber(impact.saferDirectRows)} users while protecting 0 cascade records.`
                  : `Permanently deleted ${formatNumber(impact.originalDirectRows)} users and ${formatNumber(impact.originalCascadeRows)} cascade records.`}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-caption font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-normal">Target Database:</span>
                <span className="text-emerald-700 font-semibold">blastshield_prod</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-normal">Security Audit ID:</span>
                <div className="flex items-center gap-1 text-slate-900 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  <span>{auditId}</span>
                  <button onClick={handleCopyAudit} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-body-sm rounded-xl transition-colors cursor-pointer"
            >
              Close & Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
