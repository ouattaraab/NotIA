import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { getAllNotifications } from '../database/database';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'sent', 'unsent'

  // Charger les notifications au démarrage
  useEffect(() => {
    loadNotifications();
  }, []);

  // Fonction pour charger les notifications depuis la base de données
  const loadNotifications = async () => {
    try {
      const allNotifications = await getAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      Alert.alert('Erreur', 'Impossible de charger les notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour actualiser la liste des notifications
  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  // Fonction pour filtrer les notifications
  const getFilteredNotifications = () => {
    switch (filter) {
      case 'sent':
        return notifications.filter(notification => notification.is_sent);
      case 'unsent':
        return notifications.filter(notification => !notification.is_sent);
      default:
        return notifications;
    }
  };

  // Rendu d'un élément de notification
  const renderNotificationItem = ({ item }) => {
    const date = new Date(item.received_at);
    const formattedDate = date.toLocaleString();
    
    return (
      <View style={styles.notificationItem}>
        <View style={styles.notificationHeader}>
          <Text style={styles.appName}>{item.app_name || 'Application inconnue'}</Text>
          <View style={[
            styles.statusBadge,
            item.is_sent ? styles.sentBadge : styles.unsentBadge
          ]}>
            <Text style={styles.statusText}>
              {item.is_sent ? 'Envoyé' : 'En attente'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.title}>{item.title || 'Sans titre'}</Text>
        <Text style={styles.message} numberOfLines={3}>
          {item.message || 'Aucun contenu'}
        </Text>
        
        <Text style={styles.timestamp}>{formattedDate}</Text>
      </View>
    );
  };

  // Rendu de l'en-tête de la liste
  const renderListHeader = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
          Toutes
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'sent' && styles.activeFilter]}
        onPress={() => setFilter('sent')}
      >
        <Text style={[styles.filterText, filter === 'sent' && styles.activeFilterText]}>
          Envoyées
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'unsent' && styles.activeFilter]}
        onPress={() => setFilter('unsent')}
      >
        <Text style={[styles.filterText, filter === 'unsent' && styles.activeFilterText]}>
          En attente
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Rendu si aucune notification n'est trouvée
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading
          ? 'Chargement des notifications...'
          : 'Aucune notification trouvée'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4285f4" style={styles.loader} />
      ) : (
        <FlatList
          data={getFilteredNotifications()}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4285f4']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#4285f4',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sentBadge: {
    backgroundColor: 'rgba(52, 168, 83, 0.15)',
  },
  unsentBadge: {
    backgroundColor: 'rgba(251, 188, 5, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
