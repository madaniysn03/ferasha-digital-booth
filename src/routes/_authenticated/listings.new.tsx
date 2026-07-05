import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Loader2, Save, ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { uploadImage } from "@/lib/upload";

export const Route = createFileRoute("/_authenticated/listings/new")({
  validateSearch: z.object({ ferashaId: z.string().optional() }),
  component: NewListing,
});

function NewListing() {
  const navigate = useNavigate();
  const { ferashaId } = Route.useSearch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", price: "", currency: "MAD",
    type: "produit" as "produit" | "service", image_url: "",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUserId(u.user?.id ?? null);
      setLoading(false);
    })();
  }, []);

  async function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true); setMsg(null);
    try {
      const url = await uploadImage("listings", userId, file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || !ferashaId) throw new Error("Ferasha manquante");
      const { error } = await supabase.from("listings").insert({
        ferasha_id: ferashaId, owner_id: u.user.id,
        title: form.title, description: form.description || null,
        price: form.price ? Number(form.price) : null, currency: form.currency,
        type: form.type, image_url: form.image_url || null,
      });
      if (error) throw error;
      navigate({ to: "/my-ferasha/$id", params: { id: ferashaId } });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
      setSaving(false);
    }
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;

  if (!ferashaId) return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <h1 className="font-display text-xl font-bold">Choisis d'abord une Ferasha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ouvre une de tes Ferashas puis clique sur "Nouveau" pour publier.</p>
        <Link to="/my-ferasha" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          Mes Ferashas
        </Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen pb-12">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-5">
        <Link to="/my-ferasha/$id" params={{ id: ferashaId }} className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Retour
        </Link>
        <h1 className="font-display text-2xl font-bold">Nouvelle publication</h1>

        <form onSubmit={save} className="mt-5 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="grid grid-cols-2 gap-2">
            {(["produit", "service"] as const).map((t) => (
              <button type="button" key={t} onClick={() => setForm({ ...form, type: t })}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${form.type === t ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-background text-muted-foreground"}`}>
                {t === "produit" ? "📦 Produit" : "🛎️ Service"}
              </button>
            ))}
          </div>

          <Field label="Titre *">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} className={inputCls} placeholder="Ex. Sac brodé fait main" />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} h-auto py-2.5 resize-none`} placeholder="Détails, taille, finitions..." />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="Prix">
                <input type="number" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" step="0.01" placeholder="Sur demande si vide" className={inputCls} />
              </Field>
            </div>
            <Field label="Devise">
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inputCls}>
                <option>MAD</option><option>EUR</option><option>USD</option>
              </select>
            </Field>
          </div>

          <Field label="Image">
            <div className="flex items-center gap-3">
              {form.image_url && <img src={form.image_url} alt="" className="size-12 shrink-0 rounded-lg object-cover" />}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageSelected} className="hidden" id="listing-image-upload" />
              <label htmlFor="listing-image-upload" className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-muted">
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} {form.image_url ? "Changer" : "Ajouter une image"}
              </label>
            </div>
          </Field>

          <button type="submit" disabled={saving || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Publier
          </button>
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
