import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from '../hooks/UserContext';
import { ThemeProvider } from '../theme/themecontext';

export default function RootLayout() {
  const [isAuthenticated] = useState(false);

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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <UserProvider>
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
        </UserProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
