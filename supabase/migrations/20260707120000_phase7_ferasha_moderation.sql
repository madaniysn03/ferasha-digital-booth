-- Phase 7 : modération des Ferashas par le superadmin
-- Le superadmin peut désormais suspendre une Ferasha précise (sans toucher au reste
-- du compte) OU tout le compte pro. Une suspension (Ferasha ou compte) retire
-- immédiatement le contenu concerné de tout l'espace public : c'est la RLS de la base
-- qui fait foi, donc l'état est le même partout dans l'app (accueil, page publique,
-- espace pro, espace superadmin).

-- 1. État de modération sur la Ferasha.
ALTER TABLE public.ferashas
  ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'active'
    CHECK (moderation_status IN ('active', 'suspended')),
  ADD COLUMN suspended_at TIMESTAMPTZ,
  ADD COLUMN suspended_reason TEXT;

-- 2. Helper SECURITY DEFINER : statut du compte d'un owner, interrogeable depuis une
--    policy publique sans être bloqué par la RLS de `profiles` (durcie en phase 6, où
--    l'anon ne peut plus lire les lignes profiles). Sans ce helper, la sous-requête
--    EXISTS renverrait toujours faux côté public et masquerait TOUTES les Ferashas.
CREATE OR REPLACE FUNCTION public.account_is_active(uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND account_status = 'active'
  );
$$;
REVOKE ALL ON FUNCTION public.account_is_active(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_is_active(UUID) TO anon, authenticated;

-- 3. Lecture publique des Ferashas : masquée si la Ferasha est suspendue OU si le
--    compte owner est suspendu. L'owner voit toujours la sienne (pour afficher le
--    bandeau de modération) ; le superadmin voit tout (pour modérer).
DROP POLICY IF EXISTS "ferashas_public_read" ON public.ferashas;
CREATE POLICY "ferashas_public_read" ON public.ferashas FOR SELECT USING (
  (
    is_published = true
    AND moderation_status = 'active'
    AND public.account_is_active(owner_id)
  )
  OR auth.uid() = owner_id
  OR public.is_superadmin()
);

-- 4. Lecture publique des annonces : idem — masquées si l'annonce, sa Ferasha ou le
--    compte owner sont suspendus/désactivés. Défense en profondeur : même si une
--    annonce fuitait par un autre chemin, elle reste cachée quand la Ferasha l'est.
DROP POLICY IF EXISTS "listings_public_read" ON public.listings;
CREATE POLICY "listings_public_read" ON public.listings FOR SELECT USING (
  (
    status = 'actif'
    AND public.account_is_active(owner_id)
    AND EXISTS (
      SELECT 1 FROM public.ferashas f
      WHERE f.id = ferasha_id
        AND f.is_published = true
        AND f.moderation_status = 'active'
    )
  )
  OR auth.uid() = owner_id
  OR public.is_superadmin()
);

-- 5. Anti-triche : seul le service_role (Admin API, utilisée par le superadmin dans
--    la fonction serveur moderateFerasha) peut poser/retirer une suspension. L'owner
--    ne peut ni se réactiver lui-même, ni se suspendre.
CREATE OR REPLACE FUNCTION public.protect_ferasha_moderation()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    NEW.moderation_status := OLD.moderation_status;
    NEW.suspended_at := OLD.suspended_at;
    NEW.suspended_reason := OLD.suspended_reason;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ferashas_protect_moderation
  BEFORE UPDATE ON public.ferashas
  FOR EACH ROW EXECUTE FUNCTION public.protect_ferasha_moderation();
