import { Feather, Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useThemeContext } from '../theme/themecontext';
import { ImageItem, PinBoardContext } from './context/PinBoardContext';

const screenWidth = Dimensions.get('window').width;
const imageHeight = 350;

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
  // Like state
  const [likes, setLikes] = useState(123);
  const [liked, setLiked] = useState(false);
  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const { addToCollage, pins } = useContext(PinBoardContext);

  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [plusModalVisible, setPlusModalVisible] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [plusTab, setPlusTab] = useState<'clips' | 'photo'>('clips');
  const [plusMenuVisible, setPlusMenuVisible] = useState(false);
  const [pinsModalVisible, setPinsModalVisible] = useState(false);
  const [photosModalVisible, setPhotosModalVisible] = useState(false);

  const handlePickPhoto = async () => {
    setPlusModalVisible(false);
    setPlusTab('clips');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAttachedImage(result.assets[0].uri);
    }
  };
  const handleAttachClip = (uri: string) => {
    setAttachedImage(uri);
    setPlusModalVisible(false);
  };
  const handleRemoveAttachment = () => setAttachedImage(null);

  const handleAddComment = () => {
    if (commentText.trim().length === 0) return;
    setComments(prev => [
      {
        id: Date.now().toString(),
        user: {
          name: 'You',
          avatar: null,
        },
        text: commentText,
        time: 'now',
      },
      ...prev,
    ]);
    setCommentText('');
    Keyboard.dismiss();
  };

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
      {/* Image with shared element transition and swipe gesture */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <Image
            source={{ uri: currentImage?.url }}
            style={styles.image}
            resizeMode="cover"
            // @ts-ignore: shared element prop for future animation
            sharedTransitionTag={`image-${currentImage?.id}`}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#E74C3C' : isDarkMode ? '#fff' : '#222'} />
          <Text style={[styles.actionText, { color: isDarkMode ? '#fff' : '#222' }]}>{likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setCommentsModalVisible(true)}>
          <Ionicons name="chatbubble-outline" size={26} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="share" size={26} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
          <Feather name="more-horizontal" size={26} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
      </View>
      {/* Drop-up Modal for More Options */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setModalVisible(false)}>
          <Pressable style={{ backgroundColor: isDarkMode ? '#222' : '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 24 }} onPress={e => e.stopPropagation()}>
            <TouchableOpacity style={{ paddingVertical: 16 }} onPress={handleDownload}>
              <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 16 }}>Download Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 16 }} onPress={handleAddToCollage}>
              <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 16 }}>Add to Collage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ paddingVertical: 16 }} onPress={handleShare}>
              <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 16 }}>Share</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      {/* Comments Drop-up Modal */}
      <Modal
        visible={commentsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setCommentsModalVisible(false)}>
          <Pressable style={{ height: '70%', backgroundColor: isDarkMode ? '#181D1C' : '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 12, paddingBottom: 0, paddingHorizontal: 0 }} onPress={e => e.stopPropagation()}>
            <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: isDarkMode ? '#333' : '#ccc', marginVertical: 6 }} />
              </View>
              <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 17, fontWeight: '600', marginLeft: 24, marginBottom: 4 }}>
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </Text>
              {comments.length === 0 ? (
                <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={54} color={isDarkMode ? '#444' : '#bbb'} style={{ marginBottom: 12 }} />
                  <Text style={{ color: isDarkMode ? '#888' : '#aaa', fontSize: 16 }}>No comments yet</Text>
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 14 }}>
                      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: item.user.avatar ? undefined : '#4EE0C1', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                        {item.user.avatar ? (
                          <Image source={{ uri: item.user.avatar }} style={{ width: 38, height: 38, borderRadius: 19 }} />
                        ) : (
                          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{item.user.name.charAt(0)}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                          <Text style={{ color: isDarkMode ? '#fff' : '#222', fontWeight: 'bold', fontSize: 15 }}>{item.user.name}</Text>
                          <Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 13, marginLeft: 8 }}>{item.time}</Text>
                        </View>
                        <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 15, marginBottom: 6 }}>{item.text}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                          <TouchableOpacity><Text style={{ color: isDarkMode ? '#aaa' : '#888', fontSize: 14 }}>Reply</Text></TouchableOpacity>
                          <TouchableOpacity><Ionicons name="heart-outline" size={18} color={isDarkMode ? '#aaa' : '#888'} /></TouchableOpacity>
                          <TouchableOpacity><Feather name="more-horizontal" size={18} color={isDarkMode ? '#aaa' : '#888'} /></TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                  style={{ flex: 1, maxHeight: 260 }}
                  contentContainerStyle={{ paddingBottom: 24 }}
                />
              )}
              {/* Comment Input */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? '#232323' : '#f2f2f2', margin: 12, borderRadius: 24, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <TouchableOpacity
                    onPress={() => setPlusMenuVisible(true)}
                    style={{ marginRight: 8 }}
                  >
                    <Ionicons name="add-circle" size={28} color="#4EE0C1" />
                  </TouchableOpacity>
                  {attachedImage && (
                    <View style={{ marginRight: 8, position: 'relative' }}>
                      <Image source={{ uri: attachedImage }} style={{ width: 32, height: 32, borderRadius: 8 }} />
                      <TouchableOpacity onPress={handleRemoveAttachment} style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#222', borderRadius: 10, padding: 2 }}>
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <TextInput
                    style={{ flex: 1, color: isDarkMode ? '#fff' : '#222', fontSize: 16, paddingVertical: 6 }}
                    placeholder="Add a comment"
                    placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
                    value={commentText}
                    onChangeText={setCommentText}
                    onSubmitEditing={handleAddComment}
                    returnKeyType="send"
                  />
                </View>
              </KeyboardAvoidingView>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
      {/* Plus Modal */}
      {plusModalVisible && (
        <Modal
          visible={plusModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPlusModalVisible(false)}
        >
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setPlusModalVisible(false)}>
            <Pressable style={{ height: '55%', backgroundColor: isDarkMode ? '#181D1C' : '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 12, paddingBottom: 0, paddingHorizontal: 0 }} onPress={e => e.stopPropagation()}>
              <View style={{ alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: isDarkMode ? '#333' : '#ccc', marginVertical: 6 }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 18 }}>
                <TouchableOpacity onPress={() => setPlusTab('clips')} style={{ alignItems: 'center' }}>
                  <Ionicons name="images-outline" size={28} color={plusTab === 'clips' ? '#4EE0C1' : isDarkMode ? '#fff' : '#222'} />
                  <Text style={{ color: plusTab === 'clips' ? '#4EE0C1' : (isDarkMode ? '#fff' : '#222'), marginTop: 4, fontWeight: '600' }}>Clips</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickPhoto} style={{ alignItems: 'center' }}>
                  <Ionicons name="image-outline" size={28} color={plusTab === 'photo' ? '#4EE0C1' : isDarkMode ? '#fff' : '#222'} />
                  <Text style={{ color: plusTab === 'photo' ? '#4EE0C1' : (isDarkMode ? '#fff' : '#222'), marginTop: 4, fontWeight: '600' }}>Photo</Text>
                </TouchableOpacity>
              </View>
              {/* Clips grid only if plusTab is 'clips' */}
              {plusTab === 'clips' && (
                <>
                  <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 16, fontWeight: '600', marginLeft: 24, marginBottom: 8 }}>Your Clips</Text>
                  {pins.length === 0 ? (
                    <Text style={{ color: isDarkMode ? '#888' : '#aaa', textAlign: 'center', marginTop: 32 }}>No clips yet.</Text>
                  ) : (
                    <FlatList
                      data={pins}
                      keyExtractor={item => item.id}
                      numColumns={3}
                      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                      renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleAttachClip(item.url)} style={{ margin: 6 }}>
                          <Image source={{ uri: item.url }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      )}
      {/* Floating menu for plus button */}
      <Modal
        visible={plusMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPlusMenuVisible(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setPlusMenuVisible(false)}>
          <View style={{ position: 'absolute', bottom: 70, left: 32, zIndex: 100 }}>
            <View style={{ backgroundColor: isDarkMode ? '#232323' : '#fff', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 0, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 8, minWidth: 160 }}>
              {/* Pins */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18 }}
                onPress={() => { setPlusMenuVisible(false); setPinsModalVisible(true); }}
              >
                <Ionicons name="pin" size={22} color="#4EE0C1" style={{ marginRight: 14 }} />
                <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 16 }}>Pins</Text>
              </TouchableOpacity>
              {/* Photos */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 18 }}
                onPress={() => { setPlusMenuVisible(false); setPhotosModalVisible(true); }}
              >
                <Ionicons name="image-outline" size={22} color="#4EE0C1" style={{ marginRight: 14 }} />
                <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 16 }}>Photos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
      {/* Pins modal (drop-up) */}
      <Modal
        visible={pinsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPinsModalVisible(false)}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setPinsModalVisible(false)}>
          <Pressable style={{ height: '55%', backgroundColor: isDarkMode ? '#181D1C' : '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 12, paddingBottom: 0, paddingHorizontal: 0 }} onPress={e => e.stopPropagation()}>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 16, fontWeight: '600', marginLeft: 24, marginBottom: 8 }}>Your Clips</Text>
            {pins.length === 0 ? (
              <Text style={{ color: isDarkMode ? '#888' : '#aaa', textAlign: 'center', marginTop: 32 }}>No clips yet.</Text>
            ) : (
              <FlatList
                data={pins}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => { setAttachedImage(item.url); setPinsModalVisible(false); }} style={{ margin: 6 }}>
                    <Image source={{ uri: item.url }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                  </TouchableOpacity>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
      {/* Photos modal (drop-up) */}
      <Modal
        visible={photosModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotosModalVisible(false)}
      >
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }} onPress={() => setPhotosModalVisible(false)}>
          <Pressable style={{ height: '55%', backgroundColor: isDarkMode ? '#181D1C' : '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 12, paddingBottom: 0, paddingHorizontal: 0 }} onPress={e => e.stopPropagation()}>
            {/* Camera roll picker */}
            <TouchableOpacity onPress={async () => {
              setPhotosModalVisible(false);
              const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setAttachedImage(result.assets[0].uri);
              }
            }} style={{ alignItems: 'center', marginTop: 32 }}>
              <Ionicons name="image-outline" size={48} color="#4EE0C1" />
              <Text style={{ color: isDarkMode ? '#fff' : '#222', fontSize: 18, marginTop: 12 }}>Pick a photo from your camera roll</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      {/* More to explore */}
      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#222' }]}>More to explore</Text>
      <FlatList
        data={imagesArray.filter((_: any, i: number) => i !== currentIndex)}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.moreGrid}
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
      {/* TODO: Add zoom animation if not working */}
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
    height: imageHeight,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screenWidth,
    height: imageHeight,
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

