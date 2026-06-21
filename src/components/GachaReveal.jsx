import React, { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import DuckSprite from "./DuckSprite";

const RARITY_STYLES = {
  common:    { label: "text-green-300",  border: "border-green-500",  bg: "bg-green-900/40"  },
  rare:      { label: "text-blue-300",   border: "border-blue-500",   bg: "bg-blue-900/40"   },
  epic:      { label: "text-purple-300", border: "border-purple-500", bg: "bg-purple-900/40" },
  legendary: { label: "text-yellow-300", border: "border-yellow-500", bg: "bg-yellow-900/40" },
  mythic:    { label: "text-red-300",    border: "border-red-500",    bg: "bg-red-900/40"    },
};

const RARITY_LABELS = {
  common:    "Common",
  rare:      "Rare!",
  epic:      "Epic!!",
  legendary: "Legendary!!!",
  mythic:    "Mythic!!!",
};

export default function GachaReveal({ duck, isTrophy, trophyCount, onClose }) {
  const [phase, setPhase] = useState("shake");

  useEffect(() => {
    const t = setTimeout(() => setPhase("reveal"), 2500);
    return () => clearTimeout(t);
  }, []);

  const rs = RARITY_STYLES[duck.rarity] || RARITY_STYLES.common;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="flex flex-col items-center gap-6 px-6">
        {phase === "shake" && (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-giftShake">
              <Gift size={96} className="text-emerald-400" strokeWidth={1.5} />
            </div>
            <p className="text-slate-400 text-sm animate-fadeIn">Something's inside...</p>
          </div>
        )}

        {phase === "reveal" && (
          <div className="flex flex-col items-center gap-5 animate-revealBox">
            <div className={`p-6 rounded-3xl border-2 ${rs.border} ${rs.bg} shadow-2xl`}>
              <div className="animate-duckReveal">
                <DuckSprite duck={duck} size={96} />
              </div>
            </div>

            <div className="text-center">
              <p className={`text-2xl font-black ${rs.label}`}>{duck.name}</p>
              <p className={`text-sm font-semibold mt-1 ${rs.label} opacity-70`}>
                {RARITY_LABELS[duck.rarity]}
              </p>
              {isTrophy && trophyCount === 1 && (
                <p className="text-yellow-300 text-sm mt-2">
                  Rarity Mastered! You own every {duck.rarity} ducky!
                </p>
              )}
              {isTrophy && trophyCount > 1 && (
                <p className="text-yellow-300 text-sm mt-2">
                  Trophy ×{trophyCount} — Keep collecting!
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-colors"
            >
              Nice!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}