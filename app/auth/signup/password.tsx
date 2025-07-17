import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function PasswordScreen() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasInvalidChars, setHasInvalidChars] = useState(false);
  const router = useRouter();

  const isValidPassword = (password: string) => {
    const minLength = password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*_\-+=?]/.test(password);
    const noInvalidChars = !/[^a-zA-Z0-9!@#$%^&*_\-+=?]/.test(password);
    
    return minLength && hasLetter && hasNumber && hasSpecial && noInvalidChars;
  };

  const handleNext = () => {
    router.push('/auth/signup/birthdate');
  };

  const handleBack = () => {
    router.back();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setHasInvalidChars(/[^a-zA-Z0-9!@#$%^&*_\-+=?]/.test(text));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Top nav: Back icon + Dots */}
        <View style={styles.topNav}>
          <Pressable onPress={handleBack} style={styles.backWrapper}>
            <Image
              source={require('../../../assets/images/backIcon.png')}
              style={styles.backIcon}
            />
          </Pressable>

          <View style={styles.dots}>
            {[...Array(6)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === 1 && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Create a password</Text>

          <View style={[styles.inputContainer, hasInvalidChars && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#AAAAAA"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={handlePasswordChange}
            />
            <Pressable 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={24} 
                color="#AAAAAA" 
              />
            </Pressable>
          </View>

          {hasInvalidChars && (
            <Text style={styles.errorText}>
              Password contains invalid characters. Only letters, numbers, and (!@#$%^&*_-+=?) are allowed.
            </Text>
          )}

          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Password must:</Text>
            <View style={styles.ruleItem}>
              <MaterialIcons 
                name={password.length >= 6 ? "check-circle" : "cancel"} 
                size={16} 
                color={password.length >= 6 ? "#7BD4C8" : "#AAAAAA"} 
              />
              <Text style={[styles.ruleText, password.length >= 6 && styles.ruleValid]}>
                Be at least 6 characters
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <MaterialIcons 
                name={/[a-zA-Z]/.test(password) ? "check-circle" : "cancel"} 
                size={16} 
                color={/[a-zA-Z]/.test(password) ? "#7BD4C8" : "#AAAAAA"} 
              />
              <Text style={[styles.ruleText, /[a-zA-Z]/.test(password) && styles.ruleValid]}>
                Include at least one letter
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <MaterialIcons 
                name={/[0-9]/.test(password) ? "check-circle" : "cancel"} 
                size={16} 
                color={/[0-9]/.test(password) ? "#7BD4C8" : "#AAAAAA"} 
              />
              <Text style={[styles.ruleText, /[0-9]/.test(password) && styles.ruleValid]}>
                Include at least one number
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <MaterialIcons 
                name={/[!@#$%^&*_\-+=?]/.test(password) ? "check-circle" : "cancel"} 
                size={16} 
                color={/[!@#$%^&*_\-+=?]/.test(password) ? "#7BD4C8" : "#AAAAAA"} 
              />
              <Text style={[styles.ruleText, /[!@#$%^&*_\-+=?]/.test(password) && styles.ruleValid]}>
                Include at least one special character (!@#$%^&*_-+=?)
              </Text>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <Pressable 
          style={[
            styles.nextButton, 
            { backgroundColor: isValidPassword(password) ? '#7BD4C8' : '#7BD4C880' }
          ]} 
          onPress={handleNext}
          disabled={!isValidPassword(password)}
        >
          <Text style={[
            styles.nextButtonText,
            { color: isValidPassword(password) ? '#000000' : '#00000080' }
          ]}>Next</Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181D1C',
    paddingTop: 60,
    alignItems: 'center',
  },
  topNav: {
    position: 'absolute',
    top: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backWrapper: {
    position: 'absolute',
    left: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AAAAAA',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#F3FAF8',
    backgroundColor: '#AAAAAA',
    marginTop: -1,
  },
  title: {
    color: '#F3FAF8',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  inputContainer: {
    width: 344,
    height: 50,
    borderColor: '#F3FAF8',
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 12,
    width: 344,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    color: '#F3FAF8',
  },
  eyeIcon: {
    padding: 10,
    height: '100%',
    justifyContent: 'center',
  },
  rulesContainer: {
    width: 344,
    paddingHorizontal: 15,
    marginBottom: 233,
  },
  rulesTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginLeft: 8,
  },
  ruleValid: {
    color: '#7BD4C8',
  },
  nextButton: {
    width: 334,
    height: 43,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '30%',
    alignSelf: 'center',
  },
  nextButtonText: {
    color: '#181D1C',
    fontSize: 18,
  },
  form: {
    position: 'absolute',
    top: 120,
    width: '100%',
    alignItems: 'center',
  },
});

