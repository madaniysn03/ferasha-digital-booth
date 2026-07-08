# Déploiement — Ferasha Quantic sur VPS (Ubuntu) avec auto-deploy GitHub

Objectif : héberger l'app sur ton VPS Namecheap, avec ton domaine (acheté chez
Nindohost), et un **déploiement automatique** — tu pushes sur `main`, GitHub
reconstruit et met à jour le site tout seul.

## Comment ça marche (architecture)

```
  git push (branche main)
        │
        ▼
  GitHub Actions  ──ssh/rsync──►  VPS Ubuntu
                                    ├─ npm ci + npm run build   → .output/server/index.mjs
                                    ├─ systemd service "ferasha" (node, port 3000, localhost)
                                    └─ Nginx (ports 80/443, HTTPS) ──► proxy vers 127.0.0.1:3000
                                                                            │
                                              Supabase (distant, déjà hébergé) ◄─┘
```

- L'app est **SSR** → un serveur Node tourne en permanence (pas de simple hébergement statique).
- **Supabase reste distant** : rien à héberger côté base de données.
- Le fichier **`.env` vit uniquement sur le VPS** (il contient `SUPABASE_SERVICE_ROLE_KEY`,
  etc.). Il n'est **jamais** envoyé à GitHub. Le workflow rsync l'exclut explicitement.

Remplace partout ci-dessous :
- `VPS_IP` → l'IP publique de ton VPS (dans le panneau Namecheap)
- `VOTRE_DOMAINE.com` → ton domaine Nindohost

---

## Étape 1 — Pointer le domaine vers le VPS (à faire en premier, ça propage lentement)

Dans le panneau DNS de **Nindohost** (ton registrar), crée deux enregistrements **A** :

| Type | Nom / Host | Valeur   | TTL     |
|------|------------|----------|---------|
| A    | `@`        | `VPS_IP` | Auto/3600 |
| A    | `www`      | `VPS_IP` | Auto/3600 |

> Si Nindohost te demande des « nameservers », garde ceux par défaut de Nindohost
> (sinon les enregistrements A ci-dessus doivent être créés chez le fournisseur de
> nameservers réellement utilisé). La propagation DNS prend de quelques minutes à
> quelques heures. Tu peux vérifier plus tard avec `nslookup VOTRE_DOMAINE.com`.

---

## Étape 2 — Se connecter au VPS en SSH (depuis Windows / PowerShell)

Namecheap t'a donné une IP et un mot de passe `root` (par email ou dans le panneau).

```powershell
ssh root@VPS_IP
```

Tape `yes` à la question de fingerprint, puis le mot de passe. Tu es maintenant sur le serveur.
(Toutes les commandes des étapes 3 à 7 se lancent **sur le VPS**, pas sur ton PC.)

---

## Étape 3 — Préparer le serveur (une seule fois, en `root`)

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer Node.js 22 LTS, Nginx, git, rsync, certbot
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs nginx git rsync certbot python3-certbot-nginx
node -v   # doit afficher v22.x

# Créer un utilisateur "deploy" (l'app ne tournera pas en root)
adduser --disabled-password --gecos "" deploy

# Dossier de l'app
mkdir -p /var/www/ferasha
chown -R deploy:deploy /var/www/ferasha

# Autoriser "deploy" à redémarrer UNIQUEMENT le service ferasha, sans mot de passe
echo 'deploy ALL=(root) NOPASSWD: /bin/systemctl restart ferasha, /bin/systemctl status ferasha, /usr/bin/systemctl restart ferasha, /usr/bin/systemctl status ferasha' > /etc/sudoers.d/ferasha
chmod 440 /etc/sudoers.d/ferasha

# Pare-feu : autoriser SSH + web, bloquer le reste (le port 3000 reste privé)
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## Étape 4 — Créer la clé SSH que GitHub utilisera pour se connecter

Toujours **sur le VPS**, en `root` :

```bash
# Générer une paire de clés dédiée au déploiement (sans passphrase)
ssh-keygen -t ed25519 -f /root/deploy_key -N "" -C "github-actions-deploy"

# Autoriser cette clé à se connecter en tant que "deploy"
mkdir -p /home/deploy/.ssh
cat /root/deploy_key.pub >> /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Afficher la clé PRIVÉE — copie tout ce bloc, tu la colleras dans un secret GitHub
echo "================ COPIE À PARTIR DE LA LIGNE SUIVANTE ================"
cat /root/deploy_key
echo "================ JUSQU'À LA LIGNE PRÉCÉDENTE (incluse) ================"
```

Garde cette clé privée de côté (bloc-notes) pour l'étape 8. Copie **tout**, y compris
les lignes `-----BEGIN...` et `-----END OPENSSH PRIVATE KEY-----`.

> Sécurité : une fois collée dans GitHub, tu peux supprimer le fichier du serveur :
> `rm /root/deploy_key` (garde `deploy_key.pub` dans authorized_keys).

---

## Étape 5 — Premier déploiement manuel + fichier `.env`

Encore sur le VPS. On fait le tout premier build à la main pour valider, puis GitHub
prendra le relais.

```bash
# Passer sur l'utilisateur deploy
su - deploy

# Récupérer le code (repo public : clone HTTPS. Si privé, voir la note plus bas)
git clone https://github.com/madaniysn03/ferasha-digital-booth.git /var/www/ferasha
cd /var/www/ferasha

# Créer le .env de production (il ne sera JAMAIS écrasé par les déploiements)
nano .env
```

