import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Image, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../hooks/UserContext';
import { useThemeContext } from '../../theme/themecontext'; //  FIXED PATH
import { ImageItem, PinBoardContext } from '../context/PinBoardContext';
import EditProfileModal from '../modals/EditProfileModal';

export default function ProfileScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  
  const { isDarkMode } = useThemeContext();
  const { pins, collages } = useContext(PinBoardContext);
  const [activeTab, setActiveTab] = useState<'clips' | 'boards' | 'collages' | 'saved' | 'created'>('clips');

  const [name, setName] = useState('Alvin');
  const [username, setUsername] = useState('alvinnn');
  const [bio, setBio] = useState('Basketball, Fragrance, Cars');
  const [avatar, setAvatar] = useState<string | null>(null);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const openSettings = () => {
    router.push('/settings');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }} // updated
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={openSettings}>
          <Ionicons name="settings-outline" size={28} color={isDarkMode ? 'white' : 'black'} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flex: 1 }}>
          <View style={{ minWidth: 40, alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                router.push( '/analytics' as any);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="bar-chart" size={24} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>
          <View style={{ minWidth: 40, alignItems: 'center', marginLeft: 10 }}>
            <TouchableOpacity
              onPress={async () => {
                const profileUrl = `https://clipnest.com/user/${user?.username || username}`;
                await Share.share({
                  message: `Check out this profile: ${profileUrl}`,
                  url: profileUrl,
                  title: `Profile of ${user?.id || name}`,
                });
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="share" size={24} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.topSection}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.profilePic} />
        ) : (
          <View style={[styles.profilePic, { backgroundColor: isDarkMode ? '#333' : '#ccc' }]} />
        )}
        <Text style={[styles.name, { color: isDarkMode ? '#fff' : '#000' }]}>{user?.id || name}</Text>
        <Text style={[styles.username, { color: isDarkMode ? '#aaa' : '#888' }]}>@{user?.username || username}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/followers')}>
            <Text style={[styles.statsLine, { color: isDarkMode ? '#aaa' : '#666' }]}>0 follower</Text>
          </TouchableOpacity>
          <Text style={[styles.statsLine, { color: isDarkMode ? '#aaa' : '#666' }]}> · </Text>
          <TouchableOpacity onPress={() => router.push('/following')}>
            <Text style={[styles.statsLine, { color: isDarkMode ? '#aaa' : '#666' }]}>0 following</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.bio, { color: isDarkMode ? '#ccc' : '#555' }]}>{bio}</Text>
        <TouchableOpacity
          style={[
            styles.editButton,
            { backgroundColor: '#27403B' },
          ]}
          onPress={openModal}
        >
          <Text
            style={[
              styles.editButtonText,
              { color: '#F3FAF8' },
            ]}
          >
            Edit profile
          </Text>
        </TouchableOpacity>
      </View>
      {/* Tab Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 32, borderBottomWidth: 1, borderColor: isDarkMode ? '#333' : '#ddd' }}>
        {[
          { key: 'created', label: 'Created' },
          { key: 'clips', label: 'Clips' },
          { key: 'boards', label: 'Boards' },
          { key: 'collages', label: 'Collages' },
          { key: 'saved', label: 'Saved' },
        ].map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key as any)} style={{ alignItems: 'center', flex: 1, paddingVertical: 10 }}>
            <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16, fontWeight: activeTab === tab.key ? 'bold' : 'normal' }}>{tab.label}</Text>
            {activeTab === tab.key && <View style={{ height: 3, width: 28, backgroundColor: isDarkMode ? '#fff' : '#000', borderRadius: 2, marginTop: 4 }} />}
          </TouchableOpacity>
        ))}
      </View>
      {/* Tab Content */}
      {activeTab === 'clips' && (
        <View style={{ marginTop: 24, minHeight: 200 }}>
          {pins.length === 0 ? (
            <Text style={{ color: isDarkMode ? '#888' : '#aaa', textAlign: 'center', marginTop: 32 }}>No clips yet.</Text>
          ) : (
            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 24 }}>
              {pins.map((clip: ImageItem, idx: number) => (
                <TouchableOpacity
                  key={clip.id}
                  onPress={() => router.push({
                    pathname: '/ImageDetailsScreen',
                    params: { index: idx, images: JSON.stringify(pins) },
                  })}
                >
                  <Image source={{ uri: clip.url }} style={{ width: 120, height: 120, borderRadius: 12, marginBottom: 12 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      {activeTab === 'boards' && (
        <View style={{ marginTop: 24, minHeight: 200, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: isDarkMode ? '#888' : '#aaa' }}>No boards yet.</Text>
        </View>
      )}
      {activeTab === 'collages' && (
        <View style={{ marginTop: 24, minHeight: 200 }}>
          {collages.length === 0 ? (
            <Text style={{ color: isDarkMode ? '#888' : '#aaa', textAlign: 'center', marginTop: 32 }}>No collages yet.</Text>
          ) : (
            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 24 }}>
              {collages.map((collage: ImageItem, idx: number) => (
                <TouchableOpacity
                  key={collage.id}
                  onPress={() => router.push({
                    pathname: '/ImageDetailsScreen',
                    params: { index: idx, images: JSON.stringify(collages) },
                  })}
                >
                  <Image source={{ uri: collage.url }} style={{ width: 120, height: 120, borderRadius: 12, marginBottom: 12 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
      {activeTab === 'saved' && (
        <View style={{ marginTop: 24, minHeight: 200, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: isDarkMode ? '#888' : '#aaa' }}>No saved items yet.</Text>
        </View>
      )}
      {activeTab === 'created' && (
        <View style={{ marginTop: 24, minHeight: 200, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: isDarkMode ? '#888' : '#aaa' }}>No created items yet.</Text>
        </View>
      )}

      <EditProfileModal
        visible={isModalVisible}
        onClose={closeModal}
        currentName={user?.id || name}
        currentUsername={user?.username || username}
        currentBio={bio}
        currentAvatar={avatar}
        onSave={(newName, newUsername, newBio, newAvatar) => {
          setName(newName);
          setUsername(newUsername);
          setBio(newBio);
          setAvatar(newAvatar);
          closeModal();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'flex-start',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  topSection: {
    alignItems: 'center',
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    marginTop: 2,
    fontSize: 16,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 10,
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statLabel: {},
  bio: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  editButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noPinsContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  noPinsText: {
    fontSize: 16,
  },
  statsLine: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 15,
    textAlign: 'center',
  },
  pinsGridPlaceholder: {
    marginTop: 40,
    alignItems: 'center',
  },
});
