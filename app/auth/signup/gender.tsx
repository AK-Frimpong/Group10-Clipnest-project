import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function GenderScreen() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const handleNext = () => {
    if (selectedGender) {
      router.push('/auth/signup/username');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
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
              style={[styles.dot, index === 3 && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      {/* Main content */}
      <View style={styles.form}>
        <Text style={styles.title}>What's your gender?</Text>

        <Pressable
          style={[
            styles.genderButton,
            selectedGender === 'female' && styles.genderButtonSelected,
          ]}
          onPress={() => setSelectedGender('female')}
        >
          <Text style={styles.genderButtonText}>Female</Text>
        </Pressable>

        <Pressable
          style={[
            styles.genderButton,
            selectedGender === 'male' && styles.genderButtonSelected,
          ]}
          onPress={() => setSelectedGender('male')}
        >
          <Text style={styles.genderButtonText}>Male</Text>
        </Pressable>
      </View>

      {/* Next Button */}
      <Pressable
        style={[
          styles.nextButton,
          !selectedGender && { opacity: 0.4 },
        ]}
        onPress={handleNext}
        disabled={!selectedGender}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </View>
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
    marginBottom: 20,
  },
  genderButton: {
    width: 334,
    height: 43,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#F3FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 5,
  },
  genderButtonSelected: {
    backgroundColor: '#27403B',
  },
  genderButtonText: {
    color: '#F3FAF8',
    fontSize: 16,
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
