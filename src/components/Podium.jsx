import React from "react";
import DuckSprite from "./DuckSprite";

const RARITY_STYLES = {
  common:    { podiumBg: "bg-green-900",  podiumBorder: "border-green-600",  labelColor: "text-green-400",  glowClass: "podium-glow-common",    badge: "bg-green-900/60 text-green-300 border-green-700",    label: "Common"    },
  rare:      { podiumBg: "bg-blue-900",   podiumBorder: "border-blue-600",   labelColor: "text-blue-400",   glowClass: "podium-glow-rare",       badge: "bg-blue-900/60 text-blue-300 border-blue-700",       label: "Rare"      },
  epic:      { podiumBg: "bg-purple-900", podiumBorder: "border-purple-600", labelColor: "text-purple-400", glowClass: "podium-glow-epic",       badge: "bg-purple-900/60 text-purple-300 border-purple-700", label: "Epic"      },
  legendary: { podiumBg: "bg-yellow-900", podiumBorder: "border-yellow-600", labelColor: "text-yellow-400", glowClass: "podium-glow-legendary",  badge: "bg-yellow-900/60 text-yellow-300 border-yellow-700", label: "Legendary" },
  mythic:    { podiumBg: "bg-red-900",    podiumBorder: "border-red-700",    labelColor: "text-red-400",    glowClass: "podium-glow-mythic",     badge: "bg-red-900/60 text-red-300 border-red-800",          label: "Mythic"    },
};

export default function Podium({ duck, owned, trophyCount = 0, isTrophy = false }) {
  const style = RARITY_STYLES[duck.rarity] || RARITY_STYLES.common;
  const silhouette = !owned;

  return (
    <div className="flex flex-col items-center gap-0">
      <div
        className={`relative ${owned ? "animate-bob" : ""}`}
        style={{ animationDelay: `${Math.random() * 2}s` }}
      >
        <DuckSprite duck={duck} size={64} silhouette={silhouette} />
        {isTrophy && trophyCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-lg leading-none">
            {trophyCount}
          </span>
        )}
      </div>

      <div
        className={`w-full rounded-t-lg border-t border-x ${style.podiumBg} ${style.podiumBorder} ${
          owned ? style.glowClass : ""
        } px-2 pt-1.5 pb-2 text-center`}
        style={{ minWidth: 72 }}
      >
        <p className={`text-xs font-semibold leading-tight truncate ${
          silhouette ? "text-slate-500" : style.labelColor
        }`}>
          {silhouette ? "???" : duck.name}
        </p>
        <span className={`text-[10px] mt-0.5 inline-block px-1.5 py-px rounded border ${style.badge}`}>
          {style.label}
        </span>
      </div>
    </div>
  );
}