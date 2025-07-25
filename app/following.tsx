import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function FollowingScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: '#F3FAF8' }}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: 20, zIndex: 10 }}>
        <Ionicons name="arrow-back" size={28} color="#181D1C" />
      </TouchableOpacity>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Following</Text>
        <Text style={{ fontSize: 16, color: '#888' }}>You are not following any users</Text>
      </View>
    </View>
  );
} 