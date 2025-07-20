import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQScreen() {
  const { isDarkMode } = useThemeContext();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: 'I forgot my password. What should I do?',
      answer: 'On the login screen, tap "Forgot Password?" enter your email We\'ll send a password reset link to your email.',
    },
    {
      id: 2,
      question: 'How can I change my profile information?',
      answer: 'Tap the "Edit Profile" button under you profile.',
    },
    {
      id: 3,
      question: 'The app is not working properly. What should I do?',
      answer: 'Try restarting the app or checking your internet connection. If the issue continues, use "Report a Problem" in the Help & Support section.',
    },
    {
      id: 4,
      question: 'Is my personal data secure?',
      answer: 'Yes. We don\'t share your data with anyone, and everything is stored securely. You can read more in our Privacy Policy.',
    },
    {
      id: 5,
      question: 'How do I delete my account?',
      answer: 'Go to Settings > Account Settings > Delete Account. Please note that this action is permanent and cannot be undone.',
    },
  ];

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
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
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>FAQ</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* FAQ Items */}
        <View style={styles.content}>
          {faqData.map((item) => (
            <View
              key={item.id}
              style={[
                styles.faqItem,
                {
                  borderColor: isDarkMode ? '#2C2F2E' : '#DDEAE7',
                },
              ]}
            >
              <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => toggleExpanded(item.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.question,
                    { color: isDarkMode ? '#fff' : '#000' },
                  ]}
                >
                  {item.question}
                </Text>
                <Ionicons
                  name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isDarkMode ? '#fff' : '#000'}
                />
              </TouchableOpacity>
              
              {expandedId === item.id && (
                <View style={styles.answerContainer}>
                  <Text
                    style={[
                      styles.answer,
                      { color: isDarkMode ? '#ccc' : '#666' },
                    ]}
                  >
                    {item.answer}
                  </Text>
                </View>
              )}
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
  faqItem: {
    marginBottom: 15,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  answerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
});