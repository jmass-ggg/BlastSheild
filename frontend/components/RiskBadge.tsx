"use client";

import React from "react";
import { RiskLevel } from "@/lib/types";
import { getRiskColorClass } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  score?: number;
  showDot?: boolean;
}

export function RiskBadge({ level, size = "md", score, showDot = true }: RiskBadgeProps) {
  const styles = getRiskColorClass(level);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold tracking-wider",
    md: "px-2.5 py-1 text-xs font-bold tracking-wide",
    lg: "px-3.5 py-1.5 text-sm font-black tracking-wider uppercase",
  }[size];

  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md transition-all duration-300 ${styles.badge} ${sizeClasses}`}
    >
      {showDot && (
        <span className="relative flex items-center justify-center">
          <span
            className={`absolute inline-flex rounded-full opacity-75 animate-ping ${dotSize}`}
            style={{ backgroundColor: styles.accent }}
          />
          <span
            className={`relative inline-flex rounded-full ${dotSize}`}
            style={{ backgroundColor: styles.accent }}
          />
        </span>
      )}
      <span>
        {level}
        {score !== undefined ? ` • ${score}/100` : ""}
      </span>
    </span>
  );
}
