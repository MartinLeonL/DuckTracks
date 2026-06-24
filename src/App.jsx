import React, { useState, useEffect, useMemo } from "react";
import { Bird, CheckSquare, Calendar, Package, PartyPopper, ShoppingBag } from "lucide-react";

import { fetchAllDucks } from "./supabaseClient";
import { useCoins, useTasks, useDuckInventory, useLastOpenedDate } from "./hooks/useLocalStorage";

import CoinDisplay from "./components/CoinDisplay";
import ClockDisplay from "./components/ClockDisplay";
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

function toLocalYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayYMD() {
  return toLocalYMD(new Date());
}

function yesterdayYMD() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalYMD(d);
}

export default function App() {
  const [screen, setScreen] = useState("tasks");
  const [allDucks, setAllDucks] = useState([]);
  const [ducksLoading, setDucksLoading] = useState(true);
  const [ducksError, setDucksError] = useState(null);
  const [startupMessage, setStartupMessage] = useState(null);

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

      // Check if all of yesterday's tasks were completed — award bonus if so
      const yesterdaysTasks = getTasksForDate(yesterday);
      if (yesterdaysTasks.length > 0 && yesterdaysTasks.every((t) => t.completed)) {
        addCoins(5);
        setStartupMessage({
          text: "You completed all your tasks yesterday!",
          subtext: "+5 bonus coins added to your balance.",
        });
      }

      // Penalise incomplete tasks by their coin value from the previous day
      const penaltyDay = lastOpenedDate >= yesterday ? lastOpenedDate : yesterday;
      const penaltyAmount = processDayReset(penaltyDay);
      if (penaltyAmount > 0) addCoins(-penaltyAmount);
    }

    setLastOpenedDate(today);
  }, []); // eslint-disable-line

  const today = todayYMD();
  const todayTasks = useMemo(() => getTasksForDate(today), [tasks, today]); // eslint-disable-line
  const pondDuckIds = useMemo(() => {
    const earnedMasteryIds = Object.entries(inventory.trophyCounts || {})
      .filter(([, count]) => count > 0)
      .map(([duckId]) => duckId);

    return Array.from(new Set([...inventory.owned, ...earnedMasteryIds]));
  }, [inventory.owned, inventory.trophyCounts]);

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
            ownedDuckIds={pondDuckIds}
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
              <Bird size={32} className="animate-bob mx-auto mb-2 text-emerald-400" />
              <p className="text-sm text-slate-400">Loading duckies...</p>
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

      {/* Startup notification — shown once per new day if bonus was earned */}
      {startupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass rounded-2xl p-8 text-center max-w-xs mx-4 animate-slideUp">
            <PartyPopper size={40} className="mx-auto mb-3 text-yellow-300" />
            <h3 className="text-lg font-black text-emerald-400">Great work!</h3>
            <p className="text-slate-300 text-sm mt-2">{startupMessage.text}</p>
            <p className="text-yellow-300 font-bold mt-3">{startupMessage.subtext}</p>
            <button
              onClick={() => setStartupMessage(null)}
              className="mt-5 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
            >
              Collect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
