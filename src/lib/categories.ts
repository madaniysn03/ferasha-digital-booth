export const CATEGORIES = [
  { value: "artisanat", label: "Artisanat", emoji: "🧵" },
  { value: "beaute", label: "Beauté & Soins", emoji: "💄" },
  { value: "mode", label: "Mode & Couture", emoji: "👗" },
  { value: "alimentation", label: "Alimentation", emoji: "🍯" },
  { value: "services", label: "Services", emoji: "🛎️" },
  { value: "bricolage", label: "Bricolage", emoji: "🔧" },
  { value: "tech", label: "Tech & Digital", emoji: "💻" },
  { value: "education", label: "Éducation", emoji: "📚" },
  { value: "sante", label: "Santé & Bien-être", emoji: "🌿" },
  { value: "transport", label: "Transport", emoji: "🚐" },
  { value: "evenementiel", label: "Événementiel", emoji: "🎉" },
  { value: "autre", label: "Autre", emoji: "✨" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as [CategoryValue, ...CategoryValue[]];

export const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir",
  "Meknès", "Oujda", "Kénitra", "Tétouan", "Salé", "Mohammedia",
  "El Jadida", "Nador", "Béni Mellal", "Taza", "Khouribga", "Settat",
] as const;

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
export function categoryEmoji(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.emoji ?? "✨";
}

const CATEGORY_LABELS_AR: Record<CategoryValue, string> = {
  artisanat: "الحرف اليدوية",
  beaute: "الجمال والعناية",
  mode: "الموضة والخياطة",
  alimentation: "المواد الغذائية",
  services: "خدمات",
  bricolage: "أشغال يدوية",
  tech: "تقنية ورقمنة",
  education: "التعليم",
  sante: "الصحة والعافية",
  transport: "النقل",
  evenementiel: "تنظيم الفعاليات",
  autre: "أخرى",
};

const CITY_LABELS_AR: Record<(typeof CITIES)[number], string> = {
  Casablanca: "الدار البيضاء", Rabat: "الرباط", Marrakech: "مراكش", Fès: "فاس",
  Tanger: "طنجة", Agadir: "أكادير", Meknès: "مكناس", Oujda: "وجدة",
  Kénitra: "القنيطرة", Tétouan: "تطوان", Salé: "سلا", Mohammedia: "المحمدية",
  "El Jadida": "الجديدة", Nador: "الناظور", "Béni Mellal": "بني ملال",
  Taza: "تازة", Khouribga: "خريبكة", Settat: "سطات",
};

export function categoryLabelFor(value: string, locale: "fr" | "ar"): string {
  if (locale === "ar") return CATEGORY_LABELS_AR[value as CategoryValue] ?? categoryLabel(value);
  return categoryLabel(value);
}

export function cityLabelFor(value: string, locale: "fr" | "ar"): string {
  if (locale === "ar") return CITY_LABELS_AR[value as (typeof CITIES)[number]] ?? value;
  return value;
}
