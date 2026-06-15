import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/layout/TopBar";
import { ListingCard } from "@/components/ferasha/ListingCard";
import { ContactCTA } from "@/components/ferasha/ContactCTA";
import { categoryEmoji, categoryLabel } from "@/lib/categories";

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
  notFoundComponent: () => <div className="p-8 text-center"><p>Ferasha introuvable</p><Link to="/" className="mt-4 inline-block text-primary underline">Retour à l'accueil</Link></div>,
});

type F = {
  id: string; name: string; slug: string; category: string; city: string;
  bio: string | null; logo_url: string | null; whatsapp: string | null;
  phone: string | null; email: string | null; instagram: string | null;
};
type L = {
  id: string; title: string; description: string | null; price: number | null;
  currency: string; type: "produit" | "service"; status: "actif" | "pause"; image_url: string | null;
};

function FerashaPublic() {
  const { slug } = Route.useParams();
  const [f, setF] = useState<F | null | undefined>(undefined);
  const [listings, setListings] = useState<L[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ferashas").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (!data) { setF(null); return; }
      setF(data as F);
      // increment views fire-and-forget
      void supabase.from("ferashas").update({ views_count: (data.views_count ?? 0) + 1 }).eq("id", data.id);
      const { data: l } = await supabase.from("listings").select("*").eq("ferasha_id", data.id).eq("status", "actif").order("created_at", { ascending: false });
      setListings((l as L[] | null) ?? []);
    })();
  }, [slug]);

  if (f === undefined) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-secondary" /></div>;
  if (f === null) throw notFound();

  const initial = f.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pb-12">
      <TopBar />
      <Link to="/" className="mx-auto block max-w-2xl px-4 pt-3">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Toutes les Ferashas
        </span>
      </Link>

      <header className="ferasha-gradient relative mt-3">
        <div className="mx-auto max-w-2xl px-4 py-8 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-background/20 backdrop-blur font-display text-4xl">
              {f.logo_url ? <img src={f.logo_url} alt="" className="size-full object-cover" /> : initial}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold leading-tight">{f.name}</h1>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-background/20 px-2.5 py-1 text-xs font-medium backdrop-blur">
                {categoryEmoji(f.category)} {categoryLabel(f.category)}
              </p>
              <p className="mt-2 flex items-center gap-1 text-sm opacity-90">
                <MapPin className="size-3.5" /> {f.city}
              </p>
            </div>
          </div>
          {f.bio && <p className="mt-4 text-sm leading-relaxed opacity-95">{f.bio}</p>}
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <ContactCTA whatsapp={f.whatsapp} phone={f.phone} email={f.email} instagram={f.instagram} ferashaName={f.name} />

        <section>
          <h2 className="font-display text-lg font-semibold">Publications</h2>
          {listings.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Cette Ferasha n'a pas encore publié.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {listings.map((l) => <ListingCard key={l.id} {...l} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
