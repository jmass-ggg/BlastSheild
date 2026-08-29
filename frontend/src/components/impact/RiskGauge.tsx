'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Activity,
  Layers,
  DollarSign,
  AlertOctagon,
  Database,
} from 'lucide-react';
import { RiskBreakdown, RiskLevel } from '../../types';
import { formatNumber, formatCurrency } from '../../lib/formatters';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  breakdown?: RiskBreakdown;
  isSaferMode?: boolean;
  originalScore?: number;
  originalLevel?: RiskLevel;
  directRows?: number;
  dependentRows?: number;
  arrAtRisk?: number;
  targetTable?: string;
}

const LEVEL_CONFIG: Record<
  RiskLevel,
  {
    text: string;
    bg: string;
    border: string;
    stroke: string;
    glow: string;
    badge: string;
  }
> = {
  LOW: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-800/60',
    stroke: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
  },
  MEDIUM: {
    text: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-800/60',
    stroke: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    badge: 'bg-amber-950/70 text-amber-300 border-amber-700 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
  },
  HIGH: {
    text: 'text-orange-400',
    bg: 'bg-orange-950/40',
    border: 'border-orange-800/60',
    stroke: '#f97316',
    glow: 'rgba(249, 115, 22, 0.4)',
    badge: 'bg-orange-950/70 text-orange-300 border-orange-700 shadow-[0_0_12px_rgba(249,115,22,0.3)]',
  },
  CRITICAL: {
    text: 'text-rose-400',
    bg: 'bg-rose-950/40',
    border: 'border-rose-800/60',
    stroke: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.4)',
    badge: 'bg-rose-950/70 text-rose-300 border-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
  },
};

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  level,
  breakdown,
  isSaferMode = false,
  originalScore,
  originalLevel,
  directRows = 0,
  dependentRows = 0,
  arrAtRisk = 0,
  targetTable = 'table',
}) => {
  const [displayScore, setDisplayScore] = useState(score);
  const animationRef = useRef<number | null>(null);
  const startScoreRef = useRef(displayScore);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    const startVal = startScoreRef.current;
    const targetVal = score;
    if (startVal === targetVal) return;

    const duration = 650;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (targetVal - startVal) * ease);

      setDisplayScore(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        startScoreRef.current = targetVal;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      startScoreRef.current = targetVal;
    };
  }, [score]);

  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.MEDIUM;

  // Arc Gauge Geometry
  const radius = 75;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, displayScore));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const scoreDiff =
    originalScore !== undefined && isSaferMode
      ? originalScore - score
      : 0;

  const effectiveDependentRows = isSaferMode ? 0 : dependentRows;
  const effectiveTotalRows = directRows + effectiveDependentRows;
  const effectiveArrAtRisk = isSaferMode ? 0 : arrAtRisk;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 relative overflow-hidden ${
        isSaferMode
          ? 'bg-[#091515] border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
          : 'bg-[#0b0f19] border-[#1e293b] shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
      }`}
    >
      {/* Header telemetry bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 border ${
              isSaferMode
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950/60 border-rose-800 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
            }`}
          >
            {isSaferMode ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                {isSaferMode ? 'SAFEGUARDED RISK TELEMETRY' : 'BLAST RADIUS RISK GAUGE'}
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-[#131d31] border border-[#1e293b] px-1.5 py-0.2 rounded">
                HUD_v0.4
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              {isSaferMode
                ? 'Projected risk under non-destructive soft delete rewrite'
                : 'Deterministic AST & Foreign-Key cascading graph scoring'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {scoreDiff > 0 && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>-{scoreDiff} PTS [67% MITIGATED]</span>
            </span>
          )}
          <span
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border shrink-0 ${cfg.badge}`}
          >
            {level} RISK
          </span>
        </div>
      </div>

      {/* Main Avionics Gauge & KPIs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Semi-circular Avionics Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-2">
          <div className="relative w-[220px] h-[125px] flex items-end justify-center select-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 115">
              <defs>
                <filter id="gaugeGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={cfg.stroke} floodOpacity="0.6" />
                </filter>
                <linearGradient id="hudArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="35%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              {/* Background Concentric Radar Rings */}
              <path
                d="M 25 100 A 75 75 0 0 1 175 100"
                fill="none"
                stroke="#131d31"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <path
                d="M 40 100 A 60 60 0 0 1 160 100"
                fill="none"
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2,4"
              />

              {/* Glowing Active Arc */}
              <path
                d="M 25 100 A 75 75 0 0 1 175 100"
                fill="none"
                stroke={cfg.stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                filter="url(#gaugeGlow)"
                className="transition-all duration-300"
              />

              {/* Calibrated HUD Tick Labels */}
              <text x="18" y="112" className="text-[10px] font-mono fill-slate-500">0</text>
              <text x="94" y="20" className="text-[10px] font-mono fill-slate-500">50</text>
              <text x="172" y="112" className="text-[10px] font-mono fill-slate-500">100</text>
            </svg>

            {/* Central Score Readout */}
            <div className="absolute bottom-1 flex flex-col items-center justify-center">
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight leading-none ${cfg.text} drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]`}>
                  {displayScore}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">/100</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                {level} LEVEL
              </span>
            </div>
          </div>
        </div>

        {/* Center: High-Density Telemetry KPI Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-2.5">
          {/* Direct Rows */}
          <div className="p-3 bg-[#070b12] rounded-xl border border-[#1e293b] flex flex-col justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3 h-3 text-cyan-400" /> DIRECT ROWS
            </span>
            <div className="mt-1">
              <div className="text-lg font-bold font-mono text-slate-100">
                {formatNumber(directRows)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate">
                {targetTable}
              </div>
            </div>
          </div>

          {/* Cascading Rows */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isSaferMode
              ? 'bg-emerald-950/20 border-emerald-800/40'
              : effectiveDependentRows > 0
              ? 'bg-rose-950/20 border-rose-800/40'
              : 'bg-[#070b12] border-[#1e293b]'
          }`}>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" /> CASCADE PURGE
            </span>
            <div className="mt-1">
              <div className={`text-lg font-bold font-mono ${isSaferMode ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatNumber(effectiveDependentRows)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {isSaferMode ? '0 purged (intact)' : 'dependent rows'}
              </div>
            </div>
          </div>

          {/* Total Rows */}
          <div className="p-3 bg-[#070b12] rounded-xl border border-[#1e293b] flex flex-col justify-between">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <AlertOctagon className="w-3 h-3 text-rose-400" /> TOTAL PURGED
            </span>
            <div className="mt-1">
              <div className="text-lg font-bold font-mono text-slate-100">
                {formatNumber(effectiveTotalRows)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {isSaferMode ? 'soft deleted' : 'hard deleted'}
              </div>
            </div>
          </div>

          {/* ARR at Risk */}
          <div className={`p-3 rounded-xl border flex flex-col justify-between ${
            isSaferMode
              ? 'bg-emerald-950/20 border-emerald-800/40'
              : effectiveArrAtRisk > 0
              ? 'bg-rose-950/20 border-rose-800/40'
              : 'bg-[#070b12] border-[#1e293b]'
          }`}>
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" /> ARR AT RISK
            </span>
            <div className="mt-1">
              <div className={`text-lg font-bold font-mono ${isSaferMode ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(effectiveArrAtRisk)}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {isSaferMode ? '$0 ARR risk' : 'immediate loss'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Risk Factor Sub-Bars */}
        <div className="lg:col-span-4">
          {breakdown && (
            <div className="space-y-2 font-mono text-xs bg-[#070b12] p-3 rounded-xl border border-[#1e293b]">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-[#1e293b] pb-1.5">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" /> RISK VECTOR BREAKDOWN
                </span>
                <span>PTS</span>
              </div>
              <FactorBar label="Op Weight" value={breakdown.operation} max={25} isSafer={isSaferMode} />
              <FactorBar label="Direct Impact" value={breakdown.direct_impact} max={20} isSafer={isSaferMode} />
              <FactorBar label="Cascade Depth" value={breakdown.dependent_impact + breakdown.cascade} max={30} isSafer={isSaferMode} />
              <FactorBar label="ARR / Rev Vector" value={breakdown.business_impact} max={15} isSafer={isSaferMode} />
              <FactorBar label="Recoverability" value={breakdown.recoverability} max={10} isSafer={isSaferMode} />
            </div>
          )}
        </div>
      </div>

      {/* Safe Mode Active Mitigation Banner */}
      {isSaferMode && originalScore !== undefined && (
        <div className="mt-4 pt-3 border-t border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-emerald-200 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-700/50">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Score reduced from <strong className="text-rose-300">{originalScore} ({originalLevel})</strong> ➔ <strong className="text-emerald-300">{score} ({level})</strong></span>
          </span>
          <span className="font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700">
            67% RISK MITIGATED
          </span>
        </div>
      )}
    </div>
  );
};

const FactorBar: React.FC<{
  label: string;
  value: number;
  max: number;
  isSafer: boolean;
}> = ({ label, value, max, isSafer }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-200">{value} pts</span>
      </div>
      <div className="w-full h-1.5 bg-[#131d31] rounded-full overflow-hidden">
        <div
          style={{ width: `${pct}%` }}
          className={`h-full rounded-full transition-all duration-500 ${
            isSafer ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : value > max * 0.6 ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]' : 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
          }`}
        />
      </div>
    </div>
  );
};
