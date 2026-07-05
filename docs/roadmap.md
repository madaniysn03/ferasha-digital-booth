# Roadmap de développement — Ferasha Quantic

> Découpage opérationnel du §14 du [cahier des charges](./cahier-des-charges.md).
> Version 1.0 — 2026-07-04. Ordonné par **dépendances** : chaque phase s'appuie sur la précédente.

## Écart entre l'existant et la cible

| Sujet | Aujourd'hui | Cible | Phase |
|---|---|---|---|
| Rôles | Aucun (tout compte = pareil) | `client` / `pro` / `superadmin` | **0** |
| Inscription | Libre → peut créer une Ferasha | Libre → **client** seulement | **0** |
| Comptes pro | Auto-créés | **Provisionnés par le superadmin** | **1** |
| Superadmin | Inexistant | Espace dédié | **1** |
| Ferashas/pro | 1 seule | **Plusieurs** (même catégorie) | **2** |
| Catégorie | Libre | **Verrouillée** par le superadmin | **0/2** |
| Images | URL saisie à la main | **Upload réel** (Storage) | **2** |
| Avis | Inexistant | Notes + commentaires (a posteriori) | **3** |
| LinkedIn / site web | Absent | Présents | **2** |
| Bilingue FR/AR + RTL | FR seul | **FR + AR (RTL)** | **infra dès 1, finition 4** |
| `views_count` | Read-modify-write (buggé) | Incrément atomique | **5** |
| Recherche | Filtrage en mémoire | Plein-texte Postgres | **5** |

---

## Chemin critique

```
Phase 0 (rôles & accès)  ──►  Phase 1 (superadmin + provisioning)  ──►  Phase 2 (espace pro multi-Ferasha)
                                     │
                                     └── i18n : mettre l'infrastructure en place ICI
                                         pour que tout écran suivant soit bilingue dès sa création
                                                                    │
                                                                    ▼
                                              Phase 3 (avis)  ──►  Phase 4 (finition AR/RTL)  ──►  Phase 5 (scale & prod)
```

**Règle d'or i18n** : brancher le socle de traduction **avant** de construire les nouveaux écrans
(Phase 1), sinon on paiera un coûteux « retrofit » plus tard. La traduction arabe complète + le QA
RTL se font en Phase 4, mais chaque écran est codé avec des **clés de traduction** dès le départ.

---

## Phase 0 — Fondation : rôles & modèle d'accès 🔴 *bloquante*

**Objectif** : introduire les rôles et sécuriser qui peut faire quoi. Tout le reste en dépend.

- [x] **Migration DB** : ajouter à `profiles` → `role` (`client`\|`pro`\|`superadmin`, défaut `client`),
      `allowed_categories` (array, pros only), `must_change_password` (bool), `account_status` (`active`\|`suspended`).
      → `supabase/migrations/20260704120000_phase0_roles_access.sql` (⚠️ **à exécuter manuellement** dans le
      SQL editor Supabase : pas de `service_role`/accès CLI depuis cet environnement).
- [x] Adapter le trigger `handle_new_user` → tout nouvel inscrit = rôle **`client`** (défaut de colonne).
- [x] **RLS durcies** : `role`, `allowed_categories`, `account_status` **non modifiables** par l'utilisateur (trigger `protect_profile_privileged_columns`, anti-élévation de privilège).
- [x] **Guards de routes par rôle** : `_authenticated/route.tsx` charge le profil, bloque les comptes suspendus, force `/change-password` si `must_change_password`.
- [x] Bloquer la création de Ferasha pour un `client` (RLS `ferashas_owner_insert`/`update` + message dans `my-ferasha.tsx`).
- [x] **Changement de mot de passe forcé** à la 1re connexion → route `/change-password`.
- [x] Désigner un **compte superadmin** : `demo@ferasha.app` promu dans la migration (à remplacer avant la prod).
- [x] L'inscription (`/auth`) ne produit qu'un compte `client` (défaut de colonne, non modifiable par l'utilisateur).

**Livrable** : un système à 3 rôles étanche, testé (un client ne peut pas créer de Ferasha, un pro ne voit que ses données).

## Phase 1 — Espace superadmin & provisioning des pros 🔴

**Objectif** : permettre au superadmin de créer et gérer les comptes pro.

- [ ] Route `/superadmin` protégée (rôle superadmin uniquement).
- [ ] **Création d'un compte pro** via **fonction serveur sécurisée** (Supabase Admin API / `service_role`,
      **jamais côté client**) : crée l'utilisateur auth, force `role=pro`, `must_change_password=true`,
      assigne `allowed_categories`, génère un **mot de passe temporaire** affiché **une seule fois**.
