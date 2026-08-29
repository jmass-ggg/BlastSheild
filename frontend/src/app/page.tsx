'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '../components/layout/Header';
import { PromptSection } from '../components/prompt/PromptSection';
import { ImpactComparison } from '../components/impact/ImpactComparison';
import { SchemaSection } from '../components/schema/SchemaSection';
import { ExecutionModal } from '../components/execution/ExecutionModal';
import { ActionTimeline } from '../components/timeline/ActionTimeline';
import { DATABASE_SCHEMA } from '../constants/databaseSchema';
import { DEFAULT_SQL, PRESET_QUERIES } from '../constants/presetQueries';
import { ApiError, analyze, listAnalyses, rejectAnalysis } from '../lib/apiClient';
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
  const [isSaferPreview, setIsSaferPreview] = useState(false);
  const latestReportKey = useRef<string | null>(null);

  // Keep the dashboard synchronized with analyses created by TrueForge/MCP.
  // The backend remains authoritative; the browser never recomputes evidence.
  useEffect(() => {
    let cancelled = false;

    const syncLatestReport = async () => {
      if (isAnalyzing) return;
      try {
        const reports = await listAnalyses(1);
        const latest = reports[0];
        if (!latest || cancelled) return;
        const reportKey = `${latest.analysis_id}:${latest.status}`;
        if (latestReportKey.current === reportKey) return;
        latestReportKey.current = reportKey;
        const adapted = adaptAnalysis(latest, latest.sql ?? DEFAULT_SQL);
        setSelectedTable(adapted.targetTable);
        setView(adapted);
      } catch {
        // The prompt owns user-facing connection errors. Background sync is best effort.
      }
    };

    void syncLatestReport();
    const timer = window.setInterval(() => void syncLatestReport(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isAnalyzing]);

  const runAnalysis = useCallback(async (statement: string) => {
    const trimmed = statement.trim();
    if (!trimmed) return;

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setIsSaferPreview(false);
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
        {/* 1. SQL Entry & Presets */}
        <PromptSection
          sql={sql}
          onChangeSql={handleChangeSql}
          onSubmit={() => void runAnalysis(sql)}
          isAnalyzing={isAnalyzing}
          onSelectPreset={handleSelectPreset}
          activePresetKey={activePresetKey}
          error={analyzeError}
        />

        {/* Live Staged Progress (During Analysis) or Gateway Action Feed */}
        {(isAnalyzing || view) && (
          <ActionTimeline
            isAnalyzing={isAnalyzing}
            timeline={view?.timeline}
            status={view?.status}
          />
        )}

        {/* 2. Risk Gauge & Action Comparison */}
        {view ? (
          <ImpactComparison
            view={view}
            onExecute={() => setIsExecuteOpen(true)}
            onReject={() => void handleReject()}
            isRejecting={isRejecting}
            isSaferPreview={isSaferPreview}
            onToggleSaferPreview={() => setIsSaferPreview((prev) => !prev)}
          />
        ) : (
          !isAnalyzing && <EmptyState />
        )}

        {/* 3. Interactive Blast Radius Graph & Schema Explorer */}
        <SchemaSection
          tables={DATABASE_SCHEMA}
          affectedMap={view?.affectedTableMap ?? {}}
          selectedTable={selectedTable}
          onSelectTable={setSelectedTable}
          graph={view?.graph}
          isSaferMode={isSaferPreview}
          targetTable={view?.targetTable}
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

const EmptyState: React.FC = () => (
  <section className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
    <p className="text-body-sm text-slate-500 font-normal">
      Run an impact analysis above to inspect the blast-radius dependency graph and simulated safety alternatives.
    </p>
  </section>
);
