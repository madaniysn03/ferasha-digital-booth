import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Eye, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ListingCard } from "@/components/ferasha/ListingCard";
import { CATEGORIES, CITIES } from "@/lib/categories";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/_authenticated/my-ferasha")({
  component: MyFerasha,
});

type Ferasha = {
  id: string; name: string; slug: string; category: string; city: string;
  bio: string | null; logo_url: string | null; whatsapp: string | null;
  phone: string | null; email: string | null; instagram: string | null;
};
type Listing = {
  id: string; title: string; description: string | null; price: number | null;
  currency: string; type: "produit" | "service"; status: "actif" | "pause"; image_url: string | null;
};

function MyFerasha() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ferasha, setFerasha] = useState<Ferasha | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  const [form, setForm] = useState({
    name: "", category: "artisanat", city: "Casablanca", bio: "",
    whatsapp: "", phone: "", email: "", instagram: "",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: f } = await supabase.from("ferashas").select("*").eq("owner_id", u.user.id).maybeSingle();
      if (f) {
        setFerasha(f as Ferasha);
        setForm({
          name: f.name, category: f.category, city: f.city, bio: f.bio ?? "",
          whatsapp: f.whatsapp ?? "", phone: f.phone ?? "", email: f.email ?? "", instagram: f.instagram ?? "",
        });
        const { data: l } = await supabase.from("listings").select("*").eq("ferasha_id", f.id).order("created_at", { ascending: false });
        setListings((l as Listing[] | null) ?? []);
      }
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");
      if (ferasha) {
        const { error } = await supabase.from("ferashas").update({
          name: form.name, category: form.category as never, city: form.city,
          bio: form.bio || null, whatsapp: form.whatsapp || null, phone: form.phone || null,
          email: form.email || null, instagram: form.instagram || null,
        }).eq("id", ferasha.id);
        if (error) throw error;
        setMsg("Ferasha mise à jour ✓");
      } else {
        let slug = slugify(form.name) || "ferasha";
        // ensure unique
        let attempt = slug;
        for (let i = 1; i < 50; i++) {
          const { data: ex } = await supabase.from("ferashas").select("id").eq("slug", attempt).maybeSingle();
          if (!ex) { slug = attempt; break; }
          attempt = `${slug}-${i + 1}`;
        }
        const { data: created, error } = await supabase.from("ferashas").insert({
          owner_id: u.user.id, name: form.name, slug,
          category: form.category as never, city: form.city, bio: form.bio || null,
          whatsapp: form.whatsapp || null, phone: form.phone || null,
          email: form.email || null, instagram: form.instagram || null,
        }).select().single();
        if (error) throw error;
        setFerasha(created as Ferasha);
        setMsg("Ferasha créée ! Ajoute ton premier produit.");
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) return (
    <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <TopBar right={
        <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground">
          Déconnexion
        </button>
      } />

      <main className="mx-auto max-w-2xl px-4 py-5 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">
            {ferasha ? "Ma Ferasha" : "Crée ta Ferasha"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ferasha ? "Gère ta vitrine et tes publications." : "Remplis ces infos pour ouvrir ta vitrine."}
          </p>
        </div>

        {ferasha && (
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div>
              <p className="text-xs text-muted-foreground">Lien public</p>
              <p className="font-mono text-sm">/ferasha/{ferasha.slug}</p>
            </div>
            <Link to="/ferasha/$slug" params={{ slug: ferasha.slug }}
              className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:opacity-90">
              <Eye className="size-3.5" /> Voir <ExternalLink className="size-3" />
            </Link>
          </div>
        )}

        <form onSubmit={save} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Field label="Nom de la Ferasha *">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex. Atelier Salma" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Catégorie *">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </select>
            </Field>
            <Field label="Ville *">
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Présentation courte">
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Quelques mots sur ton activité..." className={`${inputCls} h-auto py-2.5 resize-none`} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+212 6 12 34 56 78" className={inputCls} /></Field>
            <Field label="Téléphone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212..." className={inputCls} /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@..." className={inputCls} /></Field>
            <Field label="Instagram"><input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@monatelier" className={inputCls} /></Field>
          </div>
          <button type="submit" disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {ferasha ? "Enregistrer" : "Créer ma Ferasha"}
          </button>
          {msg && <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{msg}</p>}
        </form>

        {ferasha && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Mes publications</h2>
              <Link to="/listings/new" className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow-soft hover:opacity-90">
                <Plus className="size-3.5" /> Nouveau
              </Link>
            </div>
            {listings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">Pas encore de publication.</p>
                <Link to="/listings/new" className="mt-3 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
                  Publier mon premier produit
                </Link>
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
        )}
      </main>

      <BottomNav />
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
