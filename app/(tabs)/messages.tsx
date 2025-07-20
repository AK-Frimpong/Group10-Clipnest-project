import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

// Dummy user data for search (replace with real user search in the future)
const DUMMY_USERS = [
  { username: 'janedoe', name: 'Jane Doe' },
  { username: 'johndoe', name: 'John Doe' },
  { username: 'minimalist', name: 'Minimalist User' },
  { username: 'artlover', name: 'Art Lover' },
];

export default function MessagesScreen() {
  const { isDarkMode } = useThemeContext();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState(DUMMY_USERS);

  const handleSearch = (text: string) => {
    setSearchText(text);
    setSearchResults(
      DUMMY_USERS.filter(u =>
        u.username.toLowerCase().includes(text.toLowerCase()) ||
        u.name.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
        {/* Inbox Header */}
        <Text style={[styles.inboxHeader, { color: isDarkMode ? '#fff' : '#181D1C' }]}>Inbox</Text>
        {/* Messages Section */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#181D1C' }]}>Messages</Text>
        </View>
        {/* Search box always visible */}
        <View style={styles.searchBoxRow}>
          <View style={styles.iconCircleSmall}>
            <Ionicons name="people-outline" size={22} color={isDarkMode ? '#fff' : '#181D1C'} />
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED', color: isDarkMode ? '#fff' : '#181D1C' }]}
            placeholder="Find people to message"
            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
            value={searchText}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
        </View>
        {/* Search results (if searching) */}
        {searchText.trim() !== '' && (
          <FlatList
            data={searchResults}
            keyExtractor={item => item.username}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.userRow}>
                <Ionicons name="person-circle-outline" size={28} color={isDarkMode ? '#4EE0C1' : '#181D1C'} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ color: isDarkMode ? '#fff' : '#181D1C', fontWeight: 'bold' }}>{item.name}</Text>
                  <Text style={{ color: isDarkMode ? '#aaa' : '#555', fontSize: 13 }}>@{item.username}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ color: isDarkMode ? '#aaa' : '#555', textAlign: 'center', marginTop: 24 }}>No users found.</Text>}
            style={{ marginTop: 8, width: '100%' }}
          />
        )}
        {/* No messages yet state */}
        {searchText.trim() === '' && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={72} color={isDarkMode ? '#4EE0C1' : '#181D1C'} style={{ marginBottom: 24 }} />
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#181D1C' }]}>No messages yet</Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? '#aaa' : '#555' }]}>Start a conversation by searching for a username above.</Text>
          </View>
        )}
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
  inboxHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 24,
    marginBottom: 12,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 0,
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
    justifyContent: 'center',
    padding: 32,
    marginTop: 0,
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
