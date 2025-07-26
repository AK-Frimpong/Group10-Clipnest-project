import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
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

interface GroupMessage {
  id: string;
  text?: string;
  imageUri?: string;
  audioUri?: string;
  sender: string; // user ID
  senderName: string; // display name
  timestamp: number;
  status: 'sent' | 'seen' | 'not sent';
  replyTo?: string;
  deletedFor?: string[];
  edited?: boolean;
  deletedForEveryone?: boolean;
}

interface Group {
  id: string;
  name: string;
  participants: string[];
  admins: string[];
  createdBy: string;
  createdAt: number;
}

// Dummy user data for participant names
const DUMMY_USERS = [
  { id: '1', username: 'janedoe', name: 'Jane Doe' },
  { id: '2', username: 'johndoe', name: 'John Doe' },
  { id: '3', username: 'minimalist', name: 'Minimalist User' },
  { id: '4', username: 'artlover', name: 'Art Lover' },
  { id: '5', username: 'jermaine', name: 'Jermaine' },
];

export default function GroupChatScreen() {
  const { user } = useUser();
  const { groupId, groupName } = useLocalSearchParams();
  const safeGroupId = Array.isArray(groupId) ? groupId[0] : groupId;
  const safeGroupName = Array.isArray(groupName) ? groupName[0] : groupName;
  const { backgroundColor, textColor, cardColor, isDarkMode } = useThemeContext();
  
  // Handle case where user is not logged in
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }}>
        <Text style={{ color: isDarkMode ? '#F3FAF8' : '#222', fontSize: 18, textAlign: 'center', padding: 24 }}>
          Please log in to start chatting.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 12, backgroundColor: '#27403B', borderRadius: 8 }}>
          <Text style={{ color: '#F3FAF8', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState('');
  const [group, setGroup] = useState<Group | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const swipeableRefs = useRef<{ [id: string]: any }>({});
  const storageKey = `group_messages_${safeGroupId}`;
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<GroupMessage | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState('');
  const [replyTo, setReplyTo] = useState<GroupMessage | null>(null);
  const [inputHeight, setInputHeight] = useState(40);
  const [imagePreviewUri, setImagePreviewUri] = useState<string | null>(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinImages, setPinImages] = useState<{ id: string; url: string }[]>([]);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSearch, setPinSearch] = useState('');
  const [pinTab, setPinTab] = useState<'all' | 'yours'>('all');
  const [isRecording, setIsRecording] = useState(false);
  
  // Audio recording and playback state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioDurations, setAudioDurations] = useState<{ [key: string]: number }>({});
  const [playbackPositions, setPlaybackPositions] = useState<{ [key: string]: number }>({});
  const recordingTimerRef = useRef<any>(null);

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

  // Request audio permissions
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Audio permission not granted');
      }
    })();
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start timer for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Cancel recording
  const cancelRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setIsRecording(false);
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      setRecordingDuration(0);
      
    } catch (err) {
      console.error('Failed to cancel recording', err);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      
      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      if (uri && recordingDuration > 1) {
        // Send the voice note
        const newMsg: GroupMessage = {
          id: Date.now().toString(),
          audioUri: uri,
          sender: user?.id || '',
          senderName: user?.id || 'You',
          timestamp: Date.now(),
          status: 'sent',
        };
        
        const newMessages = [...messages, newMsg];
        setMessages(newMessages);
        saveMessages(newMessages);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
      
      setRecordingDuration(0);
      
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  // Play audio
  const playAudio = async (audioUri: string, messageId: string) => {
    try {
      // Stop currently playing audio
      if (sound) {
        await sound.unloadAsync();
      }
      // Set audio mode to use main speaker
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setCurrentlyPlaying(messageId);
      
      // Get audio duration if not already stored
      if (!audioDurations[messageId]) {
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setAudioDurations(prev => ({
            ...prev,
            [messageId]: status.durationMillis || 0
          }));
        }
      }
      
      // Listen for playback status
      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          // Update playback position
          setPlaybackPositions(prev => ({
            ...prev,
            [messageId]: status.positionMillis || 0
          }));
          
          if (status.didJustFinish) {
            setCurrentlyPlaying(null);
            setPlaybackPositions(prev => ({
              ...prev,
              [messageId]: 0
            }));
          }
        }
      });
      
    } catch (err) {
      console.error('Failed to play audio', err);
    }
  };

  // Stop audio
  const stopAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setCurrentlyPlaying(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load messages from AsyncStorage
  useFocusEffect(
    React.useCallback(() => {
      const loadMessages = async () => {
        try {
          const stored = await AsyncStorage.getItem(storageKey);
          if (stored) {
            setMessages(JSON.parse(stored));
          } else {
            setMessages([]);
          }
        } catch {}
      };
      loadMessages();
    }, [storageKey])
  );

  // Save messages to AsyncStorage
  const saveMessages = async (msgs: GroupMessage[]) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch {}
  };

  // Helper: can edit within 15 minutes
  const canEdit = (msg: GroupMessage) =>
    msg.sender === user?.id && Date.now() - msg.timestamp < 15 * 60 * 1000;

  // Helper: show timestamp if first message or 1hr+ since previous
  function shouldShowTimestamp(idx: number, msgs: GroupMessage[]) {
    if (idx === 0) return true;
    const prev = msgs[idx - 1];
    return msgs[idx].timestamp - prev.timestamp > 60 * 60 * 1000;
  }

  // Format timestamp for chat
  function formatChatTimestamp(ts: number) {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Get sender name
  const getSenderName = (senderId: string) => {
    if (senderId === user?.id) return 'You';
    const dummyUser = DUMMY_USERS.find(u => u.id === senderId);
    return dummyUser?.name || senderId;
  };

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
            ? { ...m, text: 'This message was deleted.', deletedForEveryone: true, edited: false, audioUri: undefined, imageUri: undefined }
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
    const newMsg: GroupMessage = {
      id: Date.now().toString(),
      text: input,
      sender: user?.id || '',
      senderName: getSenderName(user?.id || ''),
      timestamp: Date.now(),
      status: 'sent',
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
    const newMsg: GroupMessage = {
      id: Date.now().toString(),
      imageUri: imageUrl,
      sender: user?.id || '',
      senderName: getSenderName(user?.id || ''),
      timestamp: Date.now(),
      status: 'sent',
    };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    saveMessages(newMessages);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    setPinModalVisible(false);
  };

  // Images the user has sent as pins
  const yourPins = messages.filter(m => m.sender === user?.id && m.imageUri).map(m => ({ id: m.id, url: m.imageUri! }));

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header with back button, group name, and three dots */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 6 }}>
              <Ionicons
                name="arrow-back"
                size={28}
                color={isDarkMode ? '#F3FAF8' : '#181D1C'}
              />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[styles.headerName, { color: textColor }]}>{safeGroupName}</Text>
              <Text style={[styles.headerSubtitle, { color: isDarkMode ? '#aaa' : '#666' }]}>
                {group?.participants.length || 0} members
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/chat/group-settings',
                  params: { groupId: safeGroupId }
                });
              }}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={28}
                color={isDarkMode ? '#F3FAF8' : '#181D1C'}
              />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages.filter(m => !(m.deletedFor || []).includes(user?.id || 'unknown'))}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const isReplying = replyTo && replyTo.id === item.id;
            const isMyMessage = item.sender === user?.id;
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
                    {/* Faded replied-to text above the message bubble */}
                    {item.replyTo && (!replyTo || replyTo.id !== item.id) && !item.deletedForEveryone && (() => {
                      const repliedMsg = messages.find(m => m.id === item.replyTo);
                      if (!repliedMsg) return null;
                      return (
                        <Text style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', marginBottom: 2, textAlign: isMyMessage ? 'right' : 'left' }} numberOfLines={2}>
                          {repliedMsg.imageUri ? 'image' : repliedMsg.audioUri ? 'voice message' : repliedMsg.text || ''}
                        </Text>
                      );
                    })()}
                    {/* Sender name above the message bubble */}
                    {!isMyMessage && (
                      <Text style={[styles.senderName, { color: '#181D1C' }]}>
                        {item.senderName}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.messageRow,
                        isMyMessage
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
                      {item.audioUri && !item.deletedForEveryone ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, width: 220 }}>
                          <TouchableOpacity
                            onPress={() => {
                              if (currentlyPlaying === item.id) {
                                stopAudio();
                              } else {
                                playAudio(item.audioUri!, item.id);
                              }
                            }}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 20,
                              backgroundColor: isDarkMode ? '#333' : '#fff',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginRight: 12,
                            }}
                          >
                            <Ionicons
                              name={currentlyPlaying === item.id ? 'pause' : 'play'}
                              size={20}
                              color={isDarkMode ? '#F3FAF8' : '#181D1C'}
                            />
                          </TouchableOpacity>
                          <View style={{ flex: 1 }}>
                            <View style={{ height: 4, backgroundColor: isDarkMode ? '#444' : '#ddd', borderRadius: 2, marginBottom: 4 }}>
                              <View 
                                style={{ 
                                  width: audioDurations[item.id] ? `${(playbackPositions[item.id] || 0) / audioDurations[item.id] * 100}%` : '0%', 
                                  height: '100%', 
                                  backgroundColor: '#7BD4C8', 
                                  borderRadius: 2 
                                }} 
                              />
                            </View>
                            <Text style={{ color: '#181D1C', fontSize: 12 }}>
                              Voice message
                            </Text>
                          </View>
                          <Text style={{ color: '#181D1C', fontSize: 12, marginLeft: 8 }}>
                            {audioDurations[item.id] ? formatDuration(Math.floor(audioDurations[item.id] / 1000)) : '0:00'}
                          </Text>
                        </View>
                      ) : null}
                      {item.text && (
                        <Text
                          style={[
                            styles.msgText,
                            {
                              fontStyle: item.deletedForEveryone ? 'italic' : 'normal',
                              color: item.deletedForEveryone ? '#181D1C' : '#181D1C',
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
                    {isMyMessage && (
                      <Text style={[styles.statusText, { marginTop: 8 }]}>
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

        {/* Edit mode UI */}
        {editMode && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor, color: textColor, borderColor: isDarkMode ? '#F3FAF8' : '#181D1C' }]}
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

        {/* Faded replied-to text above the input box */}
        {replyTo && (
          <View style={{ padding: 8, backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED', borderRadius: 8, marginBottom: 4, flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', flex: 1 }} numberOfLines={2}>
              {replyTo.imageUri ? 'image' : replyTo.audioUri ? 'voice message' : replyTo.text}
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)} style={{ marginLeft: 8, marginTop: 2 }}>
              <Ionicons name="close" size={18} color="#888" />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputRow, { backgroundColor }]}>
          {/* Microphone button */}
          <TouchableOpacity
            style={{ marginRight: 8 }}
            onPress={async () => {
              if (isRecording) {
                await stopRecording();
              } else {
                await startRecording();
              }
            }}
          >
            <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={28} color={isRecording ? '#E74C3C' : textColor} />
          </TouchableOpacity>
          
          {/* Cancel recording button */}
          {isRecording && (
            <TouchableOpacity
              style={{ marginRight: 8 }}
              onPress={cancelRecording}
            >
              <Ionicons name="close-circle" size={28} color="#E74C3C" />
            </TouchableOpacity>
          )}
          
          {/* Plus (+) button for pins */}
          {!isRecording && (
            <TouchableOpacity style={{ marginRight: 8 }} onPress={handlePlusPress}>
              <Ionicons name="add" size={28} color={textColor} />
            </TouchableOpacity>
          )}
          
          <TextInput
            style={[
              styles.input,
              { backgroundColor, color: textColor, borderColor: isDarkMode ? '#F3FAF8' : '#181D1C', minHeight: 40, maxHeight: 120, height: inputHeight },
              isRecording && { color: '#aaa', fontStyle: 'italic' },
            ]}
            value={isRecording ? `Recording... ${formatDuration(recordingDuration)}` : input}
            onChangeText={text => {
              if (!isRecording) setInput(text);
            }}
            placeholder={isRecording ? 'Recording...' : "Type a message..."}
            placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
            onSubmitEditing={editMode ? handleEdit : handleSend}
            returnKeyType="send"
            editable={!editMode}
            multiline
            onContentSizeChange={e => {
              const h = Math.min(120, Math.max(40, e.nativeEvent.contentSize.height));
              setInputHeight(h);
            }}
          />
          
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: '#27403B', opacity: 1 }]}
            onPress={editMode ? handleEdit : handleSend}
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
              {selectedMsg && selectedMsg.sender === user?.id && (
                <TouchableOpacity onPress={() => handleDelete(true)} style={{ padding: 16 }}>
                  <Text style={{ color: textColor, fontWeight: 'bold' }}>Delete for everyone</Text>
                </TouchableOpacity>
              )}
              {/* Reply (always) */}
              <TouchableOpacity onPress={handleReply} style={{ padding: 16 }}>
                <Text style={{ color: textColor, fontWeight: 'bold' }}>Reply</Text>
              </TouchableOpacity>
              {/* Edit (if applicable) */}
              {selectedMsg && canEdit(selectedMsg) && selectedMsg.sender === user?.id && selectedMsg.text && (
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
                <FlatList
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
  headerName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
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
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderIcon: {
    marginRight: 8,
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