- [ ] Suspendre / réactiver / supprimer un pro (`account_status`).
- [ ] Assigner / modifier la/les **catégorie(s)** d'un pro.
- [ ] **Registre des commissions** (table `commissions`, CRUD manuel : montant, date, notes).
- [ ] **Journal d'audit** minimal des actions sensibles.
- [ ] Tableau de bord : nb de pros, de Ferashas, avis, etc.
- [ ] ⚙️ **Socle i18n** : installer la lib de traduction + fichiers `fr`/`ar` + sélecteur de langue (traductions AR remplies plus tard).

**Livrable** : le superadmin peut créer un pro de A à Z ; le pro reçoit ses identifiants et se connecte.

## Phase 2 — Espace pro : multi-Ferasha, services & tarifs, images 🟠

**Objectif** : donner au pro un espace complet et conforme au modèle.

- [x] Lever la contrainte **1 Ferasha/owner** → `/my-ferasha` liste toutes les Ferashas du pro, `/my-ferasha/new` + `/my-ferasha/$id` pour créer/éditer chacune.
- [x] Création/édition de Ferasha avec **catégorie restreinte** à `allowed_categories` (RLS déjà en place depuis la Phase 0 + select filtré côté UI ; superadmin voit toutes les catégories).
- [x] Ajout des champs **`linkedin`** et **`website`** (migration + formulaire + `ContactCTA` sur la page publique).
- [x] Gestion des **services/produits + tarifs** par Ferasha (existant, maintenant lié à la bonne Ferasha via `?ferashaId=`).
- [x] **Upload d'images réel** vers Supabase Storage (`src/lib/upload.ts`) pour le logo de Ferasha et les visuels de publication — remplace la saisie d'URL.
- [x] Publier / masquer une Ferasha (bouton sur `/my-ferasha/$id`).
- [ ] Statistiques simples (clics de contact) — `views_count` existe déjà mais reste en read-modify-write (bug de concurrence, corrigé en Phase 5) ; le suivi des clics de contact n'est pas encore implémenté.

**Livrable** : un pro peut monter plusieurs vitrines complètes avec images et tarifs.

## Phase 3 — Avis & notations (a posteriori) 🟠

**Objectif** : crédibiliser les Ferashas avec des avis clients modérés après coup.

- [x] Table **`reviews`** (+ RLS) : `author_id` (client obligatoire), `rating` 1-5, `comment`,
      `status` (`visible`\|`hidden`, défaut `visible`), `reported_count`, `reply`.
- [x] Contrainte **1 avis / client / Ferasha** (`UNIQUE(ferasha_id, author_id)`, testée).
- [x] Espace **client** : laisser / éditer / supprimer **son** avis (`/mes-avis` + formulaire inline sur la page publique).
- [x] Affichage des avis + **note moyenne** sur la page publique (`ReviewsSection`).
- [x] **Agrégation atomique** `rating_avg` / `rating_count` (triggers `recompute_ferasha_rating`, recalcul complet côté DB — testé).
- [x] **Réponse du pro** à un avis (`ProReviewsSection` sur `/my-ferasha/$id`).
- [x] **Signalement** d'un avis (RPC `report_review`, atomique, ouvert à tout utilisateur connecté) + file de **modération superadmin** (`ReviewModerationSection` sur `/superadmin` : masquer/rendre visible/supprimer).

**Livrable** : boucle d'avis complète, du client jusqu'à la modération.

## Phase 4 — Finition bilingue FR / AR (RTL) 🟢

**Objectif** : livrer l'expérience arabe complète.

