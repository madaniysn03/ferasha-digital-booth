import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { TopBar } from "@/components/layout/TopBar";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion · Ferasha Quantic" },
      { name: "description", content: "Connecte-toi à Ferasha Quantic pour créer ou gérer ta vitrine." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
        setMsg("Compte créé ! Tu peux te connecter maintenant.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/my-ferasha" });
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setLoading(true); setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setMsg(result.error.message ?? "Erreur Google"); setLoading(false); return; }
    if (result.redirected) return;
    navigate({ to: "/my-ferasha" });
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="font-display text-2xl font-bold">
          {mode === "signup" ? "Ouvre ta Ferasha" : "Bon retour 👋"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup" ? "Crée ton compte en 30 secondes." : "Connecte-toi pour gérer ta vitrine."}
        </p>

        <button onClick={handleGoogle} disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50">
          <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuer avec Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou par email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          {mode === "signup" && (
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
              placeholder="Nom complet"
              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            placeholder="Email"
            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            placeholder="Mot de passe (min. 6 caractères)"
            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            {mode === "signup" ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        {msg && <p className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">{msg}</p>}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Tu as déjà un compte ?" : "Pas encore inscrit ?"}{" "}
          <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setMsg(null); }}
            className="font-semibold text-primary underline-offset-2 hover:underline">
            {mode === "signup" ? "Se connecter" : "Créer un compte"}
          </button>
        </p>

        <p className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
        </p>
      </main>
    </div>
  );
}
