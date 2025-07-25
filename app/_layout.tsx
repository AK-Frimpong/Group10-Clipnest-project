import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from '../hooks/UserContext';
import { ThemeProvider } from '../theme/themecontext';
import { PinBoardProvider } from './context/PinBoardContext';

export default function RootLayout() {
  const [isAuthenticated] = useState(false);

  // Push notification setup
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<any>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          Lobster: require('../assets/fonts/Lobster-Regular.ttf'),
          Sofia: require('../assets/fonts/Sofia-Regular.ttf'),
        });
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Request permissions and get token
    async function registerForPushNotificationsAsync() {
      let token;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    }
    registerForPushNotificationsAsync();

    // Foreground notification listener
    notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
      setNotification(notification);
      // Store notification in AsyncStorage (object with msg, timestamp, type, targetId)
      try {
        const stored = await AsyncStorage.getItem('notifications');
        let notifications = stored ? JSON.parse(stored) : [];
        const content = notification.request.content;
        // Try to get type and targetId from notification data
        const notifType = content.data?.type || null;
        const notifTargetId = content.data?.targetId || null;
        const notifMsg = content.body || 'New notification';
        const notifObj = {
          msg: notifMsg,
          timestamp: Date.now(),
          type: notifType,
          targetId: notifTargetId,
        };
        notifications = [notifObj, ...notifications];
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new Event('notification-received'));
        }
      } catch (e) {
        console.warn('Failed to store notification:', e);
      }
    });
    // Response listener (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <UserProvider>
          <PinBoardProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" options={{ animation: 'none' }} />
              {isAuthenticated ? (
                <Stack.Screen name="(tabs)" />
              ) : (
                <Stack.Screen name="auth" />
              )}
              <Stack.Screen name="settings" />
              <Stack.Screen
                name="modals/PostCreationModal"
                options={{
                  presentation: 'transparentModal',
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
          </PinBoardProvider>
        </UserProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
