# Ferasha Quantic 🛍️

**La marketplace mobile des entrepreneurs marocains.** Chaque artisan, talent ou
prestataire crée sa **Ferasha** — une vitrine digitale — en une minute, y publie ses
produits et services, et reçoit ses clients directement par WhatsApp, téléphone, email
ou Instagram.

Les visiteurs explorent les Ferashas par **catégorie** (artisanat, beauté, mode,
alimentation, tech…) et par **ville** (Casablanca, Rabat, Marrakech…), sans compte.

## Stack technique

| | |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (SSR) + React 19 |
| Routing | File-based (`src/routes/`) |
| Backend | [Supabase](https://supabase.com) — Postgres, Auth, Storage (instance hébergée) |
| UI | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) + lucide-react |
| Outils | TypeScript, Zod, TanStack Query, ESLint, Prettier |

## Démarrage rapide

Prérequis : **Node 20+** et **npm**.

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
#    Créer un fichier .env à la racine avec :
#    VITE_SUPABASE_URL=...
#    VITE_SUPABASE_PUBLISHABLE_KEY=...
#    VITE_SUPABASE_PROJECT_ID=...
#    (+ SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY / SUPABASE_PROJECT_ID pour le SSR)

# 3. Lancer le serveur de développement
npm run dev
```

L'application démarre sur **http://localhost:8080** (ou 8081 si le port est occupé).

### Compte de test

`demo@ferasha.app` / `Demo1234!`

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (HMR) |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualise le build |
| `npm run lint` | Analyse ESLint |
| `npm run format` | Formate le code avec Prettier |

## Structure du projet

```
src/
├── routes/                # Pages (file-based routing) — voir routes/README.md
│   ├── __root.tsx         # Shell HTML + meta + error boundaries
│   ├── index.tsx          # Accueil : explorer les Ferashas
│   ├── auth.tsx           # Connexion / inscription
│   ├── ferasha.$slug.tsx  # Vitrine publique d'une Ferasha
│   └── _authenticated/    # Routes protégées (my-ferasha, listings, account)
├── components/
│   ├── ui/                # shadcn/ui (généré)
│   ├── ferasha/           # Composants métier (cards, CTA contact)
│   └── layout/            # TopBar, BottomNav
├── integrations/
│   ├── supabase/          # Client, types, middleware d'auth
│   └── lovable/           # OAuth Google + helpers
├── hooks/                 # use-auth, use-mobile
└── lib/                   # categories, slug, utils, config

supabase/
└── migrations/            # Schéma SQL (profiles, ferashas, listings) + RLS + storage
```

## Modèle de données

- **profiles** — profil utilisateur (1-1 avec `auth.users`, créé automatiquement à l'inscription).
- **ferashas** — une vitrine par utilisateur (`slug` unique, catégorie, ville, contacts, `is_published`, `views_count`).
- **listings** — annonces (produit/service) rattachées à une Ferasha (prix, devise, statut actif/pause, image).

La sécurité repose sur les **politiques RLS** de Supabase : lecture publique du contenu
publié, écriture réservée au propriétaire.

## Notes

- Ce projet a été généré avec [Lovable](https://lovable.dev). La configuration Vite est
  fournie par `@lovable.dev/vite-tanstack-config` — ne pas ré-ajouter les plugins manuellement.
- `src/routeTree.gen.ts` et `src/integrations/supabase/*` (client/types) sont générés — ne pas les éditer à la main.
