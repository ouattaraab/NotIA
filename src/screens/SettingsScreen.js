import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { getSetting, updateSetting } from '../database/database';
import { sendTestEmail } from '../services/email';

export default function SettingsScreen({ navigation }) {
  const [emailDestination, setEmailDestination] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState('15');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, []);

  // Fonction pour charger les paramètres
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'adresse email
      const email = await getSetting('email_destination');
      if (email) {
        setEmailDestination(email);
      }
      
      // Récupérer le paramètre de synchronisation automatique
      const syncEnabled = await getSetting('auto_sync');
      setAutoSync(syncEnabled === 'true');
      
      // Récupérer l'intervalle de synchronisation
      const interval = await getSetting('sync_interval');
      if (interval) {
        setSyncInterval(interval);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      Alert.alert('Erreur', 'Impossible de charger les paramètres');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder les paramètres
  const saveSettings = async () => {
    // Validation de l'adresse email
    if (!emailDestination.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email');
      return;
    }
    
    if (!validateEmail(emailDestination)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    // Validation de l'intervalle de synchronisation
    const intervalValue = parseInt(syncInterval);
    if (isNaN(intervalValue) || intervalValue < 1) {
      Alert.alert('Erreur', 'L\'intervalle de synchronisation doit être un nombre positif');
      return;
    }
    
    try {
      setSaving(true);
      
      // Sauvegarder l'adresse email
      await updateSetting('email_destination', emailDestination.trim());
      
      // Sauvegarder le paramètre de synchronisation automatique
      await updateSetting('auto_sync', autoSync.toString());
      
      // Sauvegarder l'intervalle de synchronisation
      await updateSetting('sync_interval', syncInterval);
      
      Alert.alert('Succès', 'Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les paramètres');
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour envoyer un email de test
  const sendTestEmailHandler = async () => {
    // Validation de l'adresse email
    if (!emailDestination.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email');
      return;
    }
    
    if (!validateEmail(emailDestination)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }
    
    try {
      setTestingEmail(true);
      
      const result = await sendTestEmail(emailDestination.trim());
      
      if (result.success) {
        Alert.alert('Succès', result.message);
      } else {
        Alert.alert('Erreur', result.message);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de test:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de l\'email de test');
    } finally {
      setTestingEmail(false);
    }
  };

  // Fonction pour valider le format de l'adresse email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285f4" />
        <Text style={styles.loadingText}>Chargement des paramètres...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres du destinataire</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Adresse email de destination</Text>
          <TextInput
            style={styles.input}
            value={emailDestination}
            onChangeText={setEmailDestination}
            placeholder="exemple@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, testingEmail && styles.disabledButton]}
          onPress={sendTestEmailHandler}
          disabled={testingEmail}
        >
          <Text style={styles.buttonText}>
            {testingEmail ? 'Envoi en cours...' : 'Envoyer un email de test'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres de synchronisation</Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Synchronisation automatique</Text>
          <Switch
            value={autoSync}
            onValueChange={setAutoSync}
            trackColor={{ false: '#d1d1d1', true: '#a8c7fa' }}
            thumbColor={autoSync ? '#4285f4' : '#f4f3f4'}
          />
        </View>
        
        <View style={[styles.inputContainer, !autoSync && styles.disabledInput]}>
          <Text style={styles.label}>Intervalle de synchronisation (minutes)</Text>
          <TextInput
            style={styles.input}
            value={syncInterval}
            onChangeText={setSyncInterval}
            keyboardType="numeric"
            editable={autoSync}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations sur l'application</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Développé par</Text>
          <Text style={styles.infoValue}>ouattaraab</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton, saving && styles.disabledButton]}
        onPress={saveSettings}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fc',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    margin: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledInput: {
    opacity: 0.5,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    margin: 15,
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: '#4285f4',
  },
  secondaryButton: {
    backgroundColor: '#34a853',
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
