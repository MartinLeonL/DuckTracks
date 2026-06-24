import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useAuth() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data);
  }

  const signUp = useCallback(async ({ email, password, username, name }) => {
    // Pass username + name as metadata — the DB trigger picks these up
    // and inserts the profiles row server-side (avoids RLS timing issues).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, name },
      },
    });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async ({ emailOrUsername, password }) => {
    let email = emailOrUsername.trim();

    // If it doesn't look like an email, look up the email via username
    if (!email.includes("@")) {
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("username", email)
        .single();
      if (error || !data?.email) throw new Error("Username not found. Please try signing in with your email.");
      email = data.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  const updateUsername = useCallback(async (newUsername, userId) => {
    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername })
      .eq("user_id", userId);
    if (error) throw error;
    setProfile((prev) => ({ ...prev, username: newUsername }));
  }, []);

  const updateName = useCallback(async (newName, userId) => {
    const { error } = await supabase
      .from("profiles")
      .update({ name: newName })
      .eq("user_id", userId);
    if (error) throw error;
    setProfile((prev) => ({ ...prev, name: newName }));
  }, []);

  return {
    session,
    profile,
    user: session?.user ?? null,
    loading: session === undefined,
    signUp,
    signIn,
    signOut,
    updatePassword,
    updateUsername: (username) => updateUsername(username, session?.user?.id),
    updateName: (name) => updateName(name, session?.user?.id),
    refetchProfile: () => session && fetchProfile(session.user.id),
  };
}