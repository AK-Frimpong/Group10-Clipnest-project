import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MasonryList from '@react-native-seoul/masonry-list';
import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useThemeContext } from '../../theme/themecontext';
import { PinBoardContext } from '../context/PinBoardContext';

const screenWidth = Dimensions.get('window').width;
const imageWidth = (screenWidth - 48) / 2;
const UNSPLASH_ACCESS_KEY = 'CIQftPIa7wzz8JKsgqiCt7-wT-W4FAI_i1t0ZBJ8MkE';
const PEXELS_API_KEY = 'OXf4xcmwMg0Zl9KpZZSWFubbuv6kXYJsGHAIVUHW0jWoP5OKeutRGbQm';
const PER_PAGE = 80;

function getRandomQueries(count = 4) {
  const queries = [
    'wallpaper', 'shoes', 'nail-art', 'baking', 'skincare', 'makeup', 'interior-design', 
    'tattoo', 'art', 'inspirational-quotes', 'hairstyles', 'outfit-fashion', 'cooking', 
    'cars', 'african-fashion', 'photography', 'gift-ideas', 'piercings', 'nature', 
    'travel', 'diy-crafts', 'fitness', 'wedding', 'jewelry', 'home-decor', 'street-style',
    'graphic-design', 'food-photography', 'architecture', 'gardening'
  ];
  const selectedQueries = [];
  const availableQueries = [...queries];
  
  for (let i = 0; i < count && availableQueries.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableQueries.length);
    selectedQueries.push(availableQueries.splice(randomIndex, 1)[0]);
  }
  
  return selectedQueries;
}

type ImageItem = {
  id: string;
  url: string;
  width?: number;
  height?: number;
};

// Memoized ImageItem component for better performance
const MemoizedImageItem = React.memo(({ 
  item, 
  onPress, 
  onLongPress
}: { 
  item: ImageItem; 
  onPress: () => void; 
  onLongPress: () => void; 
}) => {
  const screenWidth = Dimensions.get('window').width;
  const displayWidth = (screenWidth - 48) / 2; // 2 columns with margins
  const displayHeight = item.width && item.height
    ? Math.round((item.height / item.width) * displayWidth)
    : 200; // fallback height

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      style={{ margin: 8 }}
    >
      <Image
        source={{ uri: item.url }}
        style={{
          width: displayWidth,
          height: displayHeight,
          borderRadius: 12,
        }}
        resizeMode="contain"
        // @ts-ignore: shared element prop for shared transition
        sharedTransitionTag={`image-${item.id}`}
      />
    </TouchableOpacity>
  );
});

