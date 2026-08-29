"use client";

import React from "react";
import { Quote, Zap, CreditCard, ShieldCheck } from "lucide-react";

export function TestimonialSection() {
  return (
    <section className="w-full py-16 bg-[#07090E] border-b border-white/[0.06] select-none">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#1E1B4B]/80 via-[#172554]/70 to-[#0F172A]/80 border border-purple-500/20 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          {/* Quote Left */}
          <div className="lg:col-span-8 flex items-start gap-4">
            <Quote className="w-10 h-10 text-purple-400/60 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-base sm:text-lg text-slate-200 font-medium italic leading-relaxed">
                &ldquo;BlastShield gives our team the confidence to let AI agents operate without risking our data. It&apos;s the missing safety layer we always needed.&rdquo;
              </p>
              <p className="text-xs font-bold text-indigo-300">
                — Arjun Patel, <span className="text-slate-400 font-normal">Head of Engineering, Stack Labs</span>
              </p>
            </div>
          </div>

          {/* 3 Badges Right */}
          <div className="lg:col-span-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center space-y-1">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold text-slate-300">5 Min Setup</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center space-y-1">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold text-slate-300">No Credit Card</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-300">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
