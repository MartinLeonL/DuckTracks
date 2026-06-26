import React, { useState, useEffect, useRef, useMemo } from "react";
import { Bird, CheckSquare, Calendar, Coins, Package, PartyPopper, ShoppingBag, UserCircle } from "lucide-react";

import { fetchAllDucks } from "./supabaseClient.js";
import { useCoins, useTasks, useDuckInventory, useLastOpenedDate } from "./hooks/useLocalStorage.js";
import { useAuth } from "./hooks/useAuth.js";
import { useCloudSync } from "./hooks/useCloudSync.js";

import CoinDisplay from "./components/CoinDisplay.jsx";
import ClockDisplay from "./components/ClockDisplay.jsx";
import TasksScreen from "./screens/TasksScreen.jsx";
import CalendarScreen from "./screens/CalendarScreen.jsx";
import CollectionScreen from "./screens/CollectionScreen.jsx";
import StoreScreen from "./screens/StoreScreen.jsx";
import AccountScreen from "./screens/AccountScreen.jsx";
import AuthScreen from "./screens/AuthScreen.jsx";

const NAV_ITEMS = [
  { id: "tasks",      label: "Tasks",      Icon: CheckSquare },
  { id: "calendar",   label: "Calendar",   Icon: Calendar    },
  { id: "collection", label: "Collection", Icon: Package     },
  { id: "store",      label: "Store",      Icon: ShoppingBag },
  { id: "account",    label: "Account",    Icon: UserCircle  },
];

function toLocalYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function todayYMD() { return toLocalYMD(new Date()); }
function yesterdayYMD() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toLocalYMD(d);
}

