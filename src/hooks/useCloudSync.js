import { useCallback, useRef } from "react";
import { supabase } from "../supabaseClient";

/**
 * Two-way cloud sync against the user_data table.
 *
 * loadFromCloud()  – fetch the whole data blob for this user
 * saveToCloud(data) – upsert the whole blob (debounced 1.5 s)
 * clearCloudData() – wipe the blob
 */
export function useCloudSync(userId) {
  const debounceRef = useRef(null);

  const saveToCloud = useCallback(
    (data) => {
      if (!userId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await supabase.from("user_data").upsert(
            { user_id: userId, data, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
        } catch (e) {
          console.warn("Cloud save failed:", e);
        }
      }, 1500);
    },
    [userId]
  );

  const loadFromCloud = useCallback(async () => {
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
  }, [userId]);

  const clearCloudData = useCallback(async () => {
    if (!userId) return;
    await supabase.from("user_data").upsert(
      { user_id: userId, data: {}, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  }, [userId]);

  return { saveToCloud, loadFromCloud, clearCloudData };
}