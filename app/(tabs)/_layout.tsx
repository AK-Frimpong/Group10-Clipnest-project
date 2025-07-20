import { Feather, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useThemeContext } from '../../theme/themecontext';
import PostCreationModal from '../modals/PostCreationModal';

export default function TabLayout() {
  const { isDarkMode } = useThemeContext();
  const tabBarBg = isDarkMode ? '#181D1C' : '#F3FAF8';
  const tabBarActive = isDarkMode ? '#4EE0C1' : '#181D1C';
  const tabBarInactive = isDarkMode ? '#fff' : '#888';
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: tabBarActive,
          tabBarInactiveTintColor: tabBarInactive,
          tabBarStyle: { backgroundColor: tabBarBg, borderTopWidth: 0 },
          tabBarLabelStyle: { fontSize: 12 },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarLabel: 'Search',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="post"
          options={{
            tabBarLabel: '',
            tabBarIcon: ({ color, size }) => (
              <Feather name="plus-circle" size={size + 6} color={color} />
            ),
            tabBarButton: ({ accessibilityState, style }) => (
              <TouchableOpacity
                accessibilityState={accessibilityState}
                style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, style]}
                activeOpacity={0.7}
                onPress={() => setModalVisible(true)}
              >
                <Feather name="plus-circle" size={32} color={accessibilityState?.selected ? tabBarActive : tabBarInactive} />
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            tabBarLabel: 'Messages',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <PostCreationModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}
