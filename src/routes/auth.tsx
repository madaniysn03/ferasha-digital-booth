import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    mode: z.enum(["signin", "signup"]).optional(),
    reason: z.enum(["suspended"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Connexion · Ferasha Quantic" },
      { name: "description", content: "Connecte-toi à Ferasha Quantic pour créer ou gérer ta vitrine." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { mode: initialMode, reason } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind: "error" | "success" } | null>(
    reason === "suspended" ? { text: t.auth.errSuspended, kind: "error" } : null,
  );

  // Traduit une erreur Supabase (statut HTTP + message) en texte FR/AR clair.
  // Évite d'afficher un message brut vide/illisible (ex. un objet `{}`).
  function errorMessage(err: unknown): string {
    const status = typeof err === "object" && err && "status" in err ? Number((err as { status: unknown }).status) : 0;
    const raw = (err instanceof Error ? err.message : "").toLowerCase();
    if (raw.includes("failed to fetch") || raw.includes("network") || raw.includes("load failed")) return t.auth.errNetwork;
    if (status >= 500 || raw.includes("database error") || raw.includes("unexpected")) return t.auth.errServer;
    if (status === 429 || raw.includes("rate limit") || raw.includes("too many")) return t.auth.errRateLimit;
    if (raw.includes("already registered") || raw.includes("already exists") || raw.includes("user already")) return t.auth.errUserExists;
    if (raw.includes("not confirmed") || raw.includes("email not confirmed")) return t.auth.errUnconfirmed;
    if (raw.includes("invalid login") || raw.includes("invalid credentials") || status === 400) return t.auth.errInvalid;
    return t.auth.errGeneric;
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
        });
        if (error) throw error;
        setMsg({ text: t.auth.signupSuccess, kind: "success" });
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/my-ferasha" });
      }
    } catch (err) {
      setMsg({ text: errorMessage(err), kind: "error" });
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar showLangSwitch />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="font-display text-2xl font-bold">
          {mode === "signup" ? t.auth.signupTitle : t.auth.signinTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup" ? t.auth.signupSubtitle : t.auth.signinSubtitle}
        </p>

        <form onSubmit={handleEmail} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
              placeholder={t.auth.fullName}
              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder={t.auth.email}
            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            placeholder={t.auth.password}
            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            {mode === "signup" ? t.auth.createAccount : t.auth.signIn}
          </button>
        </form>

        {msg && (
          <p role="alert" className={`mt-3 rounded-lg p-3 text-xs ${
            msg.kind === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
          }`}>{msg.text}</p>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? t.auth.hasAccount : t.auth.noAccount}{" "}
          <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMsg(null); }}
            className="font-semibold text-primary underline-offset-2 hover:underline">
            {mode === "signup" ? t.auth.switchToSignin : t.auth.switchToSignup}
          </button>
        </p>

        <p className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← {t.auth.backHome}</Link>
        </p>
      </main>
    </div>
  );
}
