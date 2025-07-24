import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../hooks/UserContext';

export default function BlockedUsersScreen() {
  const { user } = useUser();
  const { isDarkMode } = useThemeContext();
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  useEffect(() => {
    const loadBlocked = async () => {
      try {
        const stored = await AsyncStorage.getItem(`blocked_users_${user?.id || 'unknown'}`);
        if (stored) {
          const arr = JSON.parse(stored);
          setBlockedUsers(Array.isArray(arr) ? arr : []);
        } else {
          setBlockedUsers([]);
        }
      } catch {
        setBlockedUsers([]);
      }
    };
    loadBlocked();
  }, []);

  const handleUnblock = async (username: string) => {
    try {
      const newList = blockedUsers.filter(u => u !== username);
      setBlockedUsers(newList);
      await AsyncStorage.setItem(`blocked_users_${user?.id || 'unknown'}`, JSON.stringify(newList));
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Blocked Users</Text>
        <View style={{ width: 28 }} />
      </View>
      <FlatList
        data={blockedUsers}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={styles.profileIconWrapper}>
              <Ionicons name="person-circle-outline" size={28} color={isDarkMode ? '#7BD4C8' : '#181D1C'} />
            </View>
            <Text style={{ color: isDarkMode ? '#F3FAF8' : '#181D1C', fontWeight: 'bold', marginLeft: 10 }}>{item}</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.unblockBtn} onPress={() => handleUnblock(item)}>
              <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>Unblock</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: isDarkMode ? '#aaa' : '#555', textAlign: 'center', marginTop: 24 }}>No blocked users.</Text>}
        style={{ marginTop: 8, width: '100%' }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  profileIconWrapper: {
    marginRight: 0,
  },
  unblockBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    marginLeft: 10,
  },
}); 