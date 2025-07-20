import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const isValidEmail = (email: string) => {
    if (!email || email.length > 254) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSendEmail = () => {
    if (isValidEmail(email)) {
      router.push({
        pathname: '/auth/reset_confirmation',
        params: { email: email }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Image
                source={require('../../assets/images/backIcon.png')}
                style={styles.backIcon}
              />
            </Pressable>
            <Text style={styles.title}>Reset your password</Text>
          </View>

          <TextInput
            style={[
              styles.input,
              !isValidEmail(email) && email.length > 0 && styles.inputError
            ]}
            placeholder="Email"
            placeholderTextColor="#AAAAAA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!isValidEmail(email) && email.length > 0 && (
            <Text style={styles.errorText}>Please enter a valid email address</Text>
          )}

          <Pressable
            style={[
              styles.sendButton,
              !isValidEmail(email) && { opacity: 0.5 }
            ]}
            onPress={handleSendEmail}
            disabled={!isValidEmail(email)}
          >
            <Text style={styles.sendButtonText}>Send password reset email</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181D1C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    color: '#F3FAF8',
    flex: 1,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#F3FAF8',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#F3FAF8',
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 15,
    paddingLeft: 5,
  },
  sendButton: {
    backgroundColor: '#7BDAC8',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  sendButtonText: {
    color: '#181D1C',
    fontSize: 16,
    fontWeight: '600',
  },
});
