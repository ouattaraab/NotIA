import * as MailComposer from 'expo-mail-composer';
import { getUnsendNotifications, markNotificationsAsSent, getSetting } from '../database/database';

// Fonction pour envoyer les notifications non envoyées par email
export async function sendNotificationsViaEmail() {
  try {
    // Vérification si l'envoi d'email est disponible
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      console.error('L\'envoi d\'email n\'est pas disponible sur cet appareil');
      return false;
    }

    // Récupération de l'adresse email de destination depuis les paramètres
    const emailDestination = await getSetting('email_destination');
    if (!emailDestination) {
      console.error('Aucune adresse email de destination configurée');
      return false;
    }

    // Récupération des notifications non envoyées
    const notifications = await getUnsendNotifications();
    if (notifications.length === 0) {
      console.log('Aucune nouvelle notification à envoyer');
      return true;
    }

    // Création du contenu de l'email
    const emailBody = formatNotificationsForEmail(notifications);
    const notificationCount = notifications.length;
    
    // Configuration de l'email
    const email = {
      recipients: [emailDestination],
      subject: `NotIA - ${notificationCount} nouvelle(s) notification(s)`,
      body: emailBody,
      isHtml: true,
    };

    // Envoi de l'email
    const result = await MailComposer.composeAsync(email);
    
    // Si l'email a été envoyé avec succès, marquer les notifications comme envoyées
    if (result.status === 'sent') {
      const notificationIds = notifications.map(notification => notification.id);
      await markNotificationsAsSent(notificationIds);
      console.log(`${notificationCount} notification(s) envoyée(s) avec succès à ${emailDestination}`);
      return true;
    } else {
      console.log('L\'email n\'a pas été envoyé:', result.status);
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications par email:', error);
    return false;
  }
}

// Fonction pour formater les notifications en HTML pour l'email
function formatNotificationsForEmail(notifications) {
  // En-tête de l'email
  let emailContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .notification { 
          margin-bottom: 20px; 
          padding: 15px; 
          border-radius: 8px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          border-left: 4px solid #4285f4; 
        }
        .app-name { 
          font-weight: bold; 
          color: #4285f4; 
          margin-bottom: 5px; 
        }
        .title { 
          font-size: 18px; 
          margin-bottom: 8px; 
        }
        .message { 
          color: #555; 
          margin-bottom: 8px; 
        }
        .time { 
          color: #888; 
          font-size: 12px; 
          text-align: right; 
        }
      </style>
    </head>
    <body>
      <h2>Nouvelles notifications de votre appareil</h2>
  `;

  // Groupe les notifications par application
  const notificationsByApp = {};
  
  notifications.forEach(notification => {
    const appName = notification.app_name || 'Application inconnue';
    if (!notificationsByApp[appName]) {
      notificationsByApp[appName] = [];
    }
    notificationsByApp[appName].push(notification);
  });

  // Ajouter les notifications groupées par application
  Object.keys(notificationsByApp).forEach(appName => {
    emailContent += `<h3>${appName}</h3>`;
    
    notificationsByApp[appName].forEach(notification => {
      const date = new Date(notification.received_at);
      const formattedDate = date.toLocaleString();
      
      emailContent += `
        <div class="notification">
          <div class="title">${escapeHtml(notification.title || 'Sans titre')}</div>
          <div class="message">${escapeHtml(notification.message || 'Sans contenu')}</div>
          <div class="time">${formattedDate}</div>
        </div>
      `;
    });
  });

  // Pied de page de l'email
  emailContent += `
      <p>Cet email a été envoyé automatiquement par l'application NotIA.</p>
    </body>
    </html>
  `;

  return emailContent;
}

// Fonction pour échapper les caractères HTML spéciaux
function escapeHtml(text) {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fonction pour envoyer un email de test
export async function sendTestEmail(emailDestination) {
  try {
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      return { success: false, message: 'L\'envoi d\'email n\'est pas disponible sur cet appareil' };
    }

    const testNotifications = [
      {
        id: 0,
        app_name: 'WhatsApp',
        title: 'John Doe',
        message: 'Salut, comment ça va?',
        received_at: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      },
      {
        id: 1,
        app_name: 'Email',
        title: 'Réunion demain',
        message: 'N\'oubliez pas la réunion de demain à 10h.',
        received_at: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      },
    ];

    const emailBody = formatNotificationsForEmail(testNotifications);
    
    const email = {
      recipients: [emailDestination],
      subject: 'NotIA - Email de test',
      body: emailBody,
      isHtml: true,
    };

    const result = await MailComposer.composeAsync(email);
    
    if (result.status === 'sent') {
      return { success: true, message: 'Email de test envoyé avec succès!' };
    } else {
      return { success: false, message: `Email non envoyé: ${result.status}` };
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de test:', error);
    return { success: false, message: `Erreur: ${error.message}` };
  }
}
