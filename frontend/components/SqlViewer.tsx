"use client";

import React, { useState } from "react";
import { Check, Copy, ShieldAlert, Shield } from "lucide-react";
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

// Syntax highlighting token map
const SQL_KEYWORDS = new Set([
  "DELETE","SELECT","UPDATE","INSERT","INTO","SET","FROM","WHERE","AND","OR",
  "TRUNCATE","DROP","TABLE","NOW","INTERVAL","NULL","IS","NOT","CASCADE",
  "RESTRICT","LIMIT","COUNT","GROUP","BY","ORDER","DESC","ASC","ALTER",
  "RENAME","TO","AS","DISTINCT","JOIN","ON","LEFT","RIGHT","INNER","OUTER",
  "VALUES","WITH","HAVING","UNION","ALL","EXISTS","IN","BETWEEN","LIKE",
]);

function tokenizeSQL(line: string): { text: string; type: string }[] {
  const tokens: { text: string; type: string }[] = [];
  const pattern = /('[^']*'|"[^"]*"|--[^\n]*|\/\*[\s\S]*?\*\/|\b\w+\b|[^\w\s]|\s+)/g;
  let match;
  while ((match = pattern.exec(line)) !== null) {
    const t = match[0];
    const upper = t.toUpperCase();
    if (SQL_KEYWORDS.has(upper)) {
      const danger = ["DELETE","DROP","TRUNCATE"].includes(upper);
      const update = ["UPDATE","SET"].includes(upper);
      const clause = ["FROM","WHERE","AND","OR","ON","JOIN","LEFT","RIGHT","INNER","OUTER"].includes(upper);
      tokens.push({ text: t, type: danger ? "danger-kw" : update ? "update-kw" : clause ? "clause-kw" : "kw" });
    } else if (t.startsWith("'") || t.startsWith('"')) {
      tokens.push({ text: t, type: "string" });
    } else if (t.startsWith("--") || t.startsWith("/*")) {
      tokens.push({ text: t, type: "comment" });
    } else if (/^\d+(\.\d+)?$/.test(t)) {
      tokens.push({ text: t, type: "number" });
    } else if (/^[a-z_][a-z0-9_]*$/i.test(t) && !SQL_KEYWORDS.has(upper)) {
      tokens.push({ text: t, type: "ident" });
    } else {
      tokens.push({ text: t, type: "punct" });
    }
  }
  return tokens;
}

const TOKEN_COLORS: Record<string, string> = {
  "danger-kw":  "#f87171",
  "update-kw":  "#34d399",
  "clause-kw":  "#c4b5fd",
  "kw":         "#67e8f9",
  "string":     "#86efac",
  "comment":    "#475569",
  "number":     "#fde68a",
  "ident":      "#e2e8f0",
  "punct":      "#94a3b8",
};

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

  const lines = sql.trim().split("\n");
  const accentColor = variant === "danger" ? "#ef4444" : variant === "safe" ? "#10b981" : "#6366f1";
  const borderColor = variant === "danger" ? "rgba(239,68,68,0.2)"
    : variant === "safe" ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)";

  const opStyle = operation === "DELETE" || operation === "DROP" || operation === "TRUNCATE"
    ? { bg: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "rgba(239,68,68,0.25)" }
    : operation === "UPDATE"
    ? { bg: "rgba(245,158,11,0.1)", color: "#fde68a", border: "rgba(245,158,11,0.25)" }
    : { bg: "rgba(16,185,129,0.1)", color: "#6ee7b7", border: "rgba(16,185,129,0.25)" };

  return (
    <div className="terminal" style={{ borderColor }}>
      {/* Terminal dots header */}
      <div className="terminal-header">
        <div className="flex items-center gap-3">
          <div className="terminal-dots">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-amber" />
            <div className="terminal-dot terminal-dot-green" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ color: accentColor, fontFamily: "var(--font-mono)" }}>
            {title || "SQL Statement"}
          </span>
          {operation && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase"
              style={{
                background: opStyle.bg,
                color: opStyle.color,
                border: `1px solid ${opStyle.border}`,
                fontFamily: "var(--font-mono)",
              }}>
              {operation}
            </span>
          )}
          {table && (
            <span className="text-[10px]" style={{ color: "#64748b", fontFamily: "var(--font-mono)" }}>
              → <strong style={{ color: "#94a3b8" }}>{table}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isDangerous && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold"
              style={{ color: "#f87171" }}>
              <ShieldAlert className="w-3 h-3" />
              Intercepted
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded transition-all text-[11px]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: copied ? "#34d399" : "#64748b",
              fontFamily: "var(--font-mono)",
            }}
          >
            {copied ? <><Check className="w-3 h-3" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
          </button>
        </div>
      </div>

      {/* Code body */}
      <div className="terminal-body overflow-x-auto" style={{ paddingBottom: 16 }}>
        {lines.map((line, i) => {
          const tokens = tokenizeSQL(line);
          return (
            <div key={i} className="code-line">
              <span className="code-ln">{i + 1}</span>
              <code className="text-xs leading-loose" style={{ fontFamily: "var(--font-mono)" }}>
                {tokens.length === 0
                  ? <span style={{ color: "#475569" }}> </span>
                  : tokens.map((tok, j) => (
                    <span key={j} style={{ color: TOKEN_COLORS[tok.type] || "#e2e8f0" }}>
                      {tok.text}
                    </span>
                  ))
                }
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}
