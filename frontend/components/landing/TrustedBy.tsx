"use client";

import React from "react";
import { Shield, Sparkles, Layers, Cpu, Database, Network } from "lucide-react";

export function TrustedBy() {
  const logos = [
    { name: "TrueForge", icon: Shield },
    { name: "DataNova", icon: Database },
    { name: "QuerySmith", icon: Sparkles },
    { name: "Stack Labs", icon: Layers },
    { name: "ByteFlow", icon: Cpu },
    { name: "CoreOps", icon: Network },
  ];

  return (
    <section className="w-full py-10 border-y border-white/[0.06] bg-[#07090E] select-none">
      <div className="max-w-[1400px] mx-auto px-6">
        <p className="text-center text-[11px] font-mono font-bold tracking-[0.2em] text-slate-500 uppercase mb-7">
          TRUSTED BY ENGINEERING TEAMS AT
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
          {logos.map((logo) => {
            const Icon = logo.icon;
            return (
              <div
                key={logo.name}
                className="flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-purple-500/30 transition-all hover:scale-105"
              >
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-slate-300 tracking-tight">
                  {logo.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
