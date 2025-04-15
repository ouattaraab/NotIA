import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { getAllNotifications } from '../database/database';
import { sendNotificationsViaEmail } from '../services/email';

export default function HomeScreen({ navigation }) {
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [stats, setStats] = useState({
    lastSync: 'Jamais',
    unsentCount: 0,
    appBreakdown: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  // Charger les statistiques des notifications au démarrage et à la mise au point
  useEffect(() => {
    loadStats();
    
    // Configurer un listener pour recharger les statistiques quand l'écran est focalisé
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    
    return unsubscribe;
  }, [navigation]);

  // Charger les statistiques des notifications depuis la base de données
  const loadStats = async () => {
    try {
      const notifications = await getAllNotifications();
      setNotificationsCount(notifications.length);
      
      // Calculer les statistiques
      const appBreakdown = {};
      let unsentCount = 0;
      
      notifications.forEach(notification => {
        // Compter par application
        const appName = notification.app_name || 'Inconnu';
        if (!appBreakdown[appName]) {
          appBreakdown[appName] = 0;
        }
        appBreakdown[appName]++;
        
        // Compter les non envoyées
        if (!notification.is_sent) {
          unsentCount++;
        }
      });
      
      // Trouver la dernière synchronisation (notification la plus récente)
      let lastSync = 'Jamais';
      if (notifications.length > 0) {
        const mostRecentNotif = notifications.reduce((prev, current) => 
          (prev.received_at > current.received_at) ? prev : current
        );
        
        const date = new Date(mostRecentNotif.received_at);
        lastSync = date.toLocaleString();
      }
      
      setStats({
        lastSync,
        unsentCount,
        appBreakdown
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques des notifications');
    }
  };

  // Fonction pour envoyer manuellement les notifications
  const handleSendNotifications = async () => {
    if (stats.unsentCount === 0) {
      Alert.alert('Information', 'Aucune nouvelle notification à envoyer');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await sendNotificationsViaEmail();
      
      if (result) {
        Alert.alert('Succès', 'Les notifications ont été envoyées avec succès');
        // Actualiser les statistiques
        await loadStats();
      } else {
        Alert.alert('Erreur', 'Impossible d\'envoyer les notifications');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>NotIA</Text>
          <Text style={styles.subtitle}>Notification Intelligence Assistant</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{notificationsCount}</Text>
            <Text style={styles.statLabel}>Notifications totales</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.unsentCount}</Text>
            <Text style={styles.statLabel}>En attente d'envoi</Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Dernière notification</Text>
          <Text style={styles.infoValue}>{stats.lastSync}</Text>
        </View>
        
        <View style={styles.appBreakdownContainer}>
          <Text style={styles.sectionTitle}>Répartition par application</Text>
          {Object.keys(stats.appBreakdown).length > 0 ? (
            Object.entries(stats.appBreakdown).map(([app, count]) => (
              <View key={app} style={styles.appBreakdownItem}>
                <Text style={styles.appName}>{app}</Text>
                <Text style={styles.appCount}>{count}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Aucune notification enregistrée</Text>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.buttonText}>Voir les notifications</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, isLoading && styles.disabledButton]}
          onPress={handleSendNotifications}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Envoi en cours...' : 'Envoyer maintenant'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.buttonText}>Paramètres</Text>
        </TouchableOpacity>
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    backgroundColor: '#4285f4',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -30,
    marginHorizontal: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 25,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  appBreakdownContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 5,
    borderRadius: 10,
    padding: 15,
    paddingBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  appBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appName: {
    fontSize: 16,
    color: '#444',
  },
  appCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285f4',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4285f4',
  },
  secondaryButton: {
    backgroundColor: '#34a853',
  },
  tertiaryButton: {
    backgroundColor: '#fbbc05',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
