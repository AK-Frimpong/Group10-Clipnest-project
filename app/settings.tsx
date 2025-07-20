import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';
import { logout } from './api/auth';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeContext();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    setShowLogoutModal(false);
    router.replace('/auth/login');
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
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#000' }]}>Settings</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Settings options */}
        <View style={styles.content}>
          <Text style={[styles.option, { color: isDarkMode ? '#fff' : '#000' }]}>Account Settings</Text>
          <Text style={[styles.option, { color: isDarkMode ? '#fff' : '#000' }]}>Notifications</Text>
          <Text style={[styles.option, { color: isDarkMode ? '#fff' : '#000' }]}>Privacy</Text>

          {/* ✅ New Display option */}
          <TouchableOpacity onPress={() => router.push('/display')}>
            <Text style={[styles.option, { color: isDarkMode ? '#fff' : '#000' }]}>Display</Text>
          </TouchableOpacity>

          <Text style={[styles.option, { color: isDarkMode ? '#fff' : '#000' }]}>Help & Support</Text>
          <TouchableOpacity onPress={() => setShowLogoutModal(true)}>
            <Text style={[styles.option, { color: isDarkMode ? '#fff' : '#000' }]}>Logout</Text>
          </TouchableOpacity>
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
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#232B2B' : '#fff' }]}>
            <Text style={[styles.modalText, { color: isDarkMode ? '#fff' : '#000' }]}>Are you sure you want to logout?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#2E3837' : '#F3FAF8' }]}
                onPress={handleLogout}
                disabled={loading}
              >
                <Text style={{ color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }}>{loading ? 'Logging out...' : 'Yes'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#2E3837' : '#F3FAF8' }]}
                onPress={() => setShowLogoutModal(false)}
                disabled={loading}
              >
                <Text style={{ color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }}>Cancel</Text>
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
  option: {
    fontSize: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
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
