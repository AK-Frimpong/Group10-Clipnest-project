import { Feather, Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { PanGestureHandler, Swipeable } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useThemeContext } from '../theme/themecontext';
import { ImageItem, PinBoardContext } from './context/PinBoardContext';

const screenWidth = Dimensions.get('window').width;

export default function ImageDetailsScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeContext();
  const { index, images } = useLocalSearchParams();
  const imagesArray = useMemo(() => {
    try {
      return images ? JSON.parse(images as string) : [];
    } catch {
      return [];
    }
  }, [images]);
  const [currentIndex, setCurrentIndex] = useState(Number(index) || 0);
  const currentImage = imagesArray[currentIndex];
  
  // Calculate image height based on aspect ratio
  const imageHeight = useMemo(() => {
    if (!currentImage?.width || !currentImage?.height) return 400; // fallback height
    const aspectRatio = currentImage.height / currentImage.width;
    return screenWidth * aspectRatio;
  }, [currentImage]);
  
  // Like state
  const [likes, setLikes] = useState(123);
  const [liked, setLiked] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  
  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  // Double tap to like
  const handleDoubleTap = () => {
    if (!liked) {
      setLiked(true);
      setLikes((prev) => prev + 1);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }
  };

  // Mock user data for the post
  const postUser = {
    id: '1',
    username: 'john_doe',
    name: 'John Doe',
    avatar: null,
    followers: 1234,
    isFollowing: false
  };

  const { addToCollage, pins } = useContext(PinBoardContext) as {
    addToCollage: (image: ImageItem) => void;
    pins: ImageItem[];
  };

  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const commentInputRef = useRef<TextInput>(null);
  
  // Mention functionality
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // Mock users data (replace with real data from backend)
  const allUsers = [
    { id: '1', username: 'john_doe', name: 'John Doe', isFollowing: true, isFollower: true, avatar: null },
    { id: '2', username: 'jane_smith', name: 'Jane Smith', isFollowing: true, isFollower: false, avatar: null },
    { id: '3', username: 'mike_wilson', name: 'Mike Wilson', isFollowing: false, isFollower: true, avatar: null },
    { id: '4', username: 'sarah_jones', name: 'Sarah Jones', isFollowing: false, isFollower: false, avatar: null },
    { id: '5', username: 'alex_brown', name: 'Alex Brown', isFollowing: true, isFollower: true, avatar: null },
    { id: '6', username: 'emma_davis', name: 'Emma Davis', isFollowing: false, isFollower: false, avatar: null },
    { id: '7', username: 'chris_lee', name: 'Chris Lee', isFollowing: true, isFollower: false, avatar: null },
    { id: '8', username: 'lisa_garcia', name: 'Lisa Garcia', isFollowing: false, isFollower: true, avatar: null },
    { id: '9', username: 'david_miller', name: 'David Miller', isFollowing: true, isFollower: true, avatar: null },
    { id: '10', username: 'sophia_taylor', name: 'Sophia Taylor', isFollowing: false, isFollower: false, avatar: null },
    { id: '11', username: 'james_anderson', name: 'James Anderson', isFollowing: true, isFollower: false, avatar: null },
    { id: '12', username: 'olivia_white', name: 'Olivia White', isFollowing: false, isFollower: true, avatar: null },
  ];

  // Get filtered and sorted users for mentions
  const getMentionSuggestions = () => {
    if (!mentionQuery) return [];
    
    const query = mentionQuery.toLowerCase();
    const filtered = allUsers.filter(user => 
      user.username.toLowerCase().includes(query) || 
      user.name.toLowerCase().includes(query)
    );
    
    // Sort: followers & following first, then others
    return filtered.sort((a, b) => {
      const aScore = (a.isFollowing ? 2 : 0) + (a.isFollower ? 1 : 0);
      const bScore = (b.isFollowing ? 2 : 0) + (b.isFollower ? 1 : 0);
      return bScore - aScore;
    });
  };

  // Handle text input changes for mentions
  const handleCommentTextChange = (text: string) => {
    setCommentText(text);
    
    // Check for @ symbol
    const lastAtSymbol = text.lastIndexOf('@');
    if (lastAtSymbol !== -1 && lastAtSymbol < text.length - 1) {
      const query = text.substring(lastAtSymbol + 1);
      setMentionQuery(query);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  // Handle user selection from mention suggestions
  const handleMentionSelect = (user: any) => {
    const lastAtSymbol = commentText.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const beforeMention = commentText.substring(0, lastAtSymbol);
      const afterMention = commentText.substring(lastAtSymbol + mentionQuery.length + 1);
      const newText = `${beforeMention}@${user.username} ${afterMention}`;
      setCommentText(newText);
    }
    setShowMentionSuggestions(false);
    setMentionQuery('');
  };

  // Flatten all comments and replies for counting
  const getTotalCommentCount = () => {
    let count = comments.length;
    comments.forEach(comment => {
      if (comment.replies) {
        count += comment.replies.length;
      }
    });
    return count;
  };

  // Flatten all comments and replies for rendering
  const getFlattenedComments = () => {
    const flattened: any[] = [];
    
    const addCommentAndReplies = (comment: any, depth = 0) => {
      console.log(`Adding comment at depth ${depth}:`, comment.id, comment.text);
      flattened.push({ ...comment, isMainComment: depth === 0, replyDepth: depth });
      if (comment.replies && comment.replies.length > 0) {
        console.log(`Comment ${comment.id} has ${comment.replies.length} replies`);
        comment.replies.forEach((reply: any) => {
          addCommentAndReplies(reply, depth + 1);
        });
      }
    };
    
    comments.forEach(comment => {
      addCommentAndReplies(comment);
    });
    
    console.log('Final flattened comments:', flattened.length, flattened.map(c => ({ id: c.id, text: c.text, depth: c.replyDepth })));
    return flattened;
  };

  // Format timestamp for comments (similar to chat screen)
  const formatCommentTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d`;
    }
    
    // More than 7 days - show date
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const handleCommentLike = (commentId: string) => {
    setLikedComments(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(commentId)) {
        newLiked.delete(commentId);
      } else {
        newLiked.add(commentId);
      }
      return newLiked;
    });
    
    // Update likes for both main comments and replies
    setComments(prev => {
      const updateCommentLikes = (commentList: any[]): any[] => {
        return commentList.map(comment => {
          if (comment.id === commentId) {
            const isLiked = likedComments.has(commentId);
            return {
              ...comment,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1
            };
          }
          // Check replies
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies)
            };
          }
          return comment;
        });
      };
      
      return updateCommentLikes(prev);
    });
  };

  const handleAddComment = () => {
    if (commentText.trim().length === 0) return;
    
    if (isEditing && selectedComment) {
      // Edit existing comment
      setComments(prev => prev.map(comment => 
        comment.id === selectedComment.id 
          ? { ...comment, text: commentText, edited: true }
          : comment
      ));
      setCommentText('');
      setIsEditing(false);
      setSelectedComment(null);
    } else if (replyingTo) {
      // Add reply to comment
      const newReply = {
        id: Date.now().toString(),
        user: {
          name: 'You',
          avatar: null,
        },
        text: commentText,
        time: Date.now(), // Use actual timestamp
        likes: 0,
        parentId: replyingTo.id,
        repliedTo: replyingTo.user.name,
        replies: []
      };
      
      console.log('Adding reply:', newReply);
      console.log('Replying to comment:', replyingTo.id);
      
      setComments(prev => {
        // Recursively find and update the parent comment
        const updateCommentReplies = (commentList: any[]): any[] => {
          return commentList.map(comment => {
            if (comment.id === replyingTo.id) {
              // Found the parent comment, add the reply
              return { ...comment, replies: [...(comment.replies || []), newReply] };
            }
            // Check if this comment has replies and search there
            if (comment.replies && comment.replies.length > 0) {
              return { ...comment, replies: updateCommentReplies(comment.replies) };
            }
            return comment;
          });
        };
        
        const updated = updateCommentReplies(prev);
        console.log('Updated comments:', updated);
        return updated;
      });
      setCommentText('');
      setReplyingTo(null);
    } else {
      // Add new comment
      setComments(prev => [
        {
          id: Date.now().toString(),
          user: {
            name: 'You',
            avatar: null,
          },
          text: commentText,
          time: Date.now(), // Use actual timestamp
          likes: 0,
          replies: []
        },
        ...prev,
      ]);
      setCommentText('');
    }
    Keyboard.dismiss();
  };

  const renderComment = (comment: any, isReply = false, replyDepth = 0) => (
    <Swipeable
      renderRightActions={() => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Edit Action */}
          <TouchableOpacity
            style={{
              backgroundColor: '#4EE0C1',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: '100%',
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8
            }}
            onPress={() => {
              setSelectedComment(comment);
              setCommentText(comment.text);
              setIsEditing(true);
              setReplyingTo(null);
              // Focus the input after a short delay to ensure state updates
              setTimeout(() => {
                commentInputRef.current?.focus();
              }, 100);
            }}
          >
            <Ionicons name="create-outline" size={24} color="#F3FAF8" />
            <Text style={{ color: '#F3FAF8', fontSize: 12, marginTop: 4 }}>Edit</Text>
          </TouchableOpacity>
          
          {/* Delete Action */}
          <TouchableOpacity
            style={{
              backgroundColor: '#E74C3C',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              height: '100%'
            }}
            onPress={() => {
              if (isReply) {
                // Delete reply from parent comment
                setComments(prev => prev.map(c => 
                  c.id === comment.parentId 
                    ? { ...c, replies: c.replies.filter((r: any) => r.id !== comment.id) }
                    : c
                ));
              } else {
                // Delete main comment
                setComments(prev => prev.filter(c => c.id !== comment.id));
              }
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#F3FAF8" />
            <Text style={{ color: '#F3FAF8', fontSize: 12, marginTop: 4 }}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
      friction={2}
      rightThreshold={40}
    >
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        paddingHorizontal: isReply ? 20 + (replyDepth * 8) : 20, 
        paddingVertical: 14, 
        backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8',
        borderLeftWidth: isReply ? 2 : 0,
        borderLeftColor: isReply ? '#4EE0C1' : 'transparent',
        marginLeft: isReply ? 8 : 0
      }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: comment.user.avatar ? undefined : '#4EE0C1', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
          {comment.user.avatar ? (
            <Image source={{ uri: comment.user.avatar }} style={{ width: 38, height: 38, borderRadius: 19 }} />
          ) : (
            <Text style={{ color: '#F3FAF8', fontWeight: 'bold', fontSize: 18 }}>{comment.user.name.charAt(0)}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          {/* Show "replied to [user]" for nested replies */}
          {replyDepth > 1 && comment.repliedTo && (
            <Text style={{ color: isDarkMode ? '#888' : '#aaa', fontSize: 12, marginBottom: 2, fontStyle: 'italic' }}>
              replied to {comment.repliedTo}
            </Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ color: isDarkMode ? '#F3FAF8' : '#222', fontWeight: 'bold', fontSize: 15 }}>{comment.user.name}</Text>
            <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 13, marginLeft: 8 }}>{formatCommentTimestamp(comment.time)}</Text>
            {comment.edited && (
              <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 12, marginLeft: 8, fontStyle: 'italic' }}>(edited)</Text>
            )}
          </View>
          <Text style={{ color: isDarkMode ? '#F3FAF8' : '#222', fontSize: 15, marginBottom: 6 }}>{comment.text}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <TouchableOpacity onPress={() => {
              setReplyingTo(comment);
              // Focus the input after a short delay to ensure state updates
              setTimeout(() => {
                commentInputRef.current?.focus();
              }, 100);
            }}>
              <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 14 }}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCommentLike(comment.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name={likedComments.has(comment.id) ? 'heart' : 'heart-outline'} size={18} color={likedComments.has(comment.id) ? '#E74C3C' : isDarkMode ? '#aaa' : '#888'} />
              {comment.likes > 0 && <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 14 }}>{comment.likes}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Swipeable>
  );

  // If currentImage is undefined, show an error message
  if (!currentImage) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
        <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 18, textAlign: 'center', padding: 24 }}>
          Sorry, we couldn't load this image. Please try again from the home page.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 12, backgroundColor: '#222', borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Gesture logic (Reanimated 2+)
  const translateX = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      if (event.translationX < -80 && currentIndex < imagesArray.length - 1) {
        translateX.value = withSpring(-screenWidth, {}, () => {
          runOnJS(setCurrentIndex)(currentIndex + 1);
          translateX.value = 0;
        });
      } else if (event.translationX > 80 && currentIndex > 0) {
        translateX.value = withSpring(screenWidth, {}, () => {
          runOnJS(setCurrentIndex)(currentIndex - 1);
          translateX.value = 0;
        });
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const [modalVisible, setModalVisible] = useState(false);

  const handleShare = async () => {
    if (currentImage) {
      try {
        await Share.share({ message: currentImage.url });
      } catch {}
    }
    setModalVisible(false);
  };

  const handleDownload = async () => {
    if (currentImage) {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;
      try {
        // Download the image to a local file
        const fileUri = FileSystem.cacheDirectory + `clipnest_${Date.now()}.jpg`;
        const downloadRes = await FileSystem.downloadAsync(currentImage.url, fileUri);
        // Save the local file to the camera roll
        await MediaLibrary.createAssetAsync(downloadRes.uri);
        Alert.alert('Success', 'Image downloaded successfully');
      } catch {
        // Optionally, show an error alert here
      }
    }
    setModalVisible(false);
  };

  const handleAddToCollage = () => {
    if (currentImage) {
      addToCollage(currentImage as ImageItem);
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Image with shared element transition and swipe gesture */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.imageContainer, animatedStyle, { height: imageHeight }]}>
            <TouchableWithoutFeedback onPress={handleDoubleTap}>
              <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <View style={[styles.imageFrame, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
                  <Image
                    source={{ uri: currentImage?.url }}
                    style={[styles.image, { height: imageHeight, borderRadius: 12 }]}
                    resizeMode="contain"
                    // @ts-ignore: shared element prop for future animation
                    sharedTransitionTag={`image-${currentImage?.id}`}
                  />
                </View>
                {/* Double tap like animation */}
                {showLikeAnimation && (
                  <View style={styles.likeAnimationContainer}>
                    <Ionicons name="heart" size={80} color="#E74C3C" />
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>

        {/* User section */}
        <View style={[styles.userSection, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
          <TouchableOpacity 
            style={styles.userInfo}
            onPress={() => router.push({ pathname: '/UserProfileScreen', params: { username: postUser.username } })}
          >
            <View style={styles.userAvatar}>
              {postUser.avatar ? (
                <Image source={{ uri: postUser.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{postUser.name.charAt(0)}</Text>
              )}
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: isDarkMode ? '#F3FAF8' : '#222' }]}>{postUser.name}</Text>
              <Text style={[styles.userFollowers, { color: isDarkMode ? '#aaa' : '#888' }]}>{postUser.followers.toLocaleString()} followers</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.followButton, { backgroundColor: postUser.isFollowing ? 'transparent' : '#27403B', borderColor: postUser.isFollowing ? '#27403B' : 'transparent' }]}
            onPress={() => {
              // Toggle follow state
              postUser.isFollowing = !postUser.isFollowing;
            }}
          >
            <Text style={[styles.followButtonText, { color: postUser.isFollowing ? '#27403B' : '#F3FAF8' }]}>
              {postUser.isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#E74C3C' : isDarkMode ? '#fff' : '#222'} />
            <Text style={[styles.actionText, { color: isDarkMode ? '#F3FAF8' : '#222' }]}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setCommentsModalVisible(true)}>
            <Ionicons name="chatbubble-outline" size={26} color={isDarkMode ? '#F3FAF8' : '#222'} />
            <Text style={[styles.actionText, { color: isDarkMode ? '#F3FAF8' : '#222' }]}>{getTotalCommentCount()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Feather name="share" size={26} color={isDarkMode ? '#F3FAF8' : '#222'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
            <Feather name="more-horizontal" size={26} color={isDarkMode ? '#F3FAF8' : '#222'} />
          </TouchableOpacity>
        </View>

        {/* More to explore */}
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#F3FAF8' : '#222' }]}>More to explore</Text>
        <FlatList
          data={imagesArray.filter((_: any, i: number) => i !== currentIndex)}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.moreGrid}
          scrollEnabled={false}
          renderItem={({ item, index: idx }: { item: any; index: number }) => (
            <TouchableOpacity
              onPress={() => {
                const newIndex = imagesArray.findIndex((img: any) => img.id === item.id);
                router.push({
                  pathname: '/ImageDetailsScreen',
                  params: { index: newIndex, images: JSON.stringify(imagesArray) },
                });
              }}
            >
              <Image source={{ uri: item.url }} style={styles.moreGridImage} />
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* Comments Modal - Simplified to fix freezing */}
      <Modal visible={commentsModalVisible} transparent animationType="slide" onRequestClose={() => setCommentsModalVisible(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <Pressable style={{ flex: 1, justifyContent: 'flex-end' }} onPress={() => setCommentsModalVisible(false)}>
              <Pressable style={{ height: '80%', backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8', borderTopLeftRadius: 18, borderTopRightRadius: 18 }} onPress={(e) => e.stopPropagation()}>
                {/* Header */}
                <View style={{ paddingTop: 12, paddingBottom: 8, paddingHorizontal: 24 }}>
                  <View style={{ alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: isDarkMode ? '#333' : '#ccc', marginVertical: 6 }} />
                  </View>
                  <Text style={{ color: isDarkMode ? '#F3FAF8' : '#222', fontSize: 17, fontWeight: '600', marginBottom: 4 }}>
                    {getTotalCommentCount()} comment{getTotalCommentCount() !== 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Comments list */}
                <View style={{ flex: 1 }}>
                  {comments.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
                      <Ionicons name="chatbubble-ellipses-outline" size={54} color={isDarkMode ? '#444' : '#bbb'} style={{ marginBottom: 12 }} />
                      <Text style={{ color: isDarkMode ? '#888' : '#aaa', fontSize: 16 }}>No comments yet</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={getFlattenedComments()}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                        <View>
                          {renderComment(item, item.replyDepth > 0, item.replyDepth)}
                        </View>
                      )}
                      style={{ flex: 1 }}
                      contentContainerStyle={{ paddingBottom: 24 }}
                      showsVerticalScrollIndicator={true}
                    />
                  )}
                </View>

                {/* Comment Input */}
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#232323' : '#F3FAF8', margin: 12, borderRadius: 24, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: isDarkMode ? '#F3FAF8' : '#181D1C' }}>
                  <TextInput
                    ref={commentInputRef}
                    style={{ flex: 1, color: isDarkMode ? '#F3FAF8' : '#222', fontSize: 16, paddingVertical: 6 }}
                    placeholder={
                      isEditing 
                        ? "Edit your comment..." 
                        : replyingTo 
                        ? `Reply to ${replyingTo.user.name}...` 
                        : "Add a comment"
                    }
                    placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                    value={commentText}
                    onChangeText={handleCommentTextChange}
                    onSubmitEditing={handleAddComment}
                    returnKeyType="send"
                  />
                  
                  {(isEditing || replyingTo) && (
                    <TouchableOpacity 
                      onPress={() => {
                        setCommentText('');
                        setIsEditing(false);
                        setReplyingTo(null);
                        setSelectedComment(null);
                      }}
                      style={{ marginLeft: 8, padding: 8 }}
                    >
                      <Ionicons name="close" size={20} color={isDarkMode ? '#aaa' : '#888'} />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={{ 
                      backgroundColor: '#27403B', 
                      borderRadius: 20, 
                      paddingHorizontal: 16, 
                      paddingVertical: 8,
                      marginLeft: 8
                    }}
                    onPress={handleAddComment}
                  >
                    <Text style={{ color: '#F3FAF8', fontSize: 16, fontWeight: 'bold' }}>
                      {isEditing ? 'Save' : replyingTo ? 'Reply' : 'Send'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Mention Suggestions */}
                {showMentionSuggestions && (
                  <View style={{ 
                    position: 'absolute', 
                    bottom: 80, 
                    left: 12, 
                    right: 12, 
                    backgroundColor: isDarkMode ? '#232323' : '#F3FAF8', 
                    borderRadius: 12, 
                    maxHeight: 200,
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#444' : '#ccc',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    zIndex: 1000
                  }}>
                    <FlatList
                      data={getMentionSuggestions()}
                      keyExtractor={item => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => handleMentionSelect(item)}
                          style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            paddingHorizontal: 16, 
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: isDarkMode ? '#444' : '#eee'
                          }}
                        >
                          <View style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: 16, 
                            backgroundColor: item.avatar ? undefined : '#4EE0C1', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            marginRight: 12 
                          }}>
                            {item.avatar ? (
                              <Image source={{ uri: item.avatar }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                            ) : (
                              <Text style={{ color: '#F3FAF8', fontWeight: 'bold', fontSize: 14 }}>{item.name.charAt(0)}</Text>
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: isDarkMode ? '#F3FAF8' : '#222', fontWeight: '600', fontSize: 14 }}>
                              {item.name}
                            </Text>
                            <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 12 }}>
                              @{item.username}
                            </Text>
                          </View>
                          {(item.isFollowing || item.isFollower) && (
                            <View style={{ 
                              backgroundColor: '#4EE0C1', 
                              borderRadius: 8, 
                              paddingHorizontal: 6, 
                              paddingVertical: 2 
                            }}>
                              <Text style={{ color: '#F3FAF8', fontSize: 10, fontWeight: '600' }}>
                                {item.isFollowing && item.isFollower ? 'Mutual' : item.isFollowing ? 'Following' : 'Follower'}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>
                )}
              </Pressable>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Main Options Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setModalVisible(false)}>
          <Pressable style={{ backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 12, paddingBottom: 24, paddingHorizontal: 0 }} onPress={e => e.stopPropagation()}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: isDarkMode ? '#333' : '#ccc', marginVertical: 6 }} />
            </View>
            
            {/* Download Option */}
            <TouchableOpacity onPress={handleDownload} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 }}>
              <Ionicons name="download-outline" size={24} color={isDarkMode ? '#F3FAF8' : '#222'} style={{ marginRight: 16 }} />
              <Text style={{ color: isDarkMode ? '#F3FAF8' : '#222', fontSize: 16 }}>Download</Text>
            </TouchableOpacity>
            
            {/* Share Option */}
            <TouchableOpacity onPress={handleShare} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 }}>
              <Feather name="share" size={24} color={isDarkMode ? '#F3FAF8' : '#222'} style={{ marginRight: 16 }} />
              <Text style={{ color: isDarkMode ? '#F3FAF8' : '#222', fontSize: 16 }}>Share</Text>
            </TouchableOpacity>
            
            {/* Add to Collage Option */}
            <TouchableOpacity onPress={handleAddToCollage} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 }}>
              <Ionicons name="layers-outline" size={24} color={isDarkMode ? '#F3FAF8' : '#222'} style={{ marginRight: 16 }} />
              <Text style={{ color: isDarkMode ? '#F3FAF8' : '#222', fontSize: 16 }}>Add to Collage</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFrame: {
    width: screenWidth,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth - 40, // Account for frame padding
    borderRadius: 12,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
    zIndex: 2,
  },
  likeAnimationContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 3,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4EE0C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    color: '#F3FAF8',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userFollowers: {
    fontSize: 14,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 24,
    marginTop: 10,
    marginBottom: 8,
    color: '#222',
  },
  moreList: {
    paddingLeft: 16,
    paddingBottom: 12,
  },
  moreImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  moreGrid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  moreGridImage: {
    width: (Dimensions.get('window').width - 48) / 2,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    marginRight: 16,
    backgroundColor: '#ccc',
  },
});