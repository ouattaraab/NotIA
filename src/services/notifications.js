import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { saveNotification } from '../database/database';

// Fonction pour enregistrer l'application pour recevoir des notifications
export async function registerForPushNotifications() {
  // Vérification si l'appareil est physique (pas un émulateur)
  const deviceType = await Notifications.getDevicePushTokenAsync();
  console.log('Type d\'appareil pour les notifications:', deviceType);

  // Demande de permissions pour les notifications
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Si nous n'avons pas déjà la permission, demandez-la
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Si la permission n'est pas accordée, nous ne pouvons pas continuer
  if (finalStatus !== 'granted') {
    console.error('Permission refusée pour les notifications!');
    return;
  }

  console.log('Permissions accordées pour les notifications');

  // Pour Android, nous devons configurer le canal de notification
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Enregistrement du gestionnaire de notifications reçues
  const notificationListener = Notifications.addNotificationReceivedListener(
    handleReceivedNotification
  );

  // Enregistrement du gestionnaire de notifications répondues
  const responseListener = Notifications.addNotificationResponseReceivedListener(
    handleNotificationResponse
  );

  return () => {
    // Nettoyage des écouteurs lors du démontage
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

// Fonction pour gérer une notification reçue
export async function handleReceivedNotification(notification) {
  const { title, body } = notification.request.content;
  const appName = getAppNameFromNotification(notification);
  
  try {
    // Enregistrement de la notification dans la base de données
    await saveNotification(appName, title, body);
    console.log('Notification enregistrée:', title);
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la notification:', error);
  }
}

// Fonction pour gérer une réponse à une notification
function handleNotificationResponse(response) {
  const { notification } = response;
  console.log('Notification cliquée:', notification);
}

// Fonction pour extraire le nom de l'application de la notification
function getAppNameFromNotification(notification) {
  // Sur Android, nous pouvons parfois obtenir le nom du package
  if (Platform.OS === 'android' && notification.request.trigger?.remoteMessage?.data?.app) {
    return notification.request.trigger.remoteMessage.data.app;
  }
  
  // Sur iOS, c'est plus difficile d'obtenir le nom exact de l'application
  // Sans un listener de notification spécifique à l'OS (qui nécessite un module natif)
  
  // Essai d'extraire des informations de la notification
  const { data, title } = notification.request.content;
  
  // Certaines applications incluent leur nom dans les données
  if (data && data.appName) {
    return data.appName;
  }
  
  // Tentative de déduire l'application à partir du titre
  if (title) {
    if (title.includes('WhatsApp')) return 'WhatsApp';
    if (title.includes('SMS') || title.includes('Message')) return 'SMS';
    if (title.includes('Call') || title.includes('Appel')) return 'Appel';
    if (title.includes('Email') || title.includes('Mail')) return 'Email';
    if (title.includes('Facebook')) return 'Facebook';
    if (title.includes('Instagram')) return 'Instagram';
    if (title.includes('Twitter') || title.includes('X')) return 'Twitter';
    if (title.includes('Telegram')) return 'Telegram';
  }
  
  // Par défaut, retourner "Application inconnue"
  return 'Application inconnue';
}

// Note: Pour vraiment capter toutes les notifications système sur Android,
// il faut implémenter un service natif NotificationListenerService
// ce qui nécessite du code Java natif et des permissions spéciales
// Cette implémentation ne peut capter que les notifications push
// envoyées directement à l'application via FCM ou similaire
// Pour une implémentation complète, un module natif serait nécessaire
