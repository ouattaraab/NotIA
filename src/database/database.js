import * as SQLite from 'expo-sqlite';

// Ouverture ou création de la base de données
const db = SQLite.openDatabase('notia.db');

// Fonction pour initialiser la base de données
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Table pour stocker les notifications
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          app_name TEXT,
          title TEXT,
          message TEXT,
          received_at INTEGER,
          is_sent BOOLEAN DEFAULT 0
        )`,
        [],
        () => {
          console.log('Base de données initialisée avec succès');
          resolve();
        },
        (_, error) => {
          console.error('Erreur lors de la création de la table:', error);
          reject(error);
        }
      );
      
      // Table pour stocker les paramètres de l'application
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE,
          value TEXT
        )`,
        [],
        () => {
          console.log('Table des paramètres créée avec succès');
          
          // Insertion des paramètres par défaut si nécessaire
          tx.executeSql(
            'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
            ['email_destination', 'example@gmail.com'],
            null,
            (_, error) => {
              console.error('Erreur lors de l\'insertion des paramètres par défaut:', error);
            }
          );
        },
        (_, error) => {
          console.error('Erreur lors de la création de la table des paramètres:', error);
        }
      );
    });
  });
};

// Fonction pour sauvegarder une notification
export const saveNotification = (appName, title, message) => {
  return new Promise((resolve, reject) => {
    const receivedAt = Date.now();
    
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO notifications (app_name, title, message, received_at, is_sent) VALUES (?, ?, ?, ?, ?)',
        [appName, title, message, receivedAt, 0],
        (_, result) => {
          console.log('Notification sauvegardée avec l\'ID:', result.insertId);
          resolve(result.insertId);
        },
        (_, error) => {
          console.error('Erreur lors de la sauvegarde de la notification:', error);
          reject(error);
        }
      );
    });
  });
};

// Fonction pour récupérer toutes les notifications
export const getAllNotifications = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notifications ORDER BY received_at DESC',
        [],
        (_, result) => {
          resolve(result.rows._array);
        },
        (_, error) => {
          console.error('Erreur lors de la récupération des notifications:', error);
          reject(error);
        }
      );
    });
  });
};

// Fonction pour récupérer les notifications non envoyées
export const getUnsendNotifications = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM notifications WHERE is_sent = 0 ORDER BY received_at ASC',
        [],
        (_, result) => {
          resolve(result.rows._array);
        },
        (_, error) => {
          console.error('Erreur lors de la récupération des notifications non envoyées:', error);
          reject(error);
        }
      );
    });
  });
};

// Fonction pour marquer les notifications comme envoyées
export const markNotificationsAsSent = (notificationIds) => {
  if (!notificationIds || notificationIds.length === 0) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const placeholders = notificationIds.map(() => '?').join(',');
    
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE notifications SET is_sent = 1 WHERE id IN (${placeholders})`,
        notificationIds,
        (_, result) => {
          console.log(`${result.rowsAffected} notifications marquées comme envoyées`);
          resolve(result.rowsAffected);
        },
        (_, error) => {
          console.error('Erreur lors de la mise à jour des notifications:', error);
          reject(error);
        }
      );
    });
  });
};

// Fonction pour récupérer un paramètre
export const getSetting = (key) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT value FROM settings WHERE key = ?',
        [key],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0).value);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Erreur lors de la récupération du paramètre:', error);
          reject(error);
        }
      );
    });
  });
};

// Fonction pour mettre à jour un paramètre
export const updateSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value],
        (_, result) => {
          console.log(`Paramètre ${key} mis à jour avec succès`);
          resolve(result.rowsAffected);
        },
        (_, error) => {
          console.error('Erreur lors de la mise à jour du paramètre:', error);
          reject(error);
        }
      );
    });
  });
};

export default db;
