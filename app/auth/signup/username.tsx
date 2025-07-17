import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function UsernameScreen() {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const router = useRouter();

  // Username validation rules
  const isValidUsername = (username: string) => {
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (username.length > 30) {
      setError('Username cannot exceed 30 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers and underscores');
      return false;
    }
    if (/^_|_$/.test(username)) {
      setError('Username cannot start or end with underscores');
      return false;
    }
    return true;
  };

  // Debounced username availability check
  useEffect(() => {
    if (!username || !isValidUsername(username)) {
      setIsAvailable(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsChecking(true);
      try {
        // This would be your actual API call
        // For now, we'll simulate an API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // TODO: Replace this with actual API call
        // const response = await fetch('/api/check-username', {
        //   method: 'POST',
        //   body: JSON.stringify({ username }),
        // });
        // const data = await response.json();
        // setIsAvailable(data.isAvailable);
        
        // For demo, always show as available
        setIsAvailable(true);
        setError('');
      } catch (err) {
        setError('Error checking username availability');
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    }, 500); // 500ms delay before checking

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleNext = () => {
    if (isValidUsername(username) && isAvailable) {
      router.push('/auth/signup/interests');
    }
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
                  index === 4 && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Main content */}
        <View style={styles.form}>
          <Text style={styles.title}>Enter your username</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                error ? styles.inputError : (isAvailable && username ? styles.inputSuccess : {})
              ]}
              placeholder="Username"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={(text) => {
                setUsername(text.toLowerCase());
                setError('');
                setIsAvailable(false);
              }}
            />
            {isChecking && (
              <ActivityIndicator 
                style={styles.inputIcon} 
                color="#AAAAAA" 
                size="small" 
              />
            )}
            {isAvailable && username && !isChecking && (
              <Text style={[styles.inputIcon, styles.successText]}>✓</Text>
            )}
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.helperText}>
              You can use letters, numbers and underscores
            </Text>
          )}
        </View>

        {/* Next Button */}
        <Pressable 
          style={[
            styles.nextButton, 
            (!isAvailable || !username || isChecking) && {opacity: 0.5}
          ]} 
          onPress={handleNext}
          disabled={!isAvailable || !username || isChecking}
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
    borderRadius: 5,
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
    position: 'relative',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#F3FAF8',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingRight: 45,
    color: '#F3FAF8',
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  inputSuccess: {
    borderColor: '#7BD4C8',
  },
  inputIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  successText: {
    color: '#7BD4C8',
    fontSize: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 285,
    width: 344,
    paddingHorizontal: 15,
  },
  helperText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 285,
    width: 344,
    paddingHorizontal: 15,
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

