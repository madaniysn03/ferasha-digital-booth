-- Phase 5 : scalabilité — compteur de vues atomique + recherche plein-texte

-- views_count : l'app faisait un read-modify-write (lecture puis update avec
-- l'ancienne valeur + 1), ce qui perd des vues sous charge concurrente. On
-- passe par une RPC qui incrémente en une seule instruction SQL atomique.
CREATE OR REPLACE FUNCTION public.increment_ferasha_views(ferasha_id uuid) RETURNS void AS $$
BEGIN
  UPDATE public.ferashas SET views_count = views_count + 1
  WHERE id = ferasha_id AND is_published = true;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.increment_ferasha_views(uuid) TO anon, authenticated;

-- Recherche plein-texte (nom + bio, config française) au lieu du filtrage en
-- mémoire côté client sur un lot plafonné à 60 lignes (qui ratait tout
-- résultat au-delà de la limite).
ALTER TABLE public.ferashas ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(bio, '')), 'B')
  ) STORED;

CREATE INDEX ferashas_search_idx ON public.ferashas USING GIN (search_vector);

-- Index composite pour la pagination par curseur (created_at, id) utilisée
-- par l'explorateur public.
CREATE INDEX ferashas_keyset_idx ON public.ferashas (is_published, created_at DESC, id DESC);
