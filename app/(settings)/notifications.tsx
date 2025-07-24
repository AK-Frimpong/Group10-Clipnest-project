import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const { isDarkMode } = useThemeContext();

  const [settings, setSettings] = useState({
    pushEnabled: true,
    likes: true,
    comments: true,
    followers: true,
    messages: true,
    emailNotifications: false,
  });

  const toggleSwitch = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const options = [
    { title: 'Push Notifications', key: 'pushEnabled' },
    { title: 'Likes', key: 'likes' },
    { title: 'Comments', key: 'comments' },
    { title: 'New Followers', key: 'followers' },
    { title: 'Messages', key: 'messages' },
    { title: 'Email Notifications', key: 'emailNotifications' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Notifications</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Options */}
        <View style={styles.content}>
          {options.map((option) => (
            <View key={option.key} style={styles.optionContainer}>
              <Text style={[styles.option, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
                {option.title}
              </Text>
              <Switch
                trackColor={{ false: '#767577', true: '#7BDAC8' }}
                thumbColor={settings[option.key  as keyof typeof settings] ? '#F3FAF8' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => toggleSwitch(option.key  as keyof typeof settings)}
                value={settings[option.key  as keyof typeof settings]}
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  option: {
    fontSize: 16,
  },
}); 