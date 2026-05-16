import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { sanitizeEmail, sanitizeText } from "@/lib/sanitize";

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
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
const AUTH_CHECK_TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: PromiseLike<T>, ms: number, fallback: unknown) {
  return new Promise<T>((resolve) => {
    const timer = window.setTimeout(() => resolve(fallback as T), ms);
    Promise.resolve(promise)
      .then((value) => resolve(value))
      .catch(() => resolve(fallback as T))
      .finally(() => window.clearTimeout(timer));
  });
}

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

function authMessage(error: unknown) {
  return error instanceof Error ? error.message : "Authentication request failed.";
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

      const { data, error } = await withTimeout(
        supabase.from("user_roles").select("role").eq("user_id", s.user.id),
        AUTH_CHECK_TIMEOUT_MS,
        { data: null, error: new Error("Role check timed out.") },
      );

      if (!active || run !== syncRun) return;
      if (error) setIsAdmin(false);

      const hasAdminRole = !!data?.some((r) => r.role === "admin");
      setIsAdmin(hasAdminRole);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => void syncSession(s), 0);
    });

    withTimeout(supabase.auth.getSession(), AUTH_CHECK_TIMEOUT_MS, {
      data: { session: null },
      error: null,
    }).then(({ data: { session: s }, error }) => {
      if (error) {
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizeEmail(email),
        password,
      });
      return { error: error?.message ?? null, session: data.session };
    } catch (error) {
      return { error: authMessage(error), session: null };
    }
  };
  const signUp: AuthCtx["signUp"] = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: sanitizeEmail(email),
        password,
        options: {
          emailRedirectTo: getAuthRedirectTo("/auth/confirm", "/account"),
          data: { full_name: sanitizeText(fullName, 120) },
        },
      });
      return { error: error?.message ?? null, session: data.session };
    } catch (error) {
      return { error: authMessage(error), session: null };
    }
  };
  const resetPasswordForEmail: AuthCtx["resetPasswordForEmail"] = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizeEmail(email), {
        redirectTo: getAuthRedirectTo("/auth/reset-password"),
      });
      return { error: error?.message ?? null };
    } catch (error) {
      return { error: authMessage(error) };
    }
  };
  const signInWithGoogle: AuthCtx["signInWithGoogle"] = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthRedirectTo("/auth/confirm", "/account"),
        },
      });
      return { error: error?.message ?? null };
    } catch (error) {
      return { error: authMessage(error) };
    }
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
        signInWithGoogle,
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
