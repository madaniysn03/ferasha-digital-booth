import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, UserPlus, Ban, CheckCircle2, Pencil, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CATEGORIES, categoryLabel, type CategoryValue } from "@/lib/categories";
import { provisionPro, updateProAccess } from "@/lib/api/superadmin.functions";
import { ReviewModerationSection } from "@/components/ferasha/ReviewModerationSection";

export const Route = createFileRoute("/_authenticated/superadmin")({
  beforeLoad: ({ context }) => {
    if (context.role !== "superadmin") throw redirect({ to: "/my-ferasha" });
  },
  component: SuperadminPage,
});

type Pro = {
  id: string;
  full_name: string | null;
  email: string | null;
  allowed_categories: string[];
  account_status: string;
  must_change_password: boolean;
};

function SuperadminPage() {
  const [loading, setLoading] = useState(true);
  const [pros, setPros] = useState<Pro[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", fullName: "", categories: [] as CategoryValue[] });
  const [reveal, setReveal] = useState<{ email: string; tempPassword: string } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategories, setEditCategories] = useState<CategoryValue[]>([]);
  const [savingCategories, setSavingCategories] = useState(false);

  async function loadPros() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, allowed_categories, account_status, must_change_password")
      .eq("role", "pro")
      .order("created_at", { ascending: false });
    setPros((data as Pro[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadPros(); }, []);

  function toggleCategory(value: CategoryValue) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(value) ? f.categories.filter((c) => c !== value) : [...f.categories, value],
    }));
  }

  async function createPro(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (form.categories.length === 0) { setMsg("Choisis au moins une catégorie."); return; }
    setCreating(true);
    try {
      const result = await provisionPro({ data: { email: form.email, fullName: form.fullName, allowedCategories: form.categories } });
      setReveal(result);
      setForm({ email: "", fullName: "", categories: [] });
      await loadPros();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Erreur");
    } finally { setCreating(false); }
  }

  async function toggleStatus(pro: Pro) {
    const next = pro.account_status === "active" ? "suspended" : "active";
    await updateProAccess({ data: { proId: pro.id, accountStatus: next } });
    await loadPros();
  }

  function startEditCategories(pro: Pro) {
    setEditingId(pro.id);
    setEditCategories(pro.allowed_categories as CategoryValue[]);
  }

  function toggleEditCategory(value: CategoryValue) {
    setEditCategories((cats) => (cats.includes(value) ? cats.filter((c) => c !== value) : [...cats, value]));
  }

  async function saveCategories(proId: string) {
    if (editCategories.length === 0) return;
    setSavingCategories(true);
    try {
      await updateProAccess({ data: { proId, allowedCategories: editCategories } });
      setEditingId(null);
      await loadPros();
    } finally { setSavingCategories(false); }
  }

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <TopBar />
      <main className="mx-auto max-w-2xl px-4 py-5 space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-secondary" />
          <h1 className="font-display text-2xl font-bold">Espace superadmin</h1>
        </div>

        {reveal && (
          <div className="rounded-2xl border-2 border-secondary bg-secondary/10 p-5">
            <p className="text-sm font-semibold">Compte pro créé — note ces identifiants, ils ne seront plus réaffichés :</p>
            <p className="mt-2 font-mono text-sm">Email : {reveal.email}</p>
            <p className="font-mono text-sm">Mot de passe temporaire : {reveal.tempPassword}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Transmets-les au pro par un canal sûr. Il devra changer ce mot de passe à sa 1ʳᵉ connexion.
            </p>
            <button onClick={() => setReveal(null)} className="mt-3 text-xs font-semibold text-secondary underline-offset-2 hover:underline">
              J'ai noté, fermer
            </button>
          </div>
        )}

        <form onSubmit={createPro} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <UserPlus className="size-4" /> Créer un compte pro
          </h2>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Nom complet *</span>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email *</span>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30" />
          </label>
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Catégories autorisées *</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button type="button" key={c.value} onClick={() => toggleCategory(c.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    form.categories.includes(c.value) ? "border-secondary bg-secondary/20 text-secondary-foreground" : "border-border bg-background text-muted-foreground"
                  }`}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={creating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90 disabled:opacity-50">
            {creating ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Créer le compte pro
          </button>
          {msg && <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{msg}</p>}
        </form>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Comptes pro ({pros.length})</h2>
          {pros.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun compte pro pour l'instant.</p>
          ) : (
            <div className="space-y-2">
              {pros.map((p) => (
                <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{p.full_name ?? "(sans nom)"}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                    <button onClick={() => toggleStatus(p)}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        p.account_status === "active" ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "bg-secondary/20 text-secondary-foreground"
                      }`}>
                      {p.account_status === "active" ? <><Ban className="size-3.5" /> Suspendre</> : <><CheckCircle2 className="size-3.5" /> Réactiver</>}
                    </button>
                  </div>
                  {editingId === p.id ? (
                    <div className="mt-2 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                          <button type="button" key={c.value} onClick={() => toggleEditCategory(c.value)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                              editCategories.includes(c.value) ? "border-secondary bg-secondary/20 text-secondary-foreground" : "border-border bg-background text-muted-foreground"
                            }`}>
                            {c.emoji} {c.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveCategories(p.id)} disabled={savingCategories || editCategories.length === 0}
                          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
                          {savingCategories ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Enregistrer
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted">
                          <X className="size-3.5" /> Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      {p.allowed_categories.map((c) => (
                        <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{categoryLabel(c)}</span>
                      ))}
                      <button onClick={() => startEditCategories(p)}
                        className="ml-1 flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:border-secondary hover:text-secondary-foreground">
                        <Pencil className="size-3" /> Modifier
                      </button>
                    </div>
                  )}
                  {p.must_change_password && (
                    <p className="mt-2 text-[10px] font-medium text-accent">En attente du 1ᵉʳ changement de mot de passe</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <ReviewModerationSection />
      </main>
      <BottomNav />
    </div>
  );
}
