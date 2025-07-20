// /api/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './axiosInstance';

export const signUp = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    const res = await api.post('/signup', { email, username, password });
    return res.data; // You can show this message on success
  } catch (error: any) {
    throw error.response?.data || { message: 'Signup failed' };
  }
};

export const login = async (email: string, password: string) => {
  try {
    const res = await api.post('/login', { email, password });
    const token = res.data.token;

    if (token) {
      await AsyncStorage.setItem('jwtToken', token);
    }

    return token;
  } catch (error: any) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const getStoredToken = async () => {
  return await AsyncStorage.getItem('jwtToken');
};

export const logout = async () => {
  await AsyncStorage.removeItem('jwtToken');
};
