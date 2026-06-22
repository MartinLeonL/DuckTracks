import React, { useState, useEffect, useMemo } from "react";
import { CheckSquare, Calendar, Package, ShoppingBag } from "lucide-react";

import { fetchAllDucks } from "./supabaseClient";
import { useCoins, useTasks, useDuckInventory, useLastOpenedDate } from "./hooks/useLocalStorage";

import CoinDisplay from "./components/CoinDisplay";
import ClockDisplay from "./components/ClockDisplay"; // <-- NEW
import TasksScreen from "./screens/TasksScreen";
import CalendarScreen from "./screens/CalendarScreen";
import CollectionScreen from "./screens/CollectionScreen";
import StoreScreen from "./screens/StoreScreen";

const NAV_ITEMS = [
  { id: "tasks",      label: "Tasks",      Icon: CheckSquare },
  { id: "calendar",   label: "Calendar",   Icon: Calendar    },
  { id: "collection", label: "Collection", Icon: Package     },
  { id: "store",      label: "Store",      Icon: ShoppingBag },
];

function todayYMD() {
  return new Date().toISOString().split("T")[0];
}

function yesterdayYMD() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export default function App() {
  const [screen, setScreen] = useState("tasks");
  const [allDucks, setAllDucks] = useState([]);
  const [ducksLoading, setDucksLoading] = useState(true);
  const [ducksError, setDucksError] = useState(null);

  const { coins, addCoins, spendCoins } = useCoins();
  const {
    tasks,
    addTask,
    updateTask,
    updateRepeatingTask,
    deleteTask,
    completeTask,
    getTasksForDate,
    processDayReset,
  } = useTasks();
  const { inventory, addDuck, incrementTrophy, getTrophyCount } = useDuckInventory();
  const [lastOpenedDate, setLastOpenedDate] = useLastOpenedDate();

  useEffect(() => {
    let cancelled = false;
    setDucksLoading(true);
    fetchAllDucks()
      .then((data) => {
        if (!cancelled) { setAllDucks(data); setDucksLoading(false); }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load duckies:", err);
          setDucksError("Could not load ducky catalog. Check your Supabase config.");
          setDucksLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const today = todayYMD();
    if (lastOpenedDate === today) return;
    if (lastOpenedDate && lastOpenedDate < today) {
      const yesterday = yesterdayYMD();
      
      // --- NEW MIDNIGHT BONUS LOGIC ---
      const yesterdaysTasks = getTasksForDate(yesterday);
      if (yesterdaysTasks.length > 0 && yesterdaysTasks.every(t => t.completed)) {
        addCoins(5);
        alert("Awesome job! You earned 5 bonus coins for completing all your tasks yesterday!");
      }
      // --------------------------------

      const penaltyDay = lastOpenedDate >= yesterday ? lastOpenedDate : yesterday;
      const penaltyCount = processDayReset(penaltyDay);
      if (penaltyCount > 0) addCoins(-penaltyCount);
    }
    setLastOpenedDate(today);
  }, []); // eslint-disable-line

  const today = todayYMD();
  const todayTasks = useMemo(() => getTasksForDate(today), [tasks, today]); // eslint-disable-line

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto bg-slate-900 relative">
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 glass z-10">
        <h1 className="text-base font-black text-emerald-400 tracking-tight">DuckTracks</h1>
        <div className="flex items-center">
          <ClockDisplay /> 
          <CoinDisplay coins={coins} />
        </div>
      </header>

      {ducksError && (
        <div className="px-4 py-2 bg-red-900/60 text-red-300 text-xs text-center border-b border-red-800">
          {ducksError}
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        {screen === "tasks" && (
          <TasksScreen
            todayTasks={todayTasks}
            allDucks={allDucks}
            ownedDuckIds={inventory.owned}
            addTask={addTask}
            updateTask={updateTask}
            updateRepeatingTask={updateRepeatingTask}
            deleteTask={deleteTask}
            completeTask={completeTask}
            addCoins={addCoins}
            today={today}
          />
        )}
        {screen === "calendar" && (
          <CalendarScreen
            today={today}
            getTasksForDate={getTasksForDate}
            addTask={addTask}
            updateTask={updateTask}
            updateRepeatingTask={updateRepeatingTask}
            deleteTask={deleteTask}
            completeTask={completeTask}
            addCoins={addCoins}
          />
        )}
        {screen === "collection" && (
          <CollectionScreen
            allDucks={allDucks}
            ownedIds={inventory.owned}
            getTrophyCount={getTrophyCount}
          />
        )}
        {screen === "store" && (
          <StoreScreen
            coins={coins}
            allDucks={allDucks}
            ownedIds={inventory.owned}
            spendCoins={spendCoins}
            addDuck={addDuck}
            incrementTrophy={incrementTrophy}
            getTrophyCount={getTrophyCount}
          />
        )}

        {ducksLoading && screen !== "tasks" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-20">
            <div className="text-center">
              <div className="animate-bob text-3xl mb-2">🦆</div>
              <p className="text-sm text-slate-400">Loading duckies…</p>
            </div>
          </div>
        )}
      </main>

      <nav className="border-t border-slate-800 glass safe-bottom z-10">
        <div className="flex">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all ${
                screen === id ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon size={20} strokeWidth={screen === id ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
              {screen === id && <span className="w-1 h-1 bg-emerald-400 rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}