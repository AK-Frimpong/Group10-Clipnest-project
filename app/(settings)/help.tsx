import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HelpScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeContext();

  const options = [
    {
      title: 'FAQ',
      icon: 'help-circle-outline',
      onPress: () => router.push('/(settings)/faq'),
    },
    {
      title: 'Contact Support',
      icon: 'mail-outline',
      onPress: () => Linking.openURL('mailto:support@clipnest.com'),
    },
    {
      title: 'Privacy Policy',
      icon: 'document-text-outline',
      onPress: () => router.push('/(settings)/privpolicy'),
    },
    {
      title: 'Terms of Service',
      icon: 'document-outline',
      onPress: () => router.push('/(settings)/terms'),
    },
    {
      title: 'App Version',
      icon: 'information-circle-outline',
      version: '1.0.0',
    },
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
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Help & Support</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Options */}
        <View style={styles.content}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionContainer}
              onPress={option.onPress}
              disabled={!option.onPress}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={isDarkMode ? '#fff' : '#000'}
                  style={styles.icon}
                />
                <Text style={[styles.option, { color: isDarkMode ? '#fff' : '#000' }]}>
                  {option.title}
                </Text>
              </View>
              {option.version ? (
                <Text style={[styles.version, { color: isDarkMode ? '#aaa' : '#666' }]}>
                  {option.version}
                </Text>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? '#fff' : '#000'}
                />
              )}
            </TouchableOpacity>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15,
  },
  option: {
    fontSize: 16,
  },
  version: {
    fontSize: 14,
  },
}); 