import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountSettingsScreen() {
  const { isDarkMode } = useThemeContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = () => {
    // Here you would typically make an API call to delete the account
    setShowDeleteModal(false);
    router.replace('/auth');
  };

  const options = [
    { title: 'Blocked Users', onPress: () => router.push('/(settings)/blocked-users') },
    { title: 'Delete Account', onPress: () => setShowDeleteModal(true), textColor: '#FF6B6B' },
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
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Account Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Options */}
        <View style={styles.content}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionContainer}
              onPress={option.onPress}
            >
              <Text style={[
                styles.option,
                { color: option.textColor || (isDarkMode ? '#F3FAF8' : '#181D1C') }
              ]}>
                {option.title}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={option.textColor || (isDarkMode ? '#F3FAF8' : '#181D1C')}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
            <Text style={[styles.modalText, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              Are you sure you want to delete your account?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}
                onPress={handleDeleteAccount}
              >
                <Text style={[styles.modalButtonText, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  option: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 