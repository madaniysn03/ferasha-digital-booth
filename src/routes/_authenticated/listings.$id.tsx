import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Trash2, ArrowLeft, Pause, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";

export const Route = createFileRoute("/_authenticated/listings/$id")({
  component: EditListing,
});

function EditListing() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", price: "", currency: "MAD",
    type: "produit" as "produit" | "service", image_url: "",
    status: "actif" as "actif" | "pause",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      if (data) {
        setForm({
          title: data.title, description: data.description ?? "",
          price: data.price?.toString() ?? "", currency: data.currency,
          type: data.type, image_url: data.image_url ?? "", status: data.status,
        });
      }
      setLoading(false);
    })();
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const { error } = await supabase.from("listings").update({
      title: form.title, description: form.description || null,
      price: form.price ? Number(form.price) : null, currency: form.currency,
      type: form.type, image_url: form.image_url || null, status: form.status,
    }).eq("id", id);
    setSaving(false);
    if (error) setMsg(error.message); else navigate({ to: "/my-ferasha" });
  }

  async function toggleStatus() {
    const newStatus = form.status === "actif" ? "pause" : "actif";
    await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    setForm({ ...form, status: newStatus });
  }

  async function remove() {
    if (!confirm("Supprimer cette publication ?")) return;
    await supabase.from("listings").delete().eq("id", id);
    navigate({ to: "/my-ferasha" });
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;

  return (
    <div className="min-h-screen pb-12">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-5">
        <Link to="/my-ferasha" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Retour
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Modifier</h1>
          <button onClick={toggleStatus} className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">
            {form.status === "actif" ? <><Pause className="size-3.5" /> Mettre en pause</> : <><Play className="size-3.5" /> Réactiver</>}
          </button>
        </div>

        <form onSubmit={save} className="mt-5 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="grid grid-cols-2 gap-2">
            {(["produit", "service"] as const).map((t) => (
              <button type="button" key={t} onClick={() => setForm({ ...form, type: t })}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${form.type === t ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-background text-muted-foreground"}`}>
                {t === "produit" ? "📦 Produit" : "🛎️ Service"}
              </button>
            ))}
          </div>
          <Field label="Titre"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputCls} /></Field>
          <Field label="Description"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} h-auto py-2.5 resize-none`} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><Field label="Prix"><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} /></Field></div>
            <Field label="Devise"><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}><option>MAD</option><option>EUR</option><option>USD</option></select></Field>
          </div>
          <Field label="URL image"><input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls} /></Field>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button type="button" onClick={remove} className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10">
              <Trash2 className="size-4" /> Supprimer
            </button>
            <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Enregistrer
            </button>
          </div>
          {msg && <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{msg}</p>}
        </form>
      </main>
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
