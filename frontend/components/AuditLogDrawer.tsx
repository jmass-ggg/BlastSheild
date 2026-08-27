"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INITIAL_AUDIT_EVENTS } from "@/lib/mockData";
import { 
  FileCheck, 
  Search, 
  X, 
  Clock, 
  User, 
  Code, 
  Copy, 
  Check 
} from "lucide-react";

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnalysisId?: string;
}

export function AuditLogDrawer({ isOpen, onClose }: AuditLogDrawerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEvents = INITIAL_AUDIT_EVENTS.filter((evt) => {
    const match =
      evt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.actor.toLowerCase().includes(searchTerm.toLowerCase());
    return match;
  });

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full max-w-xl h-full bg-[#0b101c] border-l border-slate-700 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                BlastShield Compliance Audit Log
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold">
                  IMMUTABLE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cryptographically signed ledger of intercepted agent statements
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors touch-target"
            aria-label="Close Audit Log"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Audit ID, event, or query snippet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Events */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEvents.map((evt) => {
            const isExpanded = expandedEvent === evt.id;

            return (
              <div
                key={evt.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-slate-700 transition-all"
              >
                <div
                  onClick={() => setExpandedEvent(isExpanded ? null : evt.id)}
                  className="p-3.5 cursor-pointer select-none"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {evt.id}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {evt.eventType}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(evt.id);
                      }}
                      className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-500 hover:text-slate-200 p-1"
                      title="Copy ID"
                    >
                      {copiedId === evt.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 font-medium leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60 font-mono">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {evt.actor}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Expanded JSON */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-3 bg-black/40 border-t border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1.5 font-mono text-[10px]">
                        <Code className="w-3.5 h-3.5" />
                        EVENT PAYLOAD & TELEMETRY
                      </div>
                      <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>SHA-256 Verified Ledger</span>
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors touch-target"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
