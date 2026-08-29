"use client";

import React from "react";
import { motion } from "framer-motion";
import { Play, ArrowRight, Shield, AlertTriangle, CheckCircle2, Sparkles, Terminal } from "lucide-react";
import { Hero3DVisual } from "@/components/visuals/Hero3DVisual";

interface HeroSectionProps {
  onSeeAction: () => void;
}

export function HeroSection({ onSeeAction }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden pt-12 pb-20 bg-gradient-to-b from-[#090D16] via-[#0B0F19] to-[#07090E]">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-purple-900/20 via-indigo-600/15 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & Action CTAs */}
        <div className="lg:col-span-6 space-y-7 text-left z-10">
          {/* Top Pill Tag */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-bold text-purple-300 tracking-wider uppercase shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PRE-EXECUTION IMPACT ANALYSIS FOR AI AGENTS</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.12]"
          >
            Stop Destructive SQL{" "}
            <span className="text-[#8B5CF6] underline decoration-purple-500/40 decoration-wavy decoration-1">
              Before
            </span>{" "}
            It Hits Production.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed"
          >
            BlastShield simulates, analyses and explains the impact of dangerous database actions before they reach production.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            {/* Primary CTA button: See BlastShield in Action */}
            <button
              type="button"
              onClick={onSeeAction}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white font-bold text-sm shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>See BlastShield in Action</span>
              <Play className="w-4 h-4 fill-white" />
            </button>

            {/* Secondary CTA: How It Works */}
            <button
              type="button"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-sm border border-purple-500/30 transition-all hover:border-purple-400 cursor-pointer"
            >
              <span>How It Works</span>
              <ArrowRight className="w-4 h-4 text-purple-400" />
            </button>
          </motion.div>

          {/* Micro Sub-Pill Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-2"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Built for TrueForge Agents
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> PostgreSQL
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> MCP Enabled
            </span>
          </motion.div>
        </div>

        {/* Right Column: 3D Art Composition with Floating Telemetry & Code Cards */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          {/* Main 3D Composition Graphic */}
          <Hero3DVisual className="w-full" />

          {/* Floating Code Snippet Card (Top Left of Graphic) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-2 left-0 sm:-left-4 p-3 rounded-xl bg-[#0F172A]/90 backdrop-blur-md border border-rose-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-[240px] text-left z-20"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold text-rose-400 flex items-center gap-1">
                <AlertTriangle size={11} /> DANGEROUS SQL
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <pre className="text-[11px] font-mono text-slate-200 leading-tight">
              <span className="text-rose-400 font-bold">DELETE FROM</span> users{"\n"}
              <span className="text-rose-400 font-bold">WHERE</span> last_login &lt;{"\n"}
              NOW() - INTERVAL <span className="text-amber-300">&apos;2 years&apos;</span>;
            </pre>
          </motion.div>

          {/* Floating Impact Stats Card (Top Right of Graphic) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="absolute top-0 right-0 sm:-right-4 p-4 rounded-2xl bg-[#0B0F19]/90 backdrop-blur-md border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] min-w-[210px] text-left space-y-3 z-20"
          >
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Total Impact</span>
              <span className="text-2xl font-extrabold text-white font-mono leading-tight">66,816</span>
              <span className="text-[10px] text-slate-400 block">Rows Across 6 Tables</span>
            </div>

            {/* Risk Level Gauge */}
            <div>
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span className="text-slate-400">Risk Level</span>
                <span className="text-rose-400">HIGH</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                <div className="h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="h-1.5 rounded-full bg-slate-700" />
              </div>
            </div>

            {/* Confidence Score */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Confidence Score</span>
                <span className="font-bold text-indigo-300">98%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full w-[98%]" />
              </div>
            </div>

            {/* Downtime */}
            <div className="flex justify-between text-[11px] pt-1 border-t border-white/[0.08]">
              <span className="text-slate-400">Estimated Downtime</span>
              <span className="font-bold text-white font-mono">12-18 min</span>
            </div>
          </motion.div>

          {/* Stepper Flow Pills (Bottom of Graphic) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-2 rounded-2xl bg-[#090D16]/95 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-between text-[10px] text-slate-300 font-medium z-20"
          >
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04]">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">1</span>
              AI Proposal
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04]">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">2</span>
              BlastShield Analysis
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04]">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[9px]">3</span>
              Human Approval
            </span>
            <span className="text-slate-600">→</span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">4</span>
              Execute Safely
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
