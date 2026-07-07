import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Eye, EyeOff, MapPin, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { categoryEmoji, categoryLabel } from "@/lib/categories";

export const Route = createFileRoute("/_authenticated/my-ferasha/")({
  component: MyFerashaList,
});

type Ferasha = {
  id: string; name: string; slug: string; category: string; city: string;
  logo_url: string | null; is_published: boolean; views_count: number; moderation_status: string;
};

function MyFerashaList() {
  const [loading, setLoading] = useState(true);
  const [ferashas, setFerashas] = useState<Ferasha[]>([]);
  const [role, setRole] = useState<"client" | "pro" | "superadmin">("client");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", u.user.id).maybeSingle();
      if (prof?.role) setRole(prof.role);
      const { data: f } = await supabase
        .from("ferashas")
        .select("id, name, slug, category, city, logo_url, is_published, views_count, moderation_status")
        .eq("owner_id", u.user.id)
        .order("created_at", { ascending: false });
      setFerashas((f as Ferasha[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <TopBar />

      <main className="mx-auto max-w-2xl px-4 py-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Mes Ferashas</h1>
            <p className="mt-1 text-sm text-muted-foreground">Gère tes vitrines et tes publications.</p>
          </div>
          {role !== "client" && (
            <Link to="/my-ferasha/new" className="flex items-center gap-1 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90">
              <Plus className="size-4" /> Nouvelle
            </Link>
          )}
        </div>

        {ferashas.length === 0 ? (
          role === "client" ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm font-semibold">Ton compte n'a pas encore accès à la création de Ferasha.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Seuls les comptes professionnels, créés par notre équipe, peuvent ouvrir une vitrine.
              </p>
              <Link to="/devenir-pro" className="mt-3 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
                Devenir partenaire
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Pas encore de Ferasha.</p>
              <Link to="/my-ferasha/new" className="mt-3 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
                Créer ma première Ferasha
              </Link>
            </div>
          )
        ) : (
          <div className="space-y-2">
            {ferashas.map((f) => (
              <Link key={f.id} to="/my-ferasha/$id" params={{ id: f.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-secondary">
                <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted text-xl">
                  {f.logo_url ? <img src={f.logo_url} alt="" className="size-full object-cover" /> : categoryEmoji(f.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{f.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    {categoryLabel(f.category)} · <MapPin className="size-3" /> {f.city}
                  </p>
                </div>
                {f.moderation_status === "suspended" ? (
                  <span className="flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-1 text-[10px] font-semibold text-destructive">
                    <ShieldAlert className="size-3" /> Suspendue
                  </span>
                ) : (
                  <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${f.is_published ? "bg-secondary/20 text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {f.is_published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                    {f.is_published ? "Publiée" : "Masquée"}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