Colle dedans les mêmes valeurs que ton `.env` local (celui sur ton PC Windows,
dans le dossier du projet). Il contient notamment :

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_PROJECT_ID=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ACCESS_TOKEN=...
SUPABASE_DB_PASSWORD=...
```

Enregistre dans nano : `Ctrl+O`, `Entrée`, puis `Ctrl+X`.

```bash
# Build initial
npm ci --include=dev
npm run build      # doit produire .output/server/index.mjs

# Test rapide (Ctrl+C pour arrêter après avoir vu "Listening on ...")
PORT=3000 node .output/server/index.mjs
```

> **Repo privé ?** Si `git clone` demande un mot de passe, le repo est privé.
> Le plus simple : rends-le public sur GitHub, OU crée une deploy key en lecture
> (ssh-keygen sur le VPS, ajoute la clé publique dans *Settings → Deploy keys* du repo,
> et clone via `git@github.com:...`). Le workflow rsync fonctionne dans les deux cas.

---

## Étape 6 — Service systemd (l'app tourne en permanence et redémarre au boot)

Reviens en `root` (`exit` pour quitter le shell `deploy`), puis :

```bash
# Installer le fichier de service fourni dans le repo
cp /var/www/ferasha/deploy/ferasha.service /etc/systemd/system/ferasha.service

systemctl daemon-reload
systemctl enable ferasha     # démarrage automatique au reboot
systemctl start ferasha
systemctl status ferasha     # doit être "active (running)"

# Vérifier qu'il répond en local
curl -I http://127.0.0.1:3000     # doit renvoyer HTTP/1.1 200 OK
```

---

## Étape 7 — Nginx + HTTPS

En `root` :

```bash
# Installer la config Nginx fournie
cp /var/www/ferasha/deploy/nginx-ferasha.conf /etc/nginx/sites-available/ferasha

# Remplacer le domaine placeholder par le tien
sed -i 's/VOTRE_DOMAINE.com/VOTRE_DOMAINE.com/g' /etc/nginx/sites-available/ferasha
# (édite le fichier avec: nano /etc/nginx/sites-available/ferasha  si tu préfères)

# Activer le site, désactiver le site par défaut
ln -sf /etc/nginx/sites-available/ferasha /etc/nginx/sites-enabled/ferasha
rm -f /etc/nginx/sites-enabled/default

nginx -t          # test de config → "syntax is ok"
systemctl reload nginx
```

Vérifie dans un navigateur : `http://VOTRE_DOMAINE.com` doit afficher le site
(uniquement une fois le DNS de l'étape 1 propagé).

Puis active le HTTPS gratuit (Let's Encrypt) — certbot modifie Nginx tout seul :

```bash
certbot --nginx -d VOTRE_DOMAINE.com -d www.VOTRE_DOMAINE.com
```

Réponds à l'email, accepte, et choisis la redirection HTTP→HTTPS. Le renouvellement
est automatique. Le site est maintenant en `https://VOTRE_DOMAINE.com`.

---

## Étape 8 — Activer l'auto-deploy (secrets GitHub)

Sur **GitHub**, va dans le repo → **Settings → Secrets and variables → Actions →
New repository secret**. Crée :

| Nom du secret | Valeur |
|---------------|--------|
| `VPS_HOST`    | `VPS_IP` (l'IP du serveur) |
| `VPS_USER`    | `deploy` |
| `VPS_SSH_KEY` | la clé **privée** copiée à l'étape 4 (le bloc entier) |
| `VPS_PORT`    | `22` (optionnel — seulement si tu as changé le port SSH) |

C'est tout. Le workflow `.github/workflows/deploy.yml` est déjà dans le repo.

---

## Étape 9 — L'utilisation au quotidien

À partir de maintenant, ton cycle de travail :

```bash
# sur ton PC Windows
git add -A
git commit -m "ma modification"
git push
```

→ Onglet **Actions** du repo GitHub : le job « Deploy to VPS » se lance, build sur le
VPS, redémarre le service. ~1–2 min plus tard, la modif est en ligne sur
`https://VOTRE_DOMAINE.com`.

Tu peux aussi lancer un déploiement manuellement : Actions → *Deploy to VPS* → *Run workflow*.

---

## Dépannage

- **Voir les logs de l'app** : `journalctl -u ferasha -f` (sur le VPS)
- **Le service ne démarre pas** : `systemctl status ferasha` puis `journalctl -u ferasha -n 50`
- **Le déploiement GitHub échoue** : ouvre le job dans l'onglet Actions, regarde quelle
  étape casse (souvent : mauvais secret SSH, ou `.env` manquant sur le VPS).
- **502 Bad Gateway dans le navigateur** : l'app Node est tombée → `systemctl restart ferasha`
  et regarde `journalctl -u ferasha`.
- **Changer une variable `.env`** : édite `/var/www/ferasha/.env` sur le VPS puis
  `sudo systemctl restart ferasha` (un simple push ne recharge pas le .env).
- **Vérifier le DNS** : `nslookup VOTRE_DOMAINE.com` doit renvoyer `VPS_IP`.

## Notes techniques

- Le build cible le preset **Nitro `node-server`** (voir `vite.config.ts`). Dans le
  sandbox Lovable, le preset Cloudflare reste forcé — ce réglage n'affecte que
  l'auto-hébergement/CI.
- Le serveur écoute sur `127.0.0.1:3000` (privé) ; Nginx est le seul point d'entrée public.
- `.output/` est **autonome** (dépendances serveur incluses) — pas besoin de `node_modules`
  au runtime, mais on garde `node_modules` sur le VPS car le build en a besoin.
