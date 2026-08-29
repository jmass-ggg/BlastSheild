"use client";

import React from "react";
import { Check, AlertTriangle, CheckCircle2, ArrowRight, Shield } from "lucide-react";

interface OriginalVsSaferSqlSectionProps {
  onUseAlternative: () => void;
}

export function OriginalVsSaferSqlSection({ onUseAlternative }: OriginalVsSaferSqlSectionProps) {
  return (
    <section className="w-full py-20 bg-[#07090E] border-b border-white/[0.06] select-none">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading, Subtitle & Value Checklist */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-bold text-purple-300 tracking-wider uppercase font-mono">
              ORIGINAL VS SAFER SQL
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              From Risky to Safe, With One Click
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              BlastShield not only detects risks, it helps you choose a better path forward.
            </p>

            <div className="space-y-2.5 pt-2">
              {[
                "Preserves audit history",
                "Maintains referential integrity",
                "Allows staged execution",
                "Zero data loss",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Check size={11} />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column: Side-by-Side Comparison Code Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* Dangerous Original (Red) */}
            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-rose-500/30 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400">Original (Dangerous)</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold font-mono">
                  HIGH RISK
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/[0.04]">
                <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
                  <span className="text-rose-400 font-bold">DELETE FROM</span> users{"\n"}
                  <span className="text-rose-400 font-bold">WHERE</span> last_login &lt;{"\n"}
                  NOW() - INTERVAL <span className="text-amber-300">&apos;2 years&apos;</span>;
                </pre>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-mono pt-1">
                <AlertTriangle size={12} />
                <span>Impact: 66,816 rows across 6 tables</span>
              </div>
            </div>

            {/* Safer Alternative (Green) */}
            <div className="p-4 rounded-2xl bg-[#0B0F19] border border-emerald-500/30 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400">Safer Alternative (Recommended)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold font-mono">
                  LOW RISK
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/[0.04]">
                <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
                  <span className="text-emerald-400 font-bold">UPDATE</span> users{"\n"}
                  <span className="text-emerald-400 font-bold">SET</span> status = <span className="text-amber-300">&apos;inactive&apos;</span>{"\n"}
                  <span className="text-emerald-400 font-bold">WHERE</span> last_login &lt; NOW() - INTERVAL <span className="text-amber-300">&apos;2 years&apos;</span>{"\n"}
                  {"  "}<span className="text-emerald-400 font-bold">AND</span> status = <span className="text-amber-300">&apos;active&apos;</span>;
                </pre>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono pt-1">
                <CheckCircle2 size={12} />
                <span>Impact: 0 rows deleted • Preserves history</span>
              </div>
            </div>
          </div>

          {/* Right Column: Purple Action Card */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-b from-[#2E1065] to-[#1E1B4B] border border-purple-500/30 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">Choose the safer path.</h4>
              <p className="text-[10px] text-purple-200/80">Apply safe staged mutations automatically.</p>
            </div>
            <button
              type="button"
              onClick={onUseAlternative}
              className="w-full py-2.5 px-3 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all hover:scale-105"
            >
              <span>Use This Alternative</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
