import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Flag, EyeOff, Eye, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Stars } from "./Stars";

type ReportedReview = {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  reported_count: number;
  author: { full_name: string | null } | null;
  ferasha: { name: string; slug: string } | null;
};

export function ReviewModerationSection() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReportedReview[]>([]);

  async function load() {
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, status, reported_count, author:profiles(full_name), ferasha:ferashas(name, slug)")
      .gt("reported_count", 0)
      .order("reported_count", { ascending: false });
    setReviews((data as unknown as ReportedReview[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(review: ReportedReview) {
    const next = review.status === "visible" ? "hidden" : "visible";
    await supabase.from("reviews").update({ status: next }).eq("id", review.id);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement cet avis ?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    await load();
  }

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin text-secondary" /></div>;

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        <Flag className="size-4" /> Avis signalés ({reviews.length})
      </h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun avis signalé pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  {r.ferasha && (
                    <Link to="/ferasha/$slug" params={{ slug: r.ferasha.slug }} className="text-xs font-semibold hover:underline">
                      {r.ferasha.name}
                    </Link>
                  )}
                  <p className="text-sm">{r.author?.full_name ?? "Client"}</p>
                  <Stars value={r.rating} size="size-3.5" />
                </div>
                <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                  <Flag className="size-3" /> {r.reported_count} signalement{r.reported_count > 1 ? "s" : ""}
                </span>
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => toggleStatus(r)}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                  {r.status === "visible" ? <><EyeOff className="size-3.5" /> Masquer</> : <><Eye className="size-3.5" /> Rendre visible</>}
                </button>
                <button onClick={() => remove(r.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
