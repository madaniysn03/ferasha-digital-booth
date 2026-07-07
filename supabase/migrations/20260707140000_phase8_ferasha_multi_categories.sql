-- Phase 8 : une Ferasha peut appartenir à plusieurs catégories
-- `category` reste la catégorie PRINCIPALE (badge affiché sur la carte / la page).
-- On ajoute `categories[]` = l'ensemble des catégories de la Ferasha (principale
-- incluse), utilisé par les filtres de l'accueil. Une Ferasha remonte donc sous
-- chacune de ses catégories.

ALTER TABLE public.ferashas
  ADD COLUMN categories public.ferasha_category[] NOT NULL DEFAULT '{}';

-- Backfill : la catégorie unique existante devient l'unique entrée du tableau.
UPDATE public.ferashas SET categories = ARRAY[category] WHERE cardinality(categories) = 0;

-- Intégrité : la catégorie principale doit toujours faire partie de l'ensemble.
ALTER TABLE public.ferashas
  ADD CONSTRAINT ferashas_category_in_categories CHECK (category = ANY (categories));

-- Index GIN pour des filtres "contains" (categories @> ARRAY[cat]) performants.
CREATE INDEX ferashas_categories_gin ON public.ferashas USING GIN (categories);

-- RLS : un pro ne peut ranger sa Ferasha que dans des catégories qui lui ont été
-- assignées (categories ⊆ allowed_categories). Le superadmin n'est pas restreint.
-- Comme `category = ANY(categories)` (CHECK ci-dessus), la principale est aussi
-- forcément dans allowed_categories — plus besoin de la vérifier séparément.
DROP POLICY IF EXISTS "ferashas_owner_insert" ON public.ferashas;
CREATE POLICY "ferashas_owner_insert" ON public.ferashas FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.account_status = 'active'
        AND (
          p.role = 'superadmin'
          OR (p.role = 'pro' AND categories <@ p.allowed_categories)
        )
    )
  );

DROP POLICY IF EXISTS "ferashas_owner_update" ON public.ferashas;
CREATE POLICY "ferashas_owner_update" ON public.ferashas FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.account_status = 'active'
        AND (
          p.role = 'superadmin'
          OR (p.role = 'pro' AND categories <@ p.allowed_categories)
        )
    )
  );
