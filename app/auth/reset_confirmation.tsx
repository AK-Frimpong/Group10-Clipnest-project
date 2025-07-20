import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function ResetConfirmationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Email Sent!</Text>
        <Text style={styles.message}>
          Password reset instructions have been sent to:
        </Text>
        <Text style={styles.email}>{email}</Text>

        <Pressable
          style={styles.backButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181D1C',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#F3FAF8',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#7BDAC8',
    textAlign: 'center',
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#7BDAC8',
    width: 200,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#181D1C',
    fontSize: 16,
    fontWeight: '600',
  },
}); 