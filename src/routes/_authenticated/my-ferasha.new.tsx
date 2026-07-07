import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { CATEGORIES, CITIES, type CategoryValue } from "@/lib/categories";
import { CategoryMultiSelect } from "@/components/ferasha/CategoryMultiSelect";
import { slugify } from "@/lib/slug";

export const Route = createFileRoute("/_authenticated/my-ferasha/new")({
  component: NewFerasha,
});

function NewFerasha() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [allowedCategories, setAllowedCategories] = useState<CategoryValue[] | null>(null);

  const [form, setForm] = useState({
    name: "", categories: [] as CategoryValue[], city: "Casablanca", bio: "",
    whatsapp: "", phone: "", email: "", instagram: "", linkedin: "", website: "",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: prof } = await supabase.from("profiles").select("role, allowed_categories").eq("id", u.user.id).maybeSingle();
      const options = prof?.role === "superadmin" ? CATEGORIES.map((c) => c.value) : ((prof?.allowed_categories as CategoryValue[] | undefined) ?? []);
      setAllowedCategories(options);
      setForm((f) => ({ ...f, categories: options[0] ? [options[0]] : [] }));
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Non connecté");
      if (form.categories.length === 0) throw new Error("Choisis au moins une catégorie.");

      let slug = slugify(form.name) || "ferasha";
      let attempt = slug;
      for (let i = 1; i < 50; i++) {
        const { data: ex } = await supabase.from("ferashas").select("id").eq("slug", attempt).maybeSingle();
        if (!ex) { slug = attempt; break; }
        attempt = `${slug}-${i + 1}`;
      }

      const { data: created, error } = await supabase.from("ferashas").insert({
        owner_id: u.user.id, name: form.name, slug,
        category: form.categories[0] as never, categories: form.categories as never, city: form.city, bio: form.bio || null,
        whatsapp: form.whatsapp || null, phone: form.phone || null,
        email: form.email || null, instagram: form.instagram || null,
        linkedin: form.linkedin || null, website: form.website || null,
      }).select().single();
      if (error) throw error;
      navigate({ to: "/my-ferasha/$id", params: { id: created.id } });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;

  return (
    <div className="min-h-screen pb-12">
      <TopBar />
      <main className="mx-auto max-w-md px-4 py-5">
        <Link to="/my-ferasha" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Retour
        </Link>
        <h1 className="font-display text-2xl font-bold">Nouvelle Ferasha</h1>

        {allowedCategories && allowedCategories.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">Aucune catégorie ne t'a encore été assignée. Contacte le superadmin.</p>
          </div>
        ) : (
          <form onSubmit={save} className="mt-5 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <Field label="Nom de la Ferasha *">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex. Atelier Salma" className={inputCls} />
            </Field>
            <Field label="Catégories * (une ou plusieurs)">
              <CategoryMultiSelect
                options={allowedCategories ?? []}
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
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Quelques mots sur ton activité..." className={`${inputCls} h-auto py-2.5 resize-none`} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+212 6 12 34 56 78" className={inputCls} /></Field>
              <Field label="Téléphone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212..." className={inputCls} /></Field>
              <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@..." className={inputCls} /></Field>
              <Field label="Instagram"><input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@monatelier" className={inputCls} /></Field>
              <Field label="LinkedIn"><input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/..." className={inputCls} /></Field>
              <Field label="Site web"><input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className={inputCls} /></Field>
            </div>
            <button type="submit" disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Créer ma Ferasha
            </button>
            {msg && <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{msg}</p>}
          </form>
        )}
      </main>
    </div>
  );
}

const inputCls = "h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
