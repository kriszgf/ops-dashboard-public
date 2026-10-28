# Tableau de bord des processus (exemple)

> **Toutes les données de ce dépôt sont des DONNÉES D’EXEMPLE fictives** (`data/sample-processes.json`). Aucun bot, aucune personne ni aucun système réel n’est décrit.

Un tableau de bord monopage React + TypeScript (Vite) pour des processus automatisés : bot responsable, planning, statut, dernière exécution, problème, catégorie et détails, plus un panneau de notes Obsidian. Toutes les données sont statiques dans le code source ; la page ne fait aucun appel réseau.

## Démarrage rapide
```bash
npm ci && npm start      # compile puis sert sur http://localhost:4173
```
Nécessite Node 18+. Serveur de développement : `npm run dev`.

## Installation pas à pas
**Prérequis :** Node.js 18 ou plus récent (avec npm) et Git.

```bash
git clone <your-repo-url> ops-dashboard
cd ops-dashboard
npm ci        # installer les dépendances en versions exactes
npm run dev   # serveur de développement avec rechargement (souvent http://localhost:5173)
npm test      # lancer les tests Vitest
npm run build # vérification des types et build dans dist/
npm start     # build, puis servir dist/ sur http://localhost:4173
```

Modifier les données d’exemple : processus dans `data/sample-processes.json`, projets dans `data/sample-projects.json` (les champs `what`, `why`, `status`, `next` s’affichent avec **Plus**), extraits Obsidian dans `src/obsidian-adapter.ts`. Ne commitez jamais de vrais noms, e-mails, IP, journaux ou clés.

## Commandes
- En-tête : choix de langue (9 langues ; ◐ = traduction automatique partielle), thème (Auto / Clair / Sombre), README.
- Les bandeaux rouges et orange mènent à la fiche concernée.
- Vues : horloge 24 h, réseau bots–processus, lignes de métro. Zoom, Ajuster, Plein écran (Échap).
- Fiches : « Description / Commande » avec plus / moins.
- Arrêter / Redémarrer copient un message comme `Stop: <processus> (Bot A/<id>)` à coller dans le chat du Coordinator. Rien n’est envoyé.

## Pourquoi Obsidian / Pourquoi le lecteur de vault
Le vault Obsidian est la base de connaissances partagée de l'équipe : décisions, procédures et contexte y sont conservés sous forme de notes Markdown. Le lecteur de vault y accède en lecture seule, afin que les bots puissent y chercher et utiliser ce qui est déjà écrit au lieu de redemander. Cela économise du temps et de l'énergie, et le propriétaire n'a pas à tout réexpliquer.

**Principe : d'abord la base de connaissances, ensuite le propriétaire.** Avant de solliciter le propriétaire, un bot consulte la base de connaissances partagée en lecture seule et ne pose la question que si la réponse n'y figure pas.

## Configurer Obsidian
1. Installez Obsidian (obsidian.md) sur la machine où vous voulez lire.
2. Ouvrez le coffre « example vault » (Open folder as vault). L’hôte du coffre vient de la configuration (`vaultHost`).
3. Sur une autre machine : synchronisez le dossier (Syncthing, partage SMB ou Obsidian Sync) et ouvrez-le avec le même nom de coffre.
4. Appuyez sur Actualiser dans le panneau Obsidian.

Connecter votre propre vault (espaces réservés uniquement) :
- Nom du vault: `<your-vault-name>`
- Machine: `<host where the vault lives>`
- Mode de synchronisation: Obsidian Sync / iCloud / git / local only
- Connexion: définissez `VAULT_PATH` dans un `.env` ignoré par git, puis lancez `tools/vault-read`
  `VAULT_PATH=/path/to/<your-vault-name>`

Les liens ont la forme `obsidian://open?vault=<encodeURIComponent(vault)>&file=<encodeURIComponent(chemin sans .md)>` et s’ouvrent dans un nouvel onglet, car les iframes en bac à sable bloquent les protocoles personnalisés dans le même cadre.

## Mode écriture du vault (v1.6.0)

**Interrupteur (v1.6.1) :** les écritures (`create`, `append`, `--pending`, `approve`) ne fonctionnent qu'avec `VAULT_WRITE_ENABLED=1` (env ou `.env`) ; désactivées par défaut, `pending list` reste en lecture seule.

`create` crée une nouvelle note et échoue si elle existe ; `append` ajoute uniquement à une note existante. Pas de suppression, d'écrasement ni de renommage. `--bot <nom>` est obligatoire ; le texte vient de `--text` ou de stdin. Chaque écriture est journalisée dans `_bot-writes/log.md` (ajout seul : heure, bot, commande, chemin, 200 premiers caractères, sha256) et résumée chaque jour dans `_bot-writes/daily/YYYY-MM-DD.md`. `--pending` place l'écriture dans `_bot-writes/pending/` sans toucher la cible ; seul le propriétaire l'applique avec `approve <id>`. Exclusions, blocage traversal/liens symboliques et masquage des secrets s'appliquent aussi ; `.obsidian` et les chemins exclus ne sont jamais écrits.

```sh
tools/vault-read --json create "Inbox/Note.md" --bot <bot-name> --text "..."
echo "..." | tools/vault-read --json append "Inbox/Note.md" --bot <bot-name>
tools/vault-read --json append "Inbox/Note.md" --bot <bot-name> --pending --text "..."
tools/vault-read --json pending list
tools/vault-read --json approve <id>   # owner only
```

## Adaptateur de configuration
`src/obsidian-adapter.ts` contient `OBS_CFG` (`vaultHost`, `vaultName`, `source`) et des extraits d’exemple en lecture seule. `source` vaut `local`, `syncthing`, `smb` ou `rest` (URL de la Local REST API, simple espace réservé). Remplaçable par `VITE_OBSIDIAN_HOST`, `VITE_OBSIDIAN_VAULT`, `VITE_OBSIDIAN_SOURCE` dans un `.env` ignoré par git. `src/webhook.ts` est un module désactivé pour le contrôle direct des processus.

## Guide du débutant : un processus pas à pas
1. Lancez `npm ci && npm start` et ouvrez http://localhost:4173.
2. Sous **Vue**, choisissez **Réseau bots–processus**. Dans le filtre des bots, choisissez **Coordinator**.
3. Cliquez sur la case **Veille hebdo des tendances**. La fiche détaillée indique : planning Monday 10:00, statut actif · OK, dernière exécution 10-26 10:04.
4. Ouvrez **Description / Commande** avec **plus** pour lire la consigne d’exemple.
5. Appuyez sur **Arrêter**. Le texte `Stop: Weekly trend scan (Coordinator/p02)` est copié. Collez-le dans votre chat Coordinator ; la page elle-même n’envoie rien.
6. Changez de langue dans l’en-tête et appuyez sur **README** pour lire ce guide dans cette langue.

## Données
Remplacez `data/sample-processes.json` par votre propre export (même structure). Ne commitez jamais de données réelles ni de clés.

Lecteur de coffre Obsidian (lecture seule) : `tools/vault-read` — voir le README principal.
