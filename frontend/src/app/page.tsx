'use client';

import React, { useCallback, useState } from 'react';
import { ShieldCheck, Cpu, Database, Activity, Sparkles } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { PromptSection } from '../components/prompt/PromptSection';
import { ImpactComparison } from '../components/impact/ImpactComparison';
import { SchemaSection } from '../components/schema/SchemaSection';
import { ExecutionModal } from '../components/execution/ExecutionModal';
import { ActionTimeline } from '../components/timeline/ActionTimeline';
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
  const [isSaferPreview, setIsSaferPreview] = useState(false);

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
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
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
          !isAnalyzing && <CockpitStandbyState onSelectPreset={handleSelectPreset} />
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

const CockpitStandbyState: React.FC<{ onSelectPreset: (key: string) => void }> = ({ onSelectPreset }) => (
  <section className="bg-[#0b0f19] rounded-2xl border border-[#1e293b] p-8 sm:p-10 text-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.2)]">
      <Cpu className="w-6 h-6 animate-pulse" />
    </div>

    <div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 text-cyan-300 border border-cyan-800/60 text-xs font-mono mb-2">
        <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>STANDBY // AWAITING QUERY EXECUTION</span>
      </div>
      <h2 className="text-base sm:text-lg font-bold text-slate-100 font-mono tracking-tight uppercase">
        BLAST RADIUS ENGINE READY FOR SIMULATION
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-xl mx-auto mt-1 leading-relaxed">
        Select a query preset above or write a custom DELETE statement to simulate cascading blast radius, quantify revenue at risk, and generate automated zero-loss safeguards.
      </p>
    </div>

    <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
      <span className="flex items-center gap-1.5 bg-[#070b12] px-3 py-1.5 rounded-lg border border-[#1e293b]">
        <Database className="w-3.5 h-3.5 text-cyan-400" />
        <span>AST REWRITE PARSER</span>
      </span>
      <span className="flex items-center gap-1.5 bg-[#070b12] px-3 py-1.5 rounded-lg border border-[#1e293b]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>ZERO-LOSS SOFT DELETE</span>
      </span>
      <span className="flex items-center gap-1.5 bg-[#070b12] px-3 py-1.5 rounded-lg border border-[#1e293b]">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>REAL-TIME CASCADE DAG</span>
      </span>
    </div>
  </section>
);
