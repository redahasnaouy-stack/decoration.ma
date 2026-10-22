# Connecter les commandes à Google Sheets

Les commandes restent enregistrées dans le site. Une copie de chaque nouvelle commande est envoyée à Google Sheets après enregistrement. L’échec Google ne bloque pas la commande. Le dashboard affiche l’état et propose **Envoyer à Sheets** pour les envois en attente et les anciennes commandes.

## Configuration dans Google

1. Créer un Google Sheet privé. Copier son identifiant (la partie entre `/d/` et `/edit` de son URL).
2. Ouvrir **Extensions → Apps Script**, puis remplacer le code par le contenu de [Code.gs](Code.gs).
3. Dans **Paramètres du projet → Propriétés du script**, ajouter :
   - `SPREADSHEET_ID` : identifiant du Sheet.
   - `SYNC_TOKEN` : secret aléatoire d’au moins 32 caractères généré avec un gestionnaire de mots de passe. Conserver ce secret hors du code et ne pas l’envoyer dans le chat.
4. **Déployer → Nouveau déploiement → Application Web** : exécuter en tant que votre compte, accès **Tout le monde**. Autoriser l’accès au Sheet et copier l’URL qui termine par `/exec`. Le token protège les écritures ; la feuille elle-même reste privée. Si votre organisation interdit les Web Apps publiques, cette méthode nécessite une autre intégration autorisée par votre administrateur.

## Configuration dans Netlify

Dans **Project configuration → Environment variables**, ajouter ces variables aux Functions :

- `GOOGLE_SHEETS_WEBHOOK_URL` : URL Apps Script `/exec`.
- `GOOGLE_SHEETS_SYNC_TOKEN` : exactement le secret `SYNC_TOKEN` défini dans Google.

Redéployer le site. Aucun secret n’est inclus dans le JavaScript envoyé aux visiteurs. Ne jamais committer ces variables.

## Vérifier

Créer une commande de test et vérifier la ligne dans l’onglet **Commandes** créé automatiquement : numéro, date, nom, téléphone, adresse, produits, quantités, total et statut initial. Dans `/admin`, vérifier **Synchronisé ✓**. Un nouvel envoi de la même commande ne doit pas créer une seconde ligne.

Les commandes antérieures ne sont pas exportées automatiquement : cliquer **Envoyer à Sheets** sur chacune. La synchronisation copie le statut au moment du premier envoi ; les modifications ultérieures du statut dans le dashboard ne mettent pas à jour la ligne Google. La synchronisation des produits n’est pas incluse.

Le code gère le verrouillage et la déduplication dans Apps Script. Les données saisies par les clients sont écrites en texte pour éviter les formules. L’envoi a une limite de 7 secondes ; en cas de doute, réessayer depuis l’administration, sans perdre la commande ni créer de doublon.

La connexion réelle ne peut être validée qu’après la configuration dans vos comptes Google et Netlify.
