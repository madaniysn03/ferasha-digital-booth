import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Stars } from "@/components/ferasha/Stars";

export const Route = createFileRoute("/_authenticated/mes-avis")({
  component: MesAvis,
});

type MyReview = {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  created_at: string;
  ferasha: { name: string; slug: string } | null;
};

function MesAvis() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<MyReview[]>([]);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, reply, created_at, ferasha:ferashas(name, slug)")
      .eq("author_id", u.user.id)
      .order("created_at", { ascending: false });
    setReviews((data as unknown as MyReview[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer cet avis ?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    await load();
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-5 space-y-4">
        <h1 className="font-display text-2xl font-bold">Mes avis</h1>

        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Tu n'as encore laissé aucun avis.
          </p>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  {r.ferasha ? (
                    <Link to="/ferasha/$slug" params={{ slug: r.ferasha.slug }} className="text-sm font-semibold hover:underline">
                      {r.ferasha.name}
                    </Link>
                  ) : <span className="text-sm font-semibold">Ferasha supprimée</span>}
                  <button onClick={() => remove(r.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <Stars value={r.rating} size="size-3.5" />
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
                {r.reply && (
                  <div className="mt-3 rounded-xl bg-muted p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground">Réponse du vendeur</p>
                    <p className="mt-1 text-xs">{r.reply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
