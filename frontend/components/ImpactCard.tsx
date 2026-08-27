"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn, formatNumber } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ImpactCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  subtext?: string;
  badgeText?: string;
  badgeVariant?: "danger" | "warning" | "safe" | "neutral";
  isHighlighted?: boolean;
}

export function ImpactCard({
  label,
  value,
  unit,
  icon: Icon,
  subtext,
  badgeText,
  badgeVariant = "neutral",
  isHighlighted = false,
}: ImpactCardProps) {
  const badgeStyles = {
    danger: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    safe: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    neutral: "bg-slate-800 text-slate-300 border-slate-700",
  }[badgeVariant];

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 shadow-lg",
        isHighlighted
          ? "bg-gradient-to-b from-rose-950/30 to-[#111827] border-rose-500/40 shadow-[0_4px_24px_rgba(239,68,68,0.15)]"
          : "bg-[#111827] border-slate-800 hover:border-slate-700"
      )}
    >
      {/* Top row: Icon + Label + Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 text-indigo-400">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            {label}
          </span>
        </div>
        {badgeText && (
          <span
            className={cn(
              "text-[10px] font-extrabold px-2 py-0.5 rounded-full border tracking-wider uppercase font-mono",
              badgeStyles
            )}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="my-1 flex items-baseline gap-2">
        <motion.span
          key={String(value)}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl lg:text-3xl font-black tracking-tight text-white font-mono"
        >
          {typeof value === "number" ? formatNumber(value) : value}
        </motion.span>
        {unit && (
          <span className="text-xs font-semibold text-slate-400 font-mono">{unit}</span>
        )}
      </div>

      {/* Subtitle / Context Note */}
      {subtext && (
        <p className="text-xs text-slate-400 leading-snug mt-1 truncate">
          {subtext}
        </p>
      )}
    </motion.div>
  );
}
