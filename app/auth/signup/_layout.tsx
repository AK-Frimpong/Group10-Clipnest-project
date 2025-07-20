import { Stack } from 'expo-router';

export default function SignupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="email" />
      <Stack.Screen name="password" />
      <Stack.Screen name="birthdate" />
      <Stack.Screen name="gender" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="username" />
    </Stack>
  );
} 