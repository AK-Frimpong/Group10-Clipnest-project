import MasonryList from '@react-native-seoul/masonry-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

// Get your own keys at https://unsplash.com/developers and https://www.pexels.com/api/
const UNSPLASH_DEFAULT_KEY = "BFOYbWJ2jnhmYi-W7Ew3uBsoQ7V-F_qals3ICv4SNIs";
const PEXELS_DEFAULT_KEY = "hVq7HPVbO1wmVUqvsA47uaHqeZdESbtdG2lovKcBkzTuopoaErCa226H";
const UNSPLASH_ACCESS_KEY = "CIQftPIa7wzz8JKsgqiCt7-wT-W4FAI_i1t0ZBJ8MkE"; // <-- YOUR KEY
const PEXELS_API_KEY = "OXf4xcmwMg0Zl9KpZZSWFubbuv6kXYJsGHAIVUHW0jWoP5OKeutRGbQm"; // <-- CHANGE THIS IF YOU HAVE A NEW ONE
const PER_PAGE = 20;

const SUGGESTIONS = [
  { label: 'Best nba players', image: 'https://images.pexels.com/photos/1103834/pexels-photo-1103834.jpeg' },
  { label: 'Hair routine men', image: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg' },
  { label: 'Home studio setup', image: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg' },
  { label: 'J cole art', image: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg' },
  { label: 'Mens outfits', image: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg' },
  { label: 'Solo leveling', image: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg' },
  { label: 'Natural hair styles', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
  { label: 'Cartoon profile pics', image: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg' },
  { label: 'Aesthetic guys', image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg' },
  { label: 'Streetwear fashion', image: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg' },
  { label: 'Summer hairstyles', image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
  { label: 'Mini drawings', image: 'https://images.pexels.com/photos/1707828/pexels-photo-1707828.jpeg' },
];

type ImageItem = {
  id: string;
  url: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
};

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const { isDarkMode } = useThemeContext();
  const pageRef = useRef(1);
  const searchRef = useRef('');
  const [selectedPin, setSelectedPin] = useState<ImageItem | null>(null);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Calculate image width for masonry layout
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = (screenWidth - 48) / 2;

  // Add debounce timer ref
  const debounceTimer = useRef<any>(null);

  // Memoize filtered suggestions to prevent unnecessary re-renders
  const filteredSuggestions = useMemo(() => {
    if (!searchText.trim()) return SUGGESTIONS;
    return SUGGESTIONS.filter(s => s.label.toLowerCase().includes(searchText.toLowerCase()));
  }, [searchText]);

  const fetchImages = useCallback(async (reset = false) => {
    const query = searchRef.current;
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const page = reset ? 1 : pageRef.current;
      // Unsplash fetch
      const unsplashPromise = fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}&client_id=${UNSPLASH_ACCESS_KEY}`
      ).then(async res => {
        if (!res.ok) {
          throw new Error('Unsplash: ' + await res.text());
        }
        return await res.json();
      });
      // Pexels fetch
      const pexelsPromise = fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}`,
        { headers: { Authorization: PEXELS_API_KEY } }
      ).then(async res => {
        if (!res.ok) {
          throw new Error('Pexels: ' + await res.text());
        }
        return await res.json();
      });
      // Wait for both, but don't fail if one fails
      const results = await Promise.allSettled([unsplashPromise, pexelsPromise]);
      let unsplashImages: ImageItem[] = [];
      let pexelsImages: ImageItem[] = [];
      if (results[0].status === 'fulfilled') {
        const unsplashData = results[0].value;
        unsplashImages = (unsplashData.results || []).map((img: any, index: number) => ({ 
          id: `u_${img.id}_${page}_${index}`, 
          url: img.urls.small,
          width: img.width,
          height: img.height,
        }));
      }
      if (results[1].status === 'fulfilled') {
        const pexelsData = results[1].value;
        pexelsImages = (pexelsData.photos || []).map((img: any, index: number) => ({ 
          id: `p_${img.id}_${page}_${index}`, 
          url: img.src.medium,
          width: img.width,
          height: img.height,
        }));
      }
<<<<<<< Updated upstream
      const merged = reset ? [...unsplashImages, ...pexelsImages] : [...images, ...unsplashImages, ...pexelsImages];
      setImages(merged);
=======
      const merged = [...unsplashImages, ...pexelsImages];
      setImages(prev => reset ? merged : [...prev, ...merged]);
>>>>>>> Stashed changes
      pageRef.current = page + 1;
      setHasMore(unsplashImages.length + pexelsImages.length > 0);
      if (merged.length === 0) {
        setError('No images found.');
      }
      if (results[0].status === 'rejected' && results[1].status === 'rejected') {
        setError('Image fetch error');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  const onSearch = useCallback(() => {
    Keyboard.dismiss();
    setImages([]);
    setHasMore(true);
    setError('');
    pageRef.current = 1;
    searchRef.current = searchText;
    setShowSuggestions(false);
    fetchImages(true);
  }, [searchText, fetchImages]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && images.length > 0) {
      fetchImages();
    }
  }, [loading, hasMore, images.length, fetchImages]);

<<<<<<< Updated upstream
  const renderItem = ({ item, i }: { item: unknown, i: number }) => {
    const imageItem = item as ImageItem;
    const screenWidth = Dimensions.get('window').width;
    const displayWidth = (screenWidth - 48) / 2; // 2 columns with margins
    const displayHeight = imageItem.width && imageItem.height
      ? Math.round((imageItem.height / imageItem.width) * displayWidth)
      : 200; // fallback height

    return (
      <TouchableOpacity
        onPress={() => {
          // Find the correct index in the images array
          const correctIndex = (images || []).findIndex(img => img.id === imageItem.id);
          router.push({
            pathname: '/ImageDetailsScreen',
            params: { index: correctIndex, images: JSON.stringify(images || []) },
          });
        }}
        activeOpacity={0.85}
        style={{ margin: 8 }}
      >
        <Image
          source={{ uri: imageItem.url }}
          style={{
            width: displayWidth,
            height: displayHeight,
            borderRadius: 12,
          }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };
=======
  const renderItem = useCallback(({ item, index }: { item: ImageItem, index: number }) => {
    // Generate random height for masonry effect (same as homepage)
    const imageHeight = Math.floor(Math.random() * 100) + 200; // Random height between 200-300
    
    return (
      <TouchableOpacity
        onPress={() => router.push({
          pathname: '/ImageDetailsScreen',
          params: { index, images: JSON.stringify(images) },
        })}
        activeOpacity={0.85}
        style={[
          styles.imageContainer,
          { 
            width: imageWidth,
            height: imageHeight,
            marginBottom: 16,
            marginRight: index % 2 === 0 ? 16 : 0,
          }
        ]}
      >
        <Image
          source={{ uri: item.url }}
          style={[styles.image, { width: imageWidth, height: imageHeight }]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }, [images, router, imageWidth]);
>>>>>>> Stashed changes

  const searchForSuggestion = useCallback((label: string) => {
    setSearchText(label);
    setShowSuggestions(false);
    searchRef.current = label;
    setImages([]);
    setHasMore(true);
    setError('');
    pageRef.current = 1;
    fetchImages(true);
    Keyboard.dismiss();
  }, [fetchImages]);

  const renderSuggestionTile = useCallback(({ item }: { item: typeof SUGGESTIONS[0] }) => (
    <TouchableOpacity
      style={styles.suggestionTile}
      onPress={() => searchForSuggestion(item.label)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.suggestionImage} />
      <View style={styles.suggestionOverlay} />
      <Text style={styles.suggestionLabel}>{item.label}</Text>
    </TouchableOpacity>
  ), [searchForSuggestion]);

  // Optimized useEffect to prevent unnecessary re-renders
  useEffect(() => {
    if (searchText.trim() === '') {
      setShowSuggestions(true);
      setImages([]);
      setError('');
      setHasMore(true);
      return;
    }
<<<<<<< Updated upstream
    // Filter suggestions as user types
    setFilteredSuggestions(
      SUGGESTIONS.filter(s => s.label.toLowerCase().includes(searchText.toLowerCase()))
    );
    setShowSuggestions(filteredSuggestions.length > 0);
  }, [searchText]);
=======

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      searchRef.current = searchText;
      setImages([]);
      setHasMore(true);
      setError('');
      pageRef.current = 1;
      fetchImages(true);
    }, 600);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchText, fetchImages]);
>>>>>>> Stashed changes

  // Warn if using default keys
  useEffect(() => {
    if (
      String(UNSPLASH_ACCESS_KEY) === String(UNSPLASH_DEFAULT_KEY) ||
      String(PEXELS_API_KEY) === String(PEXELS_DEFAULT_KEY)
    ) {
      setShowApiKeyWarning(true);
    } else {
      setShowApiKeyWarning(false);
    }
  }, []);

  useEffect(() => {
    if (params && params.interest && typeof params.interest === 'string') {
      setSearchText(params.interest);
      setShowSuggestions(false);
      searchRef.current = params.interest;
      setImages([]);
      setHasMore(true);
      setError('');
      pageRef.current = 1;
      fetchImages(true);
      Keyboard.dismiss();
    }
  }, [params.interest, fetchImages]);

  const styles = StyleSheet.create({
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: 17,
  },
  cancelButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionGrid: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  suggestionTile: {
    flex: 1,
    aspectRatio: 1.3,
    borderRadius: 18,
    margin: 8,
    overflow: 'hidden',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    borderRadius: 18,
  },
  suggestionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 18,
  },
  suggestionLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    zIndex: 2,
    paddingHorizontal: 8,
  },
  grid: {
<<<<<<< Updated upstream
    paddingVertical: 16,
    paddingHorizontal: 12,
=======
    padding: 16,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
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
    borderRadius: 12,
>>>>>>> Stashed changes
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    maxWidth: '90%',
    maxHeight: '80%',
  },
  modalImage: {
    width: 260,
    height: 260,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: '#ccc',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    color: '#ccc',
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#4EE0C1',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#181D1C',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

  // Memoize key extractors for better performance
  const keyExtractor = useCallback((item: ImageItem) => item.id, []);
  const suggestionKeyExtractor = useCallback((item: typeof SUGGESTIONS[0]) => item.label, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }}>
        {showApiKeyWarning && (
          <Text style={{ backgroundColor: '#ffb347', color: '#181D1C', padding: 8, textAlign: 'center', fontWeight: 'bold', borderRadius: 8, margin: 8 }}>
            ⚠️ You are using the default API keys. Please replace them at the top of this file for reliable search results!
          </Text>
        )}
        <View style={{ paddingHorizontal: 12, paddingTop: Platform.OS === 'android' ? 24 : 0, backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }}>
          <View style={styles.searchBarRow}>
            <TextInput
              placeholder="Search Clipnest"
              placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? '#222' : '#f0f0f0',
                  color: isDarkMode ? '#fff' : '#000',
                },
              ]}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => {
                setSearchFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
              onSubmitEditing={onSearch}
            />
            {(searchFocused || searchText.length > 0) && (
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setSearchText('');
                  setShowSuggestions(true);
                }}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelText, { color: isDarkMode ? '#fff' : '#181D1C' }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Suggestions dropdown */}
          {showSuggestions && searchText.trim() !== '' && filteredSuggestions.length > 0 && (
            <View style={{
              backgroundColor: isDarkMode ? '#232B2B' : '#fff',
              borderRadius: 12,
              marginTop: 4,
              marginBottom: 8,
              elevation: 4,
              borderWidth: 1,
              borderColor: isDarkMode ? '#4EE0C1' : '#181D1C',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}>
              {filteredSuggestions.slice(0, 6).map(s => (
                <TouchableOpacity
                  key={s.label}
                  style={{
                    padding: 14,
                    borderBottomWidth: 1,
                    borderColor: isDarkMode ? '#333' : '#eee',
                  }}
                  onPress={() => searchForSuggestion(s.label)}
                >
                  <Text style={{ color: isDarkMode ? '#4EE0C1' : '#181D1C', fontWeight: 'bold', fontSize: 16 }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {showSuggestions && searchText.trim() === '' ? (
          <>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#181D1C', marginLeft: 16, marginTop: 16 }]}>Ideas for you</Text>
            <FlatList
              data={SUGGESTIONS}
              keyExtractor={suggestionKeyExtractor}
              renderItem={renderSuggestionTile}
              numColumns={2}
              contentContainerStyle={styles.suggestionGrid}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={8}
              windowSize={8}
              initialNumToRender={6}
              updateCellsBatchingPeriod={50}
              disableVirtualization={false}
            />
          </>
        ) : (
          <>
            {error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>{error}</Text>
            ) : null}
            {images.length === 0 && !loading ? (
              <Text style={{ color: isDarkMode ? '#fff' : '#181D1C', textAlign: 'center', marginTop: 32, fontSize: 16 }}>
                No results found
              </Text>
            ) : null}
<<<<<<< Updated upstream
            <MasonryList
              data={images || []}
              keyExtractor={(item) => item.id}
=======
            <FlatList
              data={images}
              keyExtractor={keyExtractor}
>>>>>>> Stashed changes
              renderItem={renderItem}
              numColumns={2}
              contentContainerStyle={styles.grid}
              style={{ flex: 1 }}
              onEndReached={loadMore}
              onEndReachedThreshold={0.3}
              ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={8}
              windowSize={8}
              initialNumToRender={6}
              updateCellsBatchingPeriod={50}
              disableVirtualization={false}
              getItemLayout={(data, index) => ({
                length: 216, // height + marginBottom
                offset: 216 * Math.floor(index / 2),
                index,
              })}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
            />
          </>
        )}
        {/* Pin Details Modal */}
        <Modal
          visible={!!selectedPin}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPin(null)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setSelectedPin(null)}>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedPin?.url }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              {selectedPin?.title && (
                <Text style={styles.modalTitle}>{selectedPin.title}</Text>
              )}
              {selectedPin?.description && (
                <Text style={styles.modalDesc}>{selectedPin.description}</Text>
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPin(null)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
      </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
