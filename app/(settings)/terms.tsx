import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeContext();

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
          <Text style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Terms of Service</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.intro, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
            By using this app, you agree to the following terms. If you do not agree, please do not use the app.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              1. Use of the App
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              You may use this app for personal, non-commercial purposes only. You agree not to misuse, hack, or interfere with the app in any way.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              2. User Accounts
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              If the app requires an account:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • You are responsible for keeping your login details safe.
              </Text>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • You agree not to share your account or impersonate others.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              3. Content
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              If users can upload or post content:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • You are responsible for anything you upload.
              </Text>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • Do not post harmful, illegal, or offensive content.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              4. Changes and Updates
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              We may update the app or these terms at any time. Continued use of the app means you accept any changes.
            </Text>
          </View>
        </ScrollView>
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
    flex: 1,
    padding: 20,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  bulletPoints: {
    marginLeft: 10,
    marginBottom: 10,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
  },
});