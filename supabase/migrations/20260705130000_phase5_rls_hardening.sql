-- Phase 5 : revue de sécurité finale — durcissement RLS
-- Trouvé pendant la revue : un compte suspendu pouvait encore supprimer sa
-- Ferasha ou ses annonces (les policies DELETE ne vérifiaient pas
-- account_status, contrairement aux policies INSERT/UPDATE). Un compte
-- suspendu doit être totalement gelé, y compris pour la suppression — sinon
-- il pourrait faire disparaître le contenu à l'origine de sa suspension.

DROP POLICY IF EXISTS "ferashas_owner_delete" ON public.ferashas;
CREATE POLICY "ferashas_owner_delete" ON public.ferashas FOR DELETE TO authenticated USING (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.account_status = 'active')
);

DROP POLICY IF EXISTS "listings_owner_delete" ON public.listings;
CREATE POLICY "listings_owner_delete" ON public.listings FOR DELETE TO authenticated USING (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.account_status = 'active')
);
