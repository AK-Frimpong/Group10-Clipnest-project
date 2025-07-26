import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import MasonryList from '@react-native-seoul/masonry-list';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { createRef, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    TextInput as RNTextInput,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useUser } from '../../hooks/UserContext';
import { useThemeContext } from '../../theme/themecontext';

// Add these API keys/constants for pin fetching
const UNSPLASH_ACCESS_KEY = 'BFOYbWJ2jnhmYi-W7Ew3uBsoQ7V-F_qals3ICv4SNIs';
const PEXELS_API_KEY = 'hVq7HPVbO1wmVUqvsA47uaHqeZdESbtdG2lovKcBkzTuopoaErCa226H';
const PER_PAGE = 20;

interface Message {
  id: string;
  text?: string;
  imageUri?: string;
  sender: 'me' | 'them';
  timestamp: number;
  status: 'sent' | 'seen' | 'not sent';
  replyTo?: string; // message id
  deletedFor?: string[]; // usernames who deleted for themselves
  edited?: boolean; // indicates if the message was edited
  deletedForEveryone?: boolean; // new flag
}

export default function ChatScreen() {
  const { user } = useUser();
  const { username } = useLocalSearchParams();
  const safeUsername = Array.isArray(username) ? username[0] : username;
  const { backgroundColor, textColor, cardColor, isDarkMode } = useThemeContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const swipeableRefs = useRef<{ [id: string]: any }>({});
  const storageKey = `chat_messages_${user?.id || 'unknown'}_${safeUsername}`;
  const [blocked, setBlocked] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [inputHeight, setInputHeight] = useState(40);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinImages, setPinImages] = useState<{ id: string; url: string }[]>([]);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSearch, setPinSearch] = useState('');
  const [pinTab, setPinTab] = useState<'all' | 'yours'>('all');

  // Load messages and blocked users from AsyncStorage on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
    const loadMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) setMessages(JSON.parse(stored));
          else setMessages([]);
      } catch {}
    };
      const loadBlocked = async () => {
        try {
          const stored = await AsyncStorage.getItem(`blocked_users_${user?.id || 'unknown'}`);
          if (stored) {
            const arr = JSON.parse(stored);
            setBlocked(Array.isArray(arr) && arr.includes(safeUsername));
          } else {
            setBlocked(false);
          }
        } catch {
          setBlocked(false);
        }
    };
    loadMessages();
      loadBlocked();
    }, [storageKey, safeUsername, user?.id])
  );

  // Save messages to AsyncStorage
  const saveMessages = async (msgs: Message[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch {}
  };

  // Helper: can edit within 15 minutes
  const canEdit = (msg: Message) =>
    msg.sender === 'me' && Date.now() - msg.timestamp < 15 * 60 * 1000;

  // Helper: show timestamp if first message or 1hr+ since previous
  function shouldShowTimestamp(idx: number, msgs: Message[]) {
    if (idx === 0) return true;
    const prev = msgs[idx - 1];
    return msgs[idx].timestamp - prev.timestamp > 60 * 60 * 1000;
  }

  // Format timestamp for chat
  function formatChatTimestamp(ts: number) {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Edit message
  const handleEdit = () => {
    if (!selectedMsg || !editText.trim()) return;
    setMessages(msgs => {
      const updated = msgs.map(m =>
        m.id === selectedMsg.id ? { ...m, text: editText, edited: true } : m
      );
      saveMessages(updated);
      return updated;
    });
    setEditMode(false);
    setEditText('');
    setSelectedMsg(null);
    setActionSheetVisible(false);
  };

  // Delete message
  const handleDelete = (forEveryone: boolean) => {
    if (!selectedMsg) return;
    setMessages(msgs => {
      let updated;
      if (forEveryone) {
        updated = msgs.map(m =>
          m.id === selectedMsg.id
            ? { ...m, text: 'This message was deleted.', deletedForEveryone: true, edited: false }
            : m
        );
      } else {
        updated = msgs.map(m =>
          m.id === selectedMsg.id
            ? { ...m, deletedFor: [...(m.deletedFor || []), user?.id || 'unknown'] }
            : m
        );
      }
      saveMessages(updated);
      return updated;
    });
    setActionSheetVisible(false);
    setSelectedMsg(null);
  };

  // Reply to message
  const handleReply = () => {
    if (!selectedMsg) return;
    setReplyTo(selectedMsg);
    setActionSheetVisible(false);
  };

  // Send message (with reply)
  const handleSend = () => {
    if (!input.trim()) return;
    let status: Message['status'] = 'sent';
    if (blocked) status = 'not sent';
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'me',
      timestamp: Date.now(),
      status,
      replyTo: replyTo ? replyTo.id : undefined,
    };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    saveMessages(newMessages);
    setInput('');
    setReplyTo(null);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    setActionSheetVisible(false);
  };

  // Plus button handler for sending images
  const handlePlusPress = () => {
    setPinTab('all');
    setPinModalVisible(true);
    setPinSearch('');
    fetchPinImages('nature');
  };

  // Fetch images for pin picker
  const fetchPinImages = async (queryOverride?: string) => {
    setPinLoading(true);
    try {
      const query = queryOverride || pinSearch || 'nature';
      // Unsplash fetch
      const unsplashPromise = fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=1&per_page=${PER_PAGE}&client_id=${UNSPLASH_ACCESS_KEY}`
      ).then(res => res.ok ? res.json() : { results: [] });
      // Pexels fetch
      const pexelsPromise = fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=1&per_page=${PER_PAGE}`,
        { headers: { Authorization: PEXELS_API_KEY } }
      ).then(res => res.ok ? res.json() : { photos: [] });
      // Wait for both
      const [unsplashData, pexelsData] = await Promise.all([unsplashPromise, pexelsPromise]);
      // Normalize
      const unsplashImages = (unsplashData.results || []).map((img: any) => ({
        id: 'u_' + img.id,
        url: img.urls.small,
        width: img.width,
        height: img.height,
      }));
      const pexelsImages = (pexelsData.photos || []).map((img: any) => ({
        id: 'p_' + img.id,
        url: img.src.medium,
        width: img.width,
        height: img.height,
      }));
      setPinImages([...unsplashImages, ...pexelsImages]);
    } catch {
      setPinImages([]);
    } finally {
      setPinLoading(false);
    }
  };

  // Open pin modal and fetch images
  const handleSendPin = (imageUrl: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      imageUri: imageUrl,
      sender: 'me',
      timestamp: Date.now(),
      status: blocked ? 'not sent' : 'sent',
    };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    saveMessages(newMessages);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    setPinModalVisible(false);
  };

  // Simulate "seen" status after 2 seconds (only if not blocked and not 'not sent')
  useEffect(() => {
    if (
      messages.length > 0 &&
      messages[messages.length - 1].sender === 'me' &&
      messages[messages.length - 1].status === 'sent'
    ) {
      const timer = setTimeout(() => {
        setMessages(msgs =>
          msgs.map((msg, idx) =>
            idx === msgs.length - 1 && msg.status === 'sent'
              ? { ...msg, status: 'seen' }
              : msg
          )
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Images the user has sent as pins
  const yourPins = messages.filter(m => m.sender === 'me' && m.imageUri).map(m => ({ id: m.id, url: m.imageUri! }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header with back button, profile icon, username, and three dots */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 6 }}>
              <Ionicons
                name="arrow-back"
                size={28}
                color={isDarkMode ? '#F3FAF8' : '#181D1C'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/UserProfileScreen', params: { username: safeUsername } })}
              style={styles.profileIconWrapper}
              hitSlop={10}
            >
              <Ionicons
                name="person-circle-outline"
                size={38}
                color={isDarkMode ? '#F3FAF8' : '#181D1C'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/UserProfileScreen', params: { username: safeUsername } })}
              hitSlop={10}
            >
              <Text style={[styles.headerName, { color: textColor }]}>{safeUsername}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: '/chat/settings/[username]', params: { username: safeUsername } })
              }
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={28}
                color={isDarkMode ? '#F3FAF8' : '#181D1C'}
              />
          </TouchableOpacity>
        </View>
          {/* (keep the replyTo text above the input box only, as already present below the FlatList) */}
        <FlatList
          ref={flatListRef}
            data={messages.filter(m => !(m.deletedFor || []).includes(user?.id || 'unknown'))}
          keyExtractor={item => item.id}
            renderItem={({ item, index }) => {
              const isReplying = replyTo && replyTo.id === item.id;
              if (!swipeableRefs.current[item.id]) {
                swipeableRefs.current[item.id] = createRef();
              }
              return (
                <Swipeable
                  ref={swipeableRefs.current[item.id]}
                  renderLeftActions={() => <View style={{ width: 60 }} />}
                  renderRightActions={undefined}
                  onSwipeableLeftOpen={() => {
                    setReplyTo(item);
                    setTimeout(() => swipeableRefs.current[item.id]?.current?.close(), 100);
                  }}
                  friction={2.5}
                  overshootFriction={2.5}
                >
                  <TouchableWithoutFeedback
                    onLongPress={() => {
                      setSelectedMsg(item);
                      setEditText(item.text || '');
                      setActionSheetVisible(true);
                    }}
                    onPress={() => {
                      if (item.imageUri) setImagePreviewUri(item.imageUri);
                    }}
                  >
                    <View>
                      {/* Centered timestamp above bubble */}
                      {shouldShowTimestamp(index, messages) && (
                        <Text style={{ textAlign: 'center', color: '#888', fontSize: 12, marginBottom: 2 }}>
                          {formatChatTimestamp(item.timestamp)}
                        </Text>
                      )}
                      {/* Faded replied-to text above the message bubble, not inside, only if not currently replying */}
                      {item.replyTo && (!replyTo || replyTo.id !== item.id) && !item.deletedForEveryone && (() => {
                        const repliedMsg = messages.find(m => m.id === item.replyTo);
                        if (!repliedMsg) return null;
                        return (
                          <Text style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', marginBottom: 2, textAlign: item.sender === 'me' ? 'right' : 'left' }} numberOfLines={2}>
                            {repliedMsg.imageUri ? 'image' : repliedMsg.text || ''}
                          </Text>
                        );
                      })()}
            <View
              style={[
                styles.messageRow,
                item.sender === 'me'
                            ? [styles.myMsg, { backgroundColor: '#7BD4C8' }]
                            : [styles.theirMsg, { backgroundColor: '#7BD4C8' }],
                          item.imageUri && { backgroundColor: 'transparent', padding: 0, marginBottom: 8 },
                        ]}
                      >
                        {item.imageUri ? (
                          <TouchableOpacity onPress={() => setImagePreviewUri(item.imageUri)}>
                            <Image source={{ uri: item.imageUri }} style={{ width: 180, height: 180, borderRadius: 12 }} resizeMode="cover" />
                          </TouchableOpacity>
                        ) : null}
                        {item.text && (
                          <Text
                            style={[
                              styles.msgText,
                              {
                                fontStyle: item.deletedForEveryone ? 'italic' : 'normal',
                                color: item.deletedForEveryone ? '#888' : '#181D1C',
                              },
                            ]}
                          >
                            {item.text}
                          </Text>
                        )}
                        {item.edited && !item.deletedForEveryone && (
                          <Text style={{ color: '#aaa', fontSize: 11, textAlign: 'right', marginTop: 2 }}>edited</Text>
                        )}
                      </View>
                      {/* Sent/Seen/Not sent status with extra spacing */}
                      {item.sender === 'me' && (
                        <Text style={[styles.statusText, { marginTop: 8 }]}> {/* Add marginTop for spacing */}
                          {item.status === 'seen'
                            ? 'Seen'
                            : item.status === 'sent'
                            ? 'Sent'
                            : item.status === 'not sent'
                            ? 'Not sent'
                            : ''}
                        </Text>
                      )}
                    </View>
                  </TouchableWithoutFeedback>
                </Swipeable>
              );
            }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardDismissMode="on-drag"
          />
          {blocked && (
            <Text style={{ color: '#FF6B6B', textAlign: 'center', marginBottom: 8 }}>
              You can't send messages to this user.
            </Text>
          )}
          {/* Edit mode UI */}
          {editMode && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor, color: textColor, borderColor: isDarkMode ? '#333' : '#ccc' }]}
                value={editText}
                onChangeText={setEditText}
                placeholder="Edit message..."
                placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              />
              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: '#27403B' }]} onPress={handleEdit}>
                <Text style={styles.sendBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditMode(false); setEditText(''); setSelectedMsg(null); setActionSheetVisible(false); }}>
                <Ionicons name="close" size={22} color="#888" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}
          {/* Faded replied-to text above the input box, multiline, no label */}
          {replyTo && (
            <View style={{ padding: 8, backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED', borderRadius: 8, marginBottom: 4, flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', flex: 1 }} numberOfLines={2}>
                {replyTo.imageUri ? 'image' : replyTo.text}
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)} style={{ marginLeft: 8, marginTop: 2 }}>
                <Ionicons name="close" size={18} color="#888" />
              </TouchableOpacity>
            </View>
          )}
        <View style={[styles.inputRow, { backgroundColor }]}>
            {/* Plus (+) button for pins */}
            <TouchableOpacity style={{ marginRight: 8 }} onPress={handlePlusPress}>
              <Ionicons name="add" size={28} color={textColor} />
            </TouchableOpacity>
          <TextInput
            style={[
              styles.input,
                { backgroundColor, color: textColor, borderColor: isDarkMode ? '#333' : '#ccc', minHeight: 40, maxHeight: 120, height: inputHeight },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
              onSubmitEditing={blocked ? undefined : (editMode ? handleEdit : handleSend)}
            returnKeyType="send"
              editable={!blocked && !editMode}
              multiline
              onContentSizeChange={e => {
                const h = Math.min(120, Math.max(40, e.nativeEvent.contentSize.height));
                setInputHeight(h);
              }}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: '#27403B', opacity: blocked ? 0.5 : 1 }]}
              onPress={blocked ? undefined : (editMode ? handleEdit : handleSend)}
              disabled={blocked}
            >
              <Text style={styles.sendBtnText}>{editMode ? 'Save' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
          {/* Action Sheet for long-press */}
          <Modal visible={actionSheetVisible} transparent animationType="fade" onRequestClose={() => setActionSheetVisible(false)}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }} onPress={() => setActionSheetVisible(false)}>
              <View style={{ backgroundColor: isDarkMode ? '#232B2B' : '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 }}>
                {/* Delete for me (always) */}
                <TouchableOpacity onPress={() => handleDelete(false)} style={{ padding: 16 }}>
                  <Text style={{ color: textColor, fontWeight: 'bold' }}>Delete for me</Text>
                </TouchableOpacity>
                {/* Delete for everyone (only for my text) */}
                {selectedMsg && selectedMsg.sender === 'me' && (
                  <TouchableOpacity onPress={() => handleDelete(true)} style={{ padding: 16 }}>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Delete for everyone</Text>
                  </TouchableOpacity>
                )}
                {/* Reply (always) */}
                <TouchableOpacity onPress={handleReply} style={{ padding: 16 }}>
                  <Text style={{ color: textColor, fontWeight: 'bold' }}>Reply</Text>
              </TouchableOpacity>
                {/* Edit (if applicable) */}
                {selectedMsg && canEdit(selectedMsg) && selectedMsg.sender === 'me' && (
                  <TouchableOpacity onPress={() => { setEditMode(true); setActionSheetVisible(false); }} style={{ padding: 16 }}>
                    <Text style={{ color: textColor, fontWeight: 'bold' }}>Edit</Text>
              </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setActionSheetVisible(false)} style={{ padding: 16 }}>
                  <Text style={{ color: textColor }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
          {/* Image preview modal */}
          <Modal visible={!!imagePreviewUri} transparent animationType="fade" onRequestClose={() => setImagePreviewUri(null)}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setImagePreviewUri(null)}>
              {imagePreviewUri && (
                <Image source={{ uri: imagePreviewUri }} style={{ width: '90%', height: '70%', borderRadius: 18 }} resizeMode="contain" />
              )}
            </Pressable>
          </Modal>
          {/* Pin Picker Modal */}
          <Modal visible={pinModalVisible} transparent animationType="fade" onRequestClose={() => setPinModalVisible(false)}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={() => setPinModalVisible(false)}>
              <View style={{
                backgroundColor: isDarkMode ? '#232B2B' : '#fff',
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                paddingHorizontal: 18,
                paddingTop: 18,
                paddingBottom: 28,
                height: '80%',
                width: '100%',
              }}>
                <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>Send a clip</Text>
                {/* Search bar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8', borderRadius: 10, paddingHorizontal: 8 }}>
                  <RNTextInput
                    style={{ flex: 1, color: textColor, fontSize: 16, paddingVertical: 8 }}
                    placeholder="Search category (e.g. cars, art, food)"
                    placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                    value={pinSearch}
                    onChangeText={setPinSearch}
                    onSubmitEditing={() => fetchPinImages()}
                    returnKeyType="search"
                  />
                  <TouchableOpacity onPress={() => fetchPinImages()} style={{ marginLeft: 6 }}>
                    <Ionicons name="search" size={22} color={textColor} />
                  </TouchableOpacity>
                </View>
                {/* Tabs: All / Yours */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => setPinTab('all')}
                    style={{
                      backgroundColor: pinTab === 'all' ? (isDarkMode ? '#7BD4C8' : '#7BD4C8') : 'transparent',
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 18,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: pinTab === 'all' ? '#181D1C' : textColor, fontWeight: 'bold' }}>All</Text>
                  </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setPinTab('yours')}
                    style={{
                      backgroundColor: pinTab === 'yours' ? (isDarkMode ? '#7BD4C8' : '#7BD4C8') : 'transparent',
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 18,
                    }}
                  >
                    <Text style={{ color: pinTab === 'yours' ? '#181D1C' : textColor, fontWeight: 'bold' }}>Yours</Text>
                  </TouchableOpacity>
                </View>
                {/* Grid of pins */}
                {pinLoading && pinTab === 'all' ? (
                  <ActivityIndicator size="large" color={textColor} style={{ margin: 32 }} />
                ) : (
                  <MasonryList
                    data={pinTab === 'all' ? pinImages : yourPins}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                      const pin = item as { id: string; url: string; width?: number; height?: number };
                      const displayWidth = 170;
                      const displayHeight = pin.width && pin.height
                        ? Math.round((pin.height / pin.width) * displayWidth)
                        : 170;
                      return (
                        <TouchableOpacity onPress={() => handleSendPin(pin.url)} style={{ margin: 8 }}>
                          <Image source={{ uri: pin.url }} style={{ width: displayWidth, height: displayHeight, borderRadius: 18 }} resizeMode="cover" />
                </TouchableOpacity>
                      );
                    }}
                    contentContainerStyle={{ paddingBottom: 24, alignItems: 'center', justifyContent: 'center' }}
                    style={{ flex: 1 }}
                    ListEmptyComponent={
                      pinTab === 'all' ? (
                        <Text style={{ color: textColor, textAlign: 'center', marginTop: 24 }}>
                          No pins found.
                        </Text>
                      ) : (
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 48 }}>
                          <Ionicons name="image-outline" size={64} color={isDarkMode ? '#7BD4C8' : '#181D1C'} style={{ marginBottom: 18 }} />
                          <Text style={{ color: isDarkMode ? '#F3FAF8' : '#181D1C', fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                            You don't have any clips saved yet
                          </Text>
                          <Text style={{ color: isDarkMode ? '#aaa' : '#555', fontSize: 15, textAlign: 'center', opacity: 0.7 }}>
                            Saved clips will appear here for quick sharing.
                          </Text>
                        </View>
                      )
                    }
                  />
                )}
            </View>
          </Pressable>
        </Modal>
      </View>
    </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 6,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    marginTop: 40,
  },
  profileIconWrapper: {
    marginRight: 10,
  },
  headerName: {
    fontSize: 17,
  },
  messageRow: {
    maxWidth: '80%',
    borderRadius: 13,
    padding: 10,
    marginLeft: 8,
    marginRight: 8,
  },
  myMsg: {
    alignSelf: 'flex-end',
  },
  theirMsg: {
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  msgText: { fontSize: 16 },
  statusText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginRight: 8,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  sendBtn: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendBtnText: {
    color: '#F3FAF8',
    fontSize: 16,
  },
});