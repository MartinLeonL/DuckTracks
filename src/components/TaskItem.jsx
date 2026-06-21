import React, { useState } from "react";
import { Check, Clock, Calendar, Trash2, Pencil, ChevronDown, ChevronUp, AlignLeft } from "lucide-react";
import Timer from "./Timer";

const TYPE_LABELS = {
  activity:   { label: "Activity",   color: "text-emerald-400", bg: "bg-emerald-900/30" },
  timed:      { label: "Timed",      color: "text-cyan-400",    bg: "bg-cyan-900/30"    },
  attendance: { label: "Attendance", color: "text-blue-400",    bg: "bg-blue-900/30"    },
};

export default function TaskItem({
  task,
  onComplete,
  onDelete,
  onEdit,
  onTimerTick,
  onTimerToggle,
  onTimerReset,
  showDate = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_LABELS[task.type] || TYPE_LABELS.activity;
  const hasDescription = task.description && task.description.trim().length > 0;

  const canComplete =
    !task.completed &&
    (task.type !== "timed" || (task.timerRemaining !== null && task.timerRemaining <= 0));

  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        task.completed
          ? "border-slate-700/50 bg-slate-800/30 opacity-60"
          : "border-slate-700 bg-slate-800/60 hover:border-slate-600"
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={canComplete ? onComplete : undefined}
          disabled={!canComplete}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
            task.completed
              ? "border-emerald-500 bg-emerald-500"
              : canComplete
              ? "border-slate-500 hover:border-emerald-400"
              : "border-slate-600 opacity-40 cursor-not-allowed"
          }`}
          aria-label={task.completed ? "Completed" : "Mark complete"}
        >
          {task.completed && <Check size={11} className="text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`text-sm font-medium leading-snug ${
                task.completed ? "line-through text-slate-500" : "text-slate-100"
              }`}
            >
              {task.title}
            </span>

            <div className="flex items-center gap-1 flex-shrink-0">
              {!task.completed && (
                <>
                  <button onClick={onEdit} className="p-1 text-slate-500 hover:text-slate-300 transition-colors" aria-label="Edit task">
                    <Pencil size={13} />
                  </button>
                  <button onClick={onDelete} className="p-1 text-slate-500 hover:text-red-400 transition-colors" aria-label="Delete task">
                    <Trash2 size={13} />
                  </button>
                </>
              )}
              <button
                onClick={() => setExpanded((e) => !e)}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${meta.color} ${meta.bg}`}>
              {meta.label}
            </span>
            {task.type === "timed" && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {Math.round(task.durationSeconds / 60)} min
              </span>
            )}
            {task.type === "attendance" && task.startTime && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={10} />
                {task.startTime}{task.endTime ? ` – ${task.endTime}` : ""}
              </span>
            )}
            {showDate && task.date && (
              <span className="text-xs text-slate-500">{task.date}</span>
            )}
            {task.repeating && (
              <span className="text-xs text-purple-400">↻ Repeating</span>
            )}
            {hasDescription && !expanded && (
              <span className="text-xs text-slate-600 flex items-center gap-0.5">
                <AlignLeft size={10} /> note
              </span>
            )}
          </div>

          {task.type === "timed" && !task.completed && (
            <Timer
              totalSeconds={task.durationSeconds}
              remaining={task.timerRemaining ?? task.durationSeconds}
              running={task.timerRunning}
              completed={task.completed}
              onTick={onTimerTick}
              onComplete={onComplete}
              onToggle={onTimerToggle}
              onReset={onTimerReset}
            />
          )}

          {expanded && (
            <div className="mt-2 pt-2 border-t border-slate-700/60">
              {hasDescription ? (
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-xs text-slate-600 italic">No description. Edit the task to add one.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}