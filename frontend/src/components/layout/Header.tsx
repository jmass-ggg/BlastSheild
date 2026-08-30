'use client';

import React from 'react';
import { Bot, Radio, ScanSearch, Server, ShieldAlert, TerminalSquare } from 'lucide-react';
import { ConnectionState, ReportOrigin } from '../../types';

interface HeaderProps {
  backendStatus: ConnectionState;
  mcpStatus: ConnectionState;
  origin: ReportOrigin | null;
}

export const Header: React.FC<HeaderProps> = ({ backendStatus, mcpStatus, origin }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-2xs backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-h4 font-bold text-slate-900 tracking-tight">BlastShield</h1>
              <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 font-mono text-badge font-semibold uppercase text-amber-800">
                Safety Gateway
              </span>
            </div>
            <p className="mt-0.5 text-body-sm font-normal text-slate-500">
              Pre-execution safety for AI-generated database operations
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-caption">
          <StatusPill label="API" state={backendStatus} icon={Server} />
          <StatusPill label="MCP" state={mcpStatus} icon={Radio} />
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1.5 font-medium text-slate-700">
            <ScanSearch className="w-3.5 h-3.5 text-blue-600" />
            <span>Demo PostgreSQL · <strong className="font-semibold">READ ONLY</strong></span>
          </div>
          {origin && (
            <div className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 font-medium text-sky-800">
              {origin === 'TRUEFORGE_MCP' ? <Bot className="h-3.5 w-3.5" /> : <TerminalSquare className="h-3.5 w-3.5" />}
              <span>{origin === 'TRUEFORGE_MCP' ? 'TrueForge / MCP' : 'Dashboard source'}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

interface StatusPillProps {
  label: string;
  state: ConnectionState;
  icon: React.ComponentType<{ className?: string }>;
}

const StatusPill: React.FC<StatusPillProps> = ({ label, state, icon: Icon }) => {
  const online = state === 'online';
  const checking = state === 'checking';
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium ${
        checking
          ? 'border-slate-200 bg-slate-50 text-slate-600'
          : online
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-rose-200 bg-rose-50 text-rose-800'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}: {checking ? 'CHECKING' : online ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
  );
};