export default function HomeScreen() {
  const { isDarkMode } = useThemeContext();
  const safeAreaTop = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const textColor = isDarkMode ? '#F3FAF8' : '#181D1C';
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const [queries, setQueries] = useState(getRandomQueries());
  const router = useRouter();
  const navigation = useNavigation();
  const flatListRef = useRef<ScrollView>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastWasAtTopRef = useRef(false);
  const { addPin } = useContext(PinBoardContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  const backgroundColor = isDarkMode ? '#181D1C' : '#F3FAF8';

  // Load initial images when component mounts
  useEffect(() => {
    console.log('HomeScreen mounted, calling fetchImages');
    fetchImages(true);
  }, []);

  const fetchImages = useCallback(async (reset = false, newQueries?: string[]) => {
    console.log('=== FETCH IMAGES START ===');
    console.log('fetchImages called with reset:', reset);
    console.log('Current images count:', images.length);
    setLoading(true);
    try {
      const page = reset ? 1 : pageRef.current;
      const searchQueries = newQueries || queries;
      const imagesPerQuery = 30; // Fixed number for better performance
      
      console.log('Fetching images for queries:', searchQueries);
      console.log('Images per query:', imagesPerQuery);
      console.log('Page:', page);
      let allImages: ImageItem[] = [];
      
      // Use only Unsplash to avoid rate limits
      for (const searchQuery of searchQueries) {
        try {
          console.log(`Fetching for query: ${searchQuery}`);
          
          // Unsplash fetch only
          const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${imagesPerQuery}&client_id=${UNSPLASH_ACCESS_KEY}`;
          console.log('Unsplash URL:', unsplashUrl);
          
          const response = await fetch(unsplashUrl);
          console.log(`Unsplash response status: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Unsplash error response:', errorText);
            continue; // Skip this query if it fails
          }
          
          const unsplashData = await response.json();
          console.log(`Unsplash results for ${searchQuery}:`, unsplashData.results?.length || 0);
          
          // Normalize and add to collection
          const unsplashImages: ImageItem[] = (unsplashData.results || []).map((img: any) => ({ 
            id: `u_${img.id}_${searchQuery}_${page}`,
            url: img.urls.small,
            width: img.width || 400,
            height: img.height || 300
          }));
          
          console.log(`Images loaded for ${searchQuery}:`, unsplashImages.length);
          allImages = [...allImages, ...unsplashImages];
          
          // Add a small delay between requests to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (apiError) {
          console.error(`API error for ${searchQuery}:`, apiError);
        }
      }
      
      console.log('Total images before shuffle:', allImages.length);
      
      // Shuffle the images to mix categories
      const shuffledImages = allImages.sort(() => Math.random() - 0.5);
      
      console.log('Total images loaded:', shuffledImages.length);
      
      const merged = reset ? shuffledImages : [...images, ...shuffledImages];
      console.log('Setting images in state:', merged.length);
      setImages(prevImages => {
        const newImages = reset ? shuffledImages : [...prevImages, ...shuffledImages];
        console.log('New images state length:', newImages.length);
        return newImages;
      });
      pageRef.current = page + 1;
      setHasMore(shuffledImages.length > 0);
    } catch (error) {
      console.error('Error fetching images:', error);
      // handle error
    } finally {
      setLoading(false);
      console.log('=== FETCH IMAGES END ===');
    }
  }, [queries, images.length]);

  const loadMore = () => {
    if (!loading && hasMore && images.length > 0) {
      fetchImages();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const newQueries = getRandomQueries();
    setQueries(newQueries);
    await fetchImages(true, newQueries);
    setRefreshing(false);
  };

  // Listen for home tab press event
  // useEffect(() => {
  //   // @ts-ignore: expo-router navigation supports 'tabPress' event
  //   const unsubscribe = navigation.addListener('tabPress', (e) => {
  //     if (!isAtTop && flatListRef.current) {
  //       flatListRef.current.scrollTo({ y: 0, animated: true });
  //       lastWasAtTopRef.current = true;
  //     } else if (isAtTop && lastWasAtTopRef.current) {
  //       onRefresh();
  //       lastWasAtTopRef.current = false;
  //     } else if (isAtTop) {
  //       lastWasAtTopRef.current = true;
  //     }
  //   });
  //   return unsubscribe;
  // }, [isAtTop, onRefresh]);

  // Track if FlatList is at top
  const handleScroll = (event: any) => {
    setIsAtTop(event.nativeEvent.contentOffset.y <= 0);
    if (event.nativeEvent.contentOffset.y > 0) lastWasAtTopRef.current = false;
  };

  const handleLongPress = (item: ImageItem) => {
    setSelectedImage(item);
    setModalVisible(true);
  };
  const handlePin = () => {
    if (selectedImage) {
      // Ensure the image has the correct type for PinBoardContext
      const pinImage = {
        id: selectedImage.id,
        url: selectedImage.url,
        width: selectedImage.width || 400,
        height: selectedImage.height || 300
      };
      addPin(pinImage);
    }
    setModalVisible(false);
  };
  const handleShare = async () => {
    if (selectedImage) {
      try {
        await Share.share({ message: selectedImage.url });
      } catch {}
    }
    setModalVisible(false);
  };

  const renderItem = ({ item, i }: { item: unknown, i: number }) => {
    const imageItem = item as ImageItem;
    return (
      <MemoizedImageItem
        item={imageItem}
        onPress={() => {
          const correctIndex = (images || []).findIndex(img => img.id === imageItem.id);
          router.push({
            pathname: '/ImageDetailsScreen',
            params: { index: correctIndex, images: JSON.stringify(images || []) },
          });
        }}
        onLongPress={() => handleLongPress(imageItem)}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      {/* Pin/Share Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={{ backgroundColor: '#222', borderRadius: 16, padding: 24, alignItems: 'center' }}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedImage && (
              <Image
                source={{ uri: selectedImage.url }}
                style={{ width: 220, height: 180, borderRadius: 12, marginBottom: 20 }}
                resizeMode="cover"
              />
            )}
            <View style={{ flexDirection: 'row', gap: 32 }}>
              <Pressable onPress={handlePin} style={{ alignItems: 'center', marginRight: 24 }}>
                <MaterialCommunityIcons name="pin" size={32} color={isDarkMode ? '#fff' : '#181D1C'} />
                <Text style={{ color: isDarkMode ? '#fff' : '#181D1C', marginTop: 8 }}>Clip</Text>
              </Pressable>
              <Pressable onPress={handleShare} style={{ alignItems: 'center' }}>
                <Ionicons name="share-outline" size={32} color="#fff" />
                <Text style={{ color: '#fff', marginTop: 8 }}>Share</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <ScrollView
        ref={flatListRef}
        style={{ backgroundColor }}
        contentContainerStyle={{ 
          paddingTop: Platform.OS === 'android' 
            ? (StatusBar.currentHeight || 0) + 20
            : 20
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDarkMode ? '#fff' : '#181D1C'} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <MasonryList
            data={images}
            renderItem={renderItem}
            numColumns={2}
            keyExtractor={(item) => item.id}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
            ListEmptyComponent={
              !loading && images.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                  <Text style={{ color: textColor, fontSize: 18 }}>No images found.</Text>
                </View>
              ) : null
            }
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  headerContent: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerUnderline: {
    height: 2,
    width: 70, // Width to match the text "For you"
    backgroundColor: '#181D1C',
    marginTop: 4,
    marginLeft: 8,
  },
});
