"use client";

import React from "react";
import { ArrowRight, MessageSquare, Shield } from "lucide-react";
import { Hero3DVisual } from "@/components/visuals/Hero3DVisual";

interface CtaBannerProps {
  onTryDemo: () => void;
}

export function CtaBanner({ onTryDemo }: CtaBannerProps) {
  return (
    <section className="w-full py-20 bg-[#090D16] border-b border-white/[0.06] select-none relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#090D16] border border-purple-500/30 p-10 lg:p-14 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/15 blur-[100px] pointer-events-none" />

          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6 z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Protect Your Data. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                Empower Your Agents.
              </span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-lg leading-relaxed">
              Give your AI agents the freedom to act — with the guardrails to keep your data, users, and business safe.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onTryDemo}
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white font-bold text-sm shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95"
              >
                <span>Try BlastShield Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-semibold text-sm border border-white/10 transition-all hover:border-purple-400"
              >
                <span>Talk to an Expert</span>
                <MessageSquare className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Graphic Art */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <Hero3DVisual className="w-full scale-90" />
          </div>
        </div>
      </div>
    </section>
  );
}
