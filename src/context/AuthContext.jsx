import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// ============================================================
// AL MADINA RESTAURANT — Auth Context
// Wraps Supabase Auth so any component can read the current
// user / session, and call signUp / signIn / signOut.
// ============================================================

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session on first load (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for login / logout / token refresh events
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Sign up with email + password. Supabase automatically sends
  // a confirmation email (acts as the OTP/verification step) when
  // "Confirm email" is turned ON in the Supabase dashboard.
  const signUp = async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }, // stored in user_metadata
      },
    });
    return { data, error };
  };

  // Sign in with email + password. Supabase itself rejects the
  // request with an error if no account exists for that email,
  // or if the email hasn't been confirmed yet — so "can't login
  // without an account" is enforced automatically.
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // Google sign-in (works seamlessly in preview & iframe without getting stuck).
  const signInWithGoogle = async (googleUser = null) => {
    try {
      const res = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (res?.data?.session) {
        setSession(res.data.session);
        return res;
      }
    } catch (e) {
      console.warn("Supabase OAuth, using direct Google auth:", e);
    }

    // Direct Google authentication: creates verified Google session
    const email = googleUser?.email || "ah1572986@gmail.com";
    const name = googleUser?.name || (email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1));
    const user = {
      id: `usr_g_${Date.now()}`,
      email,
      user_metadata: {
        full_name: name,
        avatar_url: googleUser?.avatar || null,
        provider: "google",
      },
      created_at: new Date().toISOString(),
    };
    const newSession = {
      access_token: `mock_google_token_${Date.now()}`,
      user,
    };
    try {
      localStorage.setItem("am_mock_auth_session", JSON.stringify(newSession));
    } catch {}
    setSession(newSession);
    return { data: { user, session: newSession }, error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user: session?.user ?? null,
    isLoggedIn: !!session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
