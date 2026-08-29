"use client";

import React from "react";
import { Database, ShieldCheck, Cpu, Cloud, CheckCircle2 } from "lucide-react";

export function IntegrationLogos() {
  const integrations = [
    { name: "PostgreSQL", type: "Database", status: "Protected", icon: "🐘", version: "v14 - v16" },
    { name: "MySQL", type: "Database", status: "Protected", icon: "🐬", version: "v8.0+" },
    { name: "Snowflake", type: "Warehouse", status: "Protected", icon: "❄️", version: "Enterprise" },
    { name: "Supabase", type: "Cloud DB", status: "Protected", icon: "⚡", version: "Direct & Pooled" },
    { name: "Neon Serverless", type: "Postgres", status: "Protected", icon: "🟢", version: "Branching" },
    { name: "OpenAI GPT-4o", type: "Agent Source", status: "Sandboxed", icon: "🤖", version: "Tool Call Intercept" },
    { name: "Anthropic Claude", type: "Agent Source", status: "Sandboxed", icon: "🧠", version: "Artifact Intercept" },
    { name: "LangChain / CrewAI", type: "Framework", status: "Sandboxed", icon: "🔗", version: "SQL Toolkit Guard" },
  ];

  return (
    <div className="integration-showcase-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.08]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            Protected Ecosystem & Compatibility
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            Native Support for Production Databases & AI Agent Runtimes
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
          <CheckCircle2 size={14} />
          <span>Zero-Latency Wire Proxy</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {integrations.map((item) => (
          <div
            key={item.name}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col items-center text-center group"
          >
            <span className="text-2xl mb-1.5 transition-transform group-hover:scale-110">
              {item.icon}
            </span>
            <strong className="block text-xs font-semibold text-slate-200 truncate w-full">
              {item.name}
            </strong>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{item.type}</span>
            <span className="mt-2 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
