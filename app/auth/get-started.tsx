import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Image, StyleSheet, View } from 'react-native';

export default function GetStartedScreen() {
  const router = useRouter();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spiral out animation
    Animated.sequence([
      Animated.parallel([
        // Spin multiple times while scaling up
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.175, 0.885, 0.32, 1), // Custom easing for smooth spin
          useNativeDriver: true,
        }),
        // Scale up from small to normal size
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      // Brief pause at full size
      Animated.delay(200),
      // Slide up while continuing to spin
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -Dimensions.get('window').height,
          duration: 800,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(spinAnim, {
          toValue: 2,
          duration: 800,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      router.replace('/auth');
    });
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['0deg', '720deg', '1080deg'] // Two full spins during entrance, one during exit
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={{ 
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
            { rotate: spin },
            { perspective: 1000 }
          ],
          alignItems: 'center'
        }}
      >
        <Image 
          source={require('../../assets/images/clipnest_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181D1C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 500,
    height: 500,
  }
});
