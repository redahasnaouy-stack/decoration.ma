# dicoration

Catalogue de décoration en français : grille de quatre produits sur ordinateur, recherche, filtres, fiches descriptives et dashboard privé pour gérer les produits et photos. Commande directe d’un produit avec formulaire client, sans panier. Les anciennes commandes restent consultables dans l’administration.

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

Le catalogue contient 24 produits de décoration importés depuis le catalogue public Engro le 22 octobre 2026 : noms, descriptions, prix affichés et photos du fournisseur. Les prix sont ceux du fournisseur, sans marge ajoutée. Chaque fiche du catalogue source conserve son URL et son identifiant Engro dans `netlify/catalog.json`. Le stock initial est fixé à 10 unités par produit à la demande du propriétaire : il s’agit d’une quantité de démonstration, à ajuster au stock réel avant de prendre des commandes. Vérifier également les prix de vente. Les photos importées sont conservées dans `public/assets` et leur URL source est enregistrée dans le catalogue. Les nouvelles photos peuvent être téléversées directement depuis le dashboard.

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

## Photos et migration du catalogue

Dans `/admin`, modifier un produit puis sélectionner **Photo du produit** depuis l’appareil. L’interface réduit la photo à 1600 pixels maximum et l’envoie au serveur ; l’aperçu permet de vérifier le résultat avant **Enregistrer**. Formats : JPEG, PNG ou WebP, 2 Mo maximum après compression. Les fichiers sont conservés dans Netlify Blobs (`dicoration-images`) ou dans `data/images` en local. Le téléchargement est réservé à l’administrateur ; les images publiées sont accessibles publiquement.

La migration du catalogue Engro est appliquée une seule fois. Les anciennes fiches de démonstration encore inchangées sont remplacées ; les produits personnalisés et les commandes sont préservés. Les imports ne synchronisent pas automatiquement les prix ni le stock fournisseur. Le header et le panier restent visibles pendant le défilement et une confirmation apparaît à chaque ajout réussi.

Une migration unique ajoute 10 unités aux produits Engro déjà importés dont le stock est encore 0. Les quantités positives et les produits personnalisés restent inchangés. Elle ne se réapplique pas après une vente ou un passage à zéro ultérieur.

## Commande directe sans panier

Chaque fiche produit propose **Commander ce produit**. Le client renseigne quantité, nom, téléphone, ville et adresse ; le récapitulatif affiche le prix, les frais de livraison (39 DH, offerts dès 800 DH) et le total avant confirmation. Paiement à la livraison, sans paiement électronique. La commande apparaît dans `/admin` avec les coordonnées, les articles et le statut Nouvelle.

Les prix et la disponibilité sont validés côté serveur et le stock est déduit atomiquement. Un identifiant de demande empêche une double création lors d’une répétition de la même requête. Les anciennes commandes sont préservées. Les coordonnées ne sont accessibles que dans l’administration authentifiée.

## Google Sheets

Les nouvelles commandes peuvent être copiées automatiquement dans Google Sheets. Instructions de configuration : [integrations/google-sheets/README.md](integrations/google-sheets/README.md). Définir `GOOGLE_SHEETS_WEBHOOK_URL` et `GOOGLE_SHEETS_SYNC_TOKEN` côté Netlify après déploiement du script Google. Sans configuration, le site continue à enregistrer les commandes et affiche **À configurer** dans l’administration.

## Meta Pixel, TikTok Pixel et Google Ads

Dans `/admin`, ouvrir **Pixels & Publicité**. Renseigner les identifiants, activer les plateformes souhaitées puis enregistrer. Les réglages sont persistants (Netlify Blobs en production, SQLite en local) et ne nécessitent pas de redéploiement. Les identifiants publics des pixels sont les seules valeurs acceptées : ne pas coller de JavaScript, clé API ou access token.

- Meta : identifiant numérique du Pixel, évènements PageView, ViewContent, InitiateCheckout, Lead.
- TikTok : identifiant Pixel, évènements page, ViewContent, InitiateCheckout, SubmitForm.
- Google Ads : identifiant `AW-…` et libellé de conversion provenant de l’action de conversion choisie. Le libellé est nécessaire pour mesurer les demandes enregistrées ; configurer cette action comme prospect / demande, pas comme paiement encaissé. Le même identifiant de demande est utilisé comme transaction_id pour limiter les doublons.

Une demande enregistrée avec paiement à la livraison est suivie comme prospect, pas comme achat payé. Les évènements de conversion partent après confirmation de l’API uniquement. Les coordonnées client, les secrets et les données Google Sheets ne sont pas ajoutés aux paramètres des évènements par le site. Les fournisseurs reçoivent leurs données techniques habituelles lorsque leurs scripts sont autorisés.

Aucun script publicitaire n’est chargé avant l’accord du visiteur. Le pied de page permet de modifier le choix ; refuser après activation révoque le consentement et recharge la page sans balises. Le site reste utilisable après refus. Actualiser les mentions de confidentialité avec les fournisseurs effectivement activés et les coordonnées du responsable du site avant utilisation commerciale.

Le suivi est effectué dans le navigateur (pas de Conversions API, Events API ou envoi serveur). Bloqueurs, restrictions du navigateur et refus du visiteur peuvent empêcher la mesure. Les tests locaux vérifient réglages, consentement et évènements avec des scripts fournisseurs simulés ; la réception réelle doit être vérifiée avec vos identifiants dans Meta Events Manager / Pixel Helper, TikTok Events Manager / Pixel Helper et Google Tag Assistant.

## Liens directs des produits

Chaque produit dispose d’un chemin `/produit/ID-nom-du-produit`. Cliquer une fiche met à jour l’URL ; ouvrir ce lien directement ou actualiser la page affiche automatiquement les détails correspondants. L’identifiant reste la référence : un lien partagé continue à fonctionner si le nom change. Le bouton **Copier le lien du produit** fournit l’adresse complète du domaine courant. Les boutons précédent/suivant du navigateur suivent les ouvertures et fermetures de fiches. Un produit retiré affiche un message et un retour vers la collection.

`netlify.toml` réécrit `/produit/*` vers `index.html` pour les accès directs. Le serveur local prend en charge les mêmes chemins. Les aperçus sociaux restent ceux de la page générale ; ces liens affichent les détails côté navigateur.
