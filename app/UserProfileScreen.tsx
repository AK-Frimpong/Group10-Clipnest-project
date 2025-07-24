import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';

const mockCreated: { id: string; uri: string; type: string; duration?: string }[] = [
  { id: '1', uri: 'https://i.imgur.com/1.jpg', type: 'video', duration: '0:21' },
  { id: '2', uri: 'https://i.imgur.com/2.jpg', type: 'image' },
  { id: '3', uri: 'https://i.imgur.com/3.jpg', type: 'image' },
  { id: '4', uri: 'https://i.imgur.com/4.jpg', type: 'video', duration: '0:23' },
];
const mockSaved: { id: string; uri: string; type: string; duration?: string }[] = [
  { id: '5', uri: 'https://i.imgur.com/5.jpg', type: 'image' },
  { id: '6', uri: 'https://i.imgur.com/6.jpg', type: 'image' },
  { id: '7', uri: 'https://i.imgur.com/7.jpg', type: 'image' },
  { id: '8', uri: 'https://i.imgur.com/8.jpg', type: 'image' },
];

export default function UserProfileScreen() {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'created' | 'saved'>('created');
  const user = {
    name: params.name || (params.username ? String(params.username).charAt(0).toUpperCase() + String(params.username).slice(1) : 'User'),
    username: params.username || 'unknown',
    followers: 0,
    following: 0,
    avatar: null,
  };
  const posts: { id: string; uri: string; type: string; duration?: string }[] = [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {router.canGoBack?.() !== false && (
          <TouchableOpacity style={{ marginTop: 16, marginLeft: 8, width: 32 }} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#222'} />
          </TouchableOpacity>
        )}
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#2196f3', justifyContent: 'center', alignItems: 'center' }]}> 
              <Text style={{ color: '#fff', fontSize: 40, fontWeight: 'bold' }}>{user.name[0]}</Text>
            </View>
          )}
          <Text style={[styles.name, { color: '#fff', marginTop: 12 }]}>{user.name}</Text>
          <Text style={[styles.username, { color: '#aaa', marginTop: 2 }]}>@{user.username}</Text>
          <Text style={[styles.stats, { color: '#aaa', marginTop: 8 }]}>0 followers · 0 following</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDarkMode ? '#252A29' : '#eee' }]}> 
            <Feather name="share" size={20} color={isDarkMode ? '#fff' : '#222'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.messageButton, { backgroundColor: '#333' }]}> 
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.followButton, { backgroundColor: '#4EE0C1' }]}> 
            <Text style={{ color: '#181D1C', fontWeight: 'bold', fontSize: 16 }}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: isDarkMode ? '#252A29' : '#eee' }]}> 
            <Feather name="more-horizontal" size={20} color={isDarkMode ? '#fff' : '#222'} />
          </TouchableOpacity>
        </View>
        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('created')}>
            <Text style={[styles.tabText, { color: '#fff', fontWeight: activeTab === 'created' ? 'bold' : 'normal' }]}>Created</Text>
            {activeTab === 'created' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('saved')}>
            <Text style={[styles.tabText, { color: '#fff', fontWeight: activeTab === 'saved' ? 'bold' : 'normal' }]}>Saved</Text>
            {activeTab === 'saved' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>
        {/* Grid */}
        {posts.length === 0 ? (
          <Text style={{ color: isDarkMode ? '#aaa' : '#555', textAlign: 'center', marginTop: 32 }}>
            {activeTab === 'created' ? 'No created items yet.' : 'No saved items yet.'}
          </Text>
        ) : (
          <View style={styles.gridRow}>
            {posts.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <Image source={{ uri: item.uri }} style={styles.gridImage} />
                {item.type === 'video' && item.duration && (
                  <View style={styles.durationOverlay}>
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2196f3',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    marginTop: 2,
  },
  stats: {
    fontSize: 15,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
    gap: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButton: {
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  followButton: {
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
    borderBottomWidth: 1,
    borderColor: '#333',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
  },
  tabUnderline: {
    height: 3,
    width: 28,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  gridItem: {
    width: '46%',
    aspectRatio: 1,
    margin: '2%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
}); 