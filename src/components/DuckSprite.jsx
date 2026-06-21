import React from "react";
import { SPRITE_URL, SPRITE_CELL } from "../supabaseClient";

export default function DuckSprite({ duck, size = 200, silhouette = false, className = "", columns = 20 }) {
  if (!duck) return null;

  const scale = size / SPRITE_CELL;
  const bgX = -(duck.sprite_col * SPRITE_CELL * scale);
  const bgY = -(duck.sprite_row * SPRITE_CELL * scale);

  const style = {
    width: size,
    height: size,
    backgroundImage: `url(${SPRITE_URL})`,
    backgroundPosition: `${bgX}px ${bgY}px`,
    backgroundSize: `${SPRITE_CELL * columns * scale}px auto`,
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
    filter: silhouette ? "brightness(0) saturate(0)" : undefined,
    flexShrink: 0,
  };

  return (
    <div
      className={`duck-sprite ${className}`}
      style={style}
      aria-label={silhouette ? "Unknown ducky" : duck.name}
    />
  );
}