import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUser } from '../../hooks/UserContext';
import { useThemeContext } from '../../theme/themecontext';

// Dummy user data for participant selection
const DUMMY_USERS = [
  { id: '1', username: 'janedoe', name: 'Jane Doe' },
  { id: '2', username: 'johndoe', name: 'John Doe' },
  { id: '3', username: 'minimalist', name: 'Minimalist User' },
  { id: '4', username: 'artlover', name: 'Art Lover' },
  { id: '5', username: 'jermaine', name: 'Jermaine' },
];

interface Group {
  id: string;
  name: string;
  participants: string[];
  admins: string[];
  createdBy: string;
  createdAt: number;
}

export default function CreateGroupScreen() {
  const { user } = useUser();
  const { isDarkMode } = useThemeContext();
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const filteredUsers = DUMMY_USERS.filter(u =>
    u.username.toLowerCase().includes(searchText.toLowerCase()) ||
    u.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleParticipant = (userId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length === 0) {
      return;
    }

    const newGroup: Group = {
      id: Date.now().toString(),
      name: groupName.trim(),
      participants: [...selectedParticipants, user?.id || ''],
      admins: [user?.id || ''],
      createdBy: user?.id || '',
      createdAt: Date.now(),
    };

    try {
      // Save group to AsyncStorage
      const groupsKey = `user_groups_${user?.id || 'unknown'}`;
      const existingGroups = await AsyncStorage.getItem(groupsKey);
      const groups = existingGroups ? JSON.parse(existingGroups) : [];
      groups.push(newGroup);
      await AsyncStorage.setItem(groupsKey, JSON.stringify(groups));

      // Navigate to group chat
      router.push({
        pathname: '/chat/group-chat',
        params: { groupId: newGroup.id, groupName: newGroup.name }
      });
    } catch (error) {
      console.error('Error creating group:', error);
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
          Create Group
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Group Name Input */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
          Group Name
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: 'transparent',
              color: isDarkMode ? '#F3FAF8' : '#181D1C',
              borderColor: isDarkMode ? '#F3FAF8' : '#181D1C',
            },
          ]}
          placeholder="Enter group name"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          value={groupName}
          onChangeText={setGroupName}
          maxLength={50}
        />
      </View>

      {/* Participants Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
          Add Participants ({selectedParticipants.length})
        </Text>
        
        {/* Search */}
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: 'transparent',
              color: isDarkMode ? '#F3FAF8' : '#181D1C',
              borderColor: isDarkMode ? '#F3FAF8' : '#181D1C',
            },
          ]}
          placeholder="Search users..."
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Participants List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedParticipants.includes(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.participantRow,
                  {
                    backgroundColor: isSelected
                      ? '#7BD4C8'
                      : isDarkMode ? '#232B2B' : '#E2F1ED',
                  },
                ]}
                onPress={() => toggleParticipant(item.id)}
              >
                <View style={styles.participantInfo}>
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color={isSelected ? '#181D1C' : (isDarkMode ? '#7BD4C8' : '#181D1C')}
                  />
                  <View style={styles.participantText}>
                    <Text
                      style={[
                        styles.participantName,
                        { color: isSelected ? '#181D1C' : (isDarkMode ? '#F3FAF8' : '#181D1C') },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.participantUsername,
                        { color: isSelected ? '#181D1C' : (isDarkMode ? '#aaa' : '#666') },
                      ]}
                    >
                      @{item.username}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#181D1C" />
                )}
              </TouchableOpacity>
            );
          }}
          style={styles.participantsList}
        />
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          {
            backgroundColor:
              groupName.trim() && selectedParticipants.length > 0
                ? '#7BD4C8'
                : isDarkMode ? '#333' : '#ccc',
          },
        ]}
        onPress={createGroup}
        disabled={!groupName.trim() || selectedParticipants.length === 0}
      >
        <Text
          style={[
            styles.createButtonText,
            {
              color:
                groupName.trim() && selectedParticipants.length > 0
                  ? '#181D1C'
                  : isDarkMode ? '#666' : '#999',
            },
          ]}
        >
          Create Group
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  participantsList: {
    maxHeight: 300,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantText: {
    marginLeft: 12,
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  participantUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  createButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 