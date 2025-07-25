import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';
import { logout } from './api/auth';

export default function SettingsScreen() {
  const { isDarkMode } = useThemeContext();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.replace('/auth/login' as any);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
      setShowLogoutModal(false);
    }
  };

  const options = [
    { title: 'Account Settings', onPress: () => router.push('/(settings)/account' as any) },
    { title: 'Notifications', onPress: () => router.push('/(settings)/notifications' as any) },
    { title: 'Privacy', onPress: () => router.push('/(settings)/privacy' as any) },
    { title: 'Display', onPress: () => router.push('/(settings)/display' as any) },
    { title: 'Help & Support', onPress: () => router.push('/(settings)/help' as any) },
    { title: 'Logout', onPress: () => setShowLogoutModal(true), textColor: '#FF6B6B' },
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
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Settings options */}
        <View style={styles.content}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.onPress}
              style={styles.optionContainer}
            >
              <Text
                style={[
                  styles.option,
                  { color: option.textColor || (isDarkMode ? '#F3FAF8' : '#181D1C') }
                ]}
              >
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

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
            <Text style={[styles.modalText, { color: isDarkMode ? '#F3FAF8': '#181D1C' }]}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '##181D1C' : '#F3FAF8' }]}
                onPress={handleLogout}
                disabled={loading}
              >
                <Text style={{ color: isDarkMode ? '#F3FAF8' : '#181D1C', fontWeight: 'bold' }}>
                  {loading ? 'Logging out...' : 'Yes'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#181D1C': '#F3FAF8' }]}
                onPress={() => setShowLogoutModal(false)}
                disabled={loading}
              >
                <Text style={{ color: isDarkMode ? '#F3FAF8' : '#181D1C', fontWeight: 'bold' }}>
                  Cancel
                </Text>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    paddingHorizontal: 16,
    paddingTop: 8,
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
});
