-- Phase 3 : avis clients (a posteriori) + modération
-- Un avis nécessite un compte "client" actif (pas anonyme, pas un pro/superadmin),
-- est visible immédiatement, et peut être signalé puis modéré (masqué) par le superadmin.

ALTER TABLE public.ferashas
  ADD COLUMN rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0,
  ADD COLUMN rating_count INT NOT NULL DEFAULT 0;

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ferasha_id UUID NOT NULL REFERENCES public.ferashas(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
  reported_count INT NOT NULL DEFAULT 0,
  reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ferasha_id, author_id)
);

-- FK supplémentaire vers profiles (en plus de auth.users) pour permettre à
-- PostgREST d'embarquer l'auteur (`reviews.select("*, author:profiles(full_name)")`).
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_author_profile_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX reviews_ferasha_idx ON public.reviews(ferasha_id);
CREATE INDEX reviews_reported_idx ON public.reviews(reported_count) WHERE reported_count > 0;

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER reviews_touch BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Lecture : publique si visible, sinon réservée à l'auteur, au propriétaire de la
-- Ferasha concernée, ou au superadmin (modération).
CREATE POLICY "reviews_read" ON public.reviews FOR SELECT USING (
  status = 'visible'
  OR auth.uid() = author_id
  OR EXISTS (SELECT 1 FROM public.ferashas f WHERE f.id = ferasha_id AND f.owner_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
);

-- Écriture (création) : uniquement un compte client actif, sur une Ferasha publiée.
CREATE POLICY "reviews_client_insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = author_id
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'client' AND p.account_status = 'active')
  AND EXISTS (SELECT 1 FROM public.ferashas f WHERE f.id = ferasha_id AND f.is_published = true)
);

-- Mise à jour : l'auteur (note/commentaire), le propriétaire de la Ferasha (réponse),
-- ou le superadmin (modération) — le trigger ci-dessous verrouille les colonnes que
-- chaque rôle peut réellement modifier.
CREATE POLICY "reviews_update" ON public.reviews FOR UPDATE TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.ferashas f WHERE f.id = ferasha_id AND f.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  )
  WITH CHECK (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.ferashas f WHERE f.id = ferasha_id AND f.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
  );

-- Suppression : seulement l'auteur (retire son propre avis) ou le superadmin
-- (modération lourde). Le propriétaire de la Ferasha ne peut PAS supprimer un avis.
CREATE POLICY "reviews_delete" ON public.reviews FOR DELETE TO authenticated USING (
  auth.uid() = author_id
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin')
);

-- Verrouille, colonne par colonne, ce que chaque rôle peut modifier lors d'un UPDATE :
-- l'auteur ne touche qu'à rating/comment ; le propriétaire de la Ferasha qu'à reply ;
-- le superadmin qu'au statut de modération (jamais le contenu de l'avis).
CREATE OR REPLACE FUNCTION public.protect_review_columns() RETURNS TRIGGER AS $$
DECLARE
  is_owner boolean;
  is_admin boolean;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (SELECT 1 FROM public.ferashas f WHERE f.id = OLD.ferasha_id AND f.owner_id = auth.uid()) INTO is_owner;
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'superadmin') INTO is_admin;

  NEW.author_id := OLD.author_id;
  NEW.ferasha_id := OLD.ferasha_id;

  IF auth.uid() = OLD.author_id THEN
    NEW.status := OLD.status;
    NEW.reported_count := OLD.reported_count;
    NEW.reply := OLD.reply;
    NEW.replied_at := OLD.replied_at;
  ELSIF is_admin THEN
    NEW.rating := OLD.rating;
    NEW.comment := OLD.comment;
    NEW.reply := OLD.reply;
    NEW.replied_at := OLD.replied_at;
    NEW.reported_count := OLD.reported_count;
  ELSIF is_owner THEN
    NEW.rating := OLD.rating;
    NEW.comment := OLD.comment;
    NEW.status := OLD.status;
    NEW.reported_count := OLD.reported_count;
    NEW.replied_at := now();
  ELSE
    RETURN OLD;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER reviews_protect_columns
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.protect_review_columns();

-- Agrégation atomique de la note moyenne / du nombre d'avis (recalcul complet sur
-- la Ferasha concernée à chaque INSERT/UPDATE/DELETE — évite tout compteur en
-- lecture-modification-écriture côté client).
CREATE OR REPLACE FUNCTION public.recompute_ferasha_rating() RETURNS TRIGGER AS $$
DECLARE
  target_ferasha_id uuid := COALESCE(NEW.ferasha_id, OLD.ferasha_id);
BEGIN
  UPDATE public.ferashas f
  SET rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews r WHERE r.ferasha_id = target_ferasha_id AND r.status = 'visible'), 0),
      rating_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.ferasha_id = target_ferasha_id AND r.status = 'visible')
  WHERE f.id = target_ferasha_id;
  RETURN NULL;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER reviews_recompute_rating_ins AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.recompute_ferasha_rating();
CREATE TRIGGER reviews_recompute_rating_upd AFTER UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.recompute_ferasha_rating();
CREATE TRIGGER reviews_recompute_rating_del AFTER DELETE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.recompute_ferasha_rating();

-- Signalement : incrémente reported_count de façon atomique, ouvert à tout
-- utilisateur connecté (pas seulement l'auteur), sans exposer les autres colonnes.
CREATE OR REPLACE FUNCTION public.report_review(review_id uuid) RETURNS void AS $$
BEGIN
  UPDATE public.reviews SET reported_count = reported_count + 1 WHERE id = review_id;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.report_review(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.report_review(uuid) FROM PUBLIC, anon;
