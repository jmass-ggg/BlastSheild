"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  currentView?: "home" | "demo";
  onNavigate?: (view: "home" | "demo") => void;
}

export function Navbar({ currentView = "home", onNavigate }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isDemo = currentView === "demo" || pathname === "/demo";

  const handleNav = (target: "home" | "demo", hash?: string) => {
    if (onNavigate) {
      onNavigate(target);
      if (hash && typeof window !== "undefined") {
        setTimeout(() => {
          const el = document.getElementById(hash);
          el?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      if (target === "demo") {
        router.push("/demo");
      } else {
        router.push(hash ? `/#${hash}` : "/");
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#090D16]/90 border-b border-white/[0.08] select-none">
      <div className="max-w-[1400px] mx-auto px-6 h-[64px] flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNav("home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <div className="w-full h-full rounded-xl bg-[#0B0F19] flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center">
            BlastShield<span className="text-[#818CF8]">AI</span>
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            type="button"
            onClick={() => handleNav("home")}
            className={`relative py-1 transition-colors ${
              !isDemo ? "text-white font-semibold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Home
            {!isDemo && (
              <motion.div
                layoutId="navIndicator"
                className="absolute bottom-[-16px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleNav("home", "how-it-works")}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleNav("home", "features")}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => handleNav("home", "for-agents")}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            For Agents
          </button>

          <button
            type="button"
            onClick={() => handleNav("home", "docs")}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Docs
          </button>
        </nav>

        {/* Right CTA Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleNav(isDemo ? "home" : "demo")}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#581C87]/80 hover:bg-[#6B21A8] text-white text-sm font-semibold border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all hover:scale-105 active:scale-95"
          >
            <span>{isDemo ? "Back to Home" : "Try Demo"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
