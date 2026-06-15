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
