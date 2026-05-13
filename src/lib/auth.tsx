import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthResult = {
  error: string | null;
  session: Session | null;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  resetPasswordForEmail: (email: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function getAuthRedirectTo(path: string, next?: string) {
  if (typeof window === "undefined") return undefined;

  const url = new URL(window.location.origin);
  if (url.hostname === "127.0.0.1" || url.hostname === "::1") {
    url.hostname = "localhost";
  }
  url.pathname = path;
  url.search = next ? `next=${encodeURIComponent(next)}` : "";
  url.hash = "";

  return url.toString();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let syncRun = 0;

    const syncSession = async (s: Session | null) => {
      const run = ++syncRun;
      setLoading(true);
      setSession(s);

      if (!s?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", s.user.id);

      if (!active || run !== syncRun) return;
      if (error) {
        console.error("[Auth] Could not load user role", error);
      }

      const hasAdminRole = !!data?.some((r) => r.role === "admin");
      setIsAdmin(hasAdminRole);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => void syncSession(s), 0);
    });

    supabase.auth.getSession().then(({ data: { session: s }, error }) => {
      if (error) {
        console.error("[Auth] Could not load current session", error);
        setLoading(false);
        return;
      }
      void syncSession(s);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null, session: data.session };
  };
  const signUp: AuthCtx["signUp"] = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectTo("/auth/confirm", "/account"),
        data: { full_name: fullName },
      },
    });
    return { error: error?.message ?? null, session: data.session };
  };
  const resetPasswordForEmail: AuthCtx["resetPasswordForEmail"] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectTo("/auth/reset-password"),
    });
    return { error: error?.message ?? null };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAdmin,
        loading,
        resetPasswordForEmail,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
