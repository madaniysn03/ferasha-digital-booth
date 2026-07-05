-- Phase 6 : la policy "profiles_public_read" (USING true) posée à l'origine du
-- projet rendait TOUTE la table profiles lisible par n'importe qui (y compris
-- anonyme) : email, rôle, statut de compte, catégories autorisées de tous les
-- comptes pro/superadmin. Le dashboard superadmin (page /superadmin) n'était
-- donc protégé que côté routage (redirection UI) — ses données restaient
-- accessibles à quiconque interrogeait directement la table via le client
-- Supabase (anon key), sans jamais passer par l'écran superadmin.

-- Fonction utilitaire pour vérifier le rôle superadmin sans provoquer de
-- récursion RLS (SECURITY DEFINER, exécutée par le propriétaire de la table
-- qui contourne RLS sur profiles puisque FORCE ROW LEVEL SECURITY n'est pas
-- activé).
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin' AND account_status = 'active'
  );
$$;
REVOKE ALL ON FUNCTION public.is_superadmin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;

-- Chacun ne lit que sa propre ligne (toutes colonnes) ; le superadmin lit
-- toutes les lignes (nécessaire à son dashboard de gestion des comptes pro).
CREATE POLICY "profiles_read_own_or_superadmin" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_superadmin());

-- Vue publique restreinte au strict nécessaire (id + nom affiché) pour les cas
-- d'usage publics légitimes (nom de l'auteur d'un avis client) — jamais l'email,
-- le rôle, le statut ou les catégories.
CREATE OR REPLACE VIEW public.public_profile_names AS
  SELECT id, full_name FROM public.profiles;

GRANT SELECT ON public.public_profile_names TO anon, authenticated;
