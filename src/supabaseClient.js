import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SPRITE_URL =
  import.meta.env.VITE_SUPABASE_SPRITE_URL ||
  "https://placehold.co/320x192/0f172a/10b981?text=SpriteSheet";

/** Size of one ducky cell in the sprite sheet (px) — 32×32 pixel art */
export const SPRITE_CELL = 32;

export async function fetchAllDucks() {
  const { data, error } = await supabase
    .from("rubber_duckies")
    .select("*")
    .order("rarity", { ascending: true });
  if (error) throw error;
  return data;
}