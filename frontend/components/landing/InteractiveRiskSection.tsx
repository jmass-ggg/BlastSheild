"use client";

import React from "react";
import { Table, Layers, Heart, Gauge, Clock, AlertOctagon } from "lucide-react";
import { RiskChart } from "@/components/visuals/RiskChart";

export function InteractiveRiskSection() {
  const metricCards = [
    { label: "Tables Inspected", val: "6 / 18", icon: Table, color: "#818CF8" },
    { label: "Rows Affected", val: "66,816", icon: Layers, color: "#818CF8" },
    { label: "Data Criticality", val: "High", icon: Heart, color: "#EF4444", valColor: "text-rose-400" },
    { label: "Confidence Score", val: "98%", icon: Gauge, color: "#818CF8", isProgress: true },
    { label: "Est. Downtime", val: "12-18 min", icon: Clock, color: "#F59E0B" },
    { label: "Business Impact", val: "Severe", icon: AlertOctagon, color: "#EF4444", valColor: "text-rose-400" },
  ];

  return (
    <section className="w-full py-20 bg-[#090D16] border-b border-white/[0.06] select-none">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-bold text-purple-300 tracking-wider uppercase font-mono">
              INTERACTIVE RISK ANALYSIS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Understand Every Consequence
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We don&apos;t just show numbers. We explain what will be affected, why it matters, and how risky it really is.
            </p>
          </div>

          {/* Right Column: 6 Stat Cards & 2 Bottom Cards */}
          <div className="lg:col-span-8 space-y-4">
            {/* 6 Top Metric Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {metricCards.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-left flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                      <span className="truncate">{m.label}</span>
                    </div>
                    <div className={`text-sm font-extrabold font-mono ${m.valColor || "text-white"}`}>
                      {m.val}
                    </div>
                    {m.isProgress && (
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full w-[98%]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom 2 Analysis Cards: Why High Risk & Risk Over Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Left Breakdown: Why This Is High Risk */}
              <div className="p-5 rounded-2xl bg-[#0B0F19] border border-white/[0.08] space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
                  WHY THIS IS HIGH RISK
                </span>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Deleting users cascades to 6 dependent tables</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>66k+ rows will be permanently removed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Financial records and subscriptions are affected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>Recovery requires complex manual reconstruction</span>
                  </li>
                </ul>
              </div>

              {/* Right Breakdown: Risk Over Time Chart */}
              <div className="p-5 rounded-2xl bg-[#0B0F19] border border-white/[0.08] flex flex-col justify-between">
                <RiskChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
