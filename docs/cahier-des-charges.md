# Cahier des charges — Ferasha Quantic

> Document de référence produit & technique. Version 1.0 — 2026-07-04.
> Statut : **brouillon à valider**. Les points marqués 🟠 **À TRANCHER** attendent une décision.

---

## 1. Présentation & contexte

**Ferasha Quantic** est une marketplace mobile-first qui met en relation des
**professionnels marocains** (artisans, prestataires de services, commerçants) et le
**grand public**. Chaque professionnel dispose d'une ou plusieurs **Ferashas** — des
vitrines digitales — présentant ses services, ses tarifs et les avis de ses clients.

La particularité du modèle : **l'inscription n'est pas libre**. Un professionnel ne peut
pas créer son compte lui-même. Il contacte le **superadmin** de la plateforme, règle une
**commission**, et le superadmin lui provisionne un compte dont il transmet les
identifiants. Le professionnel devient alors **administrateur de son propre espace**.

Le **visiteur** navigue librement, sans compte, et contacte les professionnels via leurs
canaux externes (WhatsApp, Instagram, LinkedIn, téléphone, email…).

## 2. Objectifs

- Offrir aux professionnels une vitrine crédible, rapide à mettre à jour, avec avis clients.
- Offrir au public une découverte fluide par catégorie et par ville, sans friction (pas de compte).
- Garder le contrôle de l'accès (modèle sur invitation payante) via un superadmin.
- Tenir la charge (des milliers d'utilisateurs, montée en puissance progressive) et garantir la sécurité des données.

## 3. Périmètre

### Dans le périmètre (ce projet)
- Espace public de navigation/recherche (sans compte).
- Espace professionnel (admin de sa/ses Ferasha(s)).
- Espace superadmin (provisioning des comptes, modération, suivi des commissions).
- Système d'avis / notations clients.
- Contact via canaux externes (redirection).

### Hors périmètre (au moins pour le MVP) — 🟠 à confirmer
- **Paiement en ligne** de la commission (géré hors plateforme au départ ; le superadmin encaisse manuellement).
- **Messagerie interne** (le contact reste externe : WhatsApp/Instagram/LinkedIn…).
- **Transactions / panier / commandes** en ligne (la vente se conclut hors plateforme).
- Application mobile native (le web mobile-first fait office d'app).

---

## 4. Acteurs & rôles

| Rôle | Compte ? | Description | Droits clés |
|---|---|---|---|
| **Visiteur** | Non | Grand public non connecté. Navigue et contacte. | Lecture du contenu publié ; cliquer sur les canaux de contact. **Ne peut pas laisser d'avis.** |
| **Client** | Oui — **inscription libre** (compte simple) | Utilisateur qui souhaite laisser un avis. | Tout ce que fait le visiteur **+ laisser/éditer ses avis**. **Ne peut PAS créer de Ferasha.** |
| **Professionnel (Admin de Ferasha)** | Oui — **créé par le superadmin** | Propriétaire d'une **ou plusieurs** Ferashas, **toutes dans sa catégorie assignée**. | Gérer son profil, ses Ferashas, ses services/tarifs, répondre aux avis, voir ses statistiques. **Ne peut pas changer/ajouter sa catégorie** (→ contacter le superadmin). |
| **Superadmin** | Oui (privilégié) | Opérateur de la plateforme. | Créer/suspendre/supprimer des comptes pro, **assigner/modifier la/les catégorie(s)** d'un pro, suivre les commissions, modérer avis & contenus, tout voir. |

> **Principe** : un seul superadmin (ou une petite équipe) au départ. Le rôle est un
> privilège technique fort — voir §9 Sécurité.
>
> **Deux voies d'accès distinctes** :
> - **Inscription libre** → produit uniquement des comptes **`client`** (aucun droit de créer une Ferasha).
> - **Provisioning par le superadmin** → comptes **`pro`**, rattachés à une catégorie.

---

## 5. Exigences fonctionnelles

### 5.1 Visiteur (public, sans compte)

- **EF-V1** — Explorer la liste des Ferashas publiées (page d'accueil).
- **EF-V2** — Filtrer par **catégorie** et par **ville**.
- **EF-V3** — Rechercher par mot-clé (nom, description, service).
- **EF-V4** — Consulter la **page publique d'une Ferasha** : présentation, services + **tarifs**, **note moyenne** et avis.
- **EF-V5** — **Contacter** le professionnel via ses canaux : WhatsApp, Instagram, **LinkedIn**, téléphone, email, site web (ouverture externe, deep-link).
- **EF-V6** — Partager une Ferasha (lien, réseaux).
- **EF-V7** — Navigation entièrement responsive, rapide, sans obligation de compte.
- **EF-V8** — Pour **laisser un avis**, le visiteur est invité à **créer un compte client** (voir §5.1bis). Aucun avis anonyme n'est possible.

### 5.1bis Client (compte simple, inscription libre)

- **EF-C1** — S'inscrire librement (email + mot de passe) → compte de rôle **`client`**.
- **EF-C2** — **Laisser un avis** (note 1-5 + commentaire) sur une Ferasha, **une seule fois par Ferasha**.
- **EF-C3** — Éditer / supprimer **son propre** avis.
- **EF-C4** — **Ne peut PAS créer de Ferasha** ni accéder à l'espace professionnel.
- **EF-C5** — Un compte client peut, plus tard, être « promu » en pro **uniquement par le superadmin** (après commission).

### 5.2 Professionnel (Admin de Ferasha)

- **EF-P1** — Se connecter avec les identifiants fournis par le superadmin.
- **EF-P2** — **Changement de mot de passe obligatoire à la première connexion**.
- **EF-P3** — Gérer son **profil** (nom, coordonnées, canaux de contact, avatar).
- **EF-P4** — Créer / éditer **sa (ou ses) Ferasha(s)** : nom, catégorie, ville, présentation, logo, canaux de contact, statut publié/masqué. (Multi-Ferasha : 🟠 décision D1.)
- **EF-P5** — Gérer les **services/produits** de chaque Ferasha : titre, description, **tarif** (et devise), type, image, statut actif/pause.
- **EF-P6** — Consulter et **répondre aux avis** clients ; signaler un avis abusif.
- **EF-P7** — Voir des **statistiques** simples : vues, clics de contact, note moyenne.
- **EF-P8** — Voir l'**état de son compte** (actif / suspendu). Le compte est permanent, sans date d'expiration.
- **EF-P9** — Ne **jamais** pouvoir accéder aux données d'un autre professionnel.

### 5.3 Superadmin

- **EF-S1** — **Créer un compte professionnel** : email + génération d'un mot de passe temporaire, rattachement à un état de commission.
- **EF-S2** — Transmettre/afficher les identifiants une seule fois de façon sécurisée.
- **EF-S3** — **Tenir le registre des commissions** (paiements hors plateforme) : montant, date, notes. Simple historique, sans échéance.
- **EF-S4** — **Suspendre / réactiver / supprimer** un compte professionnel (ex. non-paiement).
- **EF-S5** — **Modérer** : valider/rejeter les avis, masquer une Ferasha ou un service non conforme.
- **EF-S6** — Tableau de bord global : nombre de pros, de Ferashas, avis en attente, revenus.
- **EF-S7** — Consulter un **journal d'audit** des actions sensibles.

### 5.4 Système d'avis / notations

- Note de **1 à 5 étoiles** + commentaire libre + (optionnel) nom/prénom de l'auteur.
- **Anti-abus** : 1 avis par personne et par Ferasha, limitation de fréquence, protection anti-spam.
- **Modération *a posteriori*** : l'avis est **publié immédiatement**. Le superadmin peut le **masquer/supprimer** ensuite, notamment s'il est **signalé**. Un mécanisme de **signalement** d'avis est prévu (visiteur/pro).
- **Note moyenne** recalculée et mise en cache par Ferasha.
- Le professionnel peut **répondre** publiquement à un avis mais **pas le supprimer** (seul le superadmin le peut).

---

## 6. Parcours utilisateurs (flux principaux)

### 6.1 Onboarding d'un professionnel (cœur du modèle)
1. Le professionnel **contacte** le superadmin (hors plateforme) et **règle la commission**.
2. Le superadmin **crée le compte** dans l'espace superadmin (email + mot de passe temporaire + échéance d'abonnement).
3. Le superadmin **transmet les identifiants** au professionnel (canal sécurisé).
4. Le professionnel **se connecte**, **change son mot de passe** (obligatoire), complète son profil.
5. Il **crée sa Ferasha**, ajoute ses **services + tarifs**, publie.
6. Sa vitrine devient **visible publiquement**.

### 6.2 Découverte & contact (visiteur)
1. Le visiteur arrive sur l'accueil → filtre par catégorie/ville, recherche.
2. Il ouvre une **Ferasha** → voit services, tarifs, note moyenne, avis.
3. Il clique sur un **canal de contact** → redirection WhatsApp/Instagram/LinkedIn/tel/email.
4. (Option) il **laisse un avis** → passe en modération.

### 6.3 Gestion quotidienne (professionnel)
Connexion → mise à jour services/tarifs → réponse aux avis → consultation des stats.

### 6.4 Modération & suivi (superadmin)
Connexion → file des avis à valider → suivi des paiements/échéances → suspension des comptes non à jour.

---

## 7. Modèle de données (cible)

> Évolution du schéma actuel (`profiles`, `ferashas`, `listings`). Ajouts en **gras**.

- **`profiles`** — 1-1 avec `auth.users`. Champs : `full_name`, `phone`, `city`, `avatar_url`,
  **`role`** (`client` \| `pro` \| `superadmin`), **`allowed_categories`** (tableau de catégories
  assignées par le superadmin — **uniquement** pour les pros), **`must_change_password`** (bool),
  **`account_status`** (`active` \| `suspended`), timestamps.
  > Le rôle par défaut à l'inscription libre est **`client`**. Le rôle `pro` et
  > `allowed_categories` ne sont modifiables **que par le superadmin**.
- **`ferashas`** — vitrine. Champs actuels + **`linkedin`**, **`website`**, **`rating_avg`** (cache),
  **`rating_count`** (cache). `owner_id`, `slug` unique, `is_published`, `views_count`.
  **Multi-Ferasha par pro autorisé** (contrainte 1:1 actuelle à lever). La `category` de chaque
  Ferasha **doit appartenir à `allowed_categories` du pro** (contrôlé par RLS + fonction serveur).
- **`listings`** — services/produits d'une Ferasha : `title`, `description`, `price`, `currency`,
  `type`, `status`, `image_url`.
- **`reviews`** *(nouveau)* — avis clients : `id`, `ferasha_id`, **`author_id`** (compte `client`,
  obligatoire — **pas d'avis anonyme**), `rating` (1-5), `comment`,
  `status` (`visible` \| `hidden` — **défaut `visible`** : modération *a posteriori*),
  **`reported_count`** (signalements), **`reply`** (réponse du pro), timestamps.
  Contrainte d'**unicité (`ferasha_id`, `author_id`)** → un seul avis par client et par Ferasha.
- **`commissions`** *(nouveau, tenue de registre)* — trace des paiements hors plateforme :
  `id`, `owner_id`, `amount`, `currency`, `paid_at`, `notes`. **Pas de champ d'expiration** : le
  compte n'expire pas ; c'est un simple historique pour le superadmin.
- **`audit_log`** *(nouveau)* — actions sensibles : `id`, `actor_id`, `action`, `target`,
  `metadata` (jsonb), `created_at`.
- **`contact_clicks`** *(nouveau, optionnel)* — analytics de contact : `ferasha_id`, `channel`, `created_at`.
- **Storage** : buckets `avatars`, `ferasha-logos`, `listings` (upload restreint au dossier `{uid}/…`).

**Compteurs atomiques** : `views_count` et `rating_avg`/`rating_count` doivent être mis à jour
par des **fonctions SQL atomiques** (RPC), jamais par un read-modify-write applicatif.

---

## 8. Exigences non-fonctionnelles

| Domaine | Exigence |
|---|---|
| **Performance** | Page publique < 1,5 s en 4G. Pagination des listes (pas de `limit 60` figé). |
| **Scalabilité** | Architecture stateless, base indexée, cache CDN sur pages publiques (voir §10). |
| **Disponibilité** | Cible 99,9 %. Sauvegardes DB quotidiennes + rétention. |
| **Sécurité** | Voir §9 (RLS, rôles, moindre privilège, RGPD/loi 09-08). |
| **Accessibilité** | Contrastes AA, navigation clavier, libellés ARIA sur les composants interactifs. |
| **SEO** | Pages Ferasha en SSR, meta/OpenGraph, `sitemap.xml`, URLs propres (`/ferasha/{slug}`). |
| **i18n** | **Bilingue FR + AR dès le départ**, avec **support RTL** complet (mise en page miroir, composants, polices arabes). Sélecteur de langue ; contenu utilisateur non traduit automatiquement. |
| **Observabilité** | Logs structurés, monitoring d'erreurs, métriques de base. |
| **Compatibilité** | Mobile-first, navigateurs récents (2 dernières versions), dégradation gracieuse. |

---

## 9. Sécurité (volet critique)

### 9.1 Authentification & comptes
- **Inscription publique limitée au rôle `client`** : le signup libre ne peut créer qu'un compte
  `client` (jamais `pro` ni `superadmin`). Le rôle est **forcé côté serveur** — le client ne peut
  pas s'auto-attribuer un rôle privilégié. La création de comptes **`pro`** passe **exclusivement
  par le superadmin**.
- **Mot de passe temporaire** généré aléatoirement (haute entropie), transmis hors bande,
  **changement forcé à la 1re connexion** (`must_change_password`).
- Politique de mot de passe (longueur min., complexité), **rate limiting** sur le login,
  verrouillage temporaire après N échecs, protection anti-bruteforce.
- **MFA** pour le superadmin — 🟠 décision D5 (fortement recommandé).
- Sessions : expiration, refresh sécurisé, déconnexion effective.

### 9.2 Autorisation (rôles & RLS)
- **Row Level Security activé sur toutes les tables** (déjà le cas aujourd'hui).
- Rôle stocké de façon fiable (colonne `profiles.role` **non modifiable par l'utilisateur**,
  idéalement portée aussi par un *custom claim* JWT vérifié serveur).
- **Moindre privilège** :
  - Visiteur (`anon`) : lecture seule du contenu **publié/approuvé** ; insertion d'un avis en statut `pending` uniquement.
  - Pro (`authenticated`) : lecture/écriture **de ses propres** lignes (`auth.uid() = owner_id`).
  - Superadmin : opérations privilégiées **exclusivement côté serveur**, via la clé `service_role` **jamais exposée au navigateur**, ou via des policies conditionnées à un rôle vérifié.
- Empêcher l'**élévation de privilège** : un pro ne peut pas se donner le rôle superadmin, ni modifier `role`/`account_status`/`subscriptions`.

### 9.3 Données personnelles (RGPD / loi marocaine 09-08)
- Les coordonnées des pros sont **publiques par nature** (consenties). Les données des visiteurs
  (avis) doivent être minimisées ; pas d'e-mail affiché publiquement.
- Mentions légales, politique de confidentialité, base légale du traitement, **droit à l'effacement**.
- Chiffrement en transit (**HTTPS** partout) et au repos (fourni par Supabase).

### 9.4 Application & données
- **Validation stricte des entrées** (Zod) côté client **et** serveur ; ne jamais faire confiance au client.
- Protection **XSS** (échappement, pas de HTML brut d'utilisateur), **CSRF** sur mutations, **CSP** stricte.
- **Storage** : politiques d'upload par dossier `{uid}/`, types/тaille de fichiers limités, scan basique.
- **Anti-abus** sur les avis : rate limit, 1 avis/personne/Ferasha (via hash de contact), honeypot/anti-bot.
- **Anti-énumération** des slugs/IDs, réponses uniformes sur les endpoints sensibles.
- **Secrets** : clés dans variables d'environnement, séparation dev/prod, `service_role` côté serveur uniquement.
- **Journal d'audit** des actions superadmin (création/suspension de compte, modération).
- **Sauvegardes** testées + plan de restauration.

---

## 10. Scalabilité & architecture technique

### 10.1 Stack cible
- **Front + SSR** : TanStack Start (React 19), déployé sur **Cloudflare** (cible par défaut du build). Stateless, scaling horizontal automatique, CDN global.
- **Backend / données** : **Supabase Cloud** (PostgreSQL + Auth + Storage), **région EU**. Langage : **TypeScript** partout ; logique sensible en **Edge Functions** si besoin.
- **CDN** : mise en cache des pages publiques et des images (Storage + transformation d'images).

### 10.2 Principes de scalabilité
- **Pagination** (curseur/keyset) sur toutes les listes ; jamais de `SELECT` non borné.
- **Index** adaptés aux filtres (catégorie, ville, slug, statut) — certains existent déjà.
- **Recherche** : passer à une recherche plein-texte Postgres (`tsvector` + index GIN) au lieu du filtrage en mémoire côté client.
- **Compteurs atomiques** (vues, notes) via RPC — supprime les conditions de course.
- **Cache** : pages publiques mises en cache CDN avec invalidation à la mise à jour ; note moyenne pré-calculée.
- **Connexions DB** : utiliser le **pooler** Supabase (PgBouncer) pour l'accès serveur.
- **Éviter les N+1** : jointures/`select` imbriqués côté PostgREST plutôt que multiples requêtes.
- **Tâches lourdes** (emails, recalculs, notifications) en **asynchrone** (Edge Functions / file d'attente).
- **Images** : upload réel vers Storage + variantes/tailles optimisées + `loading="lazy"`.
- **Observabilité** : métriques (latence, taux d'erreur), alertes, suivi des requêtes lentes.

### 10.3 Jalons de charge
- **Aujourd'hui → 10k utilisateurs** : stack tel quel, plan Supabase Pro suffisant.
- **10k → 100k+** : cache agressif, réplicas de lecture, revue des index, éventuel découpage de services.

---

## 11. Arborescence & navigation

```
Public (sans compte)
  /                       Accueil — explorer (recherche + filtres)
  /ferasha/{slug}         Vitrine publique (services, tarifs, avis, contact)
  /connexion              Connexion (clients, pros, superadmin)
  /inscription            Inscription libre → crée un compte CLIENT uniquement
  /mentions-legales, /confidentialite

Espace client (rôle = client)   [protégé, léger]
  /mon-compte             Profil simple + sécurité
  /mes-avis               Avis laissés (éditer / supprimer)

Espace professionnel (rôle = pro)   [protégé]
  /admin                  Tableau de bord (stats, abonnement)
  /admin/ferasha[/{id}]   Gérer sa/ses Ferasha(s)
  /admin/services         Gérer services & tarifs
  /admin/avis             Avis reçus + réponses
  /admin/compte           Profil & sécurité (mot de passe)

Espace superadmin (rôle = superadmin)   [protégé, renforcé]
  /superadmin                     Tableau de bord global
  /superadmin/comptes             Créer / suspendre / supprimer des pros
  /superadmin/commissions         Suivi des paiements & échéances
  /superadmin/moderation          Avis & contenus à modérer
  /superadmin/audit               Journal d'audit
```

**Principes de navigation** : mobile-first, barre inférieure pour le public, accès contextualisé
selon le rôle, fil d'Ariane dans les espaces admin, état de chargement/erreur soigné, zéro cul-de-sac.

---

## 12. Règles de gestion

- **RG1** — Aucun compte ne peut être créé sans action du superadmin.
- **RG2** — Un compte pro suspendu → ses Ferashas deviennent invisibles au public.
- **RG3** — Un compte pro est **permanent** (pas d'échéance/expiration). Seule une **suspension manuelle** par le superadmin masque ses Ferashas.
- **RG4** — Un avis est **visible dès sa publication** (modération a posteriori) ; il disparaît s'il est masqué/supprimé par le superadmin.
- **RG5** — Le `slug` d'une Ferasha est unique et stable (ne change pas après publication).
- **RG6** — La note moyenne n'inclut que les avis en statut `visible` (non masqués).
- **RG7** — Un pro ne voit et ne modifie que ses propres données.
- **RG8** — Un pro peut créer **plusieurs Ferashas**, mais chacune doit appartenir à une catégorie de ses `allowed_categories`.
- **RG9** — Un pro **ne peut pas** modifier/ajouter sa catégorie ; seule une action **superadmin** met à jour `allowed_categories`.
- **RG10** — Seul un compte **`client`** (connecté) peut laisser un avis ; **1 avis max par client et par Ferasha** ; aucun avis anonyme.
- **RG11** — Un compte `client` ne peut en aucun cas créer une Ferasha ni accéder à l'espace pro/superadmin.

---

## 13. Points à trancher (décisions ouvertes) 🟠

| # | Décision | Options | Statut / Recommandation |
|---|---|---|---|
| **D1** | Un pro a **1 seule** ou **plusieurs** Ferashas ? | 1:1 vs 1:N | ✅ **TRANCHÉ : 1:N**, toutes dans la/les catégorie(s) assignée(s) par le superadmin. |
| **D2** | Paiement de la commission **en ligne** ou **hors plateforme** ? | Manuel vs intégré (Stripe/CMI…) | ✅ **TRANCHÉ : hors plateforme / manuel.** Le superadmin encaisse et marque le compte « payé jusqu'au [date] ». Intégration en ligne = évolution future. |
| **D3** | Avis : modération **a priori** (validation avant publication) ou **a posteriori** ? | Plus sûr vs plus fluide | ✅ **TRANCHÉ : a posteriori.** L'avis est **visible immédiatement**, le superadmin peut le masquer/supprimer ensuite (ou sur signalement). |
| **D4** | Support **arabe / RTL** ? | FR seul vs FR+AR | ✅ **TRANCHÉ : bilingue FR + AR (RTL) prévu dès maintenant.** Architecture i18n + gestion RTL intégrées dès la conception. |
| **D5** | **MFA** superadmin ? | Oui/Non | ✅ **TRANCHÉ : pas de MFA pour le moment** (à réévaluer avant montée en charge — reste recommandé). |
| **D6** | Comportement à l'**échéance** de l'abonnement ? | Masquage immédiat vs délai de grâce | ✅ **TRANCHÉ : pas d'échéance.** Le compte pro reste **actif indéfiniment** ; aucun masquage automatique. Le superadmin garde le pouvoir de suspendre manuellement. |
| **D7** | Qui peut **laisser un avis** ? | Anonyme vs compte requis | ✅ **TRANCHÉ : compte `client` obligatoire**, pas d'avis anonyme, 1 avis/client/Ferasha. |

---

## 14. Phasage recommandé

- **Phase 0 — Refonte du modèle d'accès** : désactiver l'inscription publique, introduire les rôles
  (`pro`/`superadmin`), espace superadmin minimal (créer/suspendre un compte), changement de mot de passe forcé.
- **Phase 1 — MVP fonctionnel** : services + tarifs, avis modérés, canaux de contact (dont LinkedIn),
  stats de base, suivi manuel des commissions.
- **Phase 2 — Robustesse & échelle** : recherche plein-texte, upload d'images réel, compteurs atomiques,
  cache CDN, audit log complet, RGPD, MFA superadmin.
- **Phase 3 — Croissance** : paiement en ligne de la commission, i18n arabe/RTL, analytics avancées,
  notifications, éventuelle app mobile.

## 15. Critères d'acceptation (extraits)

- Un visiteur peut trouver une Ferasha par ville + catégorie et cliquer sur WhatsApp/Instagram/LinkedIn **sans créer de compte**.
- Impossible de créer un compte pro sans passer par le superadmin.
- Un pro connecté ne peut **en aucun cas** lire/écrire les données d'un autre pro (test RLS).
- Un avis n'apparaît qu'après approbation ; la note moyenne ne compte que les avis approuvés.
- Le superadmin peut suspendre un compte → les Ferashas concernées disparaissent du public.
- Les pages publiques sont rendues en SSR et indexables (SEO).
