-- Fix : report_review() incrémentait reported_count via une fonction SECURITY DEFINER
-- (qui contourne les RLS), mais le trigger protect_review_columns s'exécutait quand
-- même et remettait reported_count à son ancienne valeur pour tout appelant qui
-- n'est ni l'auteur, ni le propriétaire de la Ferasha, ni le superadmin (branche
-- ELSE -> RETURN OLD) — ce qui est justement le cas normal d'un signalement par un
-- tiers. On fait passer l'incrément via un garde-fou de session (le temps de la
-- transaction) que le trigger reconnaît et laisse passer sans y toucher.

CREATE OR REPLACE FUNCTION public.protect_review_columns() RETURNS TRIGGER AS $$
DECLARE
  is_owner boolean;
  is_admin boolean;
BEGIN
  IF current_setting('app.bypass_review_protection', true) = 'on' THEN
    RETURN NEW;
  END IF;

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

CREATE OR REPLACE FUNCTION public.report_review(review_id uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('app.bypass_review_protection', 'on', true);
  UPDATE public.reviews SET reported_count = reported_count + 1 WHERE id = review_id;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
