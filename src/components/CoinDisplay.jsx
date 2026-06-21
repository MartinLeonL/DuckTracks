/**
 * CoinDisplay.jsx
 * Shows the user's current coin balance with a gold coin icon.
 */
import React from "react";

export default function CoinDisplay({ coins }) {
  const isNegative = coins < 0;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
      isNegative
        ? "border-red-700 bg-red-900/30 text-red-300"
        : "border-yellow-700/60 bg-yellow-900/20 text-yellow-300"
    }`}>
      <span className="text-base">🪙</span>
      <span className="text-sm font-bold tabular-nums">{coins}</span>
    </div>
  );
}
