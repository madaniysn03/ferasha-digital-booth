import { useEffect, useState } from "react";
import { Loader2, Save, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Stars } from "./Stars";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  status: string;
  reported_count: number;
  author: { full_name: string | null } | null;
};

export function ProReviewsSection({ ferashaId }: { ferashaId: string }) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, reply, status, reported_count, author:profiles(full_name)")
      .eq("ferasha_id", ferashaId)
      .order("created_at", { ascending: false });
    setReviews((data as unknown as Review[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [ferashaId]);

  async function saveReply(reviewId: string) {
    setSaving(reviewId);
    await supabase.from("reviews").update({ reply: drafts[reviewId] ?? "" }).eq("id", reviewId);
    setSaving(null);
    await load();
  }

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin text-secondary" /></div>;

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold">Avis reçus ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Aucun avis pour l'instant.
        </p>
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{r.author?.full_name ?? "Client"}</p>
                  <Stars value={r.rating} size="size-3.5" />
                </div>
                <div className="flex items-center gap-2">
                  {r.status === "hidden" && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Masqué</span>}
                  {r.reported_count > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                      <Flag className="size-3" /> {r.reported_count}
                    </span>
                  )}
                </div>
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}

              {r.reply ? (
                <div className="mt-3 rounded-xl bg-muted p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground">Ta réponse</p>
                  <p className="mt-1 text-xs">{r.reply}</p>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input
                    value={drafts[r.id] ?? ""}
                    onChange={(e) => setDrafts({ ...drafts, [r.id]: e.target.value })}
                    placeholder="Répondre à cet avis..."
                    className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                  />
                  <button onClick={() => saveReply(r.id)} disabled={saving === r.id || !drafts[r.id]}
                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
                    {saving === r.id ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
