import { useCallback, useRef } from "react";
import { supabase } from "../supabaseClient.js";

export function useCloudSync(userId) {
  const debounceRef = useRef(null);

  const saveToCloud = useCallback(
    (data) => {
      if (!userId) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const { error } = await supabase.from("user_data").upsert(
          { user_id: userId, data, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
        if (error) console.error("Cloud save failed:", error.message, error);
        else console.log("Cloud save OK for", userId);
      }, 1500);
    },
    [userId]
  );

  const loadFromCloud = useCallback(async () => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", userId)
      .single();
    if (error) {
      // PGRST116 = no rows found — that's fine for a new user
      if (error.code !== "PGRST116") {
        console.error("Cloud load failed:", error.message, error);
      }
      return null;
    }
    console.log("Cloud load OK:", data?.data);
    return data?.data ?? null;
  }, [userId]);

  const clearCloudData = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase.from("user_data").upsert(
      { user_id: userId, data: {}, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (error) console.error("Cloud clear failed:", error.message);
  }, [userId]);

  return { saveToCloud, loadFromCloud, clearCloudData };
}