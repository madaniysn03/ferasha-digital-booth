import { useState } from "react";
import { ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ImageLightbox } from "@/components/ferasha/ImageLightbox";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string;
  type: "produit" | "service";
  status: "actif" | "pause";
  image_url: string | null;
};

type Props = {
  listing: Listing | null;
  onClose: () => void;
};

export function ListingDetailDialog({ listing, onClose }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <Dialog open={!!listing} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {listing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{listing.title}</DialogTitle>
              </DialogHeader>

              {listing.image_url && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group relative overflow-hidden rounded-xl"
                >
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    className="max-h-80 w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <ZoomIn className="size-6 text-white opacity-0 transition group-hover:opacity-100" />
                  </span>
                </button>
              )}

              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">
                  {listing.type === "service" ? "🛎️ Service" : "📦 Produit"}
                </span>
                {listing.status === "pause" && (
                  <span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground">En pause</span>
                )}
              </div>

              {listing.description && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {listing.description}
                </p>
              )}

              {listing.price != null ? (
                <p className="text-lg font-bold text-accent">
                  {listing.price.toLocaleString("fr-FR")} {listing.currency}
                </p>
              ) : (
                <p className="text-sm italic text-muted-foreground">Sur demande</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {listing?.image_url && lightboxOpen && (
        <ImageLightbox src={listing.image_url} alt={listing.title} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
