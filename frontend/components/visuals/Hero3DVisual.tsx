"use client";

import React from "react";
import { motion } from "framer-motion";

interface Hero3DVisualProps {
  className?: string;
  isCompact?: boolean;
}

export function Hero3DVisual({ className = "", isCompact = false }: Hero3DVisualProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-purple-600/30 to-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

      {/* SVG 3D Composition */}
      <svg
        viewBox="0 0 620 380"
        className="w-full h-auto max-w-[560px] drop-shadow-[0_20px_50px_rgba(79,70,229,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial & Linear Gradients */}
          <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#EDE9FE" />
            <stop offset="100%" stopColor="#C4B5FD" />
          </linearGradient>

          <linearGradient id="robotScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B1120" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <linearGradient id="pedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C4B5FD" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          <linearGradient id="dbDiskTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          <linearGradient id="dbDiskSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Filters */}
          <filter id="heroGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Isometric Grid Floor Glow */}
        <ellipse cx="310" cy="310" rx="260" ry="60" fill="url(#pedestalGrad)" opacity="0.25" filter="url(#heroGlow)" />

        {/* --- LEFT: AI AGENT ROBOT ON PEDESTAL --- */}
        <g transform="translate(135, 110)">
          {/* Circular Pedestal Base */}
          <g transform="translate(0, 150)">
            {/* Pedestal Bottom Base */}
            <ellipse cx="0" cy="24" rx="65" ry="24" fill="#1E1B4B" opacity="0.8" />
            {/* Pedestal Body */}
            <path d="M -65,0 L -65,24 A 65,24 0 0,0 65,24 L 65,0 A 65,24 0 0,1 -65,0 Z" fill="url(#pedestalGrad)" />
            {/* Pedestal Top Disk */}
            <ellipse cx="0" cy="0" rx="65" ry="24" fill="#6366F1" stroke="#A5B4FC" strokeWidth="2" />
            <ellipse cx="0" cy="0" rx="55" ry="20" fill="#4338CA" />
            {/* Neon Ring */}
            <ellipse cx="0" cy="0" rx="58" ry="21" fill="none" stroke="#22D3EE" strokeWidth="1.5" filter="url(#softGlow)" opacity="0.9" />
            {/* Pedestal Badge Label */}
            <g transform="translate(0, 18)">
              <rect x="-38" y="-9" width="76" height="18" rx="9" fill="#0F172A" stroke="#818CF8" strokeWidth="1" />
              <text x="0" y="3.5" fill="#E0E7FF" fontSize="8.5" fontWeight="800" textAnchor="middle" letterSpacing="1" fontFamily="sans-serif">
                AI AGENT
              </text>
            </g>
          </g>

          {/* Floating Robot Character */}
          <motion.g
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Robot Floating Shadow */}
            <ellipse cx="0" cy="140" rx="28" ry="8" fill="#1E1B4B" opacity="0.5" />

            {/* Robot Body Torso */}
            <g transform="translate(0, 75)">
              <ellipse cx="0" cy="18" rx="26" ry="24" fill="url(#robotBodyGrad)" stroke="#C4B5FD" strokeWidth="1.5" />
              {/* Torso Core Light */}
              <circle cx="0" cy="16" r="6" fill="#818CF8" filter="url(#softGlow)" />
              <circle cx="0" cy="16" r="3" fill="#FFFFFF" />
            </g>

            {/* Robot Left Hand */}
            <motion.g
              animate={{ rotate: [-6, 6, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              transform="translate(-32, 70)"
            >
              <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#robotBodyGrad)" stroke="#C4B5FD" strokeWidth="1" />
              <circle cx="0" cy="10" r="5" fill="#A5B4FC" />
            </motion.g>

            {/* Robot Right Hand (Waving / Guiding) */}
            <motion.g
              animate={{ rotate: [12, -8, 12] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              transform="translate(32, 60)"
            >
              <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#robotBodyGrad)" stroke="#C4B5FD" strokeWidth="1" />
              <circle cx="0" cy="-8" r="5" fill="#A5B4FC" />
            </motion.g>

            {/* Robot Head */}
            <g transform="translate(0, 30)">
              {/* Ears / Antennas */}
              <rect x="-32" y="10" width="6" height="12" rx="3" fill="#818CF8" />
              <rect x="26" y="10" width="6" height="12" rx="3" fill="#818CF8" />
              {/* Top Little Antenna */}
              <line x1="0" y1="-12" x2="0" y2="-2" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="-14" r="4.5" fill="#22D3EE" filter="url(#softGlow)" />

              {/* Head Shell */}
              <rect x="-28" y="-2" width="56" height="42" rx="18" fill="url(#robotBodyGrad)" stroke="#DDD6FE" strokeWidth="2" />

              {/* Head Gloss / Highlight */}
              <path d="M -20,4 Q 0,-1 20,4" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

              {/* Visor Screen Face */}
              <rect x="-21" y="8" width="42" height="24" rx="10" fill="url(#robotScreenGrad)" stroke="#4F46E5" strokeWidth="1.5" />

              {/* Glowing Eyes */}
              <motion.g
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
              >
                {/* Left Eye */}
                <ellipse cx="-10" cy="20" rx="5" ry="6" fill="#38BDF8" filter="url(#softGlow)" />
                <ellipse cx="-10" cy="20" rx="3" ry="4" fill="#FFFFFF" />
                {/* Right Eye */}
                <ellipse cx="10" cy="20" rx="5" ry="6" fill="#38BDF8" filter="url(#softGlow)" />
                <ellipse cx="10" cy="20" rx="3" ry="4" fill="#FFFFFF" />
              </motion.g>

              {/* Cute Smile / Mouth */}
              <path d="M -4,26 Q 0,29 4,26" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          </motion.g>
        </g>

        {/* --- CENTER: GLOWING PURPLE SECURITY SHIELD --- */}
        <g transform="translate(305, 185)">
          {/* Shield Ambient Glow */}
          <path
            d="M 0,-95 C 65,-95 75,-40 75,30 C 75,85 10,120 0,130 C -10,120 -75,85 -75,30 C -75,-40 -65,-95 0,-95 Z"
            fill="url(#shieldGrad)"
            opacity="0.3"
            filter="url(#heroGlow)"
          />

          <motion.g
            animate={{ y: [-3, 3, -3] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Outer Shield Shell */}
            <path
              d="M 0,-90 C 60,-90 68,-40 68,25 C 68,75 10,105 0,115 C -10,105 -68,75 -68,25 C -68,-40 -60,-90 0,-90 Z"
              fill="url(#shieldGrad)"
              stroke="url(#shieldBorderGrad)"
              strokeWidth="4"
              filter="url(#softGlow)"
            />

            {/* Inner Glass Layer */}
            <path
              d="M 0,-78 C 50,-78 56,-35 56,20 C 56,62 8,88 0,96 C -8,88 -56,62 -56,20 C -56,-35 -50,-78 0,-78 Z"
              fill="rgba(255, 255, 255, 0.12)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
            />

            {/* Shield Diagonal Specular Highlight */}
            <path
              d="M -45,-40 Q 0,-80 40,-60 L 25,-40 Q 0,-50 -35,-20 Z"
              fill="#FFFFFF"
              opacity="0.25"
            />

            {/* Large White Luminous Checkmark */}
            <path
              d="M -22,12 L -6,28 L 24,-8"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#softGlow)"
            />
            <path
              d="M -22,12 L -6,28 L 24,-8"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </g>

        {/* --- RIGHT: 3D HOLOGRAPHIC DATABASE CYLINDERS --- */}
        <g transform="translate(480, 185)">
          {/* Cylinder Stack Base Glow */}
          <ellipse cx="0" cy="85" rx="60" ry="22" fill="#4F46E5" opacity="0.4" filter="url(#heroGlow)" />

          {/* Database Disk 3 (Bottom) */}
          <g transform="translate(0, 48)">
            <ellipse cx="0" cy="22" rx="55" ry="20" fill="#0F172A" />
            <path d="M -55,0 L -55,22 A 55,20 0 0,0 55,22 L 55,0 A 55,20 0 0,1 -55,0 Z" fill="url(#dbDiskSideGrad)" stroke="#6366F1" strokeWidth="1" />
            <ellipse cx="0" cy="0" rx="55" ry="20" fill="url(#dbDiskTopGrad)" stroke="#818CF8" strokeWidth="1.5" />
            {/* Cyan glowing horizontal ring */}
            <path d="M -55,10 A 55,20 0 0,0 55,10" stroke="#22D3EE" strokeWidth="2.5" fill="none" filter="url(#softGlow)" opacity="0.8" />
            {/* LED Status Dots */}
            <circle cx="-30" cy="10" r="2.5" fill="#22D3EE" filter="url(#softGlow)" />
            <circle cx="-20" cy="10" r="2.5" fill="#818CF8" />
          </g>

          {/* Database Disk 2 (Middle) */}
          <g transform="translate(0, 0)">
            <ellipse cx="0" cy="22" rx="55" ry="20" fill="#0F172A" />
            <path d="M -55,0 L -55,22 A 55,20 0 0,0 55,22 L 55,0 A 55,20 0 0,1 -55,0 Z" fill="url(#dbDiskSideGrad)" stroke="#6366F1" strokeWidth="1" />
            <ellipse cx="0" cy="0" rx="55" ry="20" fill="url(#dbDiskTopGrad)" stroke="#818CF8" strokeWidth="1.5" />
            {/* Violet glowing horizontal ring */}
            <path d="M -55,10 A 55,20 0 0,0 55,10" stroke="#C084FC" strokeWidth="2.5" fill="none" filter="url(#softGlow)" opacity="0.9" />
            {/* LED Status Dots */}
            <circle cx="-30" cy="10" r="2.5" fill="#C084FC" filter="url(#softGlow)" />
            <circle cx="-20" cy="10" r="2.5" fill="#22D3EE" />
          </g>

          {/* Database Disk 1 (Top) */}
          <g transform="translate(0, -48)">
            <ellipse cx="0" cy="22" rx="55" ry="20" fill="#0F172A" />
            <path d="M -55,0 L -55,22 A 55,20 0 0,0 55,22 L 55,0 A 55,20 0 0,1 -55,0 Z" fill="url(#dbDiskSideGrad)" stroke="#6366F1" strokeWidth="1" />
            <ellipse cx="0" cy="0" rx="55" ry="20" fill="url(#dbDiskTopGrad)" stroke="#A78BFA" strokeWidth="2" />
            {/* Top Disk Inner Ring */}
            <ellipse cx="0" cy="0" rx="42" ry="15" fill="#1E1B4B" stroke="#818CF8" strokeWidth="1" strokeDasharray="3 3" />
            {/* Blue glowing horizontal ring */}
            <path d="M -55,10 A 55,20 0 0,0 55,10" stroke="#38BDF8" strokeWidth="2.5" fill="none" filter="url(#softGlow)" opacity="0.9" />
            {/* LED Status Dots */}
            <circle cx="-30" cy="10" r="2.5" fill="#38BDF8" filter="url(#softGlow)" />
            <circle cx="-20" cy="10" r="2.5" fill="#4ADE80" />
          </g>
        </g>

        {/* Orbiting Sparkles & Energy Rings */}
        <g opacity="0.7">
          <circle cx="210" cy="100" r="3" fill="#A5B4FC" filter="url(#softGlow)" />
          <circle cx="410" cy="90" r="2.5" fill="#38BDF8" filter="url(#softGlow)" />
          <circle cx="560" cy="180" r="3.5" fill="#C084FC" filter="url(#softGlow)" />
          <circle cx="80" cy="220" r="2" fill="#818CF8" />
        </g>
      </svg>
    </div>
  );
}
