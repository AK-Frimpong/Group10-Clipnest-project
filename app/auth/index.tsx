import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

const COLLAGE_SIZE = 340;
const CENTER = COLLAGE_SIZE / 2;

export default function AuthIndex() {
  const router = useRouter();

  const images = [
    require('../../assets/images/img1.jpg'),
    require('../../assets/images/img2.jpg'),
    require('../../assets/images/img3.jpg'),
    require('../../assets/images/img4.jpg'),
    require('../../assets/images/img5.jpg'),
    require('../../assets/images/img6.jpg'),
    require('../../assets/images/img7.jpg'),
    require('../../assets/images/img8.jpg'),
    require('../../assets/images/img9.jpg'),
    require('../../assets/images/img10.jpg'),
    require('../../assets/images/img11.jpg'),
  ];

  // Manually position each image to match the screenshot
  const collageImages = [
    // Top left (tall)
    <Image key={0} source={images[0]} style={[styles.collageImg, { width: 70, height: 110, borderRadius: 22, left: 30, top: 10 }]} />,
    // Top center left (tall)
    <Image key={1} source={images[1]} style={[styles.collageImg, { width: 70, height: 110, borderRadius: 22, left: 100, top: 0 }]} />,
    // Top right (wide)
    <Image key={2} source={images[2]} style={[styles.collageImg, { width: 90, height: 70, borderRadius: 18, left: 200, top: 20 }]} />,
    // Middle left (square)
    <Image key={3} source={images[3]} style={[styles.collageImg, { width: 70, height: 70, borderRadius: 18, left: 10, top: 100 }]} />,
    // Center left (giraffe, wide)
    <Image key={4} source={images[4]} style={[styles.collageImg, { width: 90, height: 70, borderRadius: 18, left: 70, top: 110 }]} />,
    // Center (largest)
    <Image key={5} source={images[5]} style={[styles.collageImg, { width: 110, height: 110, borderRadius: 28, left: 115, top: 90, zIndex: 2 }]} />,
    // Center right (hand, tall)
    <Image key={6} source={images[6]} style={[styles.collageImg, { width: 70, height: 110, borderRadius: 22, left: 230, top: 90 }]} />,
    // Middle right (square)
    <Image key={7} source={images[7]} style={[styles.collageImg, { width: 70, height: 70, borderRadius: 18, left: 260, top: 140 }]} />,
    // Bottom left (cake, square)
    <Image key={8} source={images[8]} style={[styles.collageImg, { width: 70, height: 70, borderRadius: 18, left: 60, top: 200 }]} />,
    // Bottom center (statue, tall)
    <Image key={9} source={images[9]} style={[styles.collageImg, { width: 70, height: 110, borderRadius: 22, left: 140, top: 200 }]} />,
    // Bottom right (room, wide)
    <Image key={10} source={images[10]} style={[styles.collageImg, { width: 90, height: 70, borderRadius: 18, left: 210, top: 210 }]} />,
  ];

  return (
    <View style={styles.container}>
      <View style={styles.collageWrapper}>
        {collageImages}
      </View>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>
          Welcome to <Text style={styles.clipnestText}>Clipnest</Text>
        </Text>
        <Pressable
          style={styles.signUpButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.signUpButtonText}>Sign up</Text>
        </Pressable>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181D1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collageWrapper: {
    width: COLLAGE_SIZE,
    height: COLLAGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 32,
    position: 'relative',
  },
  collageImg: {
    position: 'absolute',
    backgroundColor: '#222',
    resizeMode: 'cover',
  },
  contentWrapper: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    color: '#F3FAF8',
    fontWeight: '500',
    marginBottom: 32,
    textAlign: 'center',
  },
  clipnestText: {
    fontFamily: 'Lobster',
    fontSize: 28,
    color: '#7BD4C8',
  },
  signUpButton: {
    width: 280,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27403B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  signUpButtonText: {
    color: '#F3FAF8',
    fontSize: 18,
    fontWeight: '400',
  },
  loginButton: {
    width: 280,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7BD4C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#181D1C',
    fontSize: 18,
    fontWeight: '500',
  },
});
