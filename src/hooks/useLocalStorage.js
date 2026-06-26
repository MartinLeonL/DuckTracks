import { useState, useCallback, useEffect } from "react";

// Prefix keys with userId to support multiple users on same device
function makeKey(key, userId) {
  return userId ? `${key}_${userId}` : key;
}

export function useLocalStorage(key, initialValue, userId) {
  const scopedKey = makeKey(key, userId);

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(scopedKey);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Re-read from storage when userId or key changes (e.g. after login)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(scopedKey);
      setStoredValue(item !== null ? JSON.parse(item) : initialValue);
    } catch {
      setStoredValue(initialValue);
    }
  }, [scopedKey]); // eslint-disable-line

  const setValue = useCallback(
    (value) => {
      try {
        const sk = makeKey(key, userId);
        const valueToStore =
          typeof value === "function" ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(sk, JSON.stringify(valueToStore));
      } catch (err) {
        console.error("useLocalStorage write error:", err);
      }
    },
    [key, userId, storedValue]
  );

  return [storedValue, setValue];
}

export function useCoins(userId) {
  const [coins, setCoins] = useLocalStorage("dt_coins", 0, userId);
  const addCoins = useCallback((amount) => setCoins((c) => c + amount), [setCoins]);
  const spendCoins = useCallback((amount) => setCoins((c) => c - amount), [setCoins]);
  const resetCoins = useCallback(() => setCoins(0), [setCoins]);
  return { coins, setCoins, addCoins, spendCoins, resetCoins };
}

const TASKS_KEY = "dt_tasks";

const TASK_SIZE_REWARDS = {
  small: 1,
  medium: 3,
  large: 5,
};

export function useTasks(userId) {
  const [tasks, setTasks] = useLocalStorage(TASKS_KEY, [], userId);

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
      return incomplete.reduce(
        (total, task) => total + (TASK_SIZE_REWARDS[task.size] || TASK_SIZE_REWARDS.small),
        0
      );
    },
    [getTasksForDate]
  );

  const resetTasks = useCallback(() => setTasks([]), [setTasks]);

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
    resetTasks,
  };
}

export function useDuckInventory(userId) {
  const [inventory, setInventory] = useLocalStorage("dt_inventory", {
    owned: [],
    trophyCounts: {},
  }, userId);

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

  const resetInventory = useCallback(
    () => setInventory({ owned: [], trophyCounts: {} }),
    [setInventory]
  );

  return { inventory, setInventory, addDuck, incrementTrophy, ownsDuck, getTrophyCount, resetInventory };
}

export function useLastOpenedDate(userId) {
  return useLocalStorage("dt_lastOpenedDate", null, userId);
}

export function useDailyBonusClaimed(userId) {
  return useLocalStorage("dt_dailyBonusClaimed", null, userId);
}