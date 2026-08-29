'use client';

import React from 'react';
import { ShieldAlert, ScanSearch } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-2xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-h4 font-bold text-slate-900 tracking-tight">BlastShield</h1>
              <span className="text-badge font-semibold uppercase bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-mono">
                Pre-Execution Gateway
              </span>
            </div>
            <p className="text-body-sm text-slate-500 font-normal mt-0.5">
              Measures live production impact, explains risk, and constrains execution.
            </p>
          </div>
        </div>

        {/* Database Status Pills */}
        <div className="flex items-center gap-2.5 text-caption">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>blastshield_prod: <strong className="font-semibold">PROTECTED</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            <ScanSearch className="w-3.5 h-3.5 text-blue-600" />
            <span>analyzer_role: <strong className="font-semibold">READ ONLY</strong></span>
          </div>
        </div>

      </div>
    </header>
  );
};
