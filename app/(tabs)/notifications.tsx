import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

export default function NotificationsScreen() {
  const { isDarkMode, backgroundColor, textColor } = useThemeContext();
  const router = useRouter();
  // No notifications for now
  const notifications: string[] = [];

  return (
    <View style={[styles.container, { backgroundColor }]}> 
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: textColor }]}>Notifications</Text>
      </View>
      {/* Inbox Bar */}
      <Pressable style={[styles.inboxBar, { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }]} onPress={() => router.push('/messages')}>
        <Text style={[styles.inboxText, { color: isDarkMode ? '#7BD4C8' : '#181D1C' }]}>Inbox</Text>
      </Pressable>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={72} color={isDarkMode ? '#4EE0C1' : '#181D1C'} style={{ marginBottom: 24 }} />
          <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#181D1C' }]}>No notifications yet</Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#aaa' : '#555' }]}>You’ll see notifications about your activity here.</Text>
        </View>
      ) : (
        <View style={styles.notificationsList}>
          {notifications.map((msg, idx) => (
            <Text key={idx} style={[styles.notificationText, { color: textColor }]}>{msg}</Text>
          ))}
        </View>
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
    width: '80%',
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
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    marginTop: 24,
  },
  notificationText: {
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 12,
  },
});
