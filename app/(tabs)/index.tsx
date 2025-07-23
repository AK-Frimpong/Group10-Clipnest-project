import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

const screenWidth = Dimensions.get('window').width;
const imageWidth = (screenWidth - 48) / 2;
const UNSPLASH_ACCESS_KEY = 'BFOYbWJ2jnhmYi-W7Ew3uBsoQ7V-F_qals3ICv4SNIs';
const PEXELS_API_KEY = 'hVq7HPVbO1wmVUqvsA47uaHqeZdESbtdG2lovKcBkzTuopoaErCa226H';
const PER_PAGE = 20;

function getRandomQueries(count = 8) {
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
  height: number;
};

export default function HomeScreen() {
  const { isDarkMode } = useThemeContext();
  const safeAreaTop = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const [queries, setQueries] = useState(getRandomQueries());
  const router = useRouter();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastWasAtTopRef = useRef(false);

  const backgroundColor = isDarkMode ? '#181D1C' : '#F3FAF8';

  const fetchImages = useCallback(async (reset = false, newQueries?: string[]) => {
    setLoading(true);
    try {
      const page = reset ? 1 : pageRef.current;
      const searchQueries = newQueries || queries;
      const imagesPerQuery = Math.floor(PER_PAGE / searchQueries.length);
      
      let allImages: ImageItem[] = [];
      
      for (const searchQuery of searchQueries) {
        // Unsplash fetch
        const unsplashPromise = fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${imagesPerQuery}&client_id=${UNSPLASH_ACCESS_KEY}`
        ).then(res => res.ok ? res.json() : { results: [] });
        // Pexels fetch
        const pexelsPromise = fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${imagesPerQuery}`,
          { headers: { Authorization: PEXELS_API_KEY } }
        ).then(res => res.ok ? res.json() : { photos: [] });
        
        // Wait for both
        const [unsplashData, pexelsData] = await Promise.all([unsplashPromise, pexelsPromise]);
        
        // Normalize and add to collection
        const unsplashImages: ImageItem[] = (unsplashData.results || []).map((img: any) => ({ 
          id: `u_${img.id}_${searchQuery}_${page}`,
          url: img.urls.small,
          height: Math.floor(Math.random() * 100) + 200 // Random height between 200 and 300
        }));
        const pexelsImages: ImageItem[] = (pexelsData.photos || []).map((img: any) => ({ 
          id: `p_${img.id}_${searchQuery}_${page}`,
          url: img.src.medium,
          height: Math.floor(Math.random() * 100) + 200 // Random height between 200 and 300
        }));
        
        allImages = [...allImages, ...unsplashImages, ...pexelsImages];
      }
      
      // Shuffle the images to mix categories
      const shuffledImages = allImages.sort(() => Math.random() - 0.5);
      
      const merged = reset ? shuffledImages : [...images, ...shuffledImages];
      setImages(merged);
      pageRef.current = page + 1;
      setHasMore(shuffledImages.length > 0);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [images, queries]);

  useEffect(() => {
    fetchImages(true);
    // eslint-disable-next-line
  }, [queries]);

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
  useEffect(() => {
    // @ts-ignore: expo-router navigation supports 'tabPress' event
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      if (!isAtTop && flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        lastWasAtTopRef.current = true;
      } else if (isAtTop && lastWasAtTopRef.current) {
        onRefresh();
        lastWasAtTopRef.current = false;
      } else if (isAtTop) {
        lastWasAtTopRef.current = true;
      }
    });
    return unsubscribe;
  }, [isAtTop, onRefresh]);

  // Track if FlatList is at top
  const handleScroll = (event: any) => {
    setIsAtTop(event.nativeEvent.contentOffset.y <= 0);
    if (event.nativeEvent.contentOffset.y > 0) lastWasAtTopRef.current = false;
  };

  // Create two columns for masonry layout
  const [leftColumn, rightColumn] = images.reduce(
    (columns, item, index) => {
      const column = index % 2 === 0 ? columns[0] : columns[1];
      column.push(item);
      return columns;
    },
    [[], []] as [ImageItem[], ImageItem[]]
  );

  const renderColumn = (items: ImageItem[], isLeftColumn: boolean) => (
    <View style={[styles.column, isLeftColumn && styles.leftColumn]}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => router.push({
            pathname: '/ImageDetailsScreen',
            params: { index: isLeftColumn ? index * 2 : index * 2 + 1, images: JSON.stringify(images) },
          })}
          activeOpacity={0.85}
          style={styles.itemContainer}
        >
          <Image
            source={{ uri: item.url }}
            style={[styles.image, { height: item.height }]}
            resizeMode="cover"
            // @ts-ignore: shared element prop for shared transition
            sharedTransitionTag={`image-${item.id}`}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <FlatList
        ref={flatListRef}
        data={[null]} // Single item to render our custom layout
        keyExtractor={() => 'key'}
        renderItem={() => (
          <View style={styles.container}>
            {renderColumn(leftColumn, true)}
            {renderColumn(rightColumn, false)}
          </View>
        )}
        contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 }}
        style={{ backgroundColor }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDarkMode ? '#fff' : '#181D1C'} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    flexDirection: 'row',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  column: {
    flex: 1,
    padding: 8,
  },
  leftColumn: {
    marginRight: 8,
  },
  itemContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 3 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  image: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
