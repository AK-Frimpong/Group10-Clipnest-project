import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

export default function PrivacyPolicyScreen() {
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
          <Text style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Privacy Policy</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.intro, { color: isDarkMode ? '#fff' : '#181D1C' }]}>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our app.
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              1. Information We Collect
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              We may collect:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • Your name, email, and profile information (when you sign up)
              </Text>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • App usage data (like button taps or screen views)
              </Text>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • Error or crash logs to help us fix bugs
              </Text>
            </View>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              We do not collect sensitive personal data like credit card info, address, or government IDs.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              2. How We Use Your Information
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              We use your data to:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • Provide and improve app features
              </Text>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • Fix bugs and technical issues
              </Text>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • Personalize your experience
              </Text>
            </View>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              We do not sell or share your data with third parties.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              3. Data Security
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              We use basic security measures to protect your data. However, no app is 100% secure, so we recommend using a strong password and keeping your device secure.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              4. Your Control
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              You can:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • Edit or delete your profile anytime from Settings
              </Text>
              <Text style={[styles.bulletPoint, { color: isDarkMode ? '#ccc' : '#666' }]}>
                • Contact us to request data deletion
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              5. Contact Us
            </Text>
            <Text style={[styles.sectionText, { color: isDarkMode ? '#ccc' : '#666' }]}>
              If you have questions about this Privacy Policy, contact us at:
            </Text>
            <Text style={[styles.email, { color: isDarkMode ? '#7BD4C8' : '#27403B' }]}>
              support@clipnest.com
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
  email: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});