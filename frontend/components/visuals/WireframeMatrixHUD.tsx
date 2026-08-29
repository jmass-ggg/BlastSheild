"use client";

import React from "react";
import { motion } from "framer-motion";

export function WireframeMatrixHUD() {
  return (
    <div className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden bg-gradient-to-br from-[#0B0F19] via-[#090D1A] to-[#04060A] flex items-center justify-center p-4 select-none">
      {/* Background Holographic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf810_1px,transparent_1px),linear-gradient(to_bottom,#818cf810_1px,transparent_1px)] bg-[size:16px_16px]" />

      {/* Radial Center Glow */}
      <div className="absolute w-44 h-44 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* SVG 3D Isometric HUD Simulation Visual */}
      <svg
        viewBox="0 0 400 260"
        className="w-full h-full max-w-[380px] drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hudGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>

          <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
          </linearGradient>

          <filter id="hudGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Isometric Base Grid Platform */}
        <g opacity="0.4" transform="translate(200, 160)">
          {/* Concentric Isometric Ellipses */}
          <ellipse cx="0" cy="0" rx="140" ry="50" stroke="#818CF8" strokeWidth="1" strokeDasharray="3 3" />
          <ellipse cx="0" cy="0" rx="105" ry="38" stroke="#38BDF8" strokeWidth="1.2" />
          <ellipse cx="0" cy="0" rx="70" ry="25" stroke="#C084FC" strokeWidth="1" />
          <ellipse cx="0" cy="0" rx="35" ry="12" stroke="#818CF8" strokeWidth="1.5" />

          {/* Grid cross lines */}
          <line x1="-140" y1="0" x2="140" y2="0" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="2 4" />
          <line x1="0" y1="-50" x2="0" y2="50" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="2 4" />
          <line x1="-100" y1="-35" x2="100" y2="35" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="2 4" />
          <line x1="-100" y1="35" x2="100" y2="-35" stroke="#818CF8" strokeWidth="0.8" strokeDasharray="2 4" />
        </g>

        {/* Central Rotating Radar Beam */}
        <g transform="translate(200, 160)">
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <path
              d="M 0,0 L 105,-38 A 105,38 0 0,0 0,-38 Z"
              fill="url(#hudGrad1)"
              opacity="0.25"
            />
            <line x1="0" y1="0" x2="105" y2="-38" stroke="#38BDF8" strokeWidth="2" filter="url(#hudGlow)" />
          </motion.g>
        </g>

        {/* Floating Holographic 3D Virtual Wireframe Cards */}
        {/* Top Left Floating Wireframe Window */}
        <motion.g
          transform="translate(85, 60)"
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="0" y="0" width="110" height="75" rx="8" fill="#0B1120" stroke="#818CF8" strokeWidth="1.5" opacity="0.85" />
          <line x1="0" y1="18" x2="110" y2="18" stroke="#818CF8" strokeWidth="0.8" opacity="0.6" />
          {/* Window control dots */}
          <circle cx="10" cy="9" r="2.5" fill="#F43F5E" />
          <circle cx="18" cy="9" r="2.5" fill="#F59E0B" />
          <circle cx="26" cy="9" r="2.5" fill="#10B981" />
          {/* Simulated chart waveform inside */}
          <path
            d="M 12,52 L 28,34 L 44,46 L 62,28 L 80,40 L 98,30"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#hudGlow)"
          />
          {/* Data bars */}
          <rect x="15" y="58" width="8" height="6" fill="#818CF8" rx="1" />
          <rect x="27" y="55" width="8" height="9" fill="#818CF8" rx="1" />
          <rect x="39" y="52" width="8" height="12" fill="#818CF8" rx="1" />
          <rect x="51" y="56" width="8" height="8" fill="#818CF8" rx="1" />
          <rect x="63" y="50" width="8" height="14" fill="#38BDF8" rx="1" />
        </motion.g>

        {/* Top Right Floating Wireframe Window */}
        <motion.g
          transform="translate(225, 45)"
          animate={{ y: [3, -3, 3] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="0" y="0" width="105" height="80" rx="8" fill="#0B1120" stroke="#C084FC" strokeWidth="1.5" opacity="0.85" />
          <line x1="0" y1="18" x2="105" y2="18" stroke="#C084FC" strokeWidth="0.8" opacity="0.6" />
          {/* Wireframe tree nodes */}
          <circle cx="52" cy="32" r="5" fill="#818CF8" filter="url(#hudGlow)" />
          <line x1="52" y1="37" x2="28" y2="54" stroke="#818CF8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="52" y1="37" x2="76" y2="54" stroke="#818CF8" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="28" cy="56" r="4" fill="#F43F5E" />
          <circle cx="76" cy="56" r="4" fill="#38BDF8" />
          <circle cx="52" cy="68" r="3.5" fill="#10B981" />
          <line x1="52" y1="37" x2="52" y2="64" stroke="#818CF8" strokeWidth="1" strokeDasharray="2 2" />
        </motion.g>

        {/* Center Vertical Telemetry Beam */}
        <line x1="200" y1="160" x2="200" y2="70" stroke="url(#gridGrad)" strokeWidth="2" strokeDasharray="4 3" filter="url(#hudGlow)" />
        <circle cx="200" cy="70" r="5" fill="#22D3EE" filter="url(#hudGlow)" />
        <circle cx="200" cy="70" r="2" fill="#FFFFFF" />

        {/* Animated Scanning Beam Horizontal */}
        <motion.line
          x1="60"
          x2="340"
          stroke="#22D3EE"
          strokeWidth="1.5"
          opacity="0.8"
          filter="url(#hudGlow)"
          animate={{ y1: [80, 200, 80], y2: [80, 200, 80] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
