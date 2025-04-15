/**
 * Collection de fonctions utilitaires pour l'application NotIA
 */

// Formater une date en chaîne lisible
export const formatDate = (timestamp) => {
  if (!timestamp) return 'Date inconnue';
  
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Extraire le nom de l'application à partir du contenu d'une notification
export const guessAppFromNotification = (title, message) => {
  const text = `${title || ''} ${message || ''}`.toLowerCase();
  
  if (text.includes('whatsapp')) return 'WhatsApp';
  if (text.includes('message') || text.includes('sms')) return 'SMS';
  if (text.includes('appel') || text.includes('call')) return 'Appel';
  if (text.includes('mail') || text.includes('gmail') || text.includes('outlook')) return 'Email';
  if (text.includes('facebook') || text.includes('messenger')) return 'Facebook';
  if (text.includes('instagram')) return 'Instagram';
  if (text.includes('twitter') || text.includes('tweet') || text.includes('x.com')) return 'Twitter/X';
  if (text.includes('telegram')) return 'Telegram';
  if (text.includes('signal')) return 'Signal';
  if (text.includes('linkedin')) return 'LinkedIn';
  
  return 'Application inconnue';
};

// Tronquer un texte à une longueur maximale
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Valider une adresse email
export const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Générer une couleur aléatoire pour les badges d'application
export const getAppColor = (appName) => {
  // Dictionnaire de couleurs pour les applications communes
  const colorMap = {
    'WhatsApp': '#25D366',
    'SMS': '#3498db',
    'Appel': '#e74c3c',
    'Email': '#34495e',
    'Facebook': '#1877F2',
    'Instagram': '#E1306C',
    'Twitter/X': '#1DA1F2',
    'Telegram': '#0088cc',
    'Signal': '#3A76F0',
    'LinkedIn': '#0077B5',
    'Application inconnue': '#95a5a6'
  };
  
  // Retourner la couleur de l'application si elle existe dans le dictionnaire
  if (colorMap[appName]) {
    return colorMap[appName];
  }
  
  // Sinon, générer une couleur aléatoire
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
};

// Calculer le temps écoulé depuis une date (par exemple "il y a 2 heures")
export const timeAgo = (timestamp) => {
  if (!timestamp) return 'Date inconnue';
  
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) {
    return 'Il y a quelques secondes';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `Il y a ${months} mois`;
  }
  
  const years = Math.floor(months / 12);
  return `Il y a ${years} an${years > 1 ? 's' : ''}`;
};

// Générer des données de test pour le développement
export const generateTestData = () => {
  const apps = ['WhatsApp', 'SMS', 'Appel', 'Email', 'Facebook', 'Instagram', 'Twitter/X'];
  const now = Date.now();
  
  const testData = [];
  
  for (let i = 0; i < 15; i++) {
    const appIndex = Math.floor(Math.random() * apps.length);
    const appName = apps[appIndex];
    const timestamp = now - (Math.random() * 86400000 * 7); // 7 jours en arrière maximum
    
    let title, message;
    
    switch (appName) {
      case 'WhatsApp':
        title = ['Jean Dupont', 'Groupe Famille', 'Marie', 'Bureau'][Math.floor(Math.random() * 4)];
        message = ['Salut, comment vas-tu ?', 'On se retrouve à 19h ?', 'N\'oublie pas de ramener le dossier.', 'Photo reçue'][Math.floor(Math.random() * 4)];
        break;
      case 'SMS':
        title = 'Message';
        message = ['Votre code de vérification est 1234', 'RDV confirmé pour demain', 'Votre colis est en route !'][Math.floor(Math.random() * 3)];
        break;
      case 'Appel':
        title = 'Appel manqué';
        message = ['Jean Dupont', 'Numéro inconnu', '+33612345678'][Math.floor(Math.random() * 3)];
        break;
      case 'Email':
        title = ['Newsletter', 'Confirmation de commande', 'Rappel de rendez-vous'][Math.floor(Math.random() * 3)];
        message = 'Vous avez reçu un nouvel email.';
        break;
      default:
        title = 'Notification';
        message = 'Vous avez une nouvelle notification.';
    }
    
    testData.push({
      id: i,
      app_name: appName,
      title,
      message,
      received_at: timestamp,
      is_sent: Math.random() > 0.3 // 70% de chance d'être déjà envoyé
    });
  }
  
  return testData;
};
