/**
 * ConfirmDialog.jsx
 * Simple modal dialog for confirming repeating task changes.
 */
import React from "react";
import { X } from "lucide-react";

/**
 * @param {string} title
 * @param {string} message
 * @param {string} confirmA - label for option A
 * @param {string} confirmB - label for option B
 * @param {function} onA - callback for option A
 * @param {function} onB - callback for option B
 * @param {function} onClose - cancel callback
 */
export default function ConfirmDialog({ title, message, confirmA, confirmB, onA, onB, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm glass rounded-2xl shadow-2xl animate-slideUp p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-5">{message}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onA}
            className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium text-sm transition-colors"
          >
            {confirmA}
          </button>
          <button
            onClick={onB}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-sm transition-colors"
          >
            {confirmB}
          </button>
          <button onClick={onClose} className="text-slate-500 text-sm mt-1 hover:text-slate-300 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
