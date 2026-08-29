"use client";

import React from "react";
import { Eye, MousePointerClick, ShieldCheck, FileCheck, ArrowRight } from "lucide-react";

export function HumanApprovalSection() {
  const steps = [
    {
      num: 1,
      title: "Review Analysis",
      desc: "Study the impact, risk and recommendations.",
      icon: Eye,
    },
    {
      num: 2,
      title: "Choose Action",
      desc: "Execute original, use safer version, modify or cancel.",
      icon: MousePointerClick,
    },
    {
      num: 3,
      title: "Approve & Execute",
      desc: "BlastShield revalidates before safe execution.",
      icon: ShieldCheck,
    },
    {
      num: 4,
      title: "Audit Logged",
      desc: "Everything is logged for transparency.",
      icon: FileCheck,
    },
  ];

  return (
    <section className="w-full py-20 bg-[#090D16] border-b border-white/[0.06] select-none">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Subtitle */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-[11px] font-bold text-purple-300 tracking-wider uppercase font-mono">
              HUMAN APPROVAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              You&apos;re Always in Control
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              BlastShield never executes destructive actions without your explicit approval.
            </p>
          </div>

          {/* Right Column: 4-Step Horizontal Pipeline */}
          <div className="lg:col-span-8 p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.08]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.num}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.04] hover:border-purple-500/30 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Icon size={16} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{s.num}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">{s.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
