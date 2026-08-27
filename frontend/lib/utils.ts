import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRiskColorClass(level: RiskLevel): {
  badge: string;
  border: string;
  bg: string;
  text: string;
  glow: string;
  accent: string;
  gradient: string;
} {
  switch (level) {
    case 'CRITICAL':
      return {
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        border: 'border-rose-500/40',
        bg: 'bg-rose-950/20',
        text: 'text-rose-400',
        glow: 'shadow-[0_0_24px_rgba(244,63,94,0.25)]',
        accent: '#f43f5e',
        gradient: 'from-rose-500/20 to-transparent',
      };
    case 'HIGH':
      return {
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/20',
        text: 'text-amber-400',
        glow: 'shadow-[0_0_24px_rgba(245,158,11,0.25)]',
        accent: '#f59e0b',
        gradient: 'from-amber-500/20 to-transparent',
      };
    case 'MEDIUM':
      return {
        badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        border: 'border-yellow-500/40',
        bg: 'bg-yellow-950/20',
        text: 'text-yellow-400',
        glow: 'shadow-[0_0_24px_rgba(234,179,8,0.25)]',
        accent: '#eab308',
        gradient: 'from-yellow-500/20 to-transparent',
      };
    case 'LOW':
    default:
      return {
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/20',
        text: 'text-emerald-400',
        glow: 'shadow-[0_0_24px_rgba(16,185,129,0.25)]',
        accent: '#10b981',
        gradient: 'from-emerald-500/20 to-transparent',
      };
  }
}
