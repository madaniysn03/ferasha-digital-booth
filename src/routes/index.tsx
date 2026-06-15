import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Sparkles, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FerashaCard } from "@/components/ferasha/FerashaCard";
import { CATEGORIES, CITIES, categoryEmoji } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ferasha Quantic — La marketplace des entrepreneurs" },
      { name: "description", content: "Crée ta vitrine digitale en 1 minute. Découvre les talents, artisans et services près de chez toi." },
      { property: "og:title", content: "Ferasha Quantic — La marketplace des entrepreneurs" },
      { property: "og:description", content: "Crée ta vitrine digitale en 1 minute. Découvre les talents, artisans et services près de chez toi." },
    ],
  }),
  component: Explorer,
});

type Ferasha = {
  id: string; name: string; slug: string; category: string;
  city: string; bio: string | null; logo_url: string | null;
};

function Explorer() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [list, setList] = useState<Ferasha[] | null>(null);

  useEffect(() => {
    let q2 = supabase.from("ferashas").select("id,name,slug,category,city,bio,logo_url").eq("is_published", true).order("created_at", { ascending: false }).limit(60);
    if (cat) q2 = q2.eq("category", cat as never);
    if (city) q2 = q2.eq("city", city);
    q2.then(({ data }) => setList((data as Ferasha[] | null) ?? []));
  }, [cat, city]);

  const filtered = (list ?? []).filter((f) =>
    q.trim() ? (f.name + " " + (f.bio ?? "")).toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <TopBar />

      <section className="ferasha-gradient relative overflow-hidden">
        <div className="mx-auto max-w-2xl px-4 py-8 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs font-medium opacity-90">
            <Sparkles className="size-4" /> Ta Ferasha digitale, en 1 minute
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
            La marketplace des entrepreneurs <span className="text-accent">de chez toi</span>
          </h1>
          <p className="mt-2 max-w-md text-sm opacity-90">
            Découvre artisans, talents, services et produits près de chez toi — ou ouvre ta propre vitrine en 3 clics.
          </p>
          <div className="mt-5 flex gap-2">
            <Link to="/my-ferasha" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-90">
              <Plus className="size-4" /> Créer ma Ferasha
            </Link>
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-primary-foreground/20">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une Ferasha, un talent…"
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <FilterChip active={!cat} onClick={() => setCat(null)}>Tout</FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip key={c.value} active={cat === c.value} onClick={() => setCat(cat === c.value ? null : c.value)}>
                {c.emoji} {c.label}
              </FilterChip>
            ))}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <FilterChip active={!city} onClick={() => setCity(null)} variant="city">Toutes villes</FilterChip>
            {CITIES.map((c) => (
              <FilterChip key={c} active={city === c} onClick={() => setCity(city === c ? null : c)} variant="city">{c}</FilterChip>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-5">
        {list === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[5/4] animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState cat={cat} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((f) => <FerashaCard key={f.id} {...f} />)}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function FilterChip({ active, onClick, children, variant = "cat" }: { active: boolean; onClick: () => void; children: React.ReactNode; variant?: "cat" | "city" }) {
  return (
    <button onClick={onClick} className={cn(
      "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition",
      active
        ? variant === "city"
          ? "border-secondary bg-secondary text-secondary-foreground"
          : "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-muted-foreground hover:text-foreground",
    )}>
      {children}
    </button>
  );
}

function EmptyState({ cat }: { cat: string | null }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <div className="text-4xl">{cat ? categoryEmoji(cat) : "🌱"}</div>
      <h3 className="mt-2 font-display text-lg font-semibold">Aucune Ferasha pour le moment</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Sois le premier à ouvrir ta vitrine ici.
      </p>
      <Link to="/my-ferasha" className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft hover:opacity-90">
        Créer ma Ferasha
      </Link>
    </div>
  );
}
