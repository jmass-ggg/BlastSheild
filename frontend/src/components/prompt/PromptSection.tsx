'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Terminal, Loader2, Sparkles, Zap, AlertCircle } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(Boolean(error));

  useEffect(() => {
    if (error) setIsOpen(true);
  }, [error]);

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
    <details
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Developer Mode: Analyze SQL manually</div>
            <div className="text-xs text-slate-500">Secondary testing path · one PostgreSQL DELETE statement</div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-3.5 border-t border-slate-200 p-5">
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
              Analysis runs through the read-only analyzer role.
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

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
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
      </div>
    </details>
  );
};
