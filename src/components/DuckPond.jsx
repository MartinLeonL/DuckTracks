import React, { useMemo } from "react";
import DuckSprite from "./DuckSprite";

const SWIM_ANIMS = [
  "animate-swim1",
  "animate-swim2",
  "animate-swim3",
  "animate-swim4",
  "animate-swim5",
];

const POSITIONS = [
  { left: "15%", top: "38%" },
  { left: "35%", top: "56%" },
  { left: "55%", top: "32%" },
  { left: "72%", top: "55%" },
  { left: "82%", top: "36%" },
];

export default function DuckPond({ ownedDucks = [] }) {
  const pondDucks = useMemo(() => {
    if (ownedDucks.length === 0) return [];
    const shuffled = [...ownedDucks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, [ownedDucks.length]); // eslint-disable-line

  const isEmpty = pondDucks.length === 0;

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-cyan-900/60"
      style={{ height: 150 }}
    >
      {/* Deep pond water base */}
      <div
        className="absolute inset-0"
        style={{
          background: isEmpty
            ? "linear-gradient(180deg, #021a19 0%, #010f0f 100%)"
            : "linear-gradient(180deg, #083344 0%, #0c4a6e 40%, #075985 100%)",
        }}
      />

      {/* Subtle green tint at edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(20,83,45,0.3) 0%, transparent 70%)",
        }}
      />

      {/* Water surface highlight */}
      <div
        className="absolute inset-x-0 top-0 h-6 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(186,230,253,0.12) 0%, transparent 100%)",
        }}
      />

      {/* Moving light shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-3 pointer-events-none overflow-hidden"
        style={{ opacity: 0.35 }}
      >
        <div
          className="absolute inset-y-0 w-1/2"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(186,230,253,0.6) 50%, transparent 100%)",
            animation: "waterWave 4s linear infinite",
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 top-2 h-2 pointer-events-none overflow-hidden"
        style={{ opacity: 0.2 }}
      >
        <div
          className="absolute inset-y-0 w-1/3"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(186,230,253,0.8) 50%, transparent 100%)",
            animation: "waterWave 6s linear infinite reverse",
          }}
        />
      </div>

      {isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-cyan-200 text-sm font-medium">Your pond is empty!</p>
          <p className="text-cyan-500 text-xs mt-0.5">Roll the store to get your first ducky.</p>
        </div>
      ) : (
        pondDucks.map((duck, idx) => (
          <div
            key={duck.id}
            className={`absolute ${SWIM_ANIMS[idx]}`}
            style={{
              ...POSITIONS[idx],
              transform: "translateX(-50%)",
              animationDelay: `${idx * 1.3}s`,
            }}
          >
            <div
              className="absolute rounded-full bg-black/20 blur-sm"
              style={{ width: 36, height: 8, bottom: -4, left: "50%", transform: "translateX(-50%)" }}
            />
            <DuckSprite duck={duck} size={56} />
          </div>
        ))
      )}

      <div className="absolute bottom-1 right-2 text-cyan-600/50 text-xs font-mono select-none">
        ducky pond
      </div>
    </div>
  );
}