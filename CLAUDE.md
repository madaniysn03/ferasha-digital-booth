# CLAUDE.md

Guidance for Claude Code (and other AI agents) working in this repo.

## Projet

**Ferasha Quantic** — marketplace mobile-first où des entrepreneurs/artisans marocains
créent une « Ferasha » (vitrine digitale) et y publient des annonces (produits/services).
Les visiteurs explorent par catégorie/ville et contactent le vendeur (WhatsApp, tel, email, Instagram).
UI en **français**, projet initialement généré via **Lovable**.

## Stack

- **TanStack Start** (SSR) + **React 19** — routing par fichiers dans `src/routes/`
- **Supabase** (Postgres + Auth + Storage) — instance **hébergée/distante** (pas de DB locale)
- **Tailwind CSS v4** + **shadcn/ui** (composants dans `src/components/ui/`, ne pas éditer sans raison)
- **TypeScript**, **Zod**, **@tanstack/react-query**
- Config Vite via `@lovable.dev/vite-tanstack-config` (voir `vite.config.ts`)

## Commandes

```bash
npm install       # bun n'est PAS installé ici → utiliser npm (package-lock.json)
npm run dev       # serveur de dev sur http://localhost:8080 (8081 si le port est pris)
npm run build     # build de production
npm run lint      # eslint
npm run format    # prettier --write
npx tsc --noEmit  # typecheck
```

> Malgré la présence de `bun.lock`/`bunfig.toml`, bun n'est pas disponible sur cette machine.
> On installe et on lance avec **npm**.

## Architecture

### Routing (TanStack Start, file-based)
Voir `src/routes/README.md` pour les conventions. Points clés :
- `src/routes/__root.tsx` — shell HTML unique (garder `<Outlet />`), meta globales, error/404 boundaries.
- `src/routes/index.tsx` — page d'accueil publique : explorer les Ferashas (recherche + filtres catégorie/ville).
- `src/routes/auth.tsx` — connexion/inscription (email+mot de passe, ou Google via `lovable.auth`).
- `src/routes/ferasha.$slug.tsx` — page publique d'une Ferasha (+ incrément `views_count`).
- `src/routes/_authenticated/route.tsx` — garde d'auth : `beforeLoad` redirige vers `/auth` si non connecté ; `ssr: false`.
  - `my-ferasha.tsx` — créer/éditer sa Ferasha + lister ses publications.
  - `listings.new.tsx` — créer une annonce (exige une Ferasha existante).
  - `listings.$id.tsx` — éditer une annonce.
  - `account.tsx` — email + déconnexion.
- `src/routeTree.gen.ts` — **auto-généré, ne pas éditer**.

### Supabase
- Client navigateur : `src/integrations/supabase/client.ts` (lazy via Proxy, lit `VITE_SUPABASE_*`).
- Client serveur : `src/integrations/supabase/client.server.ts`. Middleware/attacher d'auth SSR dans le même dossier.
- Types DB générés : `src/integrations/supabase/types.ts`.
- OAuth Google et helpers Lovable : `src/integrations/lovable/`.

### Modèle de données (`supabase/migrations/`)
- `profiles` (1-1 avec `auth.users`, créé par trigger `handle_new_user`)
- `ferashas` — une vitrine par owner ; `slug` unique ; `is_published` ; `views_count`. Enum `ferasha_category`.
- `listings` — annonces liées à une Ferasha. Enums `listing_type` (produit|service), `listing_status` (actif|pause). Prix `MAD` par défaut.
- **RLS activé partout** : lecture publique des lignes publiées/actives ; écriture réservée au owner (`auth.uid() = owner_id`).
- **Storage** buckets : `avatars`, `ferasha-logos`, `listings` — upload réservé au dossier `{uid}/…` de l'utilisateur.

## Conventions

- Fichiers `src/components/ui/*` = shadcn/ui générés ; réutiliser plutôt que réécrire. Composants métier dans `src/components/ferasha/` et `src/components/layout/`.
- Alias d'import `@/` → `src/`.
- Constantes catégories/villes centralisées dans `src/lib/categories.ts`.
- Textes UI en français.
- Les accès data se font aujourd'hui côté client via le client `supabase` dans des `useEffect` (pas de loaders react-query pour l'instant).

## Environnement / secrets

`.env` (non commité) contient `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`
(+ équivalents non-préfixés pour le SSR). La clé est la clé **publishable** (anon) — la sécurité repose sur les RLS.

## Compte de test

`demo@ferasha.app` / `Demo1234!` (créé par la migration `20260623202229`).

## À NE PAS faire

- Ne pas créer `src/pages/` ou des conventions Next.js/Remix (voir `src/routes/README.md`).
- Ne pas éditer `src/routeTree.gen.ts` ni `src/integrations/supabase/client.ts` (fichiers générés).
- Ne pas ajouter manuellement les plugins Vite déjà fournis par `@lovable.dev/vite-tanstack-config`.
- Ne pas committer `.env`.
