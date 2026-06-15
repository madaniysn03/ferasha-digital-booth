import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { categoryEmoji, categoryLabel } from "@/lib/categories";

type Props = {
  slug: string;
  name: string;
  category: string;
  city: string;
  bio?: string | null;
  logo_url?: string | null;
};

export function FerashaCard({ slug, name, category, city, bio, logo_url }: Props) {
  const initial = name.charAt(0).toUpperCase();
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
        {bio ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bio}</p>
        ) : null}
      </div>
    </Link>
  );
}
