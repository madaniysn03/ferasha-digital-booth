-- Phase 0 : rôles & modèle d'accès
-- Introduit les 3 rôles (client / pro / superadmin), verrouille qui peut créer/éditer
-- une Ferasha, et empêche toute élévation de privilège côté client.

CREATE TYPE public.user_role AS ENUM ('client', 'pro', 'superadmin');

ALTER TABLE public.profiles
  ADD COLUMN role public.user_role NOT NULL DEFAULT 'client',
  ADD COLUMN allowed_categories public.ferasha_category[] NOT NULL DEFAULT '{}',
  ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended'));

-- Anti-élévation de privilège : un utilisateur ne peut pas modifier son propre rôle,
-- ses catégories autorisées ou son statut de compte — seule l'Admin API (service_role,
-- utilisée en Phase 1 par le superadmin) le peut. `must_change_password` peut être
-- repassé à false par l'utilisateur lui-même (après avoir changé son mot de passe),
-- mais jamais remis à true.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    NEW.role := OLD.role;
    NEW.allowed_categories := OLD.allowed_categories;
    NEW.account_status := OLD.account_status;
    IF NEW.must_change_password AND NOT OLD.must_change_password THEN
      NEW.must_change_password := OLD.must_change_password;
    END IF;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER profiles_protect_privileged
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- Une Ferasha ne peut être créée/modifiée que par un compte pro actif (dans une
-- catégorie qui lui a été assignée par le superadmin) ou par le superadmin lui-même.
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
          OR (p.role = 'pro' AND category = ANY (p.allowed_categories))
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
          OR (p.role = 'pro' AND category = ANY (p.allowed_categories))
        )
    )
  );

-- Un compte suspendu ne peut plus rien écrire, y compris sur ses annonces.
DROP POLICY IF EXISTS "listings_owner_insert" ON public.listings;
CREATE POLICY "listings_owner_insert" ON public.listings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.account_status = 'active')
  );

DROP POLICY IF EXISTS "listings_owner_update" ON public.listings;
CREATE POLICY "listings_owner_update" ON public.listings FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.account_status = 'active')
  );

-- Désigne le compte de test comme superadmin (temporaire — à remplacer par un vrai
-- compte superadmin avant la mise en production).
UPDATE public.profiles SET role = 'superadmin'
WHERE id = '22222222-2222-2222-2222-222222222222';
