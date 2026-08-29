'use client';

import React from 'react';
import { Terminal, Search, Loader2, Sparkles, Zap } from 'lucide-react';
import { PRESET_OPTIONS } from '../../constants/presetQueries';

interface PromptSectionProps {
  promptInput: string;
  onChangePrompt: (value: string) => void;
  onSubmit: () => void;
  isSimulating: boolean;
  onSelectPreset: (presetKey: string) => void;
  activePresetKey?: string;
}

export const PromptSection: React.FC<PromptSectionProps> = ({
  promptInput,
  onChangePrompt,
  onSubmit,
  isSimulating,
  onSelectPreset,
  activePresetKey,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-caption font-semibold text-slate-700 uppercase tracking-wider">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span>1. Enter Query / Database Instruction</span>
        </div>
        <span className="text-caption text-slate-400 font-normal">Natural language or SQL</span>
      </div>

      {/* Input Box & Action Button */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={promptInput}
            onChange={(e) => onChangePrompt(e.target.value)}
            placeholder="e.g. Delete inactive customers older than 2 years..."
            disabled={isSimulating}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 text-body font-normal border border-slate-300 focus:border-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={!promptInput.trim() || isSimulating}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-body-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-40 shrink-0 cursor-pointer"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Run Impact Analysis</span>
            </>
          )}
        </button>
      </form>

      {/* Preset Buttons */}
      <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-100">
        <span className="text-badge font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" /> Presets:
        </span>

        {PRESET_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onSelectPreset(opt.key)}
            className={`px-3 py-1.5 rounded-lg border transition-all text-caption cursor-pointer ${
              activePresetKey === opt.key
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

    </section>
  );
};
