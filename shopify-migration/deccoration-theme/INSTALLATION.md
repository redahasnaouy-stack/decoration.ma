# Deccoration — boutique Shopify Horizon personnalisée

## Installer sans remplacer le site actuel

1. Dans Shopify : **Boutique en ligne → Thèmes → Ajouter un thème / Importer un thème → Importer un fichier ZIP**.
2. Choisir `deccoration-shopify.zip` tel quel, sans le décompresser.
3. Ouvrir **Personnaliser** sur le thème importé puis **Aperçu**. Garder le thème actuel et le domaine Netlify pendant la préparation.
4. Le hero, les six visuels d’univers, la photo d’ambiance et le logo sont déjà dans les assets du thème. Aucun téléchargement d’image supplémentaire n’est nécessaire.
5. Les sections éditables s’appellent **Deco · Hero**, **Deco · Nos univers**, **Deco · Notre histoire**, **Deco · Nos engagements**, **Deco · FAQ** et **Deco · Pied de page**.

## Produits et navigation

- Le thème n’ajoute, ne publie et ne modifie pas les produits ni les stocks. Les 24 produits déjà importés dans Shopify restent dans le catalogue. Ne pas réimporter le CSV pour installer le thème.
- Vérifier les prix de vente, les photos, les descriptions et le stock réel, passer les produits prêts de **Brouillon** à **Actif** et les rendre disponibles sur **Boutique en ligne**.
- La sélection d’accueil utilise la collection **all / Tous les produits**. Dans Personnaliser, changer la collection si souhaité. Un seul produit actif signifie un seul produit présenté.
- Les six univers filtrent par les tags déjà présents dans le CSV : Mobilier, Luminaires, Textiles, Vases, Miroirs, Paniers. Ils peuvent aussi être liés à vos propres collections depuis l’éditeur.
- Les fiches utilisent les URL Shopify `/products/...` ; images, prix, variantes, quantités, ajout au panier et checkout restent natifs à Shopify.
- Dans **Contenu → Menus** (ou Navigation selon votre interface), régler le menu principal : Accueil `/`, La collection `/collections/all`, Contact `/pages/contact`.

## Pages et coordonnées

- Dans **Boutique en ligne → Pages** (ou Contenu → Pages), créer une page **Contact**, handle `contact`, et lui attribuer le modèle **contact**. Le formulaire Shopify est inclus dans le thème ; les messages vont à l’adresse de contact configurée dans Shopify.
- Facultatif : créer **Notre univers**, modèle `notre-univers`, et **Questions fréquentes**, modèle `faq`.
- Dans le bloc **Deco · Pied de page**, renseigner l’e-mail public de la boutique et, si souhaité, le lien WhatsApp professionnel. Aucun numéro ou e-mail n’a été inventé.
- Dans **Paramètres → Politiques**, renseigner les mentions légales, confidentialité, livraison et retours adaptées à votre entreprise. Les liens disponibles apparaissent dans le pied de page natif.
- Les informations de livraison de la FAQ sont volontairement générales : modifier les textes après avoir défini vos tarifs et délais réels.

## Réglages à faire dans votre compte Shopify

Ces réglages ne sont pas contenus dans un fichier de thème :

1. **Détails de la boutique / Général** : nom de la boutique, coordonnées et devise MAD.
2. **Langues** : définir le français comme langue principale. Le thème fournit déjà les libellés clients en français, y compris son repli par défaut.
3. **Paiements → Moyens de paiement manuels** : ajouter **Paiement à la livraison / Cash on Delivery**, puis décrire votre procédure réelle. Ne pas activer un prestataire bancaire sans contrat adapté.
4. **Expédition et livraison** : ajouter les zones marocaines et vos vrais tarifs. Les frais Netlify ne sont pas transférés automatiquement.
5. Vérifier taxes, adresse commerciale, expéditeur e-mail et notifications.
6. Passer une commande de test et vérifier stock, panier, checkout, confirmation et apparition dans **Commandes**. Tester aussi le formulaire Contact.
7. Garder la protection par mot de passe jusqu’à la validation et à l’activation de l’offre Shopify appropriée.

## Google Sheets et pixels

Les intégrations du site Netlify ne suivent pas automatiquement les commandes Shopify.

- Meta : canal / application **Facebook & Instagram** de Meta.
- TikTok : application officielle TikTok.
- Google Ads : **Google & YouTube** et vos conversions choisies.
- Préférences de confidentialité : configurer **Paramètres → Confidentialité des clients**, et tester les évènements dans les outils des plateformes. Ne pas coller le même pixel à plusieurs endroits.
- Google Sheets : mettre en place un connecteur Shopify vers Sheets ou un workflow adapté à votre offre. Le webhook Apps Script actuel attend le format du site Netlify ; il ne doit pas recevoir directement un webhook Shopify sans adaptation et vérification d’authenticité. Continuer à consulter les commandes Shopify tant que cette intégration n’est pas configurée.
- Aucun secret, token, identifiant de pixel ou mot de passe n’est embarqué dans le thème.

## Domaine : seulement quand la boutique est validée

1. Publier le nouveau thème après les tests.
2. Dans **Paramètres → Domaines → Connecter un domaine existant**, saisir `deccoration.ma`.
3. Appliquer chez CapConnect les valeurs DNS affichées par Shopify. Ne pas réutiliser les valeurs Netlify et ne pas les changer avant cette étape.
4. Conserver les enregistrements de messagerie. Attendre la validation du domaine et du certificat SSL Shopify, vérifier domaine nu et www, puis définir le domaine principal.
5. Conserver temporairement le projet Netlify et sauvegarder ses commandes. Les anciens liens `/produit/ID-nom` nécessitent des redirections vers les nouvelles URL `/products/handle` ; le thème ne crée pas de redirections dans votre compte.

## Ce qui a été vérifié

- Archive complète et sûre, structure Shopify à la racine.
- JSON et schémas des nouvelles sections valides.
- Shopify Theme Check : aucune nouvelle erreur dans nos personnalisations. Deux erreurs `UnknownFilter applicable_disclosures` et six avertissements existent déjà dans l’export Horizon original ; ces fichiers natifs sont conservés. Le rapport brut est fourni à côté du ZIP.
- Aperçu graphique local : images disponibles, 6 univers, FAQ, ordinateur et mobile sans débordement. Les captures sont un aperçu de la direction graphique avec des produits simulés, pas une preuve du checkout Shopify.
- Sans connexion à votre compte, import, rendu Shopify réel, achat, contact, paiement et livraison ne peuvent être validés ici. Effectuer ces vérifications dans l’aperçu de Shopify avant publication.
