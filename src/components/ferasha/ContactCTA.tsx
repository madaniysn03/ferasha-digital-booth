import { MessageCircle, Phone, Mail, Instagram, Share2, Linkedin, Globe } from "lucide-react";
import { contactUrls } from "@/lib/slug";
import { useI18n } from "@/lib/i18n/context";

type Props = {
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  website?: string | null;
  ferashaName: string;
};

export function ContactCTA({ whatsapp, phone, email, instagram, linkedin, website, ferashaName }: Props) {
  const { t } = useI18n();
  const urls = contactUrls({ whatsapp, phone, email, instagram, linkedin, website, prefilledMessage: `Salam, j'ai vu ta Ferasha "${ferashaName}" et j'aimerais en savoir plus.` });

  async function share() {
    const shareData = { title: ferashaName, text: `Découvre la Ferasha de ${ferashaName}`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert(t.ferasha.linkCopied);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {urls.whatsapp && (
        <a href={urls.whatsapp} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground shadow-soft transition hover:opacity-90">
          <MessageCircle className="size-4" /> {t.ferasha.whatsapp}
        </a>
      )}
      {urls.phone && (
        <a href={urls.phone}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted">
          <Phone className="size-4" /> {t.ferasha.call}
        </a>
      )}
      {urls.email && (
        <a href={urls.email}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted">
          <Mail className="size-4" /> {t.ferasha.emailContact}
        </a>
      )}
      {urls.instagram && (
        <a href={urls.instagram} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted">
          <Instagram className="size-4" /> {t.ferasha.instagram}
        </a>
      )}
      {urls.linkedin && (
        <a href={urls.linkedin} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted">
          <Linkedin className="size-4" /> {t.ferasha.linkedin}
        </a>
      )}
      {urls.website && (
        <a href={urls.website} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:bg-muted">
          <Globe className="size-4" /> {t.ferasha.website}
        </a>
      )}
      <button type="button" onClick={share}
        className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition hover:opacity-90">
        <Share2 className="size-4" /> {t.ferasha.share}
      </button>
    </div>
  );
}
