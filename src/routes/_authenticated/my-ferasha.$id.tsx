import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Save, ArrowLeft, Eye, ExternalLink, Plus, Upload, Trash2, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { ListingCard } from "@/components/ferasha/ListingCard";
import { ProReviewsSection } from "@/components/ferasha/ProReviewsSection";
import { CategoryMultiSelect } from "@/components/ferasha/CategoryMultiSelect";
import { CATEGORIES, CITIES, type CategoryValue } from "@/lib/categories";
import { uploadImage } from "@/lib/upload";

export const Route = createFileRoute("/_authenticated/my-ferasha/$id")({
  component: EditFerasha,
});

type Ferasha = {
  id: string; name: string; slug: string; category: string; categories: string[]; city: string;
  bio: string | null; logo_url: string | null; whatsapp: string | null;
  phone: string | null; email: string | null; instagram: string | null;
  linkedin: string | null; website: string | null; is_published: boolean; views_count: number;
  moderation_status: string; suspended_reason: string | null;
};
type Listing = {
  id: string; title: string; description: string | null; price: number | null;
  currency: string; type: "produit" | "service"; status: "actif" | "pause"; image_url: string | null;
};

function EditFerasha() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ferasha, setFerasha] = useState<Ferasha | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [allowedCategories, setAllowedCategories] = useState<CategoryValue[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", categories: [] as CategoryValue[], city: "Casablanca", bio: "", logo_url: "",
    whatsapp: "", phone: "", email: "", instagram: "", linkedin: "", website: "",
  });

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setUserId(u.user.id);
    const { data: prof } = await supabase.from("profiles").select("role, allowed_categories").eq("id", u.user.id).maybeSingle();
    setAllowedCategories(prof?.role === "superadmin" ? CATEGORIES.map((c) => c.value) : ((prof?.allowed_categories as CategoryValue[] | undefined) ?? []));

    const { data: f } = await supabase.from("ferashas").select("*").eq("id", id).eq("owner_id", u.user.id).maybeSingle();
    if (f) {
      setFerasha(f as Ferasha);
      setForm({
        name: f.name,
        categories: ((f.categories as CategoryValue[] | null)?.length ? (f.categories as CategoryValue[]) : [f.category as CategoryValue]),
        city: f.city, bio: f.bio ?? "", logo_url: f.logo_url ?? "",
        whatsapp: f.whatsapp ?? "", phone: f.phone ?? "", email: f.email ?? "", instagram: f.instagram ?? "",
        linkedin: f.linkedin ?? "", website: f.website ?? "",
      });
      const { data: l } = await supabase.from("listings").select("*").eq("ferasha_id", f.id).order("created_at", { ascending: false });
      setListings((l as Listing[] | null) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!ferasha) return;
    if (form.categories.length === 0) { setMsg("Choisis au moins une catégorie."); return; }
    setSaving(true); setMsg(null);
    try {
      const { error } = await supabase.from("ferashas").update({
        name: form.name, category: form.categories[0] as never, categories: form.categories as never, city: form.city,
        bio: form.bio || null, logo_url: form.logo_url || null,
        whatsapp: form.whatsapp || null, phone: form.phone || null,
        email: form.email || null, instagram: form.instagram || null,
        linkedin: form.linkedin || null, website: form.website || null,
      }).eq("id", ferasha.id);
      if (error) throw error;
      setMsg("Ferasha mise à jour ✓");
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  async function togglePublish() {
    if (!ferasha) return;
    const next = !ferasha.is_published;
    await supabase.from("ferashas").update({ is_published: next }).eq("id", ferasha.id);
    setFerasha({ ...ferasha, is_published: next });
  }

  async function onLogoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true); setMsg(null);
    try {
      const url = await uploadImage("ferasha-logos", userId, file);
      setForm((f) => ({ ...f, logo_url: url }));
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;

  if (!ferasha) return (
    <div className="min-h-screen"><TopBar />
      <main className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">Ferasha introuvable.</p>
        <Link to="/my-ferasha" className="mt-4 inline-block text-sm font-semibold text-primary underline-offset-2 hover:underline">Retour</Link>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen pb-12">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-5 space-y-6">
        <Link to="/my-ferasha" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Retour à mes Ferashas
        </Link>

        {ferasha.moderation_status === "suspended" && (
          <div className="flex items-start gap-3 rounded-2xl border-2 border-destructive/50 bg-destructive/10 p-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Ferasha suspendue par la modération</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Elle n'est plus visible publiquement. Tu peux toujours modifier son contenu, mais elle restera masquée
                tant qu'un administrateur ne l'aura pas réactivée.
                {ferasha.suspended_reason ? <> Motif : <span className="font-medium">{ferasha.suspended_reason}</span></> : null}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div>
            <p className="text-xs text-muted-foreground">Lien public · {ferasha.views_count} vues</p>
            <p className="font-mono text-sm">/ferasha/{ferasha.slug}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={togglePublish}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${ferasha.is_published ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "bg-secondary text-secondary-foreground"}`}>
              {ferasha.is_published ? "Masquer" : "Publier"}
            </button>
            <Link to="/ferasha/$slug" params={{ slug: ferasha.slug }}
              className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:opacity-90">
              <Eye className="size-3.5" /> Voir <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted">
              {form.logo_url ? <img src={form.logo_url} alt="" className="size-full object-cover" /> : <span className="text-2xl">🏪</span>}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onLogoSelected} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-muted">
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} Changer le logo
              </label>
            </div>
          </div>

          <Field label="Nom de la Ferasha *">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputCls} />
          </Field>
          <Field label="Catégories * (une ou plusieurs)">
            <CategoryMultiSelect
              options={Array.from(new Set([...allowedCategories, ...form.categories]))}
              value={form.categories}
              onChange={(categories) => setForm({ ...form, categories })}
            />
          </Field>
          <Field label="Ville *">
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls}>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Présentation courte">
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className={`${inputCls} h-auto py-2.5 resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputCls} /></Field>
            <Field label="Téléphone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} /></Field>
            <Field label="Instagram"><input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className={inputCls} /></Field>
            <Field label="LinkedIn"><input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className={inputCls} /></Field>
            <Field label="Site web"><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputCls} /></Field>
          </div>
          <button type="submit" disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Enregistrer
          </button>
          {msg && <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{msg}</p>}
        </form>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Publications</h2>
            <Link to="/listings/new" search={{ ferashaId: ferasha.id }} className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow-soft hover:opacity-90">
              <Plus className="size-3.5" /> Nouveau
            </Link>
          </div>
          {listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Pas encore de publication.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {listings.map((l) => (
                <Link key={l.id} to="/listings/$id" params={{ id: l.id }} className="block">
                  <ListingCard {...l} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <ProReviewsSection ferashaId={ferasha.id} />

        <button onClick={async () => {
          if (!confirm("Supprimer définitivement cette Ferasha et ses publications ?")) return;
          await supabase.from("ferashas").delete().eq("id", ferasha.id);
          navigate({ to: "/my-ferasha" });
        }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10">
          <Trash2 className="size-4" /> Supprimer cette Ferasha
        </button>
      </main>
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
