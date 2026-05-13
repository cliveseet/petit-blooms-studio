import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
  const { resetPasswordForEmail, signIn, signUp, session } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (session) nav({ to: "/account" });
  }, [session, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res =
      mode === "signin" ? await signIn(email, password) : await signUp(email, password, name);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
    } else if (res.session) {
      toast.success(mode === "signup" ? "Account created." : "Welcome back.");
      nav({ to: "/account" });
    } else if (mode === "signup") {
      toast.success("Check your inbox to confirm your email.");
    } else {
      toast.success("Welcome back.");
      nav({ to: "/account" });
    }
  };

  const sendReset = async () => {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setBusy(true);
    const res = await resetPasswordForEmail(email);
    setBusy(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Password reset email sent.");
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
                onClick={() => setMode(m)}
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
