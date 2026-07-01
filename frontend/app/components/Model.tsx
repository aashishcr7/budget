"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

type ModelProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function Model({ onConfirm, onCancel }: ModelProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Backdrop wrapper */}
      <div
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />

      {/* Modal Dialog Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100/80 space-y-5 z-10 overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Delete Trip</h3>
              <p className="text-xs text-slate-500">This action cannot be undone</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Section */}
        <div className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to permanently delete this trip? This will erase all planned itineraries, daily budget calculations, and saved items from this destination.
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold transition border border-slate-200 cursor-pointer text-sm active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-xl font-semibold transition shadow-md shadow-red-100 hover:shadow-lg hover:shadow-red-200 cursor-pointer text-sm flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Yes, Delete</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
