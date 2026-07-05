export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

export function contactUrls(opts: {
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  website?: string | null;
  prefilledMessage?: string;
}) {
  const msg = opts.prefilledMessage ? encodeURIComponent(opts.prefilledMessage) : "";
  const clean = (s?: string | null) => (s ?? "").replace(/[^\d+]/g, "");
  const withScheme = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`);
  return {
    whatsapp: opts.whatsapp
      ? `https://wa.me/${clean(opts.whatsapp).replace(/^\+/, "")}${msg ? `?text=${msg}` : ""}`
      : null,
    phone: opts.phone ? `tel:${clean(opts.phone)}` : null,
    email: opts.email ? `mailto:${opts.email}` : null,
    instagram: opts.instagram
      ? `https://instagram.com/${opts.instagram.replace(/^@/, "")}`
      : null,
    linkedin: opts.linkedin ? withScheme(opts.linkedin) : null,
    website: opts.website ? withScheme(opts.website) : null,
  };
}
