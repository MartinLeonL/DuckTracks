import React, { useState, useMemo } from "react";
import { Trophy } from "lucide-react";
import Podium from "../components/Podium";

const RARITIES = ["common", "rare", "epic", "legendary", "mythic"];

export default function CollectionScreen({ allDucks, ownedIds, getTrophyCount }) {
  const [view, setView] = useState("owned");

  const trophyDucks = useMemo(
    () => allDucks.filter((d) => d.name?.toLowerCase().includes("master")),
    [allDucks]
  );

  const regularDucks = useMemo(
    () => allDucks.filter((d) => !d.name?.toLowerCase().includes("master")),
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

  const ownedTrophies = trophyDucks.filter((d) => getTrophyCount(d.id) > 0);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-5">
      {ownedTrophies.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Trophy size={12} /> Rarity Masters
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ownedTrophies.map((duck) => (
              <Podium
                key={duck.id}
                duck={duck}
                owned={true}
                isTrophy={true}
                trophyCount={getTrophyCount(duck.id)}
              />
            ))}
          </div>
        </section>
      )}

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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ducks.map((duck) => (
                <Podium
                  key={duck.id}
                  duck={duck}
                  owned={ownedIds.includes(duck.id)}
                  isTrophy={false}
                />
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