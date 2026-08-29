'use client';

import React from 'react';
import { ShieldAlert, Database, Lock, Activity, Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#0b0f19]/95 backdrop-blur-md border-b border-[#1e293b] px-4 sm:px-6 py-3.5 sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Brand & Telemetry Ident */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0f19] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-mono font-bold tracking-wider text-sm sm:text-base text-slate-100 uppercase">
                <span>BLASTSHIELD</span>
                <span className="text-slate-600">//</span>
                <span className="text-amber-400">SAFETY GATEWAY</span>
                <span className="text-xs text-slate-500 font-normal">v0.4</span>
              </div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                PRE-EXECUTION ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Deterministic pre-flight PostgreSQL blast-radius analysis &amp; zero-loss automated safeguard synthesis.
            </p>
          </div>
        </div>

        {/* Live System Telemetry Status Pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* Postgres Connection Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d1424] border border-[#1e293b] text-slate-300 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-400">PG:</span>
            <span className="text-emerald-400 font-semibold">ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">PORT: 55432</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">3 ROLES</span>
          </div>

          {/* Policy Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">POLICY:</span>
            <span className="font-semibold text-cyan-200 tracking-wide">STRICT ZERO-LOSS</span>
          </div>
        </div>

      </div>
    </header>
  );
};
