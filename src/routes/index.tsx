import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Sparkles, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FerashaCard } from "@/components/ferasha/FerashaCard";
import { CATEGORIES, CITIES, categoryEmoji, categoryLabelFor, cityLabelFor } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

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
  id: string; name: string; slug: string; category: string; categories: string[];
  city: string; bio: string | null; logo_url: string | null; created_at: string;
};

const PAGE_SIZE = 20;

function Explorer() {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [list, setList] = useState<Ferasha[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  async function fetchPage(reset: boolean, cursor?: { created_at: string; id: string }) {
    let query = supabase
      .from("ferashas")
      .select("id,name,slug,category,categories,city,bio,logo_url,created_at")
      .eq("is_published", true);
    if (cat) query = query.contains("categories", [cat]);
    if (city) query = query.eq("city", city);
    if (debouncedQ.trim()) query = query.textSearch("search_vector", debouncedQ.trim(), { type: "websearch", config: "french" });
    if (cursor) {
      query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
    }
    query = query.order("created_at", { ascending: false }).order("id", { ascending: false }).limit(PAGE_SIZE);

    const { data } = await query;
    const rows = (data as Ferasha[] | null) ?? [];
    setList((prev) => (reset || !prev ? rows : [...prev, ...rows]));
    setHasMore(rows.length === PAGE_SIZE);
  }

  useEffect(() => {
    setList(null);
    fetchPage(true);
  }, [cat, city, debouncedQ]);

  async function loadMore() {
    if (!list || list.length === 0) return;
    setLoadingMore(true);
    const last = list[list.length - 1];
    await fetchPage(false, { created_at: last.created_at, id: last.id });
    setLoadingMore(false);
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <TopBar showLangSwitch />

      <section className="ferasha-gradient relative overflow-hidden">
        <div className="mx-auto max-w-2xl px-4 py-8 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs font-medium opacity-90">
            <Sparkles className="size-4" /> {t.home.tagline}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight md:text-4xl">
            {t.home.title} <span className="text-accent">{t.home.titleHighlight}</span>
          </h1>
          <p className="mt-2 max-w-md text-sm opacity-90">
            {t.home.subtitle}
          </p>
          <div className="mt-5 flex gap-2">
            <Link to="/devenir-pro" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-90">
              <Plus className="size-4" /> {t.home.createCta}
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-primary-foreground/20">
              {t.home.loginCta}
            </Link>
          </div>
        </div>
      </section>

      <div className="sticky top-14 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.home.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-border bg-card ps-10 pe-4 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <FilterChip active={!cat} onClick={() => setCat(null)}>{t.home.allCategories}</FilterChip>
            {CATEGORIES.map((c) => (
              <FilterChip key={c.value} active={cat === c.value} onClick={() => setCat(cat === c.value ? null : c.value)}>
                {c.emoji} {categoryLabelFor(c.value, locale)}
              </FilterChip>
            ))}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <FilterChip active={!city} onClick={() => setCity(null)} variant="city">{t.home.allCities}</FilterChip>
            {CITIES.map((c) => (
              <FilterChip key={c} active={city === c} onClick={() => setCity(city === c ? null : c)} variant="city">{cityLabelFor(c, locale)}</FilterChip>
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
        ) : list.length === 0 ? (
          <EmptyState cat={cat} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {list.map((f) => <FerashaCard key={f.id} {...f} />)}
            </div>
            {hasMore && (
              <div className="mt-5 flex justify-center">
                <button onClick={loadMore} disabled={loadingMore}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-50">
                  {loadingMore && <Loader2 className="size-4 animate-spin" />}
                  {t.home.loadMore}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mx-auto max-w-2xl px-4 pb-6 pt-2 text-center text-xs text-muted-foreground">
        <a href="/mentions-legales" className="hover:underline">Mentions légales</a>
        <span className="mx-2">·</span>
        <a href="/confidentialite" className="hover:underline">Confidentialité</a>
      </footer>

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
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <div className="text-4xl">{cat ? categoryEmoji(cat) : "🌱"}</div>
      <h3 className="mt-2 font-display text-lg font-semibold">{t.home.emptyTitle}</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {t.home.emptySubtitle}
      </p>
      <Link to="/devenir-pro" className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-soft hover:opacity-90">
        {t.home.createCta}
      </Link>
    </div>
  );
}
