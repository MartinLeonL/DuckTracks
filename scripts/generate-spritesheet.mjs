/**
 * generate-spritesheet.mjs
 * 
 * Development utility: generates a placeholder pixel art spritesheet
 * using Node.js Canvas (node-canvas). Run with:
 *   node scripts/generate-spritesheet.mjs
 * 
 * Output: public/spritesheet.png
 * 
 * For production, replace with a real pixel art sprite sheet
 * uploaded to Supabase Storage.
 * 
 * Install: npm install -D canvas
 */

// This is a reference script — actual sprite sheet should be hand-drawn
// pixel art. The app uses CSS background-position to crop individual ducks.

// Sprite sheet layout:
//   - Each cell: 32×32 px
//   - 10 columns × 6 rows = 60 duck slots
//   - Row 0: common ducks (cols 0-4) + extras
//   - Row 1: rare ducks
//   - Row 2: epic ducks
//   - Row 3: legendary ducks
//   - Row 4: mythic ducks
//   - Row 5: rarity master trophy ducks (cols 0-4)

const RARITY_COLORS = {
  0: "#22c55e", // common
  1: "#3b82f6", // rare
  2: "#a855f7", // epic
  3: "#eab308", // legendary
  4: "#ef4444", // mythic
  5: "#f59e0b", // trophies
};

console.log("This script requires node-canvas. For development,");
console.log("the app falls back to a placeholder image URL.");
console.log("Upload a real spritesheet.png to Supabase Storage for production.");
