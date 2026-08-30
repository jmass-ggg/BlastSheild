'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Shield, ShieldAlert, ShieldCheck, TrendingDown, Info } from 'lucide-react';
import { RiskBreakdown, RiskLevel } from '../../types';

interface RiskGaugeProps {
  score: number;
  level: RiskLevel;
  breakdown?: RiskBreakdown;
  isSaferMode?: boolean;
  originalScore?: number;
  originalLevel?: RiskLevel;
}

const LEVEL_COLORS: Record<
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
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    stroke: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  MEDIUM: {
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    stroke: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  HIGH: {
    text: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    stroke: '#f97316',
    glow: 'rgba(249, 115, 22, 0.25)',
    badge: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  CRITICAL: {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    stroke: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.25)',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
  },
};

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  level,
  breakdown,
  isSaferMode = false,
  originalScore,
  originalLevel,
}) => {
  // Smooth animated count tweening
  const [displayScore, setDisplayScore] = useState(score);
  const animationRef = useRef<number | null>(null);
  const startScoreRef = useRef(displayScore);

  useEffect(() => {
    // Check if user prefers reduced motion
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

    const duration = 650; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
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

  const color = LEVEL_COLORS[level] || LEVEL_COLORS.MEDIUM;

  // Arc Gauge Geometry (Semi-circle arc)
  // Radius = 80, Center = (100, 95)
  // Arc length for 180 degrees = PI * 80 ≈ 251.327
  const radius = 75;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle
  const clampedScore = Math.max(0, Math.min(100, displayScore));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const scoreDiff =
    originalScore !== undefined && isSaferMode
      ? originalScore - score
      : 0;

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 ${
        isSaferMode
          ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
              isSaferMode ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isSaferMode ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div>
            <h3 className="text-body-sm font-bold text-slate-900 uppercase tracking-wider">
              {isSaferMode ? 'Safeguarded Risk Meter' : 'Blast Radius Risk Gauge'}
            </h3>
            <p className="text-caption text-slate-500 font-normal">
              {isSaferMode
                ? 'Projected risk under non-destructive soft delete'
                : 'Deterministic multi-factor risk scoring'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scoreDiff > 0 && (
            <span className="px-2 py-0.5 rounded-md text-badge font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              -{scoreDiff} PTS
            </span>
          )}
          <span
            className={`px-2.5 py-1 rounded-lg text-caption font-bold border shrink-0 ${color.badge}`}
          >
            {level}
          </span>
        </div>
      </div>

      {/* Main Gauge Graphic */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Speedometer Semi-Arc */}
        <div className="relative w-[210px] h-[120px] flex items-end justify-center select-none">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 200 115">
            <defs>
              <linearGradient id="gaugeTrack" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={color.stroke} floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background Track Arc */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Color Coded Filled Arc */}
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke={color.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#glow)"
              className="transition-all duration-300"
            />

            {/* Calibrated Tick Marks */}
            <text x="18" y="112" className="text-[10px] font-mono fill-slate-400">0</text>
            <text x="94" y="20" className="text-[10px] font-mono fill-slate-400">50</text>
            <text x="172" y="112" className="text-[10px] font-mono fill-slate-400">100</text>
          </svg>

          {/* Central Score readout */}
          <div className="absolute bottom-1 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-0.5">
              <span className={`text-h1 font-extrabold font-mono tracking-tight leading-none ${color.text}`}>
                {displayScore}
              </span>
              <span className="text-caption font-bold text-slate-400 font-mono">/100</span>
            </div>
            <span className="text-badge font-bold uppercase tracking-wider text-slate-600 font-mono mt-0.5">
              {level} RISK
            </span>
          </div>
        </div>

        {/* Breakdown bars if provided */}
        {breakdown && (
          <div className="w-full sm:w-64 space-y-1.5 text-caption font-mono bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="text-badge font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
              <span>Risk Factor Vectors</span>
              <span>Weight</span>
            </div>
            <FactorBar label="Op Weight" value={breakdown.operation} max={25} isSafer={isSaferMode} />
            <FactorBar label="Direct Impact" value={breakdown.direct_impact} max={20} isSafer={isSaferMode} />
            <FactorBar label="Dependent Rows" value={breakdown.dependent_impact} max={20} isSafer={isSaferMode} />
            <FactorBar label="FK Cascade" value={breakdown.cascade} max={25} isSafer={isSaferMode} />
            <FactorBar label="Recoverability" value={breakdown.recoverability} max={10} isSafer={isSaferMode} />
          </div>
        )}
      </div>

      {isSaferMode && originalScore !== undefined && (
        <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-caption font-mono text-emerald-900 bg-emerald-100/50 px-3 py-2 rounded-lg">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Score dropped from <strong>{originalScore} ({originalLevel})</strong> ➔ <strong>{score} ({level})</strong></span>
          </span>
          <span className="font-bold text-emerald-700">-{scoreDiff} RISK POINTS</span>
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
    <div className="space-y-0.5">
      <div className="flex justify-between text-badge text-slate-600">
        <span>{label}</span>
        <span className="font-semibold text-slate-800">{value} pts</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          style={{ width: `${pct}%` }}
          className={`h-full rounded-full transition-all duration-500 ${
            isSafer ? 'bg-emerald-500' : value > max * 0.6 ? 'bg-rose-500' : 'bg-amber-500'
          }`}
        />
      </div>
    </div>
  );
};
