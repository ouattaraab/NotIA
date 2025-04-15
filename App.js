import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

import HomeScreen from './src/screens/HomeScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { initDatabase } from './src/database/database';
import { registerForPushNotifications } from './src/services/notifications';
import { sendNotificationsViaEmail } from './src/services/email';

const Stack = createNativeStackNavigator();
const BACKGROUND_FETCH_TASK = 'background-fetch-task';

// Définition de la tâche en arrière-plan
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Envoyer les notifications par email
    await sendNotificationsViaEmail();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Erreur dans la tâche en arrière-plan:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export default function App() {
  const [isDBInitialized, setIsDBInitialized] = useState(false);

  useEffect(() => {
    // Initialisation de la base de données
    const setupDB = async () => {
      try {
        await initDatabase();
        setIsDBInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
      }
    };

    // Enregistrement pour les notifications
    const setupNotifications = async () => {
      await registerForPushNotifications();
      
      // Configuration du gestionnaire de notifications
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: false,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    };

    // Configuration de la tâche en arrière-plan
    const registerBackgroundFetch = async () => {
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 15 * 60, // 15 minutes
          stopOnTerminate: false,
          startOnBoot: true,
        });
        console.log('Tâche en arrière-plan enregistrée');
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la tâche en arrière-plan:', error);
      }
    };

    setupDB();
    setupNotifications();
    registerBackgroundFetch();

    // Nettoyage lors du démontage du composant
    return () => {
      BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
        .catch(err => console.error('Erreur lors de la désinscription de la tâche en arrière-plan:', err));
    };
  }, []);

  // Attendre que la base de données soit initialisée avant de rendre l'application
  if (!isDBInitialized) {
    return null; // Ou un écran de chargement
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'NotIA - Accueil' }} 
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{ title: 'Historique des notifications' }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Paramètres' }} 
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
