"use client";

import React from "react";
import { Bot, ShieldAlert, Database, Network, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      num: 1,
      title: "AI Agent Generates SQL",
      desc: "Agent creates a query based on user request.",
      icon: Bot,
      color: "#818CF8",
    },
    {
      num: 2,
      title: "Intercepted by BlastShield",
      desc: "We detect potentially dangerous actions.",
      icon: ShieldAlert,
      color: "#A78BFA",
    },
    {
      num: 3,
      title: "Safe Sandbox Simulation",
      desc: "Query is executed on a cloned snapshot.",
      icon: Database,
      color: "#38BDF8",
    },
    {
      num: 4,
      title: "Analyze Blast Radius",
      desc: "We inspect dependencies and calculate impact.",
      icon: Network,
      color: "#C084FC",
    },
    {
      num: 5,
      title: "Human Approval",
      desc: "You review the report and decide what happens next.",
      icon: UserCheck,
      color: "#F472B6",
    },
    {
      num: 6,
      title: "Safe Execution",
      desc: "Only approved actions are executed on production.",
      icon: ShieldCheck,
      color: "#34D399",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 bg-[#090D16] border-b border-white/[0.06] select-none">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Summary Header */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-bold text-purple-300 tracking-wider uppercase font-mono">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Intelligence Between Intent and Impact
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              BlastShield adds a critical layer of intelligence between AI agents and your production database.
            </p>
          </div>

          {/* Right Flow Step Cards Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative p-4 rounded-2xl bg-[#0B0F19]/90 border border-white/[0.08] hover:border-purple-500/40 hover:bg-[#0F1629] transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-6 h-6 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
                      {step.num}
                    </span>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: step.color }} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
