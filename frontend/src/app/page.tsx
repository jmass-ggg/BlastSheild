'use client';

import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { PromptSection } from '../components/prompt/PromptSection';
import { ImpactComparison } from '../components/impact/ImpactComparison';
import { SchemaSection } from '../components/schema/SchemaSection';
import { ExecutionModal } from '../components/execution/ExecutionModal';
import { DATABASE_SCHEMA } from '../constants/databaseSchema';
import { PRESET_QUERIES } from '../constants/presetQueries';
import { ImpactResult, ExecutionMode } from '../types';

export default function Home() {
  const [promptInput, setPromptInput] = useState<string>('Delete inactive customers older than 2 years');
  const [activeImpact, setActiveImpact] = useState<ImpactResult>(PRESET_QUERIES['inactive_2y']);
  const [activePresetKey, setActivePresetKey] = useState<string>('inactive_2y');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [executingMode, setExecutingMode] = useState<ExecutionMode | null>(null);

  // Analysis simulator handler
  const handleRunAnalysis = (overrideText?: string) => {
    const text = overrideText || promptInput;
    if (!text.trim() || isSimulating) return;

    setIsSimulating(true);

    let result = PRESET_QUERIES['inactive_2y'];
    const lower = text.toLowerCase();

    if (lower.includes('trial') || lower.includes('staging') || lower.includes('q1') || lower.includes('8f42k')) {
      result = PRESET_QUERIES['staging_trials'];
    } else if (lower.includes('truncate') || lower.includes('clear') || lower.includes('order')) {
      result = PRESET_QUERIES['truncate_orders'];
    } else if (lower.includes('discount') || lower.includes('price') || lower.includes('update')) {
      result = PRESET_QUERIES['discount_subs'];
    } else {
      result = {
        ...PRESET_QUERIES['inactive_2y'],
        promptText: text,
      };
    }

    setTimeout(() => {
      setActiveImpact(result);
      setSelectedTable(result.targetTable);
      setIsSimulating(false);
    }, 400);
  };

  const handleSelectPreset = (presetKey: string) => {
    const preset = PRESET_QUERIES[presetKey];
    if (!preset) return;

    setActivePresetKey(presetKey);
    setPromptInput(preset.promptText);
    handleRunAnalysis(preset.promptText);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Top Enterprise Header */}
      <Header />

      {/* Main Orchestrator Body */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        
        {/* 1. Prompt & Preset Input Section */}
        <PromptSection
          promptInput={promptInput}
          onChangePrompt={setPromptInput}
          onSubmit={() => handleRunAnalysis()}
          isSimulating={isSimulating}
          onSelectPreset={handleSelectPreset}
          activePresetKey={activePresetKey}
        />

        {/* 2. Side-by-Side Impact & Safer Alternative Comparison */}
        <ImpactComparison
          impact={activeImpact}
          onExecute={(mode) => setExecutingMode(mode)}
        />

        {/* 3. Interactive Schema with ER Connected Lines */}
        <SchemaSection
          tables={DATABASE_SCHEMA}
          affectedMap={activeImpact.affectedTableMap}
          selectedTable={selectedTable}
          onSelectTable={(table) => setSelectedTable(table)}
        />

      </main>

      {/* 4. Production Execution Modal */}
      <ExecutionModal
        mode={executingMode}
        impact={activeImpact}
        onClose={() => setExecutingMode(null)}
      />
    </div>
  );
}
