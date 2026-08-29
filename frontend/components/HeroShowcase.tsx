"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Database,
  Layers,
  Lock,
  Eye,
  CheckCircle2,
  Tv,
  Layout,
} from "lucide-react";
import type { AnalysisRecord } from "@/lib/types";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { CleanProductMockup } from "./visuals/CleanProductMockup";

interface HeroShowcaseProps {
  analysis: AnalysisRecord;
  isSafeMode: boolean;
}

export function HeroShowcase({ analysis, isSafeMode }: HeroShowcaseProps) {
  const [viewMode, setViewMode] = useState<"mockup" | "video">("mockup");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const isReadOnly = analysis.operationType === "SELECT";
  const contained = isSafeMode || isReadOnly;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      void videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="hero-showcase-card">
      {/* Top Switcher */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Interactive Inspection View
        </span>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setViewMode("mockup")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              viewMode === "mockup"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layout size={12} /> Product Canvas
          </button>
          <button
            type="button"
            onClick={() => setViewMode("video")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              viewMode === "video"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Tv size={12} /> Execution Motion
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {viewMode === "mockup" ? (
        <CleanProductMockup analysis={analysis} isSafeMode={contained} />
      ) : (
        /* Video Container with Clean Frame */
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 border border-white/[0.08] shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
            poster="/media/blastshield-containment-poster.jpg"
          >
            <source src="/media/blastshield-containment.mp4" type="video/mp4" />
          </video>

          {/* Dark Vignette Wash */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

          {/* Video Play/Pause Control Overlay */}
          <button
            type="button"
            onClick={togglePlay}
            className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs transition-colors shadow-lg"
            aria-label={isPlaying ? "Pause Video" : "Play Video"}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          {/* Live Telemetry Overlay Badges */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-white text-xs shadow-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  contained ? "bg-emerald-400" : "bg-rose-400"
                } animate-ping`}
              />
              <span className="font-semibold">
                {contained ? "Sandbox Isolated" : "Cascade Intercepted"}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-white/10 text-slate-300 text-xs shadow-lg font-mono">
              <CheckCircle2 size={13} className="text-cyan-400" />
              <span>100% Replica Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
