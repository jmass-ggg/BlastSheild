'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, X } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { AnalysisSummary } from '../components/dashboard/AnalysisSummary';
import { EmptyState } from '../components/dashboard/EmptyState';
import { PromptSection } from '../components/prompt/PromptSection';
import { ImpactComparison } from '../components/impact/ImpactComparison';
import { SchemaSection } from '../components/schema/SchemaSection';
import { ExecutionModal } from '../components/execution/ExecutionModal';
import { ActionTimeline } from '../components/timeline/ActionTimeline';
import { DEFAULT_SQL, PRESET_QUERIES } from '../constants/presetQueries';
import { ApiError, analyze, getAnalysis, healthCheck, listAnalyses, rejectAnalysis } from '../lib/apiClient';
import { adaptAnalysis } from '../lib/adaptAnalysis';
import type { AnalysisResponse } from '../types/api';
import { AnalysisView, ConnectionState, ReportOrigin, TableSchema } from '../types';

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
  const [backendStatus, setBackendStatus] = useState<ConnectionState>('checking');
  const [mcpStatus, setMcpStatus] = useState<ConnectionState>('checking');
  const [origin, setOrigin] = useState<ReportOrigin | null>(null);
  const [receivedAt, setReceivedAt] = useState<Date>(new Date());
  const [showNewReportNotice, setShowNewReportNotice] = useState(false);
  const [pendingReports, setPendingReports] = useState<AnalysisResponse[]>([]);
  const knownMcpIds = useRef<Set<string>>(new Set());
  const latestReportKey = useRef<string | null>(null);
  const hasEstablishedReportBaseline = useRef(false);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const visibleTables = useMemo(() => {
    if (!view?.graph.nodes.length) return {};
    const tables: Record<string, TableSchema> = {};
    for (const node of view.graph.nodes) {
      tables[node.table] = {
        name: node.table,
        rowCount: 0,
        description: 'Discovered by the live foreign-key analysis. Column metadata is not included in this report.',
        columns: [],
      };
    }
    return tables;
  }, [view]);

  useEffect(() => {
    let cancelled = false;

    const checkConnections = async () => {
      const [backend, mcp] = await Promise.allSettled([
        healthCheck(),
        fetch('/api/mcp-health', { cache: 'no-store' }),
      ]);
      if (cancelled) return;
      setBackendStatus(backend.status === 'fulfilled' ? 'online' : 'offline');
      setMcpStatus(
        mcp.status === 'fulfilled' && mcp.value.ok ? 'online' : 'offline'
      );
    };

    void checkConnections();
    const timer = window.setInterval(() => void checkConnections(), 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const isExecuteOpenRef = useRef(isExecuteOpen);
  isExecuteOpenRef.current = isExecuteOpen;
  const isRejectingRef = useRef(isRejecting);
  isRejectingRef.current = isRejecting;
  const viewRef = useRef(view);
  viewRef.current = view;

  // Keep the dashboard synchronized with analyses created by TrueForge/MCP.
  // The backend remains authoritative; the browser never recomputes evidence.
  useEffect(() => {
    let cancelled = false;
    let pollSeq = 0;

    const syncLatestReport = async () => {
      if (isAnalyzing || isExecuteOpenRef.current || isRejectingRef.current) return;
      const currentSeq = ++pollSeq;
      try {
        const currentView = viewRef.current;

        // 1. Authoritatively update the viewed analysis lifecycle status
        if (currentView) {
          try {
            const activeReport = await getAnalysis(currentView.analysisId);
            if (!cancelled && currentSeq === pollSeq && viewRef.current?.analysisId === activeReport.analysis_id) {
              const terminalStatuses = ['APPROVED', 'EXECUTED', 'REJECTED', 'STALE'];
              if (!(terminalStatuses.includes(viewRef.current.status) && activeReport.status === 'PENDING_APPROVAL')) {
                setView((prev) => (prev && prev.analysisId === activeReport.analysis_id ? { ...prev, status: activeReport.status } : prev));
              }
            }
          } catch {
            // best-effort active report polling
          }
        }

        // 2. Discover incoming external analyses created by TrueForge/MCP
        const mcpReports = await listAnalyses(10, { source: 'trueforge_agent' });
        if (cancelled || currentSeq !== pollSeq) return;

        if (!hasEstablishedReportBaseline.current) {
          hasEstablishedReportBaseline.current = true;
          for (const r of mcpReports) {
            knownMcpIds.current.add(r.analysis_id);
          }
          return;
        }

        const newMcpReports = mcpReports.filter((r) => !knownMcpIds.current.has(r.analysis_id));
        if (newMcpReports.length === 0) return;

        for (const r of newMcpReports) {
          knownMcpIds.current.add(r.analysis_id);
        }

        if (!currentView) {
          // If dashboard is empty, load the newest incoming MCP report
          const latest = newMcpReports[0];
          const adapted = adaptAnalysis(latest, DEFAULT_SQL);
          setSelectedTable(adapted.targetTable);
          setView(adapted);
          setOrigin('TRUEFORGE_MCP');
          setReceivedAt(new Date());
          setShowNewReportNotice(true);
          if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
          noticeTimerRef.current = window.setTimeout(() => setShowNewReportNotice(false), 6000);
          window.setTimeout(
            () => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
            50,
          );
        } else {
          // If viewing an existing analysis, queue all new MCP reports without dropping any
          setPendingReports((prev) => [...newMcpReports, ...prev]);
          setShowNewReportNotice(true);
        }
      } catch {
        // The prompt owns user-facing connection errors. Background sync is best effort.
      }
    };

    void syncLatestReport();
    const timer = window.setInterval(() => void syncLatestReport(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
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
      latestReportKey.current = `${report.analysis_id}:${report.status}`;
      setView(adapted);
      setSelectedTable(adapted.targetTable);
      setOrigin('DASHBOARD');
      setReceivedAt(new Date());
    } catch (caught) {
      setView(null);
      if (caught instanceof ApiError) {
        const detail = caught.remediation
          ? `${caught.code}: ${caught.message} (${caught.remediation})`
          : `${caught.code}: ${caught.message}`;
        setAnalyzeError(detail);
      } else {
        setAnalyzeError('An unexpected error occurred while analyzing.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleSelectPreset = (presetKey: string) => {
    const preset = PRESET_QUERIES.find((item) => item.key === presetKey);
    if (!preset) return;
    setActivePresetKey(preset.key);
    setSql(preset.sql);
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
      latestReportKey.current = `${view.analysisId}:${transition.status}`;
    } catch (caught) {
      if (caught instanceof ApiError) {
        const detail = caught.remediation
          ? `${caught.code}: ${caught.message} (${caught.remediation})`
          : `${caught.code}: ${caught.message}`;
        setAnalyzeError(detail);
      } else {
        setAnalyzeError('Rejecting the analysis failed.');
      }
    } finally {
      setIsRejecting(false);
    }
  };

  const handleStatusChange = useCallback((analysisId: string, status: string) => {
    setView((current) => {
      if (!current || current.analysisId !== analysisId) return current;
      latestReportKey.current = `${analysisId}:${status}`;
      return { ...current, status };
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Header backendStatus={backendStatus} mcpStatus={mcpStatus} origin={origin} />

      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        {showNewReportNotice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 shadow-sm"
          >
            <span className="flex items-center gap-2 font-medium">
              <Bot className="h-4 w-4 text-sky-600" />
              {pendingReports.length > 0
                ? `${pendingReports.length} new MCP ${pendingReports.length === 1 ? 'analysis' : 'analyses'} received from TrueForge (latest: ${pendingReports[0].analysis_id.slice(0, 8)}).`
                : 'New analysis received from TrueForge through the BlastShield MCP connector.'}
            </span>
            <div className="flex items-center gap-2">
              {pendingReports.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const [nextReport, ...remaining] = pendingReports;
                    const adapted = adaptAnalysis(nextReport, DEFAULT_SQL);
                    setView(adapted);
                    setSelectedTable(adapted.targetTable);
                    setOrigin('TRUEFORGE_MCP');
                    setReceivedAt(new Date());
                    setPendingReports(remaining);
                    if (remaining.length === 0) setShowNewReportNotice(false);
                  }}
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Switch to New Analysis
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowNewReportNotice(false);
                  setPendingReports([]);
                }}
                className="rounded-lg p-1 text-sky-700 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {view ? (
          <div ref={reportRef} className="scroll-mt-24">
            <AnalysisSummary view={view} origin={origin ?? 'DASHBOARD'} receivedAt={receivedAt} />
          </div>
        ) : (
          <EmptyState backendStatus={backendStatus} mcpStatus={mcpStatus} />
        )}

        {(isAnalyzing || view) && (
          <ActionTimeline
            isAnalyzing={isAnalyzing}
            timeline={view?.timeline}
            status={view?.status}
          />
        )}

        {/* 2. Risk Gauge & Action Comparison */}
        {view && (
          <ImpactComparison
            view={view}
            onExecute={() => setIsExecuteOpen(true)}
            onReject={() => void handleReject()}
            isRejecting={isRejecting}
            isSaferPreview={isSaferPreview}
            onToggleSaferPreview={() => setIsSaferPreview((prev) => !prev)}
          />
        )}

        {view && (
          <SchemaSection
            tables={visibleTables}
            affectedMap={view.affectedTableMap}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            graph={view.graph}
            dependencies={view.dependencies}
            isSaferMode={isSaferPreview}
            targetTable={view.targetTable}
          />
        )}

        <PromptSection
          sql={sql}
          onChangeSql={handleChangeSql}
          onSubmit={() => void runAnalysis(sql)}
          isAnalyzing={isAnalyzing}
          onSelectPreset={handleSelectPreset}
          activePresetKey={activePresetKey}
          error={analyzeError}
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
