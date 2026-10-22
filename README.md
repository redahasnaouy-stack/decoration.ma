# Decoration.ma

Boutique de décoration en français : catalogue filtrable, fiches produits, panier persistant, commande avec paiement à la livraison et dashboard privé (produits, stocks, commandes).

## Démarrer

Node.js 24 ou supérieur. Installer les dépendances avec `npm ci` (Netlify Blobs est utilisé sur Netlify).

```sh
npm start
```

Port : `3000`, modifiable avec `PORT`. Boutique sur `/`, administration sur `/admin`.

Pour initialiser le compte administrateur, saisir un mot de passe privé dans le terminal, sans le mettre dans l’historique :

```sh
read -rsp 'Mot de passe administrateur (12 caractères minimum) : ' ADMIN_PASSWORD
export ADMIN_PASSWORD
npm run setup-admin
unset ADMIN_PASSWORD
npm start
```

Le mot de passe est conservé sous forme de hash scrypt. La variable `ADMIN_PASSWORD` peut aussi être injectée au démarrage comme remplacement. Les sessions expirent après 24 heures et sont supprimées au redémarrage. En production derrière HTTPS, définir `COOKIE_SECURE=1`.

## Données et état du projet

SQLite dans `data/store.sqlite` (ignoré par Git), créé au premier démarrage. Sauvegarder le dossier `data` régulièrement. Les commandes recalculent les prix côté serveur et réservent le stock dans une transaction.

Les six produits initiaux, leurs prix et les photos Unsplash sont des exemples. **Aucun produit Engro n’a été importé** : l’accès à engro.ma était bloqué lors de la création. Remplacer les exemples par des fiches et images dont l’usage est autorisé, depuis le dashboard. Les images nécessitent un accès réseau ; les polices ont des alternatives locales.

Le paiement est uniquement à la livraison. Aucun encaissement électronique ni envoi automatique de message. Avant une ouverture commerciale : configurer HTTPS et sauvegardes, ajouter les coordonnées commerciales et les conditions de vente/retour/confidentialité adaptées, remplacer les exemples et intégrer si nécessaire un prestataire de paiement et de livraison. Le serveur intégré est une base de développement ; ajouter une limitation de débit et une surveillance avant exposition publique.

## Vérifications

```sh
npm test
```

Les tests utilisent une copie temporaire et ne modifient pas la base de la boutique.

## Déployer sur Netlify

1. Envoyer les fichiers du projet, y compris `netlify.toml`, `netlify/`, `package.json` et `package-lock.json`, dans le dépôt GitHub.
2. Dans Netlify : **Add new project → Import an existing project → GitHub**, sélectionner `redahasnaouy-stack/decoration.ma` et la branche qui contient ce code.
3. Laisser Netlify lire `netlify.toml` : dossier publié `public`, Functions `netlify/functions`. Aucun serveur `npm start` ni dossier `/docs` sur Netlify.
4. Ajouter uniquement `ADMIN_PASSWORD` (secret privé d’au moins 12 caractères) dans les variables Netlify disponibles aux Functions. Redéployer après le changement.
5. Vérifier `/api/products`, `/admin`, puis une commande de test.

Aucun compte Neon, PostgreSQL ou variable `DATABASE_URL` n’est nécessaire. Les produits, commandes et stocks sont conservés côté serveur dans un store Netlify Blobs propre au site, partagé entre ses déploiements. Le catalogue de démonstration est utilisé avant la première écriture. Les mises à jour utilisent une lecture forte et des écritures conditionnelles par ETag pour éviter les pertes de mises à jour concurrentes.

En local, `npm start` continue à utiliser SQLite. Les données SQLite ou d’un ancien PostgreSQL ne sont pas transférées automatiquement. Le store actuel conserve l’ensemble de la boutique dans un document : adapté à une petite boutique ; archiver les commandes et revoir le stockage si le volume augmente. Les previews du même site peuvent accéder aux mêmes données : ne pas y saisir des commandes d’essai après ouverture commerciale.

Le déploiement et la persistance réelle sur votre compte Netlify restent à vérifier. Les tests locaux couvrent l’authentification, les conflits d’écriture simulés et le parcours SQLite. Une modification de `ADMIN_PASSWORD` invalide les sessions existantes. Aucun mot de passe ni token Blobs ne doit être ajouté au dépôt.
