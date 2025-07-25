import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type SettingsType = {
  privateAccount: boolean;
  showActivity: boolean;
  allowMessages: boolean;
};

export default function PrivacyScreen() {
  const { isDarkMode } = useThemeContext();

  const [settings, setSettings] = useState<SettingsType>({
    privateAccount: false,
    allowMessages: true,
  });

  // Load settings from AsyncStorage on mount
  React.useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('privacySettings');
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch {}
    })();
  }, []);

  const toggleSwitch = (key: keyof SettingsType) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem('privacySettings', JSON.stringify(updated));
      return updated;
    });
  };

  const options = [
    { title: 'Private Account', key: 'privateAccount' as keyof SettingsType, description: 'Only approved followers can see your posts' },
    { title: 'Direct Messages', key: 'allowMessages' as keyof SettingsType, description: 'Allow others to send you messages' },
  ];

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
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Privacy</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Options */}
        <View style={styles.content}>
          {options.map((option) => (
            <View key={option.key} style={styles.optionContainer}>
              <View style={styles.optionTextContainer}>
                <Text style={[styles.option, { color: isDarkMode ? '#fff' : '#000' }]}>
                  {option.title}
                </Text>
                <Text style={[styles.description, { color: isDarkMode ? '#aaa' : '#666' }]}>
                  {option.description}
                </Text>
              </View>
              <Switch
                trackColor={{ false: '#767577', true: '#7BDAC8' }}
                thumbColor={settings[option.key] ? '#F3FAF8' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(option.key)}
                value={settings[option.key]}
              />
            </View>
          ))}
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
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(238, 238, 238, 0.2)',
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  option: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
  },
}); 