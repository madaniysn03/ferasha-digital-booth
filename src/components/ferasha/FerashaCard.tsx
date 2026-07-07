import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { categoryEmoji, categoryLabel } from "@/lib/categories";

type Props = {
  slug: string;
  name: string;
  category: string;
  categories?: string[];
  city: string;
  bio?: string | null;
  logo_url?: string | null;
};

export function FerashaCard({ slug, name, category, categories, city, bio, logo_url }: Props) {
  const initial = name.charAt(0).toUpperCase();
  // Catégories secondaires (hors principale) à afficher en petit sous le nom.
  const extra = (categories ?? []).filter((c) => c !== category);
  return (
    <Link
      to="/ferasha/$slug"
      params={{ slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="ferasha-gradient relative aspect-[5/3] w-full">
        {logo_url ? (
          <img src={logo_url} alt={name} className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="grid size-full place-items-center font-display text-5xl text-primary-foreground">
            {initial}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium backdrop-blur">
          {categoryEmoji(category)} {categoryLabel(category)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-base font-semibold leading-tight">{name}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" /> {city}
        </p>
        {extra.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {extra.map((c) => (
              <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {categoryEmoji(c)} {categoryLabel(c)}
              </span>
            ))}
          </div>
        )}
        {bio ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bio}</p>
        ) : null}
      </div>
    </Link>
  );
}
