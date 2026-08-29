'use client';

import React, { useCallback, useState } from 'react';
import { Header } from '../components/layout/Header';
import { PromptSection } from '../components/prompt/PromptSection';
import { ImpactComparison } from '../components/impact/ImpactComparison';
import { SchemaSection } from '../components/schema/SchemaSection';
import { ExecutionModal } from '../components/execution/ExecutionModal';
import { DATABASE_SCHEMA } from '../constants/databaseSchema';
import { DEFAULT_SQL, PRESET_QUERIES } from '../constants/presetQueries';
import { ApiError, analyze, rejectAnalysis } from '../lib/apiClient';
import { adaptAnalysis } from '../lib/adaptAnalysis';
import { AnalysisView } from '../types';

export default function Home() {
  const [sql, setSql] = useState<string>(DEFAULT_SQL);
  const [activePresetKey, setActivePresetKey] = useState<string | null>(
    PRESET_QUERIES[0].key
  );

  const [view, setView] = useState<AnalysisView | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const runAnalysis = useCallback(async (statement: string) => {
    const trimmed = statement.trim();
    if (!trimmed) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const report = await analyze({ sql: trimmed, source: 'ui' });
      const adapted = adaptAnalysis(report, trimmed);
      setView(adapted);
      setSelectedTable(adapted.targetTable);
    } catch (caught) {
      setView(null);
      setAnalyzeError(
        caught instanceof ApiError
          ? `${caught.code}: ${caught.message}`
          : 'An unexpected error occurred while analyzing.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSelectPreset = (presetKey: string) => {
    const preset = PRESET_QUERIES.find((item) => item.key === presetKey);
    if (!preset) return;
    setActivePresetKey(preset.key);
    setSql(preset.sql);
    void runAnalysis(preset.sql);
  };

  const handleChangeSql = (value: string) => {
    setSql(value);
    setActivePresetKey(null);
  };

  const handleReject = async () => {
    if (!view) return;
    setIsRejecting(true);
    try {
      const transition = await rejectAnalysis(view.analysisId, { actor: 'ui' });
      setView({ ...view, status: transition.status });
    } catch (caught) {
      setAnalyzeError(
        caught instanceof ApiError
          ? `${caught.code}: ${caught.message}`
          : 'Rejecting the analysis failed.'
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const handleStatusChange = useCallback((status: string) => {
    setView((current) => (current ? { ...current, status } : current));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        <PromptSection
          sql={sql}
          onChangeSql={handleChangeSql}
          onSubmit={() => void runAnalysis(sql)}
          isAnalyzing={isAnalyzing}
          onSelectPreset={handleSelectPreset}
          activePresetKey={activePresetKey}
          error={analyzeError}
        />

        {view ? (
          <ImpactComparison
            view={view}
            onExecute={() => setIsExecuteOpen(true)}
            onReject={() => void handleReject()}
            isRejecting={isRejecting}
          />
        ) : (
          <EmptyState isAnalyzing={isAnalyzing} />
        )}

        <SchemaSection
          tables={DATABASE_SCHEMA}
          affectedMap={view?.affectedTableMap ?? {}}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
        />
      </main>

      {view && (
        <ExecutionModal
          open={isExecuteOpen}
          view={view}
          onClose={() => setIsExecuteOpen(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

const EmptyState: React.FC<{ isAnalyzing: boolean }> = ({ isAnalyzing }) => (
  <section className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
    <p className="text-body-sm text-slate-500 font-normal">
      {isAnalyzing
        ? 'Measuring blast radius against production metadata...'
        : 'Run an impact analysis to see the blast radius and safer alternative.'}
    </p>
  </section>
);
