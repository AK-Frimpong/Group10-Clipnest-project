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

export default function EmailScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const isValidEmail = (email: string) => {
    if (!email || email.length > 254) return false;

    // RFC 5322 compliant regex that handles most valid email formats
    const emailRegex = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;

    // Basic checks
    if (email.includes('..')) return false;
    if (email.startsWith('.') || email.endsWith('.')) return false;

    return emailRegex.test(email);
  };

  const handleNext = () => {
    router.push('/auth/signup/password');
  };

  const handleBack = () => {
    router.back();
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
                  index === 0 && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>What's your email?</Text>

          <TextInput
            style={[styles.input, !isValidEmail(email) && email.length > 0 && styles.invalidInput]}
            placeholder="Email"
            placeholderTextColor="#AAAAAA"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          {!isValidEmail(email) && email.length > 0 && (
            <Text style={styles.errorText}>Please enter a valid email address</Text>
          )}
        </View>

        {/* Next Button */}
        <Pressable 
          style={[
            styles.nextButton, 
            !isValidEmail(email) && { opacity: 0.5 }
          ]} 
          onPress={handleNext}
          disabled={!isValidEmail(email)}
        >
          <Text style={styles.nextButtonText}>Next</Text>
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
  },
  invalidInput: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 285,
    textAlign: 'left',
    alignSelf: 'flex-start',
    paddingLeft: 25,
  },
  nextButton: {
    backgroundColor: '#7BDAC8',
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
