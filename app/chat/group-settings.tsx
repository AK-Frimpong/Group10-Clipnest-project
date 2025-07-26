import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUser } from '../../hooks/UserContext';
import { useThemeContext } from '../../theme/themecontext';

// Dummy user data for participant names
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

export default function GroupSettingsScreen() {
  const { user } = useUser();
  const { groupId } = useLocalSearchParams();
  const safeGroupId = Array.isArray(groupId) ? groupId[0] : groupId;
  const { isDarkMode } = useThemeContext();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Load group data
  useFocusEffect(
    React.useCallback(() => {
      const loadGroup = async () => {
        try {
          const groupsKey = `user_groups_${user?.id || 'unknown'}`;
          const groupsData = await AsyncStorage.getItem(groupsKey);
          if (groupsData) {
            const groups = JSON.parse(groupsData);
            const foundGroup = groups.find((g: Group) => g.id === safeGroupId);
            setGroup(foundGroup || null);
          }
        } catch (error) {
          console.error('Error loading group:', error);
        }
      };
      loadGroup();
    }, [safeGroupId, user?.id])
  );

  // Get user details by ID
  const getUserDetails = (userId: string) => {
    if (userId === user?.id) return { name: 'You', username: user?.username || 'you' };
    const dummyUser = DUMMY_USERS.find(u => u.id === userId);
    return dummyUser || { name: userId, username: userId };
  };

  // Check if current user is group creator
  const isGroupCreator = group?.createdBy === user?.id;

  // Filter users for adding (exclude existing members)
  const availableUsers = DUMMY_USERS.filter(u => 
    !group?.participants.includes(u.id) &&
    (u.username.toLowerCase().includes(searchText.toLowerCase()) ||
     u.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  // Add members to group
  const addMembers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const groupsKey = `user_groups_${user?.id || 'unknown'}`;
      const groupsData = await AsyncStorage.getItem(groupsKey);
      if (groupsData) {
        const groups = JSON.parse(groupsData);
        const updatedGroups = groups.map((g: Group) => {
          if (g.id === safeGroupId) {
            return {
              ...g,
              participants: [...g.participants, ...selectedUsers]
            };
          }
          return g;
        });
        await AsyncStorage.setItem(groupsKey, JSON.stringify(updatedGroups));
        setGroup(updatedGroups.find((g: Group) => g.id === safeGroupId));
        setSelectedUsers([]);
        setAddMemberModalVisible(false);
        setSearchText('');
      }
    } catch (error) {
      console.error('Error adding members:', error);
    }
  };

  // Remove member from group
  const removeMember = async (memberId: string) => {
    if (!isGroupCreator) return;

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${getUserDetails(memberId).name} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const groupsKey = `user_groups_${user?.id || 'unknown'}`;
              const groupsData = await AsyncStorage.getItem(groupsKey);
              if (groupsData) {
                const groups = JSON.parse(groupsData);
                const updatedGroups = groups.map((g: Group) => {
                  if (g.id === safeGroupId) {
                    return {
                      ...g,
                      participants: g.participants.filter((p: string) => p !== memberId),
                      admins: g.admins.filter((a: string) => a !== memberId)
                    };
                  }
                  return g;
                });
                await AsyncStorage.setItem(groupsKey, JSON.stringify(updatedGroups));
                setGroup(updatedGroups.find((g: Group) => g.id === safeGroupId));
              }
            } catch (error) {
              console.error('Error removing member:', error);
            }
          }
        }
      ]
    );
  };

  // Leave group
  const leaveGroup = async () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const groupsKey = `user_groups_${user?.id || 'unknown'}`;
              const groupsData = await AsyncStorage.getItem(groupsKey);
              if (groupsData) {
                const groups = JSON.parse(groupsData);
                // Remove the entire group from the user's groups list
                const updatedGroups = groups.filter((g: Group) => g.id !== safeGroupId);
                await AsyncStorage.setItem(groupsKey, JSON.stringify(updatedGroups));
                router.back();
              }
            } catch (error) {
              console.error('Error leaving group:', error);
            }
          }
        }
      ]
    );
  };

  // Toggle user selection for adding
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
        <Text style={[styles.loadingText, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
          Loading group...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
          Group Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Group Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
          {group.name}
        </Text>
        <Text style={[styles.memberCount, { color: isDarkMode ? '#aaa' : '#666' }]}>
          {group.participants.length} members
        </Text>
      </View>

      {/* Members Section */}
      <View style={[styles.section, { flex: 1 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
            Members
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#7BD4C8' }]}
            onPress={() => setAddMemberModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#181D1C" />
            <Text style={[styles.addButtonText, { color: '#181D1C' }]}>Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={group.participants}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => {
            const userDetails = getUserDetails(item);
            const isCurrentUser = item === user?.id;
            const isCreator = item === group.createdBy;
            
            return (
              <TouchableOpacity
                style={styles.memberRow}
                onPress={() => {
                  // Only navigate if it's not the current user
                  if (item !== user?.id) {
                    // Navigate to user profile
                    router.push({
                      pathname: '/UserProfileScreen',
                      params: { username: getUserDetails(item).username }
                    });
                  }
                }}
                disabled={item === user?.id} // Disable for current user
              >
                <View style={styles.memberInfo}>
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color={isDarkMode ? '#7BD4C8' : '#181D1C'}
                  />
                  <View style={styles.memberText}>
                    <Text style={[styles.memberName, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
                      {userDetails.name}
                      {isCreator && (
                        <Text style={[styles.creatorBadge, { color: '#7BD4C8' }]}> (Creator)</Text>
                      )}
                    </Text>
                    <Text style={[styles.memberUsername, { color: isDarkMode ? '#aaa' : '#666' }]}>
                      @{userDetails.username}
                    </Text>
                  </View>
                </View>
                {isGroupCreator && !isCurrentUser && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                      removeMember(item);
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
          style={styles.membersList}
        />
      </View>

      {/* Leave Group Button */}
      <TouchableOpacity
        style={[styles.leaveButton, { backgroundColor: '#27403B' }]}
        onPress={leaveGroup}
      >
        <Text style={[styles.leaveButtonText, { color: '#F3FAF8' }]}>
          Leave Group
        </Text>
      </TouchableOpacity>

      {/* Add Member Modal */}
      <Modal
        visible={addMemberModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddMemberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#232B2B' : '#fff' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
              Add Members
            </Text>
            
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

            <FlatList
              data={availableUsers}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedUsers.includes(item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.userRow,
                      {
                        backgroundColor: isSelected
                          ? '#7BD4C8'
                          : isDarkMode ? '#181D1C' : '#F3FAF8',
                      },
                    ]}
                    onPress={() => toggleUserSelection(item.id)}
                  >
                    <View style={styles.userInfo}>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                          // Navigate to user profile
                          router.push({
                            pathname: '/UserProfileScreen',
                            params: { username: item.username }
                          });
                        }}
                        style={styles.profileIconContainer}
                      >
                        <Ionicons
                          name="person-circle-outline"
                          size={40}
                          color={isSelected ? '#181D1C' : (isDarkMode ? '#7BD4C8' : '#181D1C')}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
                          // Navigate to user profile
                          router.push({
                            pathname: '/UserProfileScreen',
                            params: { username: item.username }
                          });
                        }}
                        style={styles.userText}
                      >
                        <Text
                          style={[
                            styles.userName,
                            { color: isSelected ? '#181D1C' : (isDarkMode ? '#F3FAF8' : '#181D1C') },
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text
                          style={[
                            styles.userUsername,
                            { color: isSelected ? '#181D1C' : (isDarkMode ? '#aaa' : '#666') },
                          ]}
                        >
                          @{item.username}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color="#181D1C" />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={styles.usersList}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDarkMode ? '#333' : '#ccc' }]}
                onPress={() => {
                  setAddMemberModalVisible(false);
                  setSelectedUsers([]);
                  setSearchText('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: isDarkMode ? '#666' : '#999' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: selectedUsers.length > 0 ? '#7BD4C8' : (isDarkMode ? '#333' : '#ccc'),
                  },
                ]}
                onPress={addMembers}
                disabled={selectedUsers.length === 0}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    {
                      color: selectedUsers.length > 0 ? '#181D1C' : (isDarkMode ? '#666' : '#999'),
                    },
                  ]}
                >
                  Add ({selectedUsers.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  membersList: {
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberText: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  creatorBadge: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  removeButton: {
    padding: 4,
  },
  leaveButton: {
    width: 334,
    height: 43,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
    alignSelf: 'center',
  },
  leaveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  usersList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userText: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123, 212, 200, 0.2)', // Light blue background
  },
}); 