"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, ShieldAlert } from "lucide-react";
import { OperationType } from "@/lib/types";

interface SqlViewerProps {
  sql: string;
  operation?: OperationType;
  table?: string;
  title?: string;
  isDangerous?: boolean;
  highlightLines?: number[];
  variant?: "danger" | "safe" | "neutral";
}

export function SqlViewer({
  sql,
  operation = "DELETE",
  table,
  title,
  isDangerous = false,
  variant = "danger",
}: SqlViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighter for SQL keywords and identifiers
  const renderHighlightedSql = (code: string) => {
    const lines = code.trim().split("\n");

    return lines.map((line, lineIdx) => {
      // Split tokens carefully
      const tokens = line.split(/(\s+|[,;()=<>'-]+|\b(?:DELETE|SELECT|UPDATE|INSERT|INTO|SET|FROM|WHERE|AND|OR|TRUNCATE|DROP|TABLE|NOW|INTERVAL|NULL|IS|NOT|CASCADE|RESTRICT|LIMIT|COUNT|GROUP|BY|ORDER|DESC|ASC)\b)/gi);

      return (
        <div key={lineIdx} className="table-row">
          <span className="table-cell select-none pr-4 text-right text-xs font-mono text-slate-600">
            {lineIdx + 1}
          </span>
          <span className="table-cell font-mono text-xs leading-relaxed">
            {tokens.map((token, tIdx) => {
              const upper = token.toUpperCase();
              if (
                [
                  "DELETE", "SELECT", "UPDATE", "INSERT", "INTO", "SET",
                  "FROM", "WHERE", "AND", "OR", "TRUNCATE", "DROP",
                  "TABLE", "NOW", "INTERVAL", "NULL", "IS", "NOT",
                  "CASCADE", "RESTRICT", "LIMIT", "COUNT", "GROUP",
                  "BY", "ORDER", "DESC", "ASC"
                ].includes(upper)
              ) {
                return (
                  <span key={tIdx} className="text-cyan-400 font-bold">
                    {token}
                  </span>
                );
              }
              if (["users", "orders", "payments", "subscriptions", "invoices", "sessions"].includes(token.toLowerCase())) {
                return (
                  <span key={tIdx} className="text-rose-400 font-semibold underline decoration-rose-500/40 underline-offset-2">
                    {token}
                  </span>
                );
              }
              if (token.startsWith("'") && token.endsWith("'")) {
                return (
                  <span key={tIdx} className="text-emerald-300">
                    {token}
                  </span>
                );
              }
              if (/^\d+$/.test(token)) {
                return (
                  <span key={tIdx} className="text-amber-300">
                    {token}
                  </span>
                );
              }
              return <span key={tIdx} className="text-slate-200">{token}</span>;
            })}
          </span>
        </div>
      );
    });
  };

  const getBorderAndBg = () => {
    switch (variant) {
      case "danger":
        return "border-rose-500/30 bg-slate-950/90";
      case "safe":
        return "border-emerald-500/30 bg-slate-950/90";
      default:
        return "border-slate-800 bg-slate-950/90";
    }
  };

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${getBorderAndBg()}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/80 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 font-mono">
            {title || "SQL Statement"}
          </span>
          {operation && (
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono uppercase ${
                operation === "DELETE" || operation === "DROP" || operation === "TRUNCATE"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : operation === "UPDATE"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
              }`}
            >
              {operation}
            </span>
          )}
          {table && (
            <span className="text-[11px] text-slate-400 font-mono">
              target: <strong className="text-slate-200">{table}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDangerous && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-500/30">
              <ShieldAlert className="w-3 h-3" />
              Destructive Action Intercepted
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
            title="Copy SQL query"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code container */}
      <div className="p-3.5 overflow-x-auto bg-[#070b13]">
        <div className="table w-full">
          {renderHighlightedSql(sql)}
        </div>
      </div>
    </div>
  );
}
