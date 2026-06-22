/**
 * CalendarScreen.jsx
 * Screen 2 — Monthly calendar with task management per day.
 */
import React, { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import CalendarGrid from "../components/CalendarGrid";
import TaskItem from "../components/TaskItem";
import TaskForm from "../components/TaskForm";
import ConfirmDialog from "../components/ConfirmDialog";

function formatSelectedDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" });
}

export default function CalendarScreen({
  today,
  getTasksForDate,
  addTask,
  updateTask,
  updateRepeatingTask,
  deleteTask,
  completeTask,
  addCoins,
}) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const selectedTasks = getTasksForDate(selectedDate);

  const handleMonthChange = useCallback((offset) => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + offset);
      return d;
    });
  }, []);

  const handleFormSubmit = useCallback(
    (data) => {
      if (editingTask) {
        if (editingTask.repeating) {
          setConfirm({ type: "edit", task: editingTask, updates: data });
          setShowForm(false);
          setEditingTask(null);
          return;
        }
        updateTask(editingTask.id, data);
      } else {
        addTask(data);
      }
      setShowForm(false);
      setEditingTask(null);
    },
    [editingTask, addTask, updateTask]
  );

  const handleDelete = useCallback(
    (task) => {
      if (task.repeating) {
        setConfirm({ type: "delete", task });
      } else {
        deleteTask(task, "all", selectedDate);
      }
    },
    [deleteTask, selectedDate]
  );

  const resolveConfirm = (scope) => {
    if (!confirm) return;
    if (confirm.type === "delete") {
      deleteTask(confirm.task, scope, selectedDate);
    } else {
      updateRepeatingTask(confirm.task, confirm.updates, scope, selectedDate);
    }
    setConfirm(null);
  };

  const handleComplete = useCallback(
    (task) => {
      completeTask(task.id, selectedDate);
      
      let reward = 1;
      if (task.size === 'medium') reward = 3;
      if (task.size === 'large') reward = 5;
      
      addCoins(reward);
    },
    [completeTask, addCoins, selectedDate]
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-4">
      <section className="glass rounded-2xl p-3">
        <CalendarGrid
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          getTasksForDate={getTasksForDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          today={today}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              {formatSelectedDate(selectedDate)}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        {selectedTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            <p className="text-sm">No tasks for this day.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((task) => (
              <TaskItem
                key={task.id + (task._instanceDate || "")}
                task={task}
                onComplete={() => handleComplete(task)}
                onDelete={() => handleDelete(task)}
                onEdit={() => { setEditingTask(task); setShowForm(true); }}
                onTimerTick={(rem) => updateTask(task.id, { timerRemaining: rem })}
                onTimerToggle={() => updateTask(task.id, { timerRunning: !task.timerRunning })}
                onTimerReset={() => updateTask(task.id, { timerRemaining: task.durationSeconds, timerRunning: false })}
              />
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <TaskForm
          initialTask={editingTask}
          defaultDate={selectedDate}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.type === "delete" ? "Delete Repeating Task" : "Edit Repeating Task"}
          message={
            confirm.type === "delete"
              ? "This repeating task will be removed."
              : "How would you like to apply this change?"
          }
          confirmA="This day only"
          confirmB={confirm.type === "delete" ? "All instances" : "All future instances"}
          onA={() => resolveConfirm("this")}
          onB={() => resolveConfirm(confirm.type === "delete" ? "all" : "future")}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}