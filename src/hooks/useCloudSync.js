import { useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

/**
 * Syncs a piece of app state to Supabase user_data table.
 * Debounces writes to avoid hammering the DB.
 */
export function useCloudSync(userId) {
  const debounceRef = useRef(null);

  const syncToCloud = useCallback(
    async (dataKey, value) => {
      if (!userId) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          // Upsert a JSON patch into the data column
          const { data: existing } = await supabase
            .from("user_data")
            .select("data")
            .eq("user_id", userId)
            .single();

          const merged = { ...(existing?.data || {}), [dataKey]: value };

          await supabase.from("user_data").upsert({
            user_id: userId,
            data: merged,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn("Cloud sync failed:", e);
        }
      }, 1500);
    },
    [userId]
  );

  const loadFromCloud = useCallback(
    async () => {
      if (!userId) return null;
      try {
        const { data, error } = await supabase
          .from("user_data")
          .select("data")
          .eq("user_id", userId)
          .single();
        if (error) return null;
        return data?.data ?? null;
      } catch {
        return null;
      }
    },
    [userId]
  );

  const clearCloudData = useCallback(async () => {
    if (!userId) return;
    await supabase.from("user_data").upsert({
      user_id: userId,
      data: {},
      updated_at: new Date().toISOString(),
    });
  }, [userId]);

  return { syncToCloud, loadFromCloud, clearCloudData };
}