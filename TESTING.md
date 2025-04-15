# Guide de test pour NotIA

Ce document explique comment tester l'application NotIA en utilisant Expo.

## Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Un appareil mobile avec l'application Expo Go installée, ou un émulateur

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/ouattaraab/NotIA.git
cd NotIA
```

2. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

## Lancement de l'application

Pour lancer l'application en mode développement :

```bash
npm start
# ou
yarn start
```

Cela lancera le serveur de développement Expo. Vous pouvez ensuite :
- Scanner le code QR avec l'application Expo Go sur votre appareil mobile
- Appuyer sur 'a' pour ouvrir sur un émulateur Android
- Appuyer sur 'i' pour ouvrir sur un simulateur iOS

## Tests unitaires

Pour exécuter les tests unitaires :

```bash
npm test
# ou
yarn test
```

## Scénarios de test

### 1. Test de la capture de notifications

Pour tester la capture des notifications, vous pouvez :

1. Lancer l'application sur un appareil réel
2. Accorder les permissions de notification demandées
3. Envoyer un SMS ou un message WhatsApp à l'appareil
4. Vérifier que la notification apparaît dans l'écran "Notifications" de l'application

> **Note**: La capture de notifications système nécessite un appareil réel et peut ne pas fonctionner sur tous les appareils Android en raison des restrictions de sécurité. Sur Android 10+, des permissions spéciales peuvent être nécessaires.

### 2. Test de l'envoi d'emails

Pour tester l'envoi d'emails :

1. Accéder à l'écran "Paramètres"
2. Entrer une adresse email valide dans le champ "Adresse email de destination"
3. Appuyer sur "Envoyer un email de test"
4. Vérifier que l'email a été envoyé correctement

### 3. Test en mode développement

Pour faciliter le développement et les tests sans avoir à attendre de vraies notifications, l'application dispose d'un mécanisme pour générer des données de test :

1. Ouvrir le fichier `src/database/database.js`
2. Décommenter la fonction `_insertTestData()` dans la fonction `initDatabase()`
3. Redémarrer l'application

Cela peuplera la base de données avec des notifications fictives pour faciliter les tests d'interface.

## Résolution des problèmes courants

### Problèmes de permissions sur Android

Si l'application ne capture pas les notifications sur Android :

1. Vérifiez que vous avez accordé toutes les permissions demandées
2. Accédez aux paramètres de l'appareil > Applications > NotIA > Permissions
3. Assurez-vous que l'application a accès aux notifications

### Problèmes d'envoi d'emails

Si l'envoi d'emails ne fonctionne pas :

1. Vérifiez que vous avez une application de messagerie configurée sur l'appareil
2. Assurez-vous que l'adresse email est correctement formatée
3. Vérifiez votre connexion internet

## Construction de l'application pour la production

Pour créer une version de production de l'application :

```bash
expo build:android
# ou
expo build:ios
```

Suivez les instructions à l'écran pour finaliser la construction.

## Tests avec Expo Application Services (EAS)

Pour des tests plus avancés et une configuration CI/CD :

1. Installez EAS CLI :
```bash
npm install -g eas-cli
```

2. Connectez-vous à votre compte Expo :
```bash
eas login
```

3. Configurez EAS :
```bash
eas build:configure
```

4. Créez un build de test :
```bash
eas build --profile development --platform android
# ou
eas build --profile development --platform ios
```

Ceci créera une version de développement de votre application que vous pourrez installer sur vos appareils de test.

## Limitations connues

- La capture automatique de toutes les notifications système peut ne pas fonctionner sur tous les appareils en raison des restrictions de sécurité des systèmes d'exploitation mobiles.
- Sur iOS, les capacités de capture de notifications sont plus limitées que sur Android.
- L'envoi automatique d'emails en arrière-plan peut être interrompu par le système d'exploitation pour économiser la batterie.

## Ressources additionnelles

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/docs/getting-started)
- [Documentation Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Documentation SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
