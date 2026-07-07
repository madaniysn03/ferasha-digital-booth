import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Ban, CheckCircle2, ExternalLink, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { categoryEmoji, categoryLabel } from "@/lib/categories";
import { moderateFerasha } from "@/lib/api/superadmin.functions";
import { ListingCard } from "@/components/ferasha/ListingCard";

type AdminFerasha = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categories: string[] | null;
  city: string;
  is_published: boolean;
  moderation_status: string;
  suspended_reason: string | null;
};
type AdminListing = {
  id: string;
  ferasha_id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  type: "produit" | "service";
  status: "actif" | "pause";
  image_url: string | null;
};

// Panneau superadmin : liste les Ferashas + services d'un compte pro et permet de
// suspendre/réactiver chaque Ferasha individuellement. Le superadmin lit tout le
// contenu (même suspendu) grâce à la policy RLS `OR public.is_superadmin()`.
export function AdminProFerashas({ proId }: { proId: string }) {
  const [loading, setLoading] = useState(true);
  const [ferashas, setFerashas] = useState<AdminFerasha[]>([]);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { data: fs } = await supabase
      .from("ferashas")
      .select("id, name, slug, category, categories, city, is_published, moderation_status, suspended_reason")
      .eq("owner_id", proId)
      .order("created_at", { ascending: false });
    const list = (fs as AdminFerasha[] | null) ?? [];
    setFerashas(list);
    if (list.length > 0) {
      const { data: ls } = await supabase
        .from("listings")
        .select("id, ferasha_id, title, description, price, currency, type, status, image_url")
        .in(
          "ferasha_id",
          list.map((f) => f.id),
        )
        .order("created_at", { ascending: false });
      setListings((ls as AdminListing[] | null) ?? []);
    } else {
      setListings([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proId]);

  async function toggleModeration(f: AdminFerasha) {
    const next = f.moderation_status === "suspended" ? "active" : "suspended";
    let reason: string | undefined;
    if (next === "suspended") {
      const input = window.prompt(
        "Raison de la suspension de cette Ferasha (visible par le pro, facultatif) :",
        "",
      );
      if (input === null) return; // annulé
      reason = input;
    }
    setBusyId(f.id);
    try {
      await moderateFerasha({ data: { ferashaId: f.id, status: next, reason } });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-4">
        <Loader2 className="size-4 animate-spin text-secondary" />
      </div>
    );
  }

  if (ferashas.length === 0) {
    return (
      <p className="py-2 text-xs text-muted-foreground">Ce pro n'a pas encore créé de Ferasha.</p>
    );
  }

  return (
    <div className="space-y-3">
      {ferashas.map((f) => {
        const suspended = f.moderation_status === "suspended";
        const items = listings.filter((l) => l.ferasha_id === f.id);
        return (
          <div
            key={f.id}
            className={`rounded-xl border p-3 ${suspended ? "border-destructive/40 bg-destructive/5" : "border-border bg-background"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold">{f.name}</p>
                  {(f.categories?.length ? f.categories : [f.category]).map((c) => (
                    <span
                      key={c}
                      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${c === f.category ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {categoryEmoji(c)} {categoryLabel(c)}
                    </span>
                  ))}
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${f.is_published ? "bg-secondary/20 text-secondary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {f.is_published ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                    {f.is_published ? "Publiée" : "Masquée"}
                  </span>
                  {suspended && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                      <ShieldAlert className="size-3" /> Suspendue
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{f.city}</p>
                {suspended && f.suspended_reason && (
                  <p className="mt-1 text-[11px] text-destructive">Motif : {f.suspended_reason}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Link
                  to="/ferasha/$slug"
                  params={{ slug: f.slug }}
                  target="_blank"
                  className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                  title="Voir la page publique"
                >
                  <ExternalLink className="size-3.5" />
                </Link>
                <button
                  onClick={() => toggleModeration(f)}
                  disabled={busyId === f.id}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50 ${suspended ? "bg-secondary/20 text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"}`}
                >
                  {busyId === f.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : suspended ? (
                    <>
                      <CheckCircle2 className="size-3.5" /> Réactiver
                    </>
                  ) : (
                    <>
                      <Ban className="size-3.5" /> Suspendre
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-2">
              <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
                Services / produits ({items.length})
              </p>
              {items.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">Aucune annonce.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((l) => (
                    <ListingCard key={l.id} {...l} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
