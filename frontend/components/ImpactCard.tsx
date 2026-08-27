"use client";

import React, { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { formatNumber } from "@/lib/utils";
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
  prefix?: string;
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
  prefix = "",
}: ImpactCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const sX = useSpring(rotX, { stiffness: 300, damping: 30 });
  const sY = useSpring(rotY, { stiffness: 300, damping: 30 });

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    rotX.set((y - 0.5) * -8);
    rotY.set((x - 0.5) * 8);
    glowX.set(x * 100);
    glowY.set(y * 100);
  }, [rotX, rotY, glowX, glowY]);

  const onLeave = useCallback(() => {
    rotX.set(0); rotY.set(0);
  }, [rotX, rotY]);

  const palette = {
    danger:  { num: "#f87171", icon: "rgba(239,68,68,0.45)",  bg: "rgba(239,68,68,0.06)",  border: "rgba(239,68,68,0.18)", badge: "rgba(239,68,68,0.1)",  badgeText: "#fca5a5", badgeBorder: "rgba(239,68,68,0.22)" },
    warning: { num: "#fbbf24", icon: "rgba(245,158,11,0.45)", bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.18)", badge: "rgba(245,158,11,0.1)", badgeText: "#fde68a", badgeBorder: "rgba(245,158,11,0.22)" },
    safe:    { num: "#34d399", icon: "rgba(16,185,129,0.45)", bg: "rgba(16,185,129,0.05)", border: "rgba(16,185,129,0.18)", badge: "rgba(16,185,129,0.1)", badgeText: "#6ee7b7", badgeBorder: "rgba(16,185,129,0.22)" },
    neutral: { num: "#e2e8f0", icon: "rgba(148,163,184,0.4)", bg: "rgba(255,255,255,0.025)",border: "rgba(255,255,255,0.07)", badge: "rgba(255,255,255,0.06)", badgeText: "#94a3b8", badgeBorder: "rgba(255,255,255,0.1)" },
  }[badgeVariant];

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: sX, rotateY: sY, transformPerspective: 700 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      <div
        className="relative flex flex-col justify-between rounded-[18px] p-5 overflow-hidden transition-shadow duration-300"
        style={{
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          boxShadow: isHighlighted ? `0 0 0 1px ${palette.border}, 0 8px 32px rgba(0,0,0,0.35)` : "0 4px 16px rgba(0,0,0,0.25)",
        }}
      >
        {/* Subtle top shine */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${palette.icon}, transparent)` }} />

        {/* Top row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${palette.icon}20`, border: `1px solid ${palette.icon}` }}>
              <Icon className="w-3.5 h-3.5" style={{ color: palette.icon }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>
              {label}
            </span>
          </div>
          {badgeText && (
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                background: palette.badge,
                color: palette.badgeText,
                border: `1px solid ${palette.badgeBorder}`,
                fontFamily: "var(--font-mono)",
              }}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 my-1">
          {prefix && (
            <span className="text-sm font-semibold" style={{ color: palette.num, opacity: 0.7 }}>{prefix}</span>
          )}
          <motion.span
            key={String(value)}
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            style={{ color: palette.num, fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.04em" }}
          >
            {typeof value === "number" ? formatNumber(value) : value}
          </motion.span>
          {unit && (
            <span className="text-xs font-semibold ml-1" style={{ color: palette.num, opacity: 0.6, fontFamily: "var(--font-mono)" }}>
              {unit}
            </span>
          )}
        </div>

        {subtext && (
          <p className="text-[11px] mt-1.5 leading-snug" style={{ color: "rgba(255,255,255,0.28)" }}>
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}
