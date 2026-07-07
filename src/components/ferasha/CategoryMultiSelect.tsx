import { CATEGORIES, type CategoryValue } from "@/lib/categories";

// Sélecteur multi-catégories pour une Ferasha. La 1ʳᵉ catégorie choisie est la
// catégorie PRINCIPALE (badge de la carte) ; la Ferasha remonte sous le filtre de
// chacune des catégories sélectionnées. `options` limite le choix aux catégories
// autorisées sur le compte.
export function CategoryMultiSelect({
  options,
  value,
  onChange,
}: {
  options: CategoryValue[];
  value: CategoryValue[];
  onChange: (next: CategoryValue[]) => void;
}) {
  function toggle(v: CategoryValue) {
    onChange(value.includes(v) ? value.filter((c) => c !== v) : [...value, v]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.filter((c) => options.includes(c.value)).map((c) => {
          const selected = value.includes(c.value);
          const primary = value[0] === c.value;
          return (
            <button
              type="button"
              key={c.value}
              onClick={() => toggle(c.value)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selected
                  ? "border-secondary bg-secondary/20 text-secondary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.emoji} {c.label}
              {primary && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
                  principale
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        La 1ʳᵉ catégorie sélectionnée est la catégorie <b>principale</b> (affichée sur la carte). La
        Ferasha apparaîtra dans le filtre de <b>chacune</b> des catégories choisies.
      </p>
    </div>
  );
}
