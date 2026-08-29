"use client";

import React from "react";
import { Database, ArrowRight, Layers, ShoppingCart, CreditCard, FileText, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface RealExampleSectionProps {
  onExploreDemo: () => void;
}

export function RealExampleSection({ onExploreDemo }: RealExampleSectionProps) {
  return (
    <section id="features" className="w-full py-20 bg-[#07090E] border-b border-white/[0.06] select-none">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Database Explorer CTA */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-bold text-purple-300 tracking-wider uppercase font-mono">
              REAL EXAMPLE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              A Small Query. <br />
              A Big Impact.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Deleting &quot;inactive users&quot; looks simple. But the ripple effect is anything but.
            </p>

            <button
              type="button"
              onClick={onExploreDemo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-purple-300 font-semibold text-xs border border-purple-500/40 transition-all hover:scale-105"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Explore Demo Database</span>
            </button>
          </div>

          {/* Center Column: Glowing Network Topology Visual */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0B0F19]/90 border border-white/[0.08] shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[300px]">
            {/* Ambient purple background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-indigo-600/15 to-transparent blur-2xl pointer-events-none" />

            <div className="relative w-full max-w-[360px] h-[220px]">
              {/* SVG Connector Lines */}
              <svg viewBox="0 0 360 220" className="w-full h-full absolute inset-0 overflow-visible">
                {/* Users (180, 110) to Subscriptions (60, 40) */}
                <line x1="180" y1="110" x2="70" y2="40" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                {/* Users to Orders (300, 40) */}
                <line x1="180" y1="110" x2="290" y2="40" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                {/* Users to Payments (300, 110) */}
                <line x1="180" y1="110" x2="290" y2="110" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                {/* Users to Sessions (70, 180) */}
                <line x1="180" y1="110" x2="70" y2="180" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                {/* Users to Invoices (290, 180) */}
                <line x1="180" y1="110" x2="290" y2="180" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              </svg>

              {/* Central Node: users */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] border border-purple-300/40 shadow-[0_0_20px_rgba(99,102,241,0.5)] text-center text-white z-10"
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold">
                  <Database size={11} />
                  <span>users</span>
                </div>
                <div className="text-sm font-extrabold font-mono">12,481</div>
              </motion.div>

              {/* Satellite Node 1: Subscriptions (Top Left) */}
              <div className="absolute top-1 left-2 p-2 rounded-lg bg-[#0F172A] border border-white/10 text-[10px] text-slate-300">
                <div className="flex items-center gap-1 font-semibold text-slate-400">
                  <Calendar size={10} className="text-indigo-400" />
                  <span>subscriptions</span>
                </div>
                <div className="font-mono font-bold text-white">347</div>
              </div>

              {/* Satellite Node 2: Orders (Top Right) */}
              <div className="absolute top-1 right-2 p-2 rounded-lg bg-[#0F172A] border border-white/10 text-[10px] text-slate-300">
                <div className="flex items-center gap-1 font-semibold text-slate-400">
                  <ShoppingCart size={10} className="text-indigo-400" />
                  <span>orders</span>
                </div>
                <div className="font-mono font-bold text-white">21,003</div>
              </div>

              {/* Satellite Node 3: Payments (Middle Right) */}
              <div className="absolute top-[40%] right-2 p-2 rounded-lg bg-[#0F172A] border border-white/10 text-[10px] text-slate-300">
                <div className="flex items-center gap-1 font-semibold text-slate-400">
                  <CreditCard size={10} className="text-indigo-400" />
                  <span>payments</span>
                </div>
                <div className="font-mono font-bold text-white">18,201</div>
              </div>

              {/* Satellite Node 4: Sessions (Bottom Left) */}
              <div className="absolute bottom-1 left-2 p-2 rounded-lg bg-[#0F172A] border border-white/10 text-[10px] text-slate-300">
                <div className="flex items-center gap-1 font-semibold text-slate-400">
                  <Clock size={10} className="text-indigo-400" />
                  <span>sessions</span>
                </div>
                <div className="font-mono font-bold text-white">9,482</div>
              </div>

              {/* Satellite Node 5: Invoices (Bottom Right) */}
              <div className="absolute bottom-1 right-2 p-2 rounded-lg bg-[#0F172A] border border-white/10 text-[10px] text-slate-300">
                <div className="flex items-center gap-1 font-semibold text-slate-400">
                  <FileText size={10} className="text-indigo-400" />
                  <span>invoices</span>
                </div>
                <div className="font-mono font-bold text-white">5,102</div>
              </div>
            </div>
          </div>

          {/* Right Column: Total Blast Radius Summary Card */}
          <div className="lg:col-span-3 p-6 rounded-2xl bg-[#0B0F19]/90 border border-white/[0.08] text-left space-y-4 shadow-xl">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                TOTAL BLAST RADIUS
              </span>
              <span className="text-3xl font-extrabold text-white font-mono block leading-tight">
                66,816
              </span>
              <span className="text-xs text-slate-400 block">Rows Across 6 Tables</span>
            </div>

            {/* Risk Indicator */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-400">Risk Level</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-mono">
                  HIGH
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                <div className="h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                <div className="h-1.5 rounded-full bg-slate-800" />
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              High probability of significant business impact.
            </p>

            <button
              type="button"
              onClick={onExploreDemo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all hover:border-purple-400"
            >
              <span>View Detailed Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
