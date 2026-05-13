import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type ConfirmSearch = {
  code?: string;
  error?: string;
  error_description?: string;
  next?: string;
  token_hash?: string;
  type?: string;
};

export const Route = createFileRoute("/auth/confirm")({
  validateSearch: (search: Record<string, unknown>): ConfirmSearch => ({
    code: typeof search.code === "string" ? search.code : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string" ? search.error_description : undefined,
    next: typeof search.next === "string" ? search.next : undefined,
    token_hash: typeof search.token_hash === "string" ? search.token_hash : undefined,
    type: typeof search.type === "string" ? search.type : undefined,
  }),
  head: () => ({ meta: [{ title: "Confirming email — petit blooms" }] }),
  component: AuthConfirmPage,
});

const validOtpTypes = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function safeNext(next: string | undefined) {
  if (!next?.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}

function AuthConfirmPage() {
  const search = Route.useSearch();
  const nav = useNavigate();
  const [state, setState] = useState<"checking" | "confirmed" | "failed">("checking");
  const [message, setMessage] = useState("Confirming your email address.");

  useEffect(() => {
    let active = true;

    const confirm = async () => {
      if (search.error) {
        setState("failed");
        setMessage(search.error_description ?? search.error);
        return;
      }

      const next = safeNext(search.next);
      let errorMessage: string | null = null;

      if (search.token_hash && search.type && validOtpTypes.has(search.type)) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: search.token_hash,
          type: search.type as EmailOtpType,
        });
        errorMessage = error?.message ?? null;
      } else if (search.code) {
        const { error } = await supabase.auth.exchangeCodeForSession(search.code);
        errorMessage = error?.message ?? null;
      } else {
        const { data, error } = await supabase.auth.getSession();
        errorMessage =
          error?.message ?? (data.session ? null : "This confirmation link is missing its token.");
      }

      if (!active) return;
      if (errorMessage) {
        setState("failed");
        setMessage(errorMessage);
        return;
      }

      setState("confirmed");
      setMessage("Email confirmed. Taking you to your account.");
      setTimeout(() => {
        if (active) void nav({ to: next });
      }, 500);
    };

    void confirm();

    return () => {
      active = false;
    };
  }, [nav, search]);

  return (
    <div className="min-h-[72vh] bg-cream">
      <div className="container-page flex min-h-[72vh] items-center justify-center py-16">
        <section className="w-full max-w-md rounded-2xl border hairline bg-shell p-8 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-sage/25 text-loam">
            {state === "checking" && <Loader2 className="size-5 animate-spin" />}
            {state === "confirmed" && <CheckCircle2 className="size-5" />}
            {state === "failed" && <AlertCircle className="size-5" />}
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-[0.34em] text-clay">Account</p>
          <h1 className="mt-3 font-display text-3xl text-loam">
            {state === "failed" ? "Link not confirmed" : "Confirming email"}
            <span className="font-serif-italic text-clay">.</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-ink/75">{message}</p>
          {state === "failed" && (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="bg-loam text-cream hover:bg-ink">
                <Link to="/login">Return to sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Denise</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
