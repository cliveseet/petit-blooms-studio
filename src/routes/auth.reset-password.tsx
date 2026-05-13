import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ResetSearch = {
  code?: string;
  error?: string;
  error_description?: string;
  token_hash?: string;
  type?: string;
};

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    code: typeof search.code === "string" ? search.code : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string" ? search.error_description : undefined,
    token_hash: typeof search.token_hash === "string" ? search.token_hash : undefined,
    type: typeof search.type === "string" ? search.type : undefined,
  }),
  head: () => ({ meta: [{ title: "Reset password — petit blooms" }] }),
  component: ResetPasswordPage,
});

const validOtpTypes = new Set(["recovery", "email"]);

function hashParams() {
  if (typeof window === "undefined" || !window.location.hash) return new URLSearchParams();
  return new URLSearchParams(window.location.hash.replace(/^#/, ""));
}

function ResetPasswordPage() {
  const search = Route.useSearch();
  const nav = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Checking your reset link.");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    const prepareSession = async () => {
      if (search.error) {
        setMessage(search.error_description ?? search.error);
        setChecking(false);
        return;
      }

      let errorMessage: string | null = null;
      const hash = hashParams();

      if (search.token_hash && search.type && validOtpTypes.has(search.type)) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: search.token_hash,
          type: search.type as EmailOtpType,
        });
        errorMessage = error?.message ?? null;
      } else if (search.code) {
        const { error } = await supabase.auth.exchangeCodeForSession(search.code);
        errorMessage = error?.message ?? null;
      } else if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });
        errorMessage = error?.message ?? null;
      } else {
        const { data, error } = await supabase.auth.getSession();
        errorMessage =
          error?.message ?? (data.session ? null : "This reset link is missing its session token.");
      }

      if (!active) return;
      setChecking(false);
      if (errorMessage) {
        setMessage(errorMessage);
        return;
      }

      setReady(true);
      setMessage("Choose a new password for your Petit Blooms account.");
    };

    void prepareSession();

    return () => {
      active = false;
    };
  }, [search]);

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setDone(true);
    setMessage("Your password has been updated.");
    toast.success("Password updated.");
  };

  return (
    <div className="min-h-[76vh] bg-cream">
      <div className="container-page flex min-h-[76vh] items-center justify-center py-16">
        <section className="w-full max-w-md rounded-2xl border hairline bg-shell p-8 shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-sage/25 text-loam">
            {checking && <Loader2 className="size-5 animate-spin" />}
            {!checking && !ready && <AlertCircle className="size-5" />}
            {ready && !done && <KeyRound className="size-5" />}
            {done && <CheckCircle2 className="size-5" />}
          </div>
          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.34em] text-clay">
            Account
          </p>
          <h1 className="mt-3 text-center font-display text-3xl text-loam">
            Reset password<span className="font-serif-italic text-clay">.</span>
          </h1>
          <p className="mt-4 text-center text-sm leading-6 text-ink/75">{message}</p>

          {ready && !done && (
            <form onSubmit={updatePassword} className="mt-7 space-y-4">
              <div>
                <Label htmlFor="password" className="text-xs uppercase tracking-[0.22em] text-clay">
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="confirm-password"
                  className="text-xs uppercase tracking-[0.22em] text-clay"
                >
                  Confirm password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                  className="mt-2"
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full bg-loam text-cream hover:bg-ink"
              >
                {busy ? "Updating…" : "Update password"}
              </Button>
            </form>
          )}

          {!checking && (!ready || done) && (
            <div className="mt-7 flex justify-center">
              <Button
                asChild={!done}
                type={done ? "button" : undefined}
                onClick={done ? () => void nav({ to: "/login" }) : undefined}
                className="bg-loam text-cream hover:bg-ink"
              >
                {done ? "Return to sign in" : <Link to="/login">Return to sign in</Link>}
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
