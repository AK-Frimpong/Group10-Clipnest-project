import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const slideAnimation = new Animated.Value(0);

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.timing(slideAnimation, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(slideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleLogin = () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      router.replace('/(tabs)');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.content,
            { transform: [{ translateY: slideAnimation }] }
          ]}
        >
          <Text style={styles.title}>Log in</Text>

          <Pressable style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </Pressable>

          <Pressable style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </Pressable>

          <Pressable style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </Pressable>

          <Text style={styles.or}>OR</Text>

          <TextInput
            style={[
              styles.input,
              emailError ? styles.inputError : {}
            ]}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              validateEmail(text);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <View style={[
            styles.passwordContainer,
            passwordError ? styles.inputError : {}
          ]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
              autoCapitalize="none"
            />
            <Pressable 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={24} 
                color="#aaa" 
              />
            </Pressable>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <Pressable
            style={[
              styles.loginButton,
              {
                backgroundColor: (email && password) ? '#27403B' : '#1A2826'
              }
            ]}
            onPress={handleLogin}
            disabled={!email || !password}
          >
            <Text style={[
              styles.loginButtonText,
              { color: (email && password) ? '#FFFFFF' : '#FFFFFF80' }
            ]}>Log In</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/auth/forgot_pswd')}>
            <Text style={styles.forgotPassword}>Forgot your password?</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    justifyContent: 'center',
  },
  title: {
    color: '#F3FAF8',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 30,
    alignSelf: 'center',
  },
  socialButton: {
    backgroundColor: '#7BD4C8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#181D1C',
    fontSize: 16,
    fontWeight: '500',
  },
  or: {
    color: '#F3FAF8',
    marginVertical: 15,
    fontSize: 14,
    alignSelf: 'center',
  },
  input: {
    width: 344,
    height: 50,
    borderColor: '#F3FAF8',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#F3FAF8',
    backgroundColor: 'transparent',
    marginBottom: 8,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'left',
    alignSelf: 'flex-start',
    paddingLeft: 25,
  },
  passwordContainer: {
    width: 344,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
    paddingRight: 15,
  },
  loginButton: {
    backgroundColor: '#27403B',
    paddingVertical: 15,
    borderRadius:30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: '#F3FAF8',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#7BD4C8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
});
