/**
 * Timer.jsx
 * Countdown / stopwatch for timed tasks.
 * Calls onComplete when the timer hits 0.
 */
import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, Play, Pause, RotateCcw } from "lucide-react";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * @param {number} totalSeconds - original duration
 * @param {number} remaining - current remaining seconds (from task state)
 * @param {boolean} running - is timer currently running
 * @param {boolean} completed - task already done
 * @param {function} onTick - (remaining) => void - called each second
 * @param {function} onComplete - called when timer reaches 0
 * @param {function} onToggle - called to start/pause
 * @param {function} onReset - called to reset timer
 */
export default function Timer({
  totalSeconds,
  remaining,
  running,
  completed,
  onTick,
  onComplete,
  onToggle,
  onReset,
}) {
  useEffect(() => {
    if (!running || remaining <= 0 || completed) return;
    const interval = setInterval(() => {
      const next = remaining - 1;
      onTick(next);
      if (next <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [running, remaining, completed]); // eslint-disable-line

  const pct = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;
  const isFinished = remaining <= 0;

  return (
    <div className="mt-2 space-y-1.5">
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            isFinished ? "bg-emerald-400" : "bg-cyan-400"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-sm font-bold tabular-nums ${
            isFinished ? "text-emerald-400" : remaining < 60 ? "text-red-400" : "text-cyan-300"
          }`}
        >
          {isFinished ? (
            <span className="inline-flex items-center gap-1">
              <CheckCircle size={14} />
              Done
            </span>
          ) : (
            formatTime(remaining)
          )}
        </span>
        <span className="text-slate-500 text-xs">/ {formatTime(totalSeconds)}</span>

        {!completed && (
          <div className="flex items-center gap-1 ml-auto">
            {!isFinished && (
              <button
                onClick={onToggle}
                className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-cyan-300 transition-colors"
                aria-label={running ? "Pause" : "Start"}
              >
                {running ? <Pause size={14} /> : <Play size={14} />}
              </button>
            )}
            <button
              onClick={onReset}
              className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 transition-colors"
              aria-label="Reset"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
