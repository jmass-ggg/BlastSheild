"use client";

import React from "react";
import { motion } from "framer-motion";

interface DatabaseContainmentArtProps {
  isSafeMode: boolean;
  operation: string;
  riskScore: number;
}

export function DatabaseContainmentArt({
  isSafeMode,
  operation,
  riskScore,
}: DatabaseContainmentArtProps) {
  const glowColor = isSafeMode ? "#10B981" : "#F43F5E";
  const accentColor = isSafeMode ? "#34D399" : "#FDA4AF";

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-[#0B0F19] to-slate-950 border border-white/[0.08] shadow-2xl flex items-center justify-center p-6 select-none group">
      {/* Ambient Radial Glows */}
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          background: isSafeMode
            ? "radial-gradient(circle, #10B981 0%, #6366F1 50%, transparent 70%)"
            : "radial-gradient(circle, #F43F5E 0%, #F59E0B 50%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.38, 0.25],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* SVG 3D Isometric Safety Gate Art */}
      <svg
        viewBox="0 0 500 320"
        className="w-full h-full max-w-[480px] drop-shadow-2xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isSafeMode ? "#10B981" : "#F43F5E"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isSafeMode ? "#06B6D4" : "#F59E0B"} stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
          </linearGradient>

          <linearGradient id="dbCylinderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Isometric Grid Floor */}
        <g opacity="0.25">
          <path
            d="M 250,280 L 420,180 L 250,80 L 80,180 Z"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 250,250 L 370,180 L 250,110 L 130,180 Z"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
          />
        </g>

        {/* Database Cylinders Layer 1 (Base) */}
        <g transform="translate(250, 180)">
          {/* Lower Disk */}
          <ellipse cx="0" cy="40" rx="90" ry="32" fill="url(#dbCylinderGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <path d="M -90,40 L -90,15 A 90,32 0 0,0 90,15 L 90,40 A 90,32 0 0,1 -90,40 Z" fill="#0F172A" stroke="rgba(255,255,255,0.08)" />

          {/* Middle Disk */}
          <ellipse cx="0" cy="15" rx="90" ry="32" fill="url(#dbCylinderGrad)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <path d="M -90,15 L -90,-10 A 90,32 0 0,0 90,-10 L 90,15 A 90,32 0 0,1 -90,15 Z" fill="#1E293B" stroke="rgba(255,255,255,0.08)" />

          {/* Top Disk */}
          <ellipse cx="0" cy="-10" rx="90" ry="32" fill="#1E293B" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <ellipse cx="0" cy="-10" rx="80" ry="28" fill="rgba(15, 23, 42, 0.8)" stroke={isSafeMode ? "rgba(16,185,129,0.4)" : "rgba(244,63,94,0.4)"} strokeWidth="1" />
        </g>

        {/* Central Luminous Energy Core */}
        <g transform="translate(250, 160)">
          <motion.circle
            cx="0"
            cy="0"
            r="28"
            fill={glowColor}
            opacity="0.2"
            filter="url(#glow)"
            animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="0" cy="0" r="16" fill={glowColor} opacity="0.85" filter="url(#glow)" />
          <circle cx="0" cy="0" r="8" fill="#ffffff" />
        </g>

        {/* Protective Floating Glass Shield Perimeter */}
        <g transform="translate(250, 140)">
          {/* Left Arc Shield */}
          <motion.path
            d="M -110,-40 C -140,0 -140,60 -90,90"
            stroke="url(#shieldGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Right Arc Shield */}
          <motion.path
            d="M 110,-40 C 140,0 140,60 90,90"
            stroke="url(#shieldGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
            animate={{ y: [3, -3, 3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Upper Floating Crest */}
          <motion.path
            d="M -60,-80 L 0,-110 L 60,-80"
            stroke="url(#shieldGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>

        {/* Orbiting Satellite Data Nodes */}
        <g transform="translate(250, 160)">
          {/* Node 1 */}
          <motion.g
            animate={{
              rotate: [0, 360],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="120" cy="0" r="6" fill="#818CF8" filter="url(#glow)" />
            <circle cx="120" cy="0" r="3" fill="#ffffff" />
          </motion.g>

          {/* Node 2 */}
          <motion.g
            animate={{
              rotate: [360, 0],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="-135" cy="0" r="5" fill="#38BDF8" filter="url(#glow)" />
            <circle cx="-135" cy="0" r="2.5" fill="#ffffff" />
          </motion.g>

          {/* Node 3 */}
          <motion.g
            animate={{
              rotate: [180, 540],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="0" cy="75" r="5" fill={glowColor} filter="url(#glow)" />
            <circle cx="0" cy="75" r="2" fill="#ffffff" />
          </motion.g>
        </g>
      </svg>

      {/* Floating Glass Telemetry Chips */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-white text-xs shadow-xl">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span className="font-semibold">{operation} Gate Active</span>
      </div>

      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/10 text-xs shadow-xl">
        <span className="text-slate-400 font-mono">Status:</span>
        <strong
          className={`font-semibold ${
            isSafeMode ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {isSafeMode ? "100% Contained" : `Risk Score ${riskScore}/100`}
        </strong>
      </div>
    </div>
  );
}
