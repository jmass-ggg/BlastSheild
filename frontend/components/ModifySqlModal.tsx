"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Play, Code, Sparkles } from "lucide-react";

interface ModifySqlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSql: string;
  onApplySql: (newSql: string) => void;
}

export function ModifySqlModal({
  isOpen,
  onClose,
  currentSql,
  onApplySql,
}: ModifySqlModalProps) {
  const [editedSql, setEditedSql] = useState(currentSql);

  useEffect(() => {
    setEditedSql(currentSql);
  }, [currentSql]);

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

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplySql(editedSql);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-[#0e1626] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Modify Candidate SQL Query
              </h3>
              <p className="text-xs text-slate-400">
                Edit the SQL statement directly to test blast radius recalculation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors touch-target"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-300">
              SQL Query:
            </label>
            <textarea
              value={editedSql}
              onChange={(e) => setEditedSql(e.target.value)}
              rows={5}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <span>
              Applying will run an isolated simulation in sandbox and update the blast radius.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-colors touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-6 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-lg touch-target"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Re-Analyze in Sandbox
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