- [x] Socle i18n (`src/lib/i18n/`) : dictionnaire typé FR/AR (`translations.ts`), contexte React (`I18nProvider`/`useI18n`), sélecteur de langue persisté (`localStorage`).
- [x] **Traductions arabes** des écrans **publics** : accueil (`/`), connexion/inscription (`/auth`), fiche publique d'une Ferasha (`/ferasha/$slug`), avis (`ReviewsSection`), 404.
- [x] Support **RTL** : `dir`/`lang` sur `<html>` basculés dynamiquement, classes Tailwind logiques (`ps-`/`pe-`/`start-`) au lieu de `pl-`/`pr-`/`left-`, icônes directionnelles retournées (`rtl:-scale-x-100`).
- [x] **Police arabe** (Cairo, via Google Fonts) substituée à Poppins/Inter quand `dir="rtl"`.
- [ ] **Reste à faire** : les écrans **back-office** (`/my-ferasha*`, `/superadmin`, `/listings*`, `/account`, `/mes-avis`, `/change-password`) restent en français uniquement — public cible = équipe interne francophone pour l'instant, non prioritaire. Catégories/villes traduites (`categoryLabelFor`/`cityLabelFor`) mais utilisées seulement sur les pages publiques.
- [ ] QA bilingue visuelle non effectuée dans un vrai navigateur (pas d'outil de navigateur headless disponible dans cet environnement) — build + typecheck + rendu SSR vérifiés, bascule FR/AR à confirmer manuellement.

**Livrable** : plateforme pleinement utilisable en français et en arabe.

## Phase 5 — Scalabilité, sécurité & mise en production 🟢

**Objectif** : durcir et déployer pour la charge réelle.

- [x] **`views_count` atomique** — RPC `increment_ferasha_views` (SECURITY DEFINER), corrige la condition de course (testé : 10 incréments concurrents → 10, avant l'ancien code en perdait sous charge).
- [x] **Recherche plein-texte** Postgres (`tsvector` généré + index GIN, config `french`) sur nom/bio — remplace le filtrage en mémoire qui ratait tout résultat au-delà des 60 premières lignes chargées.
- [x] **Pagination keyset** (curseur `created_at`+`id`, 20/page, bouton "Charger plus") sur l'explorateur public — testée (pas de chevauchement ni de trou entre pages).
- [x] Pages légales (**mentions légales**, **confidentialité**) — `/mentions-legales`, `/confidentialite`, liées en pied de page. ⚠️ Modèles génériques avec champs `[à compléter]` — **à faire relire par un professionnel du droit** avant prod.
- [x] Revue RLS finale : trouvé et corrigé un gap — un compte **suspendu** pouvait encore supprimer sa Ferasha/ses annonces (les policies DELETE ne vérifiaient pas `account_status`, contrairement aux INSERT/UPDATE). Corrigé.
- [x] Validation Zod côté serveur : déjà en place sur les fonctions serveur (`superadmin.functions.ts`) depuis la Phase 1.
- [ ] **Cache CDN** des pages publiques + **optimisation des images** — non fait (dépend du choix d'hébergement final).
- [ ] **Rate limiting login** — Supabase Auth applique déjà un rate limit par défaut sur `signInWithPassword` ; pas de couche supplémentaire ajoutée, à vérifier/ajuster dans le dashboard Supabase (Auth → Rate Limits) selon le trafic réel.
- [ ] **CSP stricte** — non ajoutée : nécessiterait une modification de middleware non testable dans cet environnement (pas de navigateur pour vérifier qu'elle ne casse rien) ; plus sûr à configurer au niveau Cloudflare (Transform Rules / Workers) au moment du déploiement réel.
- [ ] Monitoring/erreurs, **sauvegardes testées** — nécessite un compte de monitoring (Sentry ou équivalent) et une vérification manuelle des sauvegardes Supabase ; non fait, dépend de comptes externes du porteur de projet.
- [ ] **Déploiement prod** : Cloudflare (SSR) + Supabase Cloud **région EU**, variables d'env prod, domaine — nécessite un compte Cloudflare et des décisions (domaine, DNS) ; non fait, guide à fournir quand tu es prêt.

**Livrable** : plateforme en production, prête pour des milliers d'utilisateurs.

---

## Jalons

| Jalon | Contenu | On peut… |
|---|---|---|
| **M1** | Phases 0 + 1 | Créer des pros via le superadmin. Base saine. |
| **M2** | Phase 2 | Les pros publient de vraies vitrines → **démo crédible**. |
| **M3** | Phase 3 | Avis en ligne → **valeur perçue** complète. |
| **M4** | Phases 4 + 5 | **Lancement public** bilingue en production. |

## Notes techniques à ne pas oublier

- La **création de comptes pro** exige l'**Admin API Supabase** (clé `service_role`) → **uniquement**
  dans une fonction serveur (TanStack Start server function ou Edge Function). Ne jamais exposer cette clé au navigateur.
- Prévoir un **environnement de préproduction** (projet Supabase séparé) pour ne pas tester sur la prod.
- Écrire les nouveaux écrans **avec des clés i18n** dès la Phase 1 pour éviter un retrofit douloureux.
