import React, { useState, useMemo } from "react";
import { Trophy } from "lucide-react";
import Podium from "../components/Podium";

const RARITIES = ["common", "rare", "epic", "legendary", "mythic"];
const RARITY_RANK = Object.fromEntries(
  RARITIES.map((rarity, index) => [rarity, index])
);

// Must match DB names exactly (same constant as StoreScreen)
const TROPHY_NAMES = new Set([
  "Common Mastery Duck",
  "Rare Mastery Duck",
  "Epic Mastery Duck",
  "Legendary Mastery Duck",
  "Mythic Mastery Duck",
]);

export default function CollectionScreen({ allDucks, ownedIds, getTrophyCount }) {
  const [view, setView] = useState("owned");

  const trophyDucks = useMemo(
    () => allDucks.filter((d) => TROPHY_NAMES.has(d.name)),
    [allDucks]
  );

  const regularDucks = useMemo(
    () => allDucks.filter((d) => !TROPHY_NAMES.has(d.name)),
    [allDucks]
  );

  const displayDucks = useMemo(() => {
    if (view === "owned") return regularDucks.filter((d) => ownedIds.includes(d.id));
    return regularDucks;
  }, [view, regularDucks, ownedIds]);

  const byRarity = useMemo(() => {
    return RARITIES.reduce((acc, r) => {
      acc[r] = displayDucks.filter((d) => d.rarity === r);
      return acc;
    }, {});
  }, [displayDucks]);

  // Only show trophy ducks the user has actually earned (trophyCount > 0)
  const earnedTrophies = trophyDucks
    .filter((d) => getTrophyCount(d.id) > 0)
    .sort(
      (a, b) =>
        (RARITY_RANK[a.rarity] ?? RARITIES.length) -
        (RARITY_RANK[b.rarity] ?? RARITIES.length)
    );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-5">
      {/* Rarity Masters section — only visible once at least one trophy is earned */}
      {earnedTrophies.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Trophy size={12} className="text-yellow-400" />
            <span className="text-yellow-400">Rarity Masters</span>
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Awarded for collecting every duck of a rarity.
          </p>
          <div className="-mx-4 flex items-end gap-3 overflow-x-auto overflow-y-hidden bg-slate-950/35 px-6 pt-3">
            {earnedTrophies.map((duck) => (
              <div key={duck.id} className="w-44 shrink-0 sm:w-48">
                <Podium
                  duck={duck}
                  owned={true}
                  isTrophy={true}
                  trophyCount={getTrophyCount(duck.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("owned")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            view === "owned"
              ? "bg-emerald-700 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Owned ({regularDucks.filter((d) => ownedIds.includes(d.id)).length})
        </button>
        <button
          onClick={() => setView("all")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            view === "all"
              ? "bg-slate-600 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          All Duckies ({regularDucks.length})
        </button>
      </div>

      {/* Ducks by rarity */}
      {RARITIES.map((rarity) => {
        const ducks = byRarity[rarity];
        if (ducks.length === 0) return null;
        return (
          <section key={rarity}>
            <h2
              className={`text-xs font-semibold uppercase tracking-wider mb-3 rarity-${rarity}`}
              style={{ color: "var(--rarity-color)" }}
            >
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)} ({ducks.length})
            </h2>
            <div className="-mx-4 flex items-end gap-3 overflow-x-auto overflow-y-hidden bg-slate-950/35 px-6 pt-3">
              {ducks.map((duck) => (
                <div key={duck.id} className="w-32 shrink-0 sm:w-36">
                  <Podium
                    duck={duck}
                    owned={ownedIds.includes(duck.id)}
                    isTrophy={false}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {displayDucks.length === 0 && (
        <div className="text-center py-16 text-slate-600">
          <p className="text-sm font-medium">No duckies yet!</p>
          <p className="text-xs mt-1">Roll the store to start your collection.</p>
        </div>
      )}
    </div>
  );
}
