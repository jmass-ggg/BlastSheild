"use client";

import React from "react";
import { motion } from "framer-motion";

export function RiskChart() {
  const points = [
    { x: 30, y: 70, time: "Now", val: "High (91)" },
    { x: 95, y: 65, time: "+15m", val: "Critical" },
    { x: 155, y: 40, time: "+1h", val: "Spike" },
    { x: 220, y: 30, time: "+6h", val: "Max" },
    { x: 285, y: 18, time: "+24h", val: "Irreversible" },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
          RISK OVER TIME
        </span>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
          </span>
        </div>
      </div>

      <div className="relative w-full h-[110px]">
        <svg viewBox="0 0 320 95" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="riskAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>

            <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Level Guides */}
          <line x1="10" y1="20" x2="310" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="10" y1="50" x2="310" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="10" y1="80" x2="310" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

          {/* Area under curve */}
          <path
            d="M 30,70 Q 95,65 155,40 T 285,18 L 285,85 L 30,85 Z"
            fill="url(#riskAreaGrad)"
          />

          {/* Main Risk Curve */}
          <motion.path
            d="M 30,70 Q 95,65 155,40 T 285,18"
            stroke="#EF4444"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Dots on Curve */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer group">
              <circle cx={pt.x} cy={pt.y} r="4.5" fill="#EF4444" filter="url(#pointGlow)" />
              <circle cx={pt.x} cy={pt.y} r="2" fill="#FFFFFF" />
            </g>
          ))}
        </svg>

        {/* Time X-Axis Labels */}
        <div className="flex justify-between px-3 text-[10px] text-slate-400 font-mono mt-1">
          <span>Now</span>
          <span>+15m</span>
          <span>+1h</span>
          <span>+6h</span>
          <span>+24h</span>
        </div>
      </div>
    </div>
  );
}
