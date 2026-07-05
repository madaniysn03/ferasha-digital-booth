# Guide de test — Ferasha Quantic

> Ce document explique comment lancer le projet en local et tester toutes les fonctionnalités
> actuellement disponibles, avec les comptes à utiliser. Pour la vision produit complète, voir
> le [cahier des charges](./cahier-des-charges.md) ; pour l'avancement détaillé phase par phase,
> voir la [roadmap](./roadmap.md).

## 1. Démarrage en local

Prérequis : **Node 20+** et **npm** (bun n'est pas utilisé sur ce projet malgré `bun.lock`).

```bash
npm install
npm run dev
```

L'app démarre sur **http://localhost:8080** (ou 8081 si le port est pris).

Il faut un fichier `.env` à la racine (non commité) avec les clés Supabase. Demande-les à
l'équipe (Akram) — elles pointent vers l'instance Supabase distante déjà peuplée, il n'y a
**aucune base de données à installer en local** :

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_PROJECT_ID=...
```

## 2. Les 3 rôles du système

La plateforme a 3 types de comptes, avec des droits différents :

| Rôle | Peut faire |
|---|---|
| **client** | Explorer les Ferashas, contacter un vendeur, laisser un avis |
| **pro** | Tout ce qu'un client peut faire + créer/gérer une ou plusieurs Ferashas (vitrines) et leurs annonces, répondre aux avis |
| **superadmin** | Tout ce qu'un pro peut faire + créer/suspendre des comptes pro, modérer les avis signalés |

**Important** : un compte **pro ne peut pas être créé en s'inscrivant normalement** —
l'inscription libre (`/auth`) ne crée que des comptes **client**. Les comptes pro sont
**provisionnés uniquement par le superadmin** depuis `/superadmin` (voir §4).

## 3. Compte de test fourni

| Email | Mot de passe | Rôle |
|---|---|---|
| `demo@ferasha.app` | `Demo1234!` | **superadmin** |

C'est le seul compte pré-existant dans la base. Pour tester les autres rôles, il faut :
- **client** → créer un nouveau compte via `/auth` (inscription libre, email + mot de passe quelconques).
- **pro** → le créer soi-même depuis l'espace superadmin (voir §4.2) avec le compte `demo@ferasha.app`.

## 4. Parcours de test par fonctionnalité

### 4.1. Parcours visiteur (sans compte)

1. Aller sur `/` : liste des Ferashas publiées, recherche texte, filtres par catégorie et par ville.
2. Cliquer sur une Ferasha → page publique `/ferasha/$slug` : logo, bio, coordonnées, annonces,
   avis clients et note moyenne.
3. Cliquer sur un bouton de contact (WhatsApp / téléphone / email / Instagram) → doit ouvrir le
   bon canal avec les coordonnées du vendeur.
4. Scroller la liste → un bouton **« Charger plus »** doit paginer sans doublon ni trou.
5. Basculer la langue (sélecteur FR/AR dans le TopBar) → le texte des pages publiques passe en
   arabe et la mise en page s'inverse (RTL).

### 4.2. Parcours superadmin (`demo@ferasha.app`)

1. Se connecter, aller sur `/superadmin`.
2. **Créer un compte pro** : remplir nom + email + au moins une catégorie → un mot de passe
   temporaire s'affiche **une seule fois** à l'écran. Le noter pour la suite du test (§4.3).
3. **Modifier les catégories autorisées** d'un pro existant.
4. **Suspendre / réactiver** un compte pro → vérifier que le compte suspendu ne peut plus se
   connecter ni modifier ses Ferashas.
5. Descendre à la section **modération des avis** : masquer / rendre visible / supprimer un avis
   signalé (nécessite qu'un avis ait été signalé au préalable, voir §4.4).

### 4.3. Parcours pro (compte créé en §4.2)

1. Se connecter avec l'email + mot de passe temporaire reçu.
2. Doit être **redirigé automatiquement vers `/change-password`** (changement de mot de passe
   obligatoire à la première connexion) → en choisir un nouveau.
3. Aller sur `/my-ferasha` : liste des Ferashas du compte (vide au départ).
4. **Créer une Ferasha** (`/my-ferasha/new`) : nom, bio, ville, catégorie (limitée aux catégories
   assignées par le superadmin), logo (upload réel), WhatsApp/téléphone/email/Instagram,
   LinkedIn, site web.
5. Vérifier qu'une **2ᵉ Ferasha** peut être créée (limite d'1 seule levée en Phase 2).
6. **Publier / dépublier** la Ferasha → vérifier qu'elle apparaît/disparaît de `/` selon l'état.
7. Ajouter une **annonce** (`/listings/new?ferashaId=...`) : titre, description, type
   (produit/service), prix (MAD), statut (actif/pause), image (upload réel).
8. Éditer une annonce existante (`/listings/$id`).
9. Sur la page de la Ferasha (`/my-ferasha/$id`), **répondre à un avis client** reçu.

### 4.4. Parcours client (compte créé en §4.1)

1. Se connecter, visiter la page publique d'une Ferasha.
2. **Laisser un avis** (note 1-5 + commentaire) → vérifier qu'il apparaît immédiatement et que
   la note moyenne de la Ferasha se met à jour.
3. Essayer de laisser un **2ᵉ avis sur la même Ferasha** → doit être refusé (1 avis max par
   client par Ferasha).
4. Aller sur `/mes-avis` : voir/éditer/supprimer son propre avis, voir la réponse du pro si elle
   existe.
5. **Signaler un avis** (d'un autre auteur) → il doit ensuite apparaître dans la file de
   modération du superadmin (§4.2).
6. Essayer d'accéder à `/my-ferasha` ou `/superadmin` avec ce compte client → doit être bloqué
   (un client ne peut pas créer de Ferasha ni accéder à l'espace superadmin).

### 4.5. Compte

- `/account` : afficher l'email, se déconnecter.
- `/change-password` : changer son mot de passe (accessible à tout moment, pas seulement en
  changement forcé).

## 5. Points connus / non finalisés (voir [roadmap](./roadmap.md) pour le détail)

- Back-office (`/my-ferasha*`, `/superadmin`, `/listings*`, `/account`, `/mes-avis`,
  `/change-password`) : **français uniquement**, pas encore traduit en arabe.
- Pages légales (`/mentions-legales`, `/confidentialite`) : modèles génériques à faire relire
  par un juriste avant mise en production.
- Pas de suivi des clics de contact (seul `views_count` de la page Ferasha est trackée).
- Pas de déploiement en production à ce stade (dev local uniquement).
