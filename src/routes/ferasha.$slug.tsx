import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { ListingCard } from "@/components/ferasha/ListingCard";
import { ListingDetailDialog } from "@/components/ferasha/ListingDetailDialog";
import { ImageLightbox } from "@/components/ferasha/ImageLightbox";
import { ContactCTA } from "@/components/ferasha/ContactCTA";
import { ReviewsSection } from "@/components/ferasha/ReviewsSection";
import { Stars } from "@/components/ferasha/Stars";
import { categoryEmoji, categoryLabelFor } from "@/lib/categories";
import { useI18n } from "@/lib/i18n/context";

export const Route = createFileRoute("/ferasha/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} · Ferasha Quantic` },
      { name: "description", content: `Découvre la Ferasha de ${params.slug} sur Ferasha Quantic.` },
      { property: "og:title", content: `${params.slug} · Ferasha Quantic` },
      { property: "og:description", content: `Découvre cette Ferasha sur Ferasha Quantic.` },
    ],
  }),
  component: FerashaPublic,
  errorComponent: ({ error }) => <div className="p-8 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => {
    const { t } = useI18n();
    return <div className="p-8 text-center"><p>{t.notFound.title}</p><Link to="/" className="mt-4 inline-block text-primary underline">{t.notFound.home}</Link></div>;
  },
});

type F = {
  id: string; name: string; slug: string; category: string; categories: string[] | null; city: string;
  bio: string | null; logo_url: string | null; whatsapp: string | null;
  phone: string | null; email: string | null; instagram: string | null;
  linkedin: string | null; website: string | null;
  rating_avg: number; rating_count: number;
};
type L = {
  id: string; title: string; description: string | null; price: number | null;
  currency: string; type: "produit" | "service"; status: "actif" | "pause"; image_url: string | null;
};

function FerashaPublic() {
  const { t, locale } = useI18n();
  const { slug } = Route.useParams();
  const [f, setF] = useState<F | null | undefined>(undefined);
  const [listings, setListings] = useState<L[]>([]);
  const [selectedListing, setSelectedListing] = useState<L | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ferashas").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (!data) { setF(null); return; }
      setF(data as F);
      // atomic increment (RPC), fire-and-forget
      void supabase.rpc("increment_ferasha_views", { ferasha_id: data.id });
      const { data: l } = await supabase.from("listings").select("*").eq("ferasha_id", data.id).eq("status", "actif").order("created_at", { ascending: false });
      setListings((l as L[] | null) ?? []);
    })();
  }, [slug]);

  if (f === undefined) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;
  if (f === null) throw notFound();

  const initial = f.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pb-12">
      <TopBar showLangSwitch />
      <Link to="/" className="mx-auto block max-w-2xl px-4 pt-3">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5 rtl:-scale-x-100" /> {t.ferasha.backToAll}
        </span>
      </Link>

      <header className="ferasha-gradient relative mt-3">
        <div className="mx-auto max-w-2xl px-4 py-8 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-background/20 backdrop-blur font-display text-4xl">
              {f.logo_url ? (
                <button type="button" onClick={() => setLightboxSrc(f.logo_url)} className="size-full cursor-zoom-in">
                  <img src={f.logo_url} alt="" className="size-full object-cover" />
                </button>
              ) : initial}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold leading-tight">{f.name}</h1>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(f.categories?.length ? f.categories : [f.category]).map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-background/20 px-2.5 py-1 text-xs font-medium backdrop-blur">
                    {categoryEmoji(c)} {categoryLabelFor(c, locale)}
                  </span>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1 text-sm opacity-90">
                <MapPin className="size-3.5" /> {f.city}
              </p>
              {f.rating_count > 0 && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm opacity-95">
                  <Stars value={f.rating_avg} size="size-3.5" /> {f.rating_avg.toFixed(1)} ({f.rating_count})
                </p>
              )}
            </div>
          </div>
          {f.bio && <p className="mt-4 text-sm leading-relaxed opacity-95">{f.bio}</p>}
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <ContactCTA whatsapp={f.whatsapp} phone={f.phone} email={f.email} instagram={f.instagram} linkedin={f.linkedin} website={f.website} ferashaName={f.name} />

        <section>
          <h2 className="font-display text-lg font-semibold">{t.ferasha.publications}</h2>
          {listings.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              {t.ferasha.noPublications}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {listings.map((l) => <ListingCard key={l.id} {...l} onClick={() => setSelectedListing(l)} />)}
            </div>
          )}
        </section>

        <ReviewsSection ferashaId={f.id} ratingAvg={f.rating_avg} ratingCount={f.rating_count} />
      </main>

      <ListingDetailDialog listing={selectedListing} onClose={() => setSelectedListing(null)} />
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
