import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useThemeContext } from '../theme/themecontext';

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
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="more-horizontal" size={26} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
      </View>
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

