import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

const screenWidth = Dimensions.get('window').width;
const imageWidth = (screenWidth - 48) / 2;
const UNSPLASH_ACCESS_KEY = 'BFOYbWJ2jnhmYi-W7Ew3uBsoQ7V-F_qals3ICv4SNIs';
const PEXELS_API_KEY = 'hVq7HPVbO1wmVUqvsA47uaHqeZdESbtdG2lovKcBkzTuopoaErCa226H';
const PER_PAGE = 20;

function getRandomQuery() {
  const queries = [
    'nature', 'food', 'fashion', 'art', 'travel', 'animals', 'technology', 'city', 'flowers', 'mountains', 'beach', 'architecture', 'music', 'cars', 'abstract', 'portrait', 'sports', 'space', 'people', 'lifestyle',
  ];
  return queries[Math.floor(Math.random() * queries.length)];
}

type ImageItem = {
  id: string;
  url: string;
};

export default function HomeScreen() {
  const { isDarkMode } = useThemeContext();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const [query, setQuery] = useState(getRandomQuery());

  const backgroundColor = isDarkMode ? '#181D1C' : '#F3FAF8';

  const fetchImages = useCallback(async (reset = false, newQuery?: string) => {
    setLoading(true);
    try {
      const page = reset ? 1 : pageRef.current;
      const searchQuery = newQuery || query;
      // Unsplash fetch
      const unsplashPromise = fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${PER_PAGE}&client_id=${UNSPLASH_ACCESS_KEY}`
      ).then(res => res.ok ? res.json() : { results: [] });
      // Pexels fetch
      const pexelsPromise = fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${PER_PAGE}`,
        { headers: { Authorization: PEXELS_API_KEY } }
      ).then(res => res.ok ? res.json() : { photos: [] });
      // Wait for both
      const [unsplashData, pexelsData] = await Promise.all([unsplashPromise, pexelsPromise]);
      // Normalize
      const unsplashImages: ImageItem[] = (unsplashData.results || []).map((img: any) => ({ id: 'u_' + img.id + '_' + page, url: img.urls.small }));
      const pexelsImages: ImageItem[] = (pexelsData.photos || []).map((img: any) => ({ id: 'p_' + img.id + '_' + page, url: img.src.medium }));
      const merged = reset ? [...unsplashImages, ...pexelsImages] : [...images, ...unsplashImages, ...pexelsImages];
      setImages(merged);
      pageRef.current = page + 1;
      setHasMore(unsplashImages.length + pexelsImages.length > 0);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [images, query]);

  useEffect(() => {
    fetchImages(true);
    // eslint-disable-next-line
  }, [query]);

  const loadMore = () => {
    if (!loading && hasMore && images.length > 0) {
      fetchImages();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const newQuery = getRandomQuery();
    setQuery(newQuery);
    await fetchImages(true, newQuery);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: ImageItem }) => (
    <Image
      source={{ uri: item.url }}
      style={styles.image}
      resizeMode="cover"
    />
  );

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      contentContainerStyle={styles.container}
      style={{ backgroundColor }}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDarkMode ? '#fff' : '#181D1C'} />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  image: {
    width: (Dimensions.get('window').width - 48) / 2,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    marginRight: 16,
  },
});
