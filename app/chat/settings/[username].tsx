import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../../hooks/UserContext';
import { useThemeContext } from '../../../theme/themecontext';

const NOTIF_OPTIONS = [
  'On',
  'Mute for 1 hour',
  'Mute for 24 hours',
  'Mute until I turn on',
];

export default function ChatSettingsScreen() {
  const { user } = useUser();
  const { username } = useLocalSearchParams();
  const safeUsername = Array.isArray(username) ? username[0] : username;
  const { backgroundColor, textColor, isDarkMode, cardColor } = useThemeContext();
  const [blocked, setBlocked] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [notifSetting, setNotifSetting] = useState('On');
  const [hidden, setHidden] = useState(false);
  const [clearModal, setClearModal] = useState(false);

  // Load blocked users from AsyncStorage
  useEffect(() => {
    const loadBlocked = async () => {
      try {
        const stored = await AsyncStorage.getItem(`blocked_users_${user?.id || 'unknown'}`);
        if (stored) {
          const arr = JSON.parse(stored);
          setBlocked(Array.isArray(arr) && arr.includes(safeUsername));
        }
      } catch {}
    };
    loadBlocked();
  }, [safeUsername, user?.id]);

  // Block/unblock logic
  const handleBlockToggle = async () => {
    try {
      const key = `blocked_users_${user?.id || 'unknown'}`;
      const stored = await AsyncStorage.getItem(key);
      let arr = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(arr)) arr = [];
      if (blocked) {
        arr = arr.filter((u: string) => u !== safeUsername);
      } else {
        arr.push(safeUsername);
      }
      await AsyncStorage.setItem(key, JSON.stringify(arr));
      setBlocked(!blocked);
    } catch {}
  };

  // Clear conversation logic
  const handleClearConversation = async () => {
    try {
      const key = `chat_messages_${user?.id || 'unknown'}_${safeUsername}`;
      console.log('Clearing conversation with key:', key);
      await AsyncStorage.setItem(key, JSON.stringify([]));
      console.log('Conversation cleared successfully');
      setClearModal(false);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Settings</Text>
      </View>
      {/* Block/Unblock */}
      <TouchableOpacity style={styles.settingBtn} onPress={handleBlockToggle}>
        <Text style={[styles.settingText, { color: textColor }]}>{blocked ? 'Unblock' : 'Block'}</Text>
      </TouchableOpacity>
      {/* Notifications */}
      <TouchableOpacity style={styles.settingBtn} onPress={() => setNotifModal(true)}>
        <Text style={[styles.settingText, { color: textColor }]}>Notifications: {notifSetting}</Text>
      </TouchableOpacity>
      {/* Hide Conversation */}
      <TouchableOpacity style={styles.settingBtn} onPress={() => setHidden(h => !h)}>
        <Text style={[styles.settingText, { color: textColor }]}>{hidden ? 'Show conversation' : 'Hide conversation'}</Text>
      </TouchableOpacity>
      {/* Clear Conversation */}
      <TouchableOpacity style={styles.settingBtn} onPress={() => setClearModal(true)}>
        <Text style={[styles.settingText, { color: textColor }]}>Clear Conversation</Text>
      </TouchableOpacity>
      {hidden && (
        <Text style={{ color: isDarkMode ? '#aaa' : '#555', marginTop: 20, textAlign: 'center' }}>
          Conversation hidden.
        </Text>
      )}
      {/* Notification Modal */}
      <Modal
        visible={notifModal}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setNotifModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: cardColor }]}> 
            {NOTIF_OPTIONS.map(option => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setNotifSetting(option);
                  setNotifModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, { color: textColor }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
      {/* Clear Conversation Modal */}
      <Modal
        visible={clearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setClearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
            <Text style={[styles.modalText, { color: isDarkMode ? '#F3FAF8': '#181D1C' }]}>
              Are you sure you want to clear this conversation?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}
                onPress={handleClearConversation}
              >
                <Text style={{ color: isDarkMode ? '#F3FAF8' : '#181D1C', fontWeight: 'bold' }}>
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#181D1C': '#F3FAF8' }]}
                onPress={() => setClearModal(false)}
              >
                <Text style={{ color: isDarkMode ? '#F3FAF8' : '#181D1C', fontWeight: 'bold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 30 : 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingBtn: {
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingText: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 0,
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
  modalOption: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 18,
  },
}); 