'use client';

import React, { useState } from 'react';
import {
  Terminal as TerminalIcon,
  Loader2,
  Sparkles,
  Zap,
  AlertCircle,
  Code2,
  Cpu,
  CornerDownLeft,
} from 'lucide-react';
import { PRESET_QUERIES } from '../../constants/presetQueries';

interface PromptSectionProps {
  sql: string;
  onChangeSql: (value: string) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
  onSelectPreset: (presetKey: string) => void;
  activePresetKey?: string | null;
  error?: string | null;
}

export const PromptSection: React.FC<PromptSectionProps> = ({
  sql,
  onChangeSql,
  onSubmit,
  isAnalyzing,
  onSelectPreset,
  activePresetKey,
  error,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Cmd/Ctrl+Enter submits
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  // Calculate line numbers
  const lines = sql.split('\n');
  const lineCount = Math.max(lines.length, 3);

  return (
    <section className="bg-[#0b0f19] rounded-2xl border border-[#1e293b] p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.6)] space-y-4">
      {/* IDE Terminal Window Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-3">
          {/* Terminal Dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/50 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/50 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/50 inline-block" />
          </div>

          {/* Tab */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#131d31] border border-[#1e293b] rounded-lg text-xs font-mono text-slate-200">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-100">query.sql</span>
            <span className="text-slate-500">·</span>
            <span className="text-cyan-400 text-[11px]">[POSTGRES_DIALECT]</span>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>AST_INTERCEPT_MODE: READ_ONLY</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">ISOLATION: TRANSACTIONAL</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Editor Area with Monospace Gutter */}
        <div className="relative flex rounded-xl border border-[#1e293b] bg-[#070b12] overflow-hidden focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/40 transition-all shadow-inner">
          {/* Line Numbers Gutter */}
          <div className="select-none py-3.5 px-3 bg-[#090d16] border-r border-[#1e293b] font-mono text-xs text-slate-600 text-right space-y-1">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="leading-6">
                {String(i + 1).padStart(2, '0')}
              </div>
            ))}
          </div>

          {/* Code Textarea */}
          <div className="relative flex-1">
            <textarea
              value={sql}
              onChange={(e) => onChangeSql(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={lineCount}
              spellCheck={false}
              placeholder="DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';"
              disabled={isAnalyzing}
              className="w-full h-full py-3.5 px-4 bg-transparent text-emerald-300 font-mono text-xs sm:text-sm leading-6 border-0 focus:outline-none focus:ring-0 placeholder:text-slate-700 resize-y disabled:opacity-50"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          {error ? (
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-800/60 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <TerminalIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Simulation engine validates foreign keys &amp; ON DELETE CASCADE triggers</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!sql.trim() || isAnalyzing}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>ANALYZING AST &amp; DAG...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>RUN ANALYSIS</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-700/30 text-[10px] text-slate-900 border border-amber-700/40 flex items-center gap-0.5">
                  <span>⌘</span>
                  <CornerDownLeft className="w-2.5 h-2.5" />
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Query Chips */}
      <div className="pt-3 border-t border-[#1e293b] flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>SECURITY TEST SUITES &amp; QUERY PRESETS:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_QUERIES.map((preset) => {
            const isActive = activePresetKey === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => onSelectPreset(preset.key)}
                className={`p-2.5 rounded-xl border text-left transition-all font-mono cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] text-amber-200 ring-1 ring-amber-500/30'
                    : 'bg-[#0d1424] hover:bg-[#131d31] border-[#1e293b] hover:border-[#334155] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-semibold text-slate-100 truncate">
                    {preset.label}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isActive ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-600'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed">
                  {preset.hint}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
