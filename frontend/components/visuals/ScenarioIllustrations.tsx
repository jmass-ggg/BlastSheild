"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  KeyRound,
  CreditCard,
  FileCheck2,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface ScenarioCardArtProps {
  scenarioId: string;
  isSelected?: boolean;
}

export function ScenarioIllustration({ scenarioId, isSelected }: ScenarioCardArtProps) {
  if (scenarioId === "inactive_users_delete") {
    return (
      <div className="relative h-20 w-full rounded-lg overflow-hidden bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-white/[0.06] flex items-center justify-center p-2 mb-2">
        <svg viewBox="0 0 160 70" className="w-full h-full">
          {/* User network nodes */}
          <circle cx="30" cy="35" r="10" fill="#6366F1" opacity="0.3" />
          <circle cx="30" cy="35" r="5" fill="#818CF8" />
          <line x1="35" y1="35" x2="75" y2="20" stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="35" y1="35" x2="75" y2="50" stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="80" cy="20" r="8" fill="#F43F5E" opacity="0.4" />
          <circle cx="80" cy="20" r="4" fill="#FDA4AF" />
          <circle cx="80" cy="50" r="8" fill="#F43F5E" opacity="0.4" />
          <circle cx="80" cy="50" r="4" fill="#FDA4AF" />
          {/* Shield Gate */}
          <path d="M 125,25 L 140,30 L 140,45 L 125,55 L 110,45 L 110,30 Z" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="1.5" />
        </svg>
      </div>
    );
  }

  if (scenarioId === "truncate_sessions") {
    return (
      <div className="relative h-20 w-full rounded-lg overflow-hidden bg-gradient-to-br from-amber-950/60 to-slate-900 border border-white/[0.06] flex items-center justify-center p-2 mb-2">
        <svg viewBox="0 0 160 70" className="w-full h-full">
          {/* Session Token Bars */}
          <rect x="25" y="15" width="45" height="10" rx="3" fill="rgba(245,158,11,0.25)" stroke="#F59E0B" strokeWidth="1" />
          <rect x="25" y="30" width="45" height="10" rx="3" fill="rgba(245,158,11,0.25)" stroke="#F59E0B" strokeWidth="1" />
          <rect x="25" y="45" width="45" height="10" rx="3" fill="rgba(245,158,11,0.25)" stroke="#F59E0B" strokeWidth="1" />
          {/* Cascade Arrow to Gate */}
          <path d="M 80,35 L 105,35" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="125" cy="35" r="14" fill="rgba(244,63,94,0.2)" stroke="#F43F5E" strokeWidth="1.5" />
          <path d="M 120,30 L 130,40 M 130,30 L 120,40" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (scenarioId === "update_missing_where") {
    return (
      <div className="relative h-20 w-full rounded-lg overflow-hidden bg-gradient-to-br from-rose-950/60 to-slate-900 border border-white/[0.06] flex items-center justify-center p-2 mb-2">
        <svg viewBox="0 0 160 70" className="w-full h-full">
          {/* Subscription Cards Stack */}
          <rect x="20" y="18" width="50" height="34" rx="4" fill="#1E293B" stroke="rgba(244,63,94,0.5)" strokeWidth="1.5" />
          <line x1="28" y1="28" x2="55" y2="28" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="36" x2="45" y2="36" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          {/* Revenue Shield Protection */}
          <circle cx="120" cy="35" r="16" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="1.5" />
          <text x="120" y="40" fill="#10B981" fontSize="14" fontWeight="bold" textAnchor="middle">$</text>
        </svg>
      </div>
    );
  }

  if (scenarioId === "drop_invoices") {
    return (
      <div className="relative h-20 w-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-950/60 to-slate-900 border border-white/[0.06] flex items-center justify-center p-2 mb-2">
        <svg viewBox="0 0 160 70" className="w-full h-full">
          {/* Table Schema Blueprint */}
          <rect x="25" y="15" width="48" height="40" rx="4" fill="#0F172A" stroke="#818CF8" strokeWidth="1.5" />
          <line x1="25" y1="26" x2="73" y2="26" stroke="#818CF8" strokeWidth="1" />
          <line x1="32" y1="34" x2="65" y2="34" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="42" x2="55" y2="42" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
          {/* Compliance Lock */}
          <rect x="110" y="28" width="24" height="20" rx="3" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
          <path d="M 115,28 L 115,22 A 7,7 0 0,1 129,22 L 129,28" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
        </svg>
      </div>
    );
  }

  // Safe analytics select
  return (
    <div className="relative h-20 w-full rounded-lg overflow-hidden bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-white/[0.06] flex items-center justify-center p-2 mb-2">
      <svg viewBox="0 0 160 70" className="w-full h-full">
        {/* Growth Bar Chart */}
        <rect x="30" y="38" width="10" height="18" rx="2" fill="#10B981" opacity="0.6" />
        <rect x="45" y="28" width="10" height="28" rx="2" fill="#10B981" opacity="0.8" />
        <rect x="60" y="18" width="10" height="38" rx="2" fill="#10B981" />
        {/* Pass Check */}
        <circle cx="120" cy="35" r="14" fill="rgba(16,185,129,0.2)" stroke="#10B981" strokeWidth="1.5" />
        <path d="M 114,35 L 118,39 L 127,30" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}
