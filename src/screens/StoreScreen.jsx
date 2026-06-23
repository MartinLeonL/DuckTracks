import React, { useState, useCallback } from "react";
import { Coins, Shuffle, Trophy } from "lucide-react";
import GachaReveal from "../components/GachaReveal";

const ROLL_COST = 1;

const RARITY_RATES_ROLL = [
  { rarity: "mythic",    chance: 0.02 },
  { rarity: "legendary", chance: 0.08 },
  { rarity: "epic",      chance: 0.15 },
  { rarity: "rare",      chance: 0.30 },
  { rarity: "common",    chance: 0.45 },
];

const RARITY_RATES_DISPLAY = [
  { rarity: "common",    chance: 0.45 },
  { rarity: "rare",      chance: 0.30 },
  { rarity: "epic",      chance: 0.15 },
  { rarity: "legendary", chance: 0.08 },
  { rarity: "mythic",    chance: 0.02 },
];

// Must match the `name` values seeded in the DB exactly
const TROPHY_NAME_MAP = {
  common:    "The Common Master Duck",
  rare:      "The Rare Master Duck",
  epic:      "The Epic Master Duck",
  legendary: "The Legendary Master Duck",
  mythic:    "The Mythic Master Duck",
};

const TROPHY_NAMES = new Set(Object.values(TROPHY_NAME_MAP));

function rollRarity() {
  const r = Math.random();
  let cumulative = 0;
  for (const { rarity, chance } of RARITY_RATES_ROLL) {
    cumulative += chance;
    if (r < cumulative) return rarity;
  }
  return "common";
}

export default function StoreScreen({
  coins,
  allDucks,
  ownedIds,
  spendCoins,
  addDuck,
  incrementTrophy,
  getTrophyCount,
}) {
  const [reveal, setReveal] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const canRoll = coins >= ROLL_COST;

  const trophyDucks = allDucks.filter((d) => TROPHY_NAMES.has(d.name));
  const regularDucks = allDucks.filter((d) => !TROPHY_NAMES.has(d.name));

  const handleRoll = useCallback(() => {
    if (!canRoll || isRolling) return;
    setIsRolling(true);

    const rarity = rollRarity();
    const rarityPool = regularDucks.filter((d) => d.rarity === rarity);
    const unowned = rarityPool.filter((d) => !ownedIds.includes(d.id));

    if (unowned.length > 0) {
      // Still regular ducks to collect — give one of those
      const duck = unowned[Math.floor(Math.random() * unowned.length)];
      spendCoins(ROLL_COST);
      addDuck(duck.id);
      setReveal({ duck, isTrophy: false, trophyCount: 0 });
    } else if (rarityPool.length > 0) {
      // All regular ducks of this rarity are owned — award trophy duck
      const trophyDuck = trophyDucks.find((d) => d.name === TROPHY_NAME_MAP[rarity]);
      if (trophyDuck) {
        spendCoins(ROLL_COST);
        const newCount = getTrophyCount(trophyDuck.id) + 1;
        incrementTrophy(trophyDuck.id);
        setReveal({ duck: trophyDuck, isTrophy: true, trophyCount: newCount });
      } else {
        // Trophy duck not found in DB — just don't charge and warn
        console.warn("No trophy duck found for rarity:", rarity);
      }
    } else {
      // No ducks of this rarity exist in DB at all — shouldn't happen
      console.warn("No ducks found for rarity:", rarity);
    }

    setIsRolling(false);
  }, [canRoll, isRolling, regularDucks, trophyDucks, ownedIds, spendCoins, addDuck, getTrophyCount, incrementTrophy]);

  const totalRegular = regularDucks.length;
  const ownedRegular = regularDucks.filter((d) => ownedIds.includes(d.id)).length;
  const pct = totalRegular > 0 ? Math.round((ownedRegular / totalRegular) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 space-y-6">
      {/* Header card */}
      <div className="glass rounded-2xl p-5 text-center">
        <h2 className="text-xl font-black text-slate-100">Ducky Roll</h2>
        <p className="text-sm text-slate-400 mt-1">
          Roll for a chance to collect a rare rubber ducky!
        </p>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-yellow-300 font-semibold">
          <Coins size={16} />
          <span>{coins} coins</span>
        </div>
      </div>

      {/* Roll button */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleRoll}
          disabled={!canRoll}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${
            canRoll
              ? "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white active:scale-95"
              : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }`}
        >
          <Shuffle size={22} />
          <span>Roll Ducky</span>
          <span className="inline-flex items-center gap-1">
            {ROLL_COST}
            <Coins size={18} />
          </span>
        </button>
        {!canRoll && (
          <p className="text-xs text-slate-500">
            Need {ROLL_COST - coins} more coin{ROLL_COST - coins !== 1 ? "s" : ""} to roll.
          </p>
        )}
      </div>

      {/* Drop rates */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Drop Rates
        </h3>
        <div className="space-y-1.5">
          {RARITY_RATES_DISPLAY.map(({ rarity, chance }) => {
            const pool = regularDucks.filter((d) => d.rarity === rarity);
            const unowned = pool.filter((d) => !ownedIds.includes(d.id));
            const complete = unowned.length === 0 && pool.length > 0;

            return (
              <div
                key={rarity}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg rarity-${rarity}`}
                style={{ background: "var(--rarity-bg)" }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "var(--rarity-color)" }}
                />
                <span className="flex-1 text-sm font-medium text-slate-200 capitalize">
                  {rarity}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--rarity-color)" }}
                >
                  {(chance * 100).toFixed(0)}%
                </span>
                {complete ? (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    <Trophy size={11} /> Complete
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">
                    {unowned.length}/{pool.length} left
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Complete a rarity to unlock its Master Duck trophy!
        </p>
      </section>

      {/* Collection progress */}
      <section className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-300">Collection Progress</h3>
          <span className="text-sm font-bold text-emerald-400">
            {ownedRegular}/{totalRegular}
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5 text-right">{pct}% complete</p>
      </section>

      {reveal && (
        <GachaReveal
          duck={reveal.duck}
          isTrophy={reveal.isTrophy}
          trophyCount={reveal.trophyCount}
          onClose={() => setReveal(null)}
        />
      )}
    </div>
  );
}
