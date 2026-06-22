import React, { useState, useEffect, useMemo } from "react";
import DuckSprite from "./DuckSprite";

export default function DuckPond({ ownedDucks = [] }) {
  const pondDucks = useMemo(() => {
    if (ownedDucks.length === 0) return [];
    const shuffled = [...ownedDucks].sort(() => Math.random() - 0.5);
    // show 5 ducks if screen is large enough, otherwise 3
    const count = window.innerWidth >= 640 ? 5 : 3;
    return shuffled.slice(0, count);
  }, [ownedDucks.length]); // eslint-disable-line

  // Manage swimming state: coordinates and direction
  const [duckStates, setDuckStates] = useState([]);

  // Initialize random starting positions
  useEffect(() => {
    setDuckStates(
      pondDucks.map((duck) => ({
        id: duck.id,
        duck,
        x: Math.random() * 80 + 10, // Keep them away from the absolute edges
        y: Math.random() * 60 + 20,
        scaleX: 1, // 1 = facing right, -1 = facing left
      }))
    );
  }, [pondDucks]);
  
  // Swim interval
  useEffect(() => {
    if (duckStates.length === 0) return;
    const interval = setInterval(() => {
      setDuckStates((prev) =>
        prev.map((d) => {
          // Give them a 30% chance to just chill instead of moving every tick
          if (Math.random() > 0.7) return d;
          
          const newX = Math.random() * 80 + 10;
          const newY = Math.random() * 60 + 20;
          
          return {
            ...d,
            x: newX,
            y: newY,
            scaleX: newX < d.x ? -1 : 1, // Flip to face left if moving left!
          };
        })
      );
    }, 8000); // Pick a new spot every 8 seconds

    return () => clearInterval(interval);
  }, [duckStates.length]);

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

      {isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-cyan-200 text-sm font-medium">Your pond is empty!</p>
          <p className="text-cyan-500 text-xs mt-0.5">Roll the store to get your first ducky.</p>
        </div>
      ) : (
        duckStates.map((d) => (
          <div
            key={d.id}
            className="absolute transition-all duration-[8000ms] ease-in-out"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: Math.round(d.y), // Ducks lower down appear in front
            }}
          >
            <div style={{ transform: `scaleX(${d.scaleX})`, transition: 'transform 0.4s ease-in-out' }}>
              <div
                className="absolute rounded-full bg-black/20 blur-sm"
                style={{ width: 36, height: 8, bottom: -4, left: "50%", transform: "translateX(-50%)" }}
              />
              <DuckSprite duck={d.duck} size={64} />
            </div>
          </div>
        ))
      )}

      <div className="absolute bottom-1 right-2 text-cyan-600/50 text-xs font-mono select-none">
        ducky pond
      </div>
    </div>
  );
}