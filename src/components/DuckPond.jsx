import React, { useState, useEffect, useRef, useMemo } from "react";
import DuckSprite from "./DuckSprite";

// How often (ms) each duck picks a new waypoint
const WAYPOINT_INTERVAL = 4000;
// Movement speed in % of pond per second
const SPEED = 3.5;
// Wobble amplitude in degrees
const WOBBLE_DEG = 7;
// Wobble period in ms
const WOBBLE_PERIOD = 2200;

const MASTERY_GLOWS = {
  common: "rgba(34, 197, 94, 0.45)",
  rare: "rgba(59, 130, 246, 0.45)",
  epic: "rgba(168, 85, 247, 0.45)",
  legendary: "rgba(234, 179, 8, 0.48)",
  mythic: "rgba(239, 68, 68, 0.5)",
};

function randomWaypoint() {
  return {
    x: Math.random() * 76 + 12,
    y: Math.random() * 52 + 20,
  };
}

function initDuck(duck) {
  return {
    id: duck.id,
    duck,
    x: Math.random() * 76 + 12,
    y: Math.random() * 52 + 20,
    targetX: Math.random() * 76 + 12,
    targetY: Math.random() * 52 + 20,
    facingLeft: false,
    wobbleOffset: Math.random() * Math.PI * 2, // phase offset so ducks don't all bob together
    restTimer: 0, // counts down ms until duck picks next waypoint
  };
}

export default function DuckPond({ ownedDucks = [] }) {
  const pondDucks = useMemo(() => {
    if (ownedDucks.length === 0) return [];
    const shuffled = [...ownedDucks].sort(() => Math.random() - 0.5);
    const count = window.innerWidth >= 640 ? 5 : 3;
    return shuffled.slice(0, count);
  }, [ownedDucks.length]); // eslint-disable-line

  const [duckStates, setDuckStates] = useState(() => pondDucks.map(initDuck));
  const [tick, setTick] = useState(0); // drives re-render for wobble
  const lastTimeRef = useRef(null);
  const rafRef = useRef(null);

  // Re-init when the duck list changes
  useEffect(() => {
    setDuckStates(pondDucks.map(initDuck));
  }, [pondDucks.length]); // eslint-disable-line

  useEffect(() => {
    if (pondDucks.length === 0) return;

    function frame(timestamp) {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const dt = Math.min(timestamp - lastTimeRef.current, 100); // cap at 100ms to avoid jumps
      lastTimeRef.current = timestamp;

      setDuckStates((prev) =>
        prev.map((d) => {
          const dx = d.targetX - d.x;
          const dy = d.targetY - d.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // How far to move this frame (% units)
          const step = (SPEED * dt) / 1000;

          if (dist < 0.5) {
            // Reached target — rest a bit then pick new waypoint
            const newRest = d.restTimer - dt;
            if (newRest <= 0) {
              const wp = randomWaypoint();
              return { ...d, targetX: wp.x, targetY: wp.y, restTimer: 800 + Math.random() * 2000 };
            }
            return { ...d, restTimer: newRest };
          }

          // Move toward target
          const nx = d.x + (dx / dist) * Math.min(step, dist);
          const ny = d.y + (dy / dist) * Math.min(step, dist);

          return {
            ...d,
            x: nx,
            y: ny,
            facingLeft: dx < 0,
          };
        })
      );

      setTick(timestamp); // trigger wobble re-render
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pondDucks.length]); // eslint-disable-line

  const isEmpty = pondDucks.length === 0;

  return (
    <div
      className="relative isolate w-full rounded-2xl overflow-hidden border border-cyan-900/60"
      style={{ height: 150 }}
    >
      {/* Deep pond water */}
      <div
        className="absolute inset-0"
        style={{
          background: isEmpty
            ? "linear-gradient(180deg, #021a19 0%, #010f0f 100%)"
            : "linear-gradient(180deg, #083344 0%, #0c4a6e 40%, #075985 100%)",
        }}
      />

      {/* Edge tint */}
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
        duckStates.map((d) => {
          // Wobble: bob up/down + slight tilt while moving
          const t = tick / 1000;
          const bobY = Math.sin((t * (2 * Math.PI)) / (WOBBLE_PERIOD / 1000) + d.wobbleOffset) * 3;
          const tiltDeg =
            Math.sin((t * (2 * Math.PI)) / (WOBBLE_PERIOD / 1000) + d.wobbleOffset) * WOBBLE_DEG;

          // Only tilt while actually moving (dist > 0.5)
          const dx = d.targetX - d.x;
          const dy = d.targetY - d.y;
          const moving = Math.sqrt(dx * dx + dy * dy) > 0.5;
          const tilt = moving ? tiltDeg * 0.5 : tiltDeg * 0.15;

          const flipX = d.facingLeft ? -1 : 1;
          const isMasteryDuck = d.duck.name.endsWith("Mastery Duck");
          const masteryGlow = MASTERY_GLOWS[d.duck.rarity] || MASTERY_GLOWS.common;

          return (
            <div
              key={d.id}
              className="absolute"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                transform: `translate(-50%, calc(-50% + ${bobY}px))`,
                zIndex: Math.round(d.y),
                willChange: "transform, left, top",
              }}
            >
              {/* Shadow ripple under duck */}
              <div
                className="absolute rounded-full bg-black/20 blur-sm"
                style={{
                  width: 36,
                  height: 8,
                  bottom: -2,
                  left: "50%",
                  transform: `translateX(-50%) scaleX(${0.8 + Math.abs(Math.sin(t * 2 + d.wobbleOffset)) * 0.4})`,
                }}
              />
              {/* Duck sprite with flip + tilt */}
              <div
                className="relative"
                style={{
                  transform: `scaleX(${flipX}) rotate(${tilt * flipX}deg)`,
                  transformOrigin: "center bottom",
                  transition: "transform 0.3s ease-out",
                }}
              >
                {isMasteryDuck && (
                  <div
                    className="absolute inset-0 rounded-full blur-md"
                    style={{
                      background: `radial-gradient(circle, ${masteryGlow} 0%, transparent 68%)`,
                      transform: "scale(1.25)",
                    }}
                  />
                )}
                <DuckSprite duck={d.duck} size={64} />
              </div>
            </div>
          );
        })
      )}

      <div className="absolute bottom-1 right-2 text-cyan-600/50 text-xs font-mono select-none">
        ducky pond
      </div>
    </div>
  );
}
