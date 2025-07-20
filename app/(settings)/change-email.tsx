import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChangeEmailScreen() {
  const { isDarkMode } = useThemeContext();
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Basic validation
    if (!currentEmail || !newEmail || !password) {
      setError('All fields are required');
      return;
    }

    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (currentEmail === newEmail) {
      setError('New email must be different from current email');
      return;
    }

    // Here you would typically make an API call to change the email
    // For now, we'll just go back
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Change Email</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Form */}
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Current Email</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDarkMode ? '#232B2B' : '#FFFFFF',
                  color: isDarkMode ? '#F3FAF8' : '#181D1C',
                  borderColor: isDarkMode ? '#2E3837' : '#DDD'
                }
              ]}
              value={currentEmail}
              onChangeText={setCurrentEmail}
              placeholder="Enter your current email"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>New Email</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDarkMode ? '#232B2B' : '#FFFFFF',
                  color: isDarkMode ? '#F3FAF8' : '#181D1C',
                  borderColor: isDarkMode ? '#2E3837' : '#DDD'
                }
              ]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="Enter your new email"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: isDarkMode ? '#232B2B' : '#FFFFFF',
                  color: isDarkMode ? '#F3FAF8' : '#181D1C',
                  borderColor: isDarkMode ? '#2E3837' : '#DDD'
                }
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={isDarkMode ? '#999' : '#666'}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, { opacity: (!currentEmail || !newEmail || !password) ? 0.5 : 1 }]}
            onPress={handleSubmit}
            disabled={!currentEmail || !newEmail || !password}
          >
            <Text style={styles.submitButtonText}>Change Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 20,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#27403B',
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 