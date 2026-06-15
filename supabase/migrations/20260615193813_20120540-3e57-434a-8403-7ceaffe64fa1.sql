
CREATE TYPE public.ferasha_category AS ENUM (
  'artisanat','beaute','mode','alimentation','services','bricolage','tech','education','sante','transport','evenementiel','autre'
);
CREATE TYPE public.listing_type AS ENUM ('produit','service');
CREATE TYPE public.listing_status AS ENUM ('actif','pause');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT, phone TEXT, city TEXT, avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.ferashas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category public.ferasha_category NOT NULL,
  city TEXT NOT NULL,
  bio TEXT, logo_url TEXT,
  whatsapp TEXT, phone TEXT, email TEXT, instagram TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ferashas_owner_idx ON public.ferashas(owner_id);
CREATE INDEX ferashas_category_city_idx ON public.ferashas(category, city);
GRANT SELECT ON public.ferashas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ferashas TO authenticated;
GRANT ALL ON public.ferashas TO service_role;
ALTER TABLE public.ferashas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ferashas_public_read" ON public.ferashas FOR SELECT USING (is_published = true OR auth.uid() = owner_id);
CREATE POLICY "ferashas_owner_insert" ON public.ferashas FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "ferashas_owner_update" ON public.ferashas FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "ferashas_owner_delete" ON public.ferashas FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ferasha_id UUID NOT NULL REFERENCES public.ferashas(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT,
  price NUMERIC(10,2), currency TEXT NOT NULL DEFAULT 'MAD',
  type public.listing_type NOT NULL DEFAULT 'produit',
  status public.listing_status NOT NULL DEFAULT 'actif',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX listings_ferasha_idx ON public.listings(ferasha_id);
CREATE INDEX listings_status_idx ON public.listings(status);
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_public_read" ON public.listings FOR SELECT USING (status = 'actif' OR auth.uid() = owner_id);
CREATE POLICY "listings_owner_insert" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "listings_owner_update" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "listings_owner_delete" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER ferashas_touch BEFORE UPDATE ON public.ferashas FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER listings_touch BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
