import { Feather, Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, Pressable, SafeAreaView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const { addToCollage } = useContext(PinBoardContext);

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
        <TouchableOpacity style={styles.actionButton}>
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

