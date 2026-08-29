'use client';

import React from 'react';
import { Terminal, Loader2, Sparkles, Zap, AlertCircle } from 'lucide-react';
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

  // Cmd/Ctrl+Enter submits, so the textarea can still take newlines.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-caption font-semibold text-slate-700 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>1. Enter SQL Statement</span>
        </div>
        <span className="text-caption text-slate-400 font-normal">
          One DELETE statement · ⌘/Ctrl + Enter to run
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <textarea
          value={sql}
          onChange={(e) => onChangeSql(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          spellCheck={false}
          placeholder="DELETE FROM users WHERE last_login < NOW() - INTERVAL '2 years';"
          disabled={isAnalyzing}
          className="w-full px-3.5 py-3 bg-slate-950 text-emerald-200 font-mono text-caption leading-relaxed border border-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all placeholder:text-slate-600 resize-y disabled:opacity-60"
        />

        <div className="flex items-center justify-between gap-3">
          {error ? (
            <div className="flex items-start gap-1.5 text-caption text-rose-700 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <span className="text-caption text-slate-400 font-normal">
              Analysis runs read-only against production metadata.
            </span>
          )}

          <button
            type="submit"
            disabled={!sql.trim() || isAnalyzing}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-body-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-40 shrink-0 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Run Impact Analysis</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100">
        <span className="text-badge font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" /> Presets:
        </span>

        {PRESET_QUERIES.map((preset) => (
          <button
            key={preset.key}
            type="button"
            title={preset.hint}
            onClick={() => onSelectPreset(preset.key)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-caption cursor-pointer ${
              activePresetKey === preset.key
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
};
