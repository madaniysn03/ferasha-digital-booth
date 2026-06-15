import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string | null;
  price?: number | null;
  currency?: string;
  type?: "produit" | "service";
  image_url?: string | null;
  status?: "actif" | "pause";
  onClick?: () => void;
  className?: string;
};

export function ListingCard({ title, description, price, currency = "MAD", type = "produit", image_url, status, onClick, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow",
        className,
      )}
    >
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
        {image_url ? (
          <img src={image_url} alt={title} className="size-full object-cover" loading="lazy" />
        ) : (
          <span className="font-display text-2xl text-muted-foreground">
            {type === "service" ? "🛎️" : "📦"}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 font-display text-sm font-semibold">{title}</h4>
          {status === "pause" ? (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">En pause</span>
          ) : null}
        </div>
        {description ? <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p> : null}
        {price != null ? (
          <p className="mt-auto text-sm font-bold text-accent">
            {price.toLocaleString("fr-FR")} {currency}
          </p>
        ) : (
          <p className="mt-auto text-xs italic text-muted-foreground">Sur demande</p>
        )}
      </div>
    </button>
  );
}
