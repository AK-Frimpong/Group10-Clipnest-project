import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, Image, ScrollView } from 'react-native';

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageGrid}>
        {images.map((img, index) => (
          <Image key={index} source={img} style={styles.imageItem} />
        ))}
      </View>

      <Text style={styles.title}>
        Welcome to <Text style={styles.clipnestText}>Clipnest</Text>
      </Text>

      <Pressable style={styles.button} onPress={() => router.push('/auth/signup')}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.login]} onPress={() => router.push('/auth/login')}>
        <Text style={[styles.buttonText, styles.loginButtonText]}>Log In</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#181D1C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  imageItem: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 5,
  },
  title: {
    fontSize: 28,
    color: '#F3FAF8',
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  clipnestText: {
    fontFamily: 'Sofia',
    fontSize: 28,
    color: '#7BD4C8',
  },
  button: {
    backgroundColor: '#27403B',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  login: {
    backgroundColor: '#7BD4C8',
   },
   loginButtonText: {
    color: '#181D1C',
  },
  buttonText: {
    color: '#F3FAF8',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
