import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Flag, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Stars, StarPicker } from "./Stars";
import { useI18n } from "@/lib/i18n/context";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  author_id: string;
  created_at: string;
  author: { full_name: string | null } | null;
};

export function ReviewsSection({ ferashaId, ratingAvg, ratingCount }: { ferashaId: string; ratingAvg: number; ratingCount: number }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [myReview, setMyReview] = useState<{ id: string; rating: number; comment: string | null } | null>(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data: visible } = await supabase
      .from("reviews")
      .select("id, rating, comment, reply, author_id, created_at")
      .eq("ferasha_id", ferashaId)
      .eq("status", "visible")
      .order("created_at", { ascending: false });
    const rows = (visible as Omit<Review, "author">[] | null) ?? [];

    const authorIds = [...new Set(rows.map((r) => r.author_id))];
    const { data: names } = authorIds.length
      ? await supabase.from("public_profile_names").select("id, full_name").in("id", authorIds)
      : { data: [] as { id: string; full_name: string | null }[] };
    const nameById = new Map((names ?? []).map((n) => [n.id, n.full_name]));

    setReviews(rows.map((r) => ({ ...r, author: { full_name: nameById.get(r.author_id) ?? null } })));

    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      setUserId(u.user.id);
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", u.user.id).maybeSingle();
      setIsClient(prof?.role === "client");
      const { data: mine } = await supabase.from("reviews").select("id, rating, comment").eq("ferasha_id", ferashaId).eq("author_id", u.user.id).maybeSingle();
      setMyReview(mine);
      if (mine) setForm({ rating: mine.rating, comment: mine.comment ?? "" });
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [ferashaId]);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true); setMsg(null);
    try {
      if (myReview) {
        const { error } = await supabase.from("reviews").update({ rating: form.rating, comment: form.comment || null }).eq("id", myReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews").insert({ ferasha_id: ferashaId, author_id: userId, rating: form.rating, comment: form.comment || null });
        if (error) throw error;
      }
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  async function deleteMyReview() {
    if (!myReview || !confirm("Supprimer ton avis ?")) return;
    await supabase.from("reviews").delete().eq("id", myReview.id);
    setMyReview(null);
    setForm({ rating: 5, comment: "" });
    await load();
  }

  async function report(reviewId: string) {
    if (!userId) return;
    await supabase.rpc("report_review", { review_id: reviewId });
    setMsg(t.ferasha.reportThanks);
  }

  if (loading) return <div className="flex justify-center py-4"><Loader2 className="size-5 animate-spin text-secondary" /></div>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{t.ferasha.reviews}</h2>
        {ratingCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Stars value={ratingAvg} />
            <span className="font-semibold">{ratingAvg.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({ratingCount})</span>
          </div>
        )}
      </div>

      {isClient && (
        <form onSubmit={submitReview} className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="text-xs font-semibold text-muted-foreground">{myReview ? t.ferasha.editReview : t.ferasha.leaveReview}</p>
          <StarPicker value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
          <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={2}
            placeholder={t.ferasha.reviewPlaceholder}
            className="h-auto w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} {myReview ? t.ferasha.updateReview : t.ferasha.submitReview}
            </button>
            {myReview && (
              <button type="button" onClick={deleteMyReview}
                className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10">
                <Trash2 className="size-3.5" /> {t.ferasha.deleteReview}
              </button>
            )}
          </div>
        </form>
      )}

      {!isClient && !userId && (
        <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <Link to="/auth" className="font-semibold text-primary underline-offset-2 hover:underline">{t.ferasha.loginToReview}</Link> {t.ferasha.loginToReviewSuffix}
        </p>
      )}

      {msg && <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{msg}</p>}

      {reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          {t.ferasha.noReviews}
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
                {userId && userId !== r.author_id && (
                  <button onClick={() => report(r.id)} title={t.ferasha.reportReview} className="text-muted-foreground hover:text-destructive">
                    <Flag className="size-3.5" />
                  </button>
                )}
              </div>
              {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              {r.reply && (
                <div className="mt-3 rounded-xl bg-muted p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground">{t.ferasha.sellerReply}</p>
                  <p className="mt-1 text-xs">{r.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
