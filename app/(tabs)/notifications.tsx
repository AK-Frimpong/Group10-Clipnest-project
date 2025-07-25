import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

export default function NotificationsScreen() {
  const { isDarkMode, backgroundColor, textColor } = useThemeContext();
  const router = useRouter();
  const [notifications, setNotifications] = useState<(
    string | { msg: string; timestamp: number; type?: string; targetId?: string }
  )[]>([]);

  // Load notifications from AsyncStorage
  const loadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // If old format (array of strings), convert to objects with timestamp
        if (parsed.length && typeof parsed[0] === 'string') {
          setNotifications(parsed.map((msg: string) => ({ msg, timestamp: Date.now() })));
        } else {
          setNotifications(parsed);
        }
      } else setNotifications([]);
    } catch {
      setNotifications([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  // Listen for custom event to reload notifications (for push notification updates)
  useEffect(() => {
    const handler = () => loadNotifications();
    // @ts-ignore
    window.addEventListener && window.addEventListener('notification-received', handler);
    return () => {
      // @ts-ignore
      window.removeEventListener && window.removeEventListener('notification-received', handler);
    };
  }, [loadNotifications]);

  // Clear all notifications
  const clearAllNotifications = async () => {
    await AsyncStorage.removeItem('notifications');
    setNotifications([]);
  };

  // Delete a single notification by index
  const deleteNotification = async (idx: number) => {
    const updated = notifications.filter((_, i) => i !== idx);
    setNotifications(updated);
    await AsyncStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Handle notification press for navigation
  const handleNotificationPress = (notif: any) => {
    if (!notif.type || !notif.targetId) return;
    if (notif.type === 'follow') {
      router.push({ pathname: '/UserProfileScreen', params: { username: notif.targetId } });
    } else if (['like', 'comment', 'save'].includes(notif.type)) {
      router.push({ pathname: '/ImageDetailsScreen', params: { id: notif.targetId } });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: textColor }]}>Notifications</Text>
      </View>
      {/* Inbox Bar */}
      <Pressable style={[styles.inboxBar, { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }]} onPress={() => router.push('/messages')}>
        <Text style={[styles.inboxText, { color: isDarkMode ? '#7BD4C8' : '#181D1C' }]}>Inbox</Text>
      </Pressable>
      {/* Clear All Button */}
      {notifications.length > 0 && (
        <Pressable
          style={{ marginBottom: 8, alignSelf: 'flex-end', marginRight: 24, padding: 0 }}
          onPress={() => {
            Alert.alert('Clear All Notifications', 'Are you sure you want to delete all notifications?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear All', style: 'destructive', onPress: clearAllNotifications },
            ]);
          }}
        >
          <Text style={{ color: textColor, fontSize: 16 }}>Clear All</Text>
        </Pressable>
      )}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={72} color={isDarkMode ? '#4EE0C1' : '#181D1C'} style={{ marginBottom: 24 }} />
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#181D1C' }]}>No notifications yet</Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#aaa' : '#555' }]}>You’ll see notifications about your activity here.</Text>
        </View>
      ) : (
        <ScrollView style={styles.notificationsList} contentContainerStyle={{ paddingBottom: 32, alignItems: 'center' }}>
          {notifications.map((notif, idx) => {
            if (typeof notif === 'string') {
              // Old format: just a string
              return (
                <Pressable
                  key={idx}
                  onLongPress={() => {
                    Alert.alert('Delete Notification', 'Do you want to delete this notification?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(idx) },
                    ]);
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    backgroundColor: isDarkMode ? '#232B2B' : '#F3FAF8',
                    borderRadius: 14,
                    paddingVertical: 7,
                    paddingHorizontal: 10,
                    marginBottom: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                    width: '98%',
                  }}
                >
                  <Text
                    style={[
                      styles.notificationText,
                      {
                        color: textColor,
                        fontSize: 16,
                        flex: 1,
                        textAlign: 'left',
                      },
                    ]}
                  >
                    {notif}
                  </Text>
                </Pressable>
              );
            }
            // New format: object with msg, timestamp, etc.
            return (
              <Pressable
                key={idx}
                onPress={() => handleNotificationPress(notif)}
                onLongPress={() => {
                  Alert.alert('Delete Notification', 'Do you want to delete this notification?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(idx) },
                  ]);
                }}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  backgroundColor: isDarkMode ? '#232B2B' : '#F3FAF8',
                  borderRadius: 14,
                  paddingVertical: 7,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                  width: '98%',
                }}
              >
                <Text
                  style={[
                    styles.notificationText,
                    {
                      color: textColor,
                      fontSize: 16,
                      flex: 1,
                      textAlign: 'left',
                    },
                  ]}
                >
                  {notif.msg}
                </Text>
                <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 13, marginLeft: 10, alignSelf: 'flex-end' }}>
                  {notif.timestamp ? formatTimestamp(notif.timestamp) : ''}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    alignItems: 'center',
    backgroundColor: '#181D1C',
  },
  headerRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  inboxBar: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
  },
  inboxText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 0,
    width: '100%',
  },
  notificationsList: {
    width: '100%',
    paddingHorizontal: 32,
    marginTop: 24,
  },
  notificationText: {
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 12,
  },
});

// Helper to format timestamp like in messages
function formatTimestamp(ts: number) {
  const date = new Date(ts);
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    // Today: show time only
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // Not today: show date
    return date.toLocaleDateString();
  }
}
