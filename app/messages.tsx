import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useUser } from '../hooks/UserContext';

// Dummy user data for search (replace with real user search in the future)
const DUMMY_USERS = [
  { username: 'janedoe', name: 'Jane Doe' },
  { username: 'johndoe', name: 'John Doe' },
  { username: 'minimalist', name: 'Minimalist User' },
  { username: 'artlover', name: 'Art Lover' },
  { username: 'jermaine', name: 'Jermaine' },
];

interface Group {
  id: string;
  name: string;
  participants: string[];
  admins: string[];
  createdBy: string;
  createdAt: number;
}

interface GroupMessage {
  id: string;
  text?: string;
  imageUri?: string;
  audioUri?: string;
  sender: string;
  senderName: string;
  timestamp: number;
  status: 'sent' | 'seen' | 'not sent';
  replyTo?: string;
  deletedFor?: string[];
  edited?: boolean;
  deletedForEveryone?: boolean;
}

function formatTimestamp(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (
    now.getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear()
  ) {
    // Today
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (
    new Date(now.getTime() - oneDay).getDate() === date.getDate() &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear()
  ) {
    // Yesterday
    return 'Yesterday';
  } else if (diff < 7 * oneDay) {
    // Within the last week
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  } else {
    // Older
    return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}

export default function MessagesScreen() {
  const { user } = useUser();
  const { isDarkMode } = useThemeContext();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState(DUMMY_USERS);
  const [conversations, setConversations] = useState<any[]>([]); // { username/groupId, name, lastMessage, unreadCount, isGroup }
  const router = useRouter();

  // Helper to get unread count key
  const getUnreadKey = (username: string) => `chat_unread_${user?.id || 'unknown'}_${username}`;
  // Helper to get chat messages key
  const getChatKey = (username: string) => `chat_messages_${user?.id || 'unknown'}_${username}`;
  // Helper to get group messages key
  const getGroupMessagesKey = (groupId: string) => `group_messages_${groupId}`;

  useFocusEffect(
    React.useCallback(() => {
      const loadConversations = async () => {
        const convos: any[] = [];
        
        // Load hidden conversations
        const hiddenKey = `hidden_conversations_${user?.id || 'unknown'}`;
        const hiddenRaw = await AsyncStorage.getItem(hiddenKey);
        const hiddenList = hiddenRaw ? JSON.parse(hiddenRaw) : [];

        // Load individual conversations
        for (const u of DUMMY_USERS) {
          const key = `chat_messages_${user?.id || 'unknown'}_${u.username}`;
          const stored = await AsyncStorage.getItem(key);
          const unreadKey = getUnreadKey(u.username);
          const unreadRaw = await AsyncStorage.getItem(unreadKey);
          const unreadCount = unreadRaw ? parseInt(unreadRaw, 10) : 0;
          
          if (stored) {
            const msgs = JSON.parse(stored);
            if (Array.isArray(msgs) && msgs.length > 0) {
              const lastMsg = msgs[msgs.length - 1];
              // Only show if not hidden (unless searching)
              if (searchText.trim() !== '' || !hiddenList.includes(u.username)) {
                convos.push({
                  id: u.username,
                  name: u.username,
                  lastMessage: (lastMsg.text && lastMsg.text.trim() !== '') ? lastMsg.text : (lastMsg.imageUri ? 'image' : (lastMsg.audioUri ? 'Voice message' : '')),
                  lastIsImage: !!lastMsg.imageUri && (!lastMsg.text || lastMsg.text.trim() === ''),
                  lastTimestamp: lastMsg.timestamp,
                  unreadCount,
                  isGroup: false,
                });
              }
            }
          }
        }

        // Load group conversations
        try {
          const groupsKey = `user_groups_${user?.id || 'unknown'}`;
          const groupsData = await AsyncStorage.getItem(groupsKey);
          if (groupsData) {
            const groups: Group[] = JSON.parse(groupsData);
            
            for (const group of groups) {
              const groupMessagesKey = getGroupMessagesKey(group.id);
              const groupMessagesData = await AsyncStorage.getItem(groupMessagesKey);
              
              let lastMessage = '';
              let lastSender = '';
              let lastTimestamp = group.createdAt; // Use creation time as fallback
              let lastIsImage = false;
              
              if (groupMessagesData) {
                const groupMessages: GroupMessage[] = JSON.parse(groupMessagesData);
                if (groupMessages.length > 0) {
                  const lastMsg = groupMessages[groupMessages.length - 1];
                  lastSender = lastMsg.senderName || 'Unknown';
                  lastMessage = (lastMsg.text && lastMsg.text.trim() !== '') ? lastMsg.text : (lastMsg.imageUri ? 'image' : (lastMsg.audioUri ? 'Voice message' : ''));
                  lastTimestamp = lastMsg.timestamp;
                  lastIsImage = !!lastMsg.imageUri && (!lastMsg.text || lastMsg.text.trim() === '');
                }
              }
              
              convos.push({
                id: group.id,
                name: group.name,
                lastMessage: lastMessage || 'No messages yet',
                lastSender: lastSender,
                lastIsImage: lastIsImage,
                lastTimestamp: lastTimestamp,
                unreadCount: 0, // TODO: Implement group unread count
                isGroup: true,
                memberCount: group.participants.length,
              });
            }
          }
        } catch (error) {
          console.error('Error loading groups:', error);
        }

        // Sort conversations by last message timestamp (newest first)
        convos.sort((a, b) => (a.lastTimestamp || 0) - (b.lastTimestamp || 0));
        setConversations(convos);
      };
      loadConversations();
    }, [user?.id, searchText])
  );

  const handleSearch = (text: string) => {
    setSearchText(text);
    setSearchResults(
      DUMMY_USERS.filter(u =>
        u.username.toLowerCase().includes(text.toLowerCase()) ||
        u.name.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  // Show only users with conversations, or search results if searching
  const usersToShow =
    searchText.trim() !== ''
      ? searchResults.map(u => ({ ...u, lastMessage: '' }))
      : conversations;

  // When a chat is opened, reset unread count for that user
  const handleOpenChat = async (conversation: any) => {
    if (conversation.isGroup) {
      // Navigate to group chat
      router.push({
        pathname: '/chat/group-chat',
        params: { groupId: conversation.id, groupName: conversation.name }
      });
    } else {
      // Navigate to individual chat
      await AsyncStorage.setItem(getUnreadKey(conversation.id), '0');
      router.push({ pathname: '/chat/chat', params: { username: conversation.id } });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
        {/* Inbox Header Row */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backIconWrapper} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
          </Pressable>
          <Text style={[styles.inboxHeader, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Inbox</Text>
          <TouchableOpacity 
            style={styles.createGroupButton} 
            onPress={() => {
              router.push('/chat/create-group');
            }}
            hitSlop={10}
          >
            <Ionicons name="people" size={24} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
          </TouchableOpacity>
        </View>
        {/* Messages Section */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Messages</Text>
        </View>
        {/* Search box always visible */}
        <View style={[styles.searchBoxRow, { borderWidth: 1, borderColor: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>
          <TextInput
            style={[styles.input, { backgroundColor: 'transparent', color: isDarkMode ? '#fff' : '#181D1C' }]}
            placeholder="Find people to message"
            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
        </View>
        {/* User list */}
        <FlatList
          data={usersToShow}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <TouchableOpacity 
                onPress={() => {
                  if (item.isGroup) {
                    // Don't navigate to profile for groups
                    return;
                  }
                  router.push({ pathname: '/UserProfileScreen', params: { username: item.id } });
                }} 
                hitSlop={10}
              >
                <Ionicons 
                  name={item.isGroup ? "people" : "person-circle-outline"} 
                  size={28} 
                  color={isDarkMode ? '#4EE0C1' : '#181D1C'} 
                />
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 12, flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={() => handleOpenChat(item)} activeOpacity={0.8}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: isDarkMode ? '#F3FAF8' : '#181D1C', fontWeight: 'bold' }}>{item.name}</Text>
                    {item.isGroup && (
                      <Text style={{ color: isDarkMode ? '#aaa' : '#666', fontSize: 12, marginLeft: 8 }}>
                        {item.memberCount} members
                      </Text>
                    )}
                  </View>
                  {item.lastMessage !== undefined && item.lastMessage !== '' && (
                    <Text
                      style={{
                        color: item.lastSender === 'them' ? '#181D1C' : (isDarkMode ? '#aaa' : '#555'),
                        fontSize: 14,
                        marginTop: 2,
                        fontStyle: item.lastIsImage ? 'italic' : 'normal',
                        opacity: item.lastIsImage ? 0.7 : 1,
                        fontWeight: item.unreadCount > 0 ? 'bold' : 'normal',
                      }}
                      numberOfLines={1}
                    >
                      {item.isGroup && item.lastSender && item.lastSender !== 'You' ? `${item.lastSender}: ` : ''}
                      {item.lastIsImage ? 'image' : item.lastMessage}
                    </Text>
                  )}
                </View>
                {item.lastTimestamp !== undefined && (
                  <Text style={{ color: isDarkMode ? '#aaa' : '#555', fontSize: 13, marginLeft: 8, textAlign: 'right', minWidth: 70 }}>
                    {formatTimestamp(new Date(item.lastTimestamp))}
                  </Text>
                )}
                {/* Unread badge */}
                {item.unreadCount > 0 && (
                  <View style={{
                    backgroundColor: '#7BD4C8',
                    borderRadius: 12,
                    minWidth: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 10,
                    paddingHorizontal: 6,
                  }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{item.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color={isDarkMode ? '#7BD4C8' : '#181D1C'} style={{ marginBottom: 18 }} />
              <Text style={{ color: isDarkMode ? '#F3FAF8' : '#181D1C', fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                No messages yet
              </Text>
              <Text style={{ color: isDarkMode ? '#aaa' : '#181D1C', fontSize: 15, textAlign: 'center', opacity: 0.7 }}>
                Start a conversation to see your messages here.
              </Text>
            </View>
          }
          style={{ marginTop: 8, width: '100%' }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 0,
    marginBottom: 12,
    width: '100%',
    paddingHorizontal: 24,
  },
  backIconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  createGroupButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  iconCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 32,
    marginTop: '40%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
