-- Phase 2 : espace pro — multi-Ferasha, réseaux, tarifs
-- La contrainte "1 Ferasha par owner" n'a jamais existé en base (seulement dans
-- l'app cliente), donc le multi-Ferasha ne demande pas de migration de schéma
-- pour ça. On ajoute juste les champs réseaux professionnels manquants.

ALTER TABLE public.ferashas
  ADD COLUMN linkedin TEXT,
  ADD COLUMN website TEXT;
