import { useState, useCallback } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          typeof value === "function" ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (err) {
        console.error("useLocalStorage write error:", err);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

export function useCoins() {
  const [coins, setCoins] = useLocalStorage("dt_coins", 0);
  const addCoins = useCallback((amount) => setCoins((c) => c + amount), [setCoins]);
  const spendCoins = useCallback((amount) => setCoins((c) => c - amount), [setCoins]);
  return { coins, setCoins, addCoins, spendCoins };
}

const TASKS_KEY = "dt_tasks";

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage(TASKS_KEY, []);

  const uuid = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });

  const addTask = useCallback(
    (taskData) => {
      const newTask = {
        id: uuid(),
        repeatGroupId: taskData.repeating ? uuid() : null,
        exceptions: {},
        completed: false,
        timerRemaining: taskData.type === "timed" ? taskData.durationSeconds : null,
        timerRunning: false,
        completedOn: null,
        description: taskData.description || "",
        ...taskData,
      };
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [setTasks]
  );

  const updateTask = useCallback(
    (id, updates) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    [setTasks]
  );

  const updateRepeatingTask = useCallback(
    (task, updates, scope, date) => {
      if (scope === "this") {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.repeatGroupId !== task.repeatGroupId) return t;
            return {
              ...t,
              exceptions: {
                ...t.exceptions,
                [date]: { ...t, ...updates, id: t.id, date },
              },
            };
          })
        );
      } else {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.repeatGroupId !== task.repeatGroupId) return t;
            return { ...t, ...updates };
          })
        );
      }
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (task, scope, date) => {
      if (!task.repeating || scope === "all") {
        setTasks((prev) =>
          prev.filter((t) => {
            if (task.repeating) return t.repeatGroupId !== task.repeatGroupId;
            return t.id !== task.id;
          })
        );
      } else {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.repeatGroupId !== task.repeatGroupId) return t;
            return {
              ...t,
              exceptions: { ...t.exceptions, [date]: "deleted" },
            };
          })
        );
      }
    },
    [setTasks]
  );

  const completeTask = useCallback(
    (id, date) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: true, completedOn: date } : t))
      );
    },
    [setTasks]
  );

  const getTasksForDate = useCallback(
    (dateStr) => {
      const dow = new Date(dateStr + "T12:00:00").getDay();
      const results = [];

      for (const t of tasks) {
        if (t.repeating) {
          if (!t.repeatDays.includes(dow)) continue;
          const exception = t.exceptions?.[dateStr];
          if (exception === "deleted") continue;
          if (exception && typeof exception === "object") {
            results.push({ ...exception, _instanceDate: dateStr });
          } else {
            results.push({ ...t, _instanceDate: dateStr, completed: t.completedOn === dateStr });
          }
        } else {
          if (t.date === dateStr) results.push(t);
        }
      }

      return results;
    },
    [tasks]
  );

  const processDayReset = useCallback(
    (yesterdayStr) => {
      const yesterdayTasks = getTasksForDate(yesterdayStr);
      const incomplete = yesterdayTasks.filter((t) => !t.completed);
      return incomplete.length;
    },
    [getTasksForDate]
  );

  return {
    tasks,
    addTask,
    updateTask,
    updateRepeatingTask,
    deleteTask,
    completeTask,
    getTasksForDate,
    processDayReset,
    setTasks,
  };
}

export function useDuckInventory() {
  const [inventory, setInventory] = useLocalStorage("dt_inventory", {
    owned: [],
    trophyCounts: {},
  });

  const addDuck = useCallback(
    (duckId) => {
      setInventory((prev) => ({ ...prev, owned: [...prev.owned, duckId] }));
    },
    [setInventory]
  );

  const incrementTrophy = useCallback(
    (duckId) => {
      setInventory((prev) => ({
        ...prev,
        trophyCounts: {
          ...prev.trophyCounts,
          [duckId]: (prev.trophyCounts[duckId] || 0) + 1,
        },
      }));
    },
    [setInventory]
  );

  const ownsDuck = useCallback(
    (duckId) => inventory.owned.includes(duckId),
    [inventory.owned]
  );

  const getTrophyCount = useCallback(
    (duckId) => inventory.trophyCounts[duckId] || 0,
    [inventory.trophyCounts]
  );

  return { inventory, addDuck, incrementTrophy, ownsDuck, getTrophyCount };
}

export function useLastOpenedDate() {
  return useLocalStorage("dt_lastOpenedDate", null);
}

export function useDailyBonusClaimed() {
  return useLocalStorage("dt_dailyBonusClaimed", null);
}