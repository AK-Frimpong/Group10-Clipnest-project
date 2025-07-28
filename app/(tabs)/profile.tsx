import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUser } from '../../hooks/UserContext';
import { useThemeContext } from '../../theme/themecontext';
import EditProfileModal from '../modals/EditProfileModal';

export default function ProfileScreen() {
  const { isDarkMode } = useThemeContext();
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUser();

  // Dummy data for boards
  const [boards, setBoards] = useState([
    { id: '1', name: 'Fashion', imageCount: 12 },
    { id: '2', name: 'Travel', imageCount: 8 },
    { id: '3', name: 'Food', imageCount: 15 },
  ]);

  // Dummy data for collages
  const [collages, setCollages] = useState([
    { id: '1', name: 'Summer 2023', imageCount: 4 },
    { id: '2', name: 'Vacation', imageCount: 6 },
    { id: '3', name: 'Memories', imageCount: 3 },
  ]);

  const [activeTab, setActiveTab] = useState('boards');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Implement logout logic here
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const renderAvatar = () => {
    if (user?.avatar) {
      return (
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
      );
    }
    return (
      <View style={[styles.avatar, styles.defaultAvatar, { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }]}>
        <Ionicons name="person" size={40} color={isDarkMode ? '#7BD4C8' : '#181D1C'} />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push('/(settings)' as any)}>
            <Ionicons name="settings-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.username, { color: isDarkMode ? '#fff' : '#000' }]}>
            {user?.username || 'Username'}
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          {renderAvatar()}
          <View style={styles.stats}>
            <Pressable onPress={() => router.push('/followers' as any)} style={styles.statItem}>
              <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#000' }]}>1.2K</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>Followers</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/following' as any)} style={styles.statItem}>
              <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#000' }]}>1K</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>Following</Text>
            </Pressable>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#000' }]}>50</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#aaa' : '#666' }]}>Boards</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.editButtonText, { color: isDarkMode ? '#7BD4C8' : '#181D1C' }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        <View style={styles.bio}>
          <Text style={[styles.bioText, { color: isDarkMode ? '#ccc' : '#555' }]}>
            {user?.bio || 'No bio yet'}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'boards' && styles.activeTab,
            { borderColor: isDarkMode ? '#333' : '#ddd' }
          ]}
          onPress={() => setActiveTab('boards')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'boards' ? '#4EE0C1' : (isDarkMode ? '#fff' : '#000') }
            ]}
          >
            Boards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'collages' && styles.activeTab,
            { borderColor: isDarkMode ? '#333' : '#ddd' }
          ]}
          onPress={() => setActiveTab('collages')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'collages' ? '#4EE0C1' : (isDarkMode ? '#fff' : '#000') }
            ]}
          >
            Collages
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'boards' ? (
          <View style={styles.grid}>
            {boards.map((board) => (
              <TouchableOpacity
                key={board.id}
                style={[
                  styles.gridItem,
                  { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }
                ]}
              >
                <Text style={[styles.gridItemTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                  {board.name}
                </Text>
                <Text style={[styles.gridItemCount, { color: isDarkMode ? '#aaa' : '#666' }]}>
                  {board.imageCount} images
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.grid}>
            {collages.map((collage) => (
              <TouchableOpacity
                key={collage.id}
                style={[
                  styles.gridItem,
                  { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }
                ]}
              >
                <Text style={[styles.gridItemTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                  {collage.name}
                </Text>
                <Text style={[styles.gridItemCount, { color: isDarkMode ? '#aaa' : '#666' }]}>
                  {collage.imageCount} images
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <EditProfileModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        currentName={user?.name || ''}
        currentUsername={user?.username || ''}
        currentBio={user?.bio || ''}
        currentAvatar={user?.avatar ?? null}
        onSave={(newName, newUsername, newBio, newAvatar, showPins) => {
          if (user) {
            setUser({
              ...user,
              name: newName || user.name,
              username: newUsername || user.username,
              bio: newBio || user.bio,
              avatar: newAvatar,
            });
          }
          setModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0, // Add padding for Android status bar
  },
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  defaultAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'stretch',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bio: {
    marginBottom: 16,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4EE0C1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  gridItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  gridItemCount: {
    fontSize: 12,
  },
});
