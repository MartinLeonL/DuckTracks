import React, { useState } from "react";
import { X, Clock, Calendar, Zap } from "lucide-react";

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultForm = {
  title: "",
  description: "",
  type: "activity",
  date: "",
  durationMinutes: 30,
  startTime: "",
  endTime: "",
  repeating: false,
  repeatDays: [],
};

export default function TaskForm({ initialTask, defaultDate, onSubmit, onClose }) {
  const [form, setForm] = useState(() => {
    if (initialTask) {
      return {
        title: initialTask.title,
        description: initialTask.description || "",
        type: initialTask.type,
        date: initialTask.date || "",
        durationMinutes: initialTask.durationSeconds
          ? Math.round(initialTask.durationSeconds / 60)
          : 30,
        startTime: initialTask.startTime || "",
        endTime: initialTask.endTime || "",
        repeating: initialTask.repeating || false,
        repeatDays: initialTask.repeatDays || [],
      };
    }
    return { ...defaultForm, date: defaultDate || "" };
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleDay = (dow) => {
    setForm((f) => ({
      ...f,
      repeatDays: f.repeatDays.includes(dow)
        ? f.repeatDays.filter((d) => d !== dow)
        : [...f.repeatDays, dow],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.repeating && !form.date) return;
    if (form.repeating && form.repeatDays.length === 0) return;

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      date: form.repeating ? null : form.date,
      durationSeconds: form.type === "timed" ? form.durationMinutes * 60 : undefined,
      startTime: form.type === "attendance" ? form.startTime : undefined,
      endTime: form.type === "attendance" ? form.endTime || null : undefined,
      repeating: form.repeating,
      repeatDays: form.repeating ? form.repeatDays : [],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md glass rounded-2xl shadow-2xl animate-slideUp">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/60">
          <h3 className="text-base font-semibold text-slate-100">
            {initialTask ? "Edit Task" : "New Task"}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Task name</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="What do you need to do?"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Add notes or details..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Task type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { value: "activity",   icon: Zap,      label: "Activity"   },
                { value: "timed",      icon: Clock,    label: "Timed"      },
                { value: "attendance", icon: Calendar, label: "Attendance" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("type", value)}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs font-medium transition-all ${
                    form.type === value
                      ? "border-emerald-500 bg-emerald-900/40 text-emerald-300"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.type === "timed" && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                max={480}
                value={form.durationMinutes}
                onChange={(e) => set("durationMinutes", Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          )}

          {form.type === "attendance" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Start time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">End time <span className="text-slate-600">(optional)</span></label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set("endTime", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => set("repeating", false)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                  !form.repeating
                    ? "border-emerald-500 bg-emerald-900/30 text-emerald-300"
                    : "border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                One-time
              </button>
              <button
                type="button"
                onClick={() => set("repeating", true)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                  form.repeating
                    ? "border-purple-500 bg-purple-900/30 text-purple-300"
                    : "border-slate-700 bg-slate-800 text-slate-400"
                }`}
              >
                ↻ Repeating
              </button>
            </div>

            {!form.repeating && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            )}

            {form.repeating && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Repeat on</label>
                <div className="flex gap-1.5">
                  {DOW_LABELS.map((day, dow) => (
                    <button
                      key={dow}
                      type="button"
                      onClick={() => toggleDay(dow)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                        form.repeatDays.includes(dow)
                          ? "border-purple-500 bg-purple-900/40 text-purple-300"
                          : "border-slate-700 bg-slate-800 text-slate-500"
                      }`}
                    >
                      {day[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              !form.title.trim() ||
              (!form.repeating && !form.date) ||
              (form.repeating && form.repeatDays.length === 0)
            }
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-sm transition-all"
          >
            {initialTask ? "Save Changes" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}