function LoadingScreen({ message = "Loading DuckTracks…" }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3">
      <Bird size={40} className="text-emerald-400 animate-bob" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

export default function App() {
  const {
    session, profile, user,
    loading: authLoading,
    signIn, signUp, signOut,
    updatePassword, updateUsername, updateName,
  } = useAuth();
  const userId = user?.id ?? null;

  const [screen, setScreen] = useState("tasks");
  const [allDucks, setAllDucks] = useState([]);
  const [ducksLoading, setDucksLoading] = useState(true);
  const [ducksError, setDucksError] = useState(null);
  const [startupMessage, setStartupMessage] = useState(null);
  // true while we're hydrating state from the cloud on first login
  const [cloudLoading, setCloudLoading] = useState(false);
  const cloudLoadedRef = useRef(false); // prevent double-load on re-renders

  const { coins, setCoins, addCoins, spendCoins, resetCoins } = useCoins(userId);
  const {
    tasks, setTasks,
    addTask, updateTask, updateRepeatingTask,
    deleteTask, completeTask,
    getTasksForDate, processDayReset, resetTasks,
  } = useTasks(userId);
  const {
    inventory, setInventory,
    addDuck, incrementTrophy, getTrophyCount, resetInventory,
  } = useDuckInventory(userId);
  const [lastOpenedDate, setLastOpenedDate] = useLastOpenedDate(userId);

  const { saveToCloud, loadFromCloud, clearCloudData } = useCloudSync(userId);

  // ─── Load duck catalog ───────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    setDucksLoading(true);
    fetchAllDucks()
      .then((data) => { if (!cancelled) { setAllDucks(data); setDucksLoading(false); } })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load duckies:", err);
          setDucksError("Could not load ducky catalog. Check your Supabase config.");
          setDucksLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [session]);

  // ─── Hydrate from cloud on login ─────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      cloudLoadedRef.current = false;
      return;
    }
    if (cloudLoadedRef.current) return;
    cloudLoadedRef.current = true;

    (async () => {
      setCloudLoading(true);
      const cloudData = await loadFromCloud();
      if (cloudData) {
        if (cloudData.coins !== undefined) setCoins(cloudData.coins);
        if (cloudData.tasks !== undefined) setTasks(cloudData.tasks);
        if (cloudData.inventory !== undefined) setInventory(cloudData.inventory);
        if (cloudData.lastOpenedDate !== undefined) setLastOpenedDate(cloudData.lastOpenedDate);
      }
      setCloudLoading(false);
    })();
  }, [userId]); // eslint-disable-line

  // ─── Save to cloud whenever state changes ────────────────────────────────
  // Skip saving while we're still loading from cloud (would overwrite with stale localStorage)
  const isHydrated = !cloudLoading && cloudLoadedRef.current;

  useEffect(() => {
    if (!isHydrated) return;
    saveToCloud({ coins, tasks, inventory, lastOpenedDate });
  }, [coins, tasks, inventory, lastOpenedDate, isHydrated]); // eslint-disable-line

  // ─── Day-change startup check ─────────────────────────────────────────────
  // Runs after hydration so we're working with cloud data, not stale localStorage
  const dayCheckDoneRef = useRef(false);
  useEffect(() => {
    if (!userId || !isHydrated || dayCheckDoneRef.current) return;
    dayCheckDoneRef.current = true;

    const today = todayYMD();
    if (lastOpenedDate === today) return;

    if (lastOpenedDate && lastOpenedDate < today) {
      const yesterday = yesterdayYMD();
      const yesterdaysTasks = getTasksForDate(yesterday);
      const earnedBonus = yesterdaysTasks.length > 0 && yesterdaysTasks.every((t) => t.completed);

      if (earnedBonus) addCoins(5);

      const penaltyDay = lastOpenedDate >= yesterday ? lastOpenedDate : yesterday;
      const penaltyAmount = processDayReset(penaltyDay);
      if (penaltyAmount > 0) addCoins(-penaltyAmount);

      if (earnedBonus) {
        setStartupMessage({
          type: "bonus",
          title: "Great work!",
          text: "You completed all your tasks yesterday!",
          subtext: "+5 bonus coins added to your balance.",
        });
      } else if (penaltyAmount > 0) {
        setStartupMessage({
          type: "penalty",
          title: "Daily reset",
          text: "Some tasks were unfinished yesterday.",
          subtext: `-${penaltyAmount} coin${penaltyAmount !== 1 ? "s" : ""} removed from your balance.`,
        });
      }
    }

    setLastOpenedDate(today);
  }, [isHydrated, userId]); // eslint-disable-line

  // Reset day-check ref on logout so it runs again next login
  useEffect(() => {
    if (!userId) dayCheckDoneRef.current = false;
  }, [userId]);

  // ─── Derived state ────────────────────────────────────────────────────────
  const today = todayYMD();
  const todayTasks = useMemo(() => getTasksForDate(today), [tasks, today]); // eslint-disable-line
  const pondDuckIds = useMemo(() => {
    const earnedMasteryIds = Object.entries(inventory.trophyCounts || {})
      .filter(([, count]) => count > 0)
      .map(([duckId]) => duckId);
    return Array.from(new Set([...inventory.owned, ...earnedMasteryIds]));
  }, [inventory.owned, inventory.trophyCounts]);

  const handleResetData = async () => {
    resetCoins();
    resetTasks();
    resetInventory();
    await clearCloudData();
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (authLoading) return <LoadingScreen />;
  if (!session) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  if (cloudLoading) return <LoadingScreen message="Syncing your data…" />;

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
        {screen === "account" && (
          <AccountScreen
            user={user}
            profile={profile}
            coins={coins}
            ownedDuckCount={inventory.owned.length}
            onSignOut={signOut}
            onUpdateUsername={updateUsername}
            onUpdateName={updateName}
            onUpdatePassword={updatePassword}
            onResetData={handleResetData}
          />
        )}

        {ducksLoading && screen !== "tasks" && screen !== "account" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 z-20">
            <div className="text-center">
              <Bird size={32} className="animate-bob mx-auto mb-2 text-emerald-400" />
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

      {startupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass rounded-2xl p-8 text-center max-w-xs mx-4 animate-slideUp">
            {startupMessage.type === "penalty" ? (
              <Coins size={40} className="mx-auto mb-3 text-red-300" />
            ) : (
              <PartyPopper size={40} className="mx-auto mb-3 text-yellow-300" />
            )}
            <h3 className={`text-lg font-black ${startupMessage.type === "penalty" ? "text-red-300" : "text-emerald-400"}`}>
              {startupMessage.title}
            </h3>
            <p className="text-slate-300 text-sm mt-2">{startupMessage.text}</p>
            <p className={`font-bold mt-3 ${startupMessage.type === "penalty" ? "text-red-300" : "text-yellow-300"}`}>
              {startupMessage.subtext}
            </p>
            <button
              onClick={() => setStartupMessage(null)}
              className="mt-5 px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
            >
              {startupMessage.type === "penalty" ? "Continue" : "Collect"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}