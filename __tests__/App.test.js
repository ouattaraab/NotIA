import React from 'react';
import renderer from 'react-test-renderer';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

// Mock des dépendances externes
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    NavigationContainer: ({ children }) => <>{children}</>,
  };
});

jest.mock('@react-navigation/native-stack', () => {
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) => <>{children}</>,
      Screen: ({ children }) => <>{children}</>,
    }),
  };
});

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((callback) => {
      callback({
        executeSql: jest.fn((_, __, success) => success({ rows: { _array: [], length: 0, item: jest.fn() } })),
      });
    }),
  })),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getDevicePushTokenAsync: jest.fn(() => Promise.resolve({ type: 'expo', data: 'test-token' })),
  setNotificationChannelAsync: jest.fn(),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
}));

jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
  BackgroundFetchResult: {
    NewData: 'newData',
    NoData: 'noData',
    Failed: 'failed',
  },
}));

jest.mock('../src/screens/HomeScreen', () => 'HomeScreen');
jest.mock('../src/screens/NotificationsScreen', () => 'NotificationsScreen');
jest.mock('../src/screens/SettingsScreen', () => 'SettingsScreen');

// Mock de la base de données
jest.mock('../src/database/database', () => ({
  initDatabase: jest.fn(() => Promise.resolve()),
  getAllNotifications: jest.fn(() => Promise.resolve([])),
  getUnsendNotifications: jest.fn(() => Promise.resolve([])),
  saveNotification: jest.fn(() => Promise.resolve(1)),
  markNotificationsAsSent: jest.fn(() => Promise.resolve()),
  getSetting: jest.fn((key) => {
    if (key === 'email_destination') return Promise.resolve('example@gmail.com');
    if (key === 'auto_sync') return Promise.resolve('true');
    if (key === 'sync_interval') return Promise.resolve('15');
    return Promise.resolve(null);
  }),
  updateSetting: jest.fn(() => Promise.resolve()),
}));

// Mock des services
jest.mock('../src/services/notifications', () => ({
  registerForPushNotifications: jest.fn(() => Promise.resolve()),
  handleReceivedNotification: jest.fn(),
}));

jest.mock('../src/services/email', () => ({
  sendNotificationsViaEmail: jest.fn(() => Promise.resolve(true)),
  sendTestEmail: jest.fn(() => Promise.resolve({ success: true, message: 'Email envoyé avec succès' })),
}));

describe('App', () => {
  it('Rendu de l\'application sans plantage', () => {
    renderer.create(<App />);
  });

  it('L\'application initialise la base de données au démarrage', async () => {
    const { initDatabase } = require('../src/database/database');
    render(<App />);

    await waitFor(() => {
      expect(initDatabase).toHaveBeenCalled();
    });
  });

  it('L\'application enregistre les notifications au démarrage', async () => {
    const { registerForPushNotifications } = require('../src/services/notifications');
    render(<App />);

    await waitFor(() => {
      expect(registerForPushNotifications).toHaveBeenCalled();
    });
  });

  // Test pour vérifier l'enregistrement de la tâche en arrière-plan
  it('L\'application enregistre une tâche en arrière-plan', async () => {
    const { registerTaskAsync } = require('expo-background-fetch');
    render(<App />);

    await waitFor(() => {
      expect(registerTaskAsync).toHaveBeenCalledWith('background-fetch-task', expect.any(Object));
    });
  });
});

// Des tests supplémentaires pourraient être ajoutés pour les écrans individuels
// et les fonctionnalités plus spécifiques, mais cela nécessiterait de configurer
// davantage l'environnement de test et de créer des mocks plus détaillés.
