/**
 * CalendarGrid.jsx
 * Monthly calendar grid. Clicking a day opens its task list.
 * Color dots indicate task density.
 */
import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toYMD(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDensityColor(count) {
  if (count === 0) return "";
  if (count === 1) return "bg-emerald-800/60";
  if (count === 2) return "bg-emerald-700/60";
  if (count <= 4) return "bg-emerald-600/60";
  return "bg-emerald-500/70";
}

function getDotCount(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  return 3;
}

/**
 * @param {Date} currentMonth - first day of shown month
 * @param {function} onMonthChange - (offset: -1|1) => void
 * @param {function} getTasksForDate - (dateStr) => task[]
 * @param {string} selectedDate - YYYY-MM-DD
 * @param {function} onSelectDate - (dateStr) => void
 * @param {string} today - YYYY-MM-DD
 */
export default function CalendarGrid({
  currentMonth,
  onMonthChange,
  getTasksForDate,
  selectedDate,
  onSelectDate,
  today,
}) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const { days, startPad } = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { days: daysInMonth, startPad: firstDow };
  }, [year, month]);

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-slate-100">{monthLabel}</h2>
        <button
          onClick={() => onMonthChange(1)}
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day of week labels */}
      <div className="grid grid-cols-7 mb-1">
        {DOW_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`pad-${idx}`} />;

          const dateStr = toYMD(year, month, day);
          const tasks = getTasksForDate(dateStr);
          const count = tasks.length;
          const completedCount = tasks.filter((t) => t.completed).length;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dotCount = getDotCount(count);
          const allDone = count > 0 && completedCount === count;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative flex flex-col items-center justify-start rounded-lg pt-1 pb-1 transition-all text-xs font-medium
                ${isSelected
                  ? "bg-emerald-600 text-white ring-2 ring-emerald-400"
                  : isToday
                  ? "bg-slate-700 text-emerald-400 ring-1 ring-emerald-600"
                  : "hover:bg-slate-700/60 text-slate-300"
                }
              `}
              style={{ minHeight: 44 }}
            >
              <span>{day}</span>

              {/* Task density dots */}
              {dotCount > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: dotCount }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        allDone
                          ? "bg-emerald-400"
                          : isSelected
                          ? "bg-white/70"
                          : "bg-emerald-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
