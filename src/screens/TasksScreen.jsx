import React, { useState, useCallback, useEffect } from "react";
import { Plus, Star } from "lucide-react";
import DuckPond from "../components/DuckPond";
import TaskItem from "../components/TaskItem";
import TaskForm from "../components/TaskForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { useDailyBonusClaimed } from "../hooks/useLocalStorage";

export default function TasksScreen({
  todayTasks,
  allDucks,
  ownedDuckIds,
  addTask,
  updateTask,
  updateRepeatingTask,
  deleteTask,
  completeTask,
  addCoins,
  today,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showBonus, setShowBonus] = useState(false);
  const [coinPop, setCoinPop] = useState(null);

  const [bonusClaimedDate, setBonusClaimedDate] = useDailyBonusClaimed();

  const ownedDucks = allDucks.filter((d) => ownedDuckIds.includes(d.id));
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const allDone = todayTasks.length > 0 && completedCount === todayTasks.length;
  const bonusAlreadyClaimed = bonusClaimedDate === today;

  useEffect(() => {
    if (allDone && !bonusAlreadyClaimed) {
      setShowBonus(true);
    }
  }, [allDone, bonusAlreadyClaimed]);

  const handleComplete = useCallback(
    (task, e) => {
      completeTask(task.id, today);
      
      // Determine reward based on task size
      let reward = 1;
      if (task.size === 'medium') reward = 3;
      if (task.size === 'large') reward = 5;
      
      addCoins(reward);
      
      if (e?.currentTarget) {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoinPop({ x: rect.left + rect.width / 2, y: rect.top, amount: reward });
        setTimeout(() => setCoinPop(null), 900);
      }
    },
    [completeTask, addCoins, today]
  );

  const handleDelete = useCallback(
    (task) => {
      if (task.repeating) {
        setConfirm({ type: "delete", task });
      } else {
        deleteTask(task, "all", today);
      }
    },
    [deleteTask, today]
  );

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

  const resolveConfirm = (scope) => {
    if (!confirm) return;
    if (confirm.type === "delete") {
      deleteTask(confirm.task, scope, today);
    } else if (confirm.type === "edit") {
      updateRepeatingTask(confirm.task, confirm.updates, scope, today);
    }
    setConfirm(null);
  };

  const collectBonus = () => {
    addCoins(5);
    setBonusClaimedDate(today);
    setShowBonus(false);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-24">
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Your Pond
        </h2>
        <DuckPond ownedDucks={ownedDucks} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Tasks
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {completedCount}/{todayTasks.length} complete
              {todayTasks.length > 0 && ` · ${todayTasks.length - completedCount} remaining`}
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

        {todayTasks.length === 0 ? (
          <div className="text-center py-10 text-slate-600">
            <p className="text-sm">No tasks for today.</p>
            <p className="text-xs mt-1">Add one to start earning coins!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <TaskItem
                key={task.id + (task._instanceDate || "")}
                task={task}
                onComplete={(e) => handleComplete(task, e)}
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

      {showBonus && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="glass rounded-2xl p-8 text-center max-w-xs mx-4 animate-revealBox">
            <Star size={40} className="text-yellow-400 mx-auto mb-3" fill="currentColor" />
            <h3 className="text-xl font-black text-emerald-400">All Done!</h3>
            <p className="text-slate-300 text-sm mt-2">
              You completed every task for today!
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-300 font-bold text-lg">
              <span>🪙</span>
              <span>+5 Bonus Coins!</span>
            </div>
            <button
              onClick={collectBonus}
              className="mt-5 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
            >
              Collect
            </button>
          </div>
        </div>
      )}

      {coinPop && (
        <div
          className="fixed pointer-events-none z-50 animate-coinPop font-bold text-yellow-300 text-sm"
          style={{ left: coinPop.x, top: coinPop.y, transform: "translateX(-50%)" }}
        >
          +{coinPop.amount} 🪙
        </div>
      )}

      {showForm && (
        <TaskForm
          initialTask={editingTask}
          defaultDate={today}
          onSubmit={handleFormSubmit}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.type === "delete" ? "Delete Repeating Task" : "Edit Repeating Task"}
          message={
            confirm.type === "delete"
              ? "This is a repeating task. How would you like to delete it?"
              : "This is a repeating task. How would you like to apply changes?"
          }
          confirmA="This day only"
          confirmB={confirm.type === "delete" ? "Delete all instances" : "Apply to all future instances"}
          onA={() => resolveConfirm("this")}
          onB={() => resolveConfirm(confirm.type === "delete" ? "all" : "future")}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}