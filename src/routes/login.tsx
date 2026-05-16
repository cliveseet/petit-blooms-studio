import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — petit blooms" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const { resetPasswordForEmail, signIn, signInWithGoogle, signUp, session, isAdmin, loading } =
    useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (session && !loading) nav({ to: isAdmin ? "/admin" : "/account" });
  }, [session, isAdmin, loading, nav]);

  const destinationForUser = async (userId: string): Promise<"/admin" | "/account"> => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    return data?.role === "admin" ? "/admin" : "/account";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineMessage(null);
    setResetMessage(null);
    setBusy(true);
    const res =
      mode === "signin" ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (res.error) {
      const message = authErrorCopy(res.error);
      setInlineMessage(message);
      toast.error(message);
    } else if (res.session) {
      toast.success(mode === "signup" ? "Account created." : "Welcome back.");
      nav({ to: await destinationForUser(res.session.user.id) });
    } else if (mode === "signup") {
      toast.success("Check your inbox to confirm your email.");
    } else {
      toast.success("Welcome back.");
      nav({ to: "/account", search: { payment: undefined, order: undefined, status: undefined } });
    }
  };

  const sendReset = async () => {
    setInlineMessage(null);
    setResetMessage(null);
    if (!email) {
      const message = "Enter your email first, then request a reset link.";
      setInlineMessage(message);
      toast.error(message);
      return;
    }
    setBusy(true);
    const res = await resetPasswordForEmail(email);
    setBusy(false);
    if (res.error) {
      const message = authErrorCopy(res.error);
      setInlineMessage(message);
      toast.error(message);
      return;
    }
    setResetMessage("Password reset email sent. Open the link to choose a new password.");
    toast.success("Password reset email sent.");
  };

  const googleSignIn = async () => {
    setInlineMessage(null);
    setResetMessage(null);
    setBusy(true);
    const res = await signInWithGoogle();
    setBusy(false);
    if (res.error) {
      const message = authErrorCopy(res.error);
      setInlineMessage(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-[80vh] bg-cream">
      <div className="container-page grid items-center py-16 md:grid-cols-2 md:gap-20 md:py-24">
        <div className="hidden md:block">
          <p className="text-[11px] uppercase tracking-[0.34em] text-clay">Account</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] text-loam md:text-6xl">
            A quiet space
            <span className="block font-serif-italic text-clay">for your blooms.</span>
          </h1>
          <p className="mt-6 max-w-md text-ink/75">
            Sign in to track your orders, save your details and revisit your favourite arrangements.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm rounded-2xl border hairline bg-shell p-8 shadow-[var(--shadow-soft)]">
          <div className="flex gap-1 rounded-md border hairline p-1 text-xs uppercase tracking-[0.22em]">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setInlineMessage(null);
                  setResetMessage(null);
                }}
                className={`flex-1 rounded-sm px-3 py-2 transition-all ${mode === m ? "bg-loam text-cream" : "text-ink/70 hover:text-loam"}`}
              >
                {m === "signin" ? "Sign in" : "Create"}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name" className="text-xs uppercase tracking-[0.22em] text-clay">
                  Full name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.22em] text-clay">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-[0.22em] text-clay">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-2"
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full bg-loam text-cream hover:bg-ink"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          {mode === "signin" && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-ink/10" />
                <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Or
                </span>
                <span className="h-px flex-1 bg-ink/10" />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={googleSignIn}
                className="w-full text-loam"
              >
                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full border border-clay/40 font-display text-xs text-clay">
                  G
                </span>
                Continue with Google
              </Button>
            </>
          )}
          {(inlineMessage || resetMessage) && (
            <div
              className={`mt-4 flex gap-3 rounded-md border px-4 py-3 text-sm ${
                inlineMessage
                  ? "border-destructive/25 bg-destructive/5 text-destructive"
                  : "border-sage/40 bg-sage/20 text-loam"
              }`}
              role={inlineMessage ? "alert" : "status"}
            >
              {inlineMessage && <AlertCircle className="mt-0.5 size-4 flex-none" />}
              <p>{inlineMessage ?? resetMessage}</p>
            </div>
          )}
          {mode === "signin" && (
            <button
              type="button"
              onClick={sendReset}
              disabled={busy}
              className="mt-4 w-full text-center text-xs uppercase tracking-[0.22em] text-clay underline-offset-4 hover:text-loam hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Forgot password?
            </button>
          )}
          <p className="mt-5 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline hover:text-loam">
              Back to petit blooms
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function authErrorCopy(error: string) {
  const message = error.toLowerCase();
  if (message.includes("invalid login credentials")) {
    return "The email or password is incorrect. Please check both and try again.";
  }
  if (message.includes("email not confirmed") || message.includes("confirm")) {
    return "Please confirm your email before signing in. If you have already done so, request a new reset or confirmation link.";
  }
  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch")
  ) {
    return "We could not reach Supabase. Check your internet connection and try again.";
  }
  if (message.includes("provider") || message.includes("oauth")) {
    return "Google sign-in is not ready yet. Enable the Google provider in Supabase, then try again.";
  }
  return error;
}
