import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";

export const Route = createFileRoute("/_authenticated/change-password")({
  component: ChangePassword,
});

function ChangePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password !== confirm) {
      setMsg("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const { error: eUpd } = await supabase.auth.updateUser({ password });
      if (eUpd) throw eUpd;
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("profiles").update({ must_change_password: false }).eq("id", u.user.id);
      }
      navigate({ to: "/my-ferasha" });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="font-display text-2xl font-bold">Choisis un mot de passe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pour sécuriser ton compte, remplace le mot de passe temporaire par le tien.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Nouveau mot de passe (min. 6 caractères)"
            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            placeholder="Confirme le mot de passe"
            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <KeyRound className="size-4" />
            )}
            Valider
          </button>
        </form>

        {msg && <p className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">{msg}</p>}
      </main>
    </div>
  );
}
