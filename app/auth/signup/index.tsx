import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function SignupIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/signup/email');
  }, []);

  return <View />;
}
