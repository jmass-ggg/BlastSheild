"use client";

import React from "react";
import {
  Plus,
  Layers,
  FileSpreadsheet,
  Activity,
  FileCheck2,
  Bell,
  Database,
  Bot,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface DemoSidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onNewAnalysis?: () => void;
}

export function DemoSidebar({
  activeTab = "new-analysis",
  onSelectTab,
  onNewAnalysis,
}: DemoSidebarProps) {
  return (
    <aside className="w-full lg:w-[220px] flex-shrink-0 bg-[#090D16] border-r border-white/[0.08] p-4 flex flex-col justify-between select-none min-h-[calc(100vh-64px)]">
      <div className="space-y-6 text-left">
        {/* Top Dropdown: Live Demo */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-semibold cursor-pointer hover:bg-purple-950/60 transition-colors">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Live Demo</span>
          </div>
          <ChevronDown size={14} className="text-purple-400" />
        </div>

        {/* Section 1: ANALYSIS */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono block mb-1.5">
            ANALYSIS
          </span>

          <button
            type="button"
            onClick={onNewAnalysis}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "new-analysis"
                ? "bg-[#6366F1] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            <Plus size={14} />
            <span>New Analysis</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.("all-analyses")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <Layers size={14} />
            <span>All Analyses</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.("risk-reports")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <FileSpreadsheet size={14} />
            <span>Risk Reports</span>
          </button>
        </div>

        {/* Section 2: MONITORING */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono block mb-1.5">
            MONITORING
          </span>

          <button
            type="button"
            onClick={() => onSelectTab?.("activities")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <Activity size={14} />
            <span>Activities</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.("audit-logs")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <FileCheck2 size={14} />
            <span>Audit Logs</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.("alerts")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <Bell size={14} />
            <span>Alerts</span>
          </button>
        </div>

        {/* Section 3: SYSTEM */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 font-mono block mb-1.5">
            SYSTEM
          </span>

          <button
            type="button"
            onClick={() => onSelectTab?.("databases")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <Database size={14} />
            <span>Databases</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.("agents")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <Bot size={14} />
            <span>Agents</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab?.("settings")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-all"
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Bottom User Profile */}
      <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            SJ
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-white leading-tight">
              Sarah Johnson
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              Admin
            </span>
          </div>
        </div>
        <ChevronDown size={14} className="text-slate-500" />
      </div>
    </aside>
  );
}
