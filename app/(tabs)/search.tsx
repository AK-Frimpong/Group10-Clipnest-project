import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

// =====================
//  API KEYS - CHANGE THESE TO YOUR OWN!
// =====================
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
  const [debugInfo, setDebugInfo] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<typeof SUGGESTIONS>([]);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const router = useRouter();

  // Add debounce timer ref
  const debounceTimer = useRef<any>(null);

  const fetchImages = async (reset = false) => {
    setDebugInfo('');
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
          const txt = await res.text();
          setDebugInfo(prev => prev + `\nUnsplash error: ${txt}`);
          throw new Error('Unsplash: ' + txt);
        }
        const json = await res.json();
        setDebugInfo(prev => prev + `\nUnsplash success: ${JSON.stringify(json).slice(0, 300)}`);
        return json;
      });
      // Pexels fetch
      const pexelsPromise = fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${PER_PAGE}`,
        { headers: { Authorization: PEXELS_API_KEY } }
      ).then(async res => {
        if (!res.ok) {
          const txt = await res.text();
          setDebugInfo(prev => prev + `\nPexels error: ${txt}`);
          throw new Error('Pexels: ' + txt);
        }
        const json = await res.json();
        setDebugInfo(prev => prev + `\nPexels success: ${JSON.stringify(json).slice(0, 300)}`);
        return json;
      });
      // Wait for both, but don't fail if one fails
      const results = await Promise.allSettled([unsplashPromise, pexelsPromise]);
      let unsplashImages: ImageItem[] = [];
      let pexelsImages: ImageItem[] = [];
      if (results[0].status === 'fulfilled') {
        const unsplashData = results[0].value;
        unsplashImages = (unsplashData.results || []).map((img: any) => ({ id: 'u_' + img.id, url: img.urls.small }));
      }
      if (results[1].status === 'fulfilled') {
        const pexelsData = results[1].value;
        pexelsImages = (pexelsData.photos || []).map((img: any) => ({ id: 'p_' + img.id, url: img.src.medium }));
      }
      const merged = [...unsplashImages, ...pexelsImages];
      setImages(merged);
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
      setDebugInfo(prev => prev + `\nImage fetch error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    Keyboard.dismiss();
    setImages([]);
    setHasMore(true);
    setError('');
    pageRef.current = 1;
    searchRef.current = searchText;
    setShowSuggestions(false);
    fetchImages(true);
  };

  const loadMore = () => {
    if (!loading && hasMore && images.length > 0) {
      fetchImages();
    }
  };

  const renderItem = ({ item, index }: { item: ImageItem, index: number }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/ImageDetailsScreen',
        params: { index, images: JSON.stringify(images) },
      })}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.image}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const searchForSuggestion = (label: string) => {
    setSearchText(label);
    setShowSuggestions(false);
    searchRef.current = label;
    setImages([]);
    setHasMore(true);
    setError('');
    pageRef.current = 1;
    fetchImages(true);
    Keyboard.dismiss();
  };

  const renderSuggestionTile = ({ item }: { item: typeof SUGGESTIONS[0] }) => (
    <TouchableOpacity
      style={styles.suggestionTile}
      onPress={() => searchForSuggestion(item.label)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.suggestionImage} />
      <View style={styles.suggestionOverlay} />
      <Text style={styles.suggestionLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  // Only fetch images on onSearch or when a suggestion is tapped
  useEffect(() => {
    if (searchText.trim() === '') {
      setShowSuggestions(true);
      setImages([]);
      setError('');
      setHasMore(true);
      setFilteredSuggestions(SUGGESTIONS);
      return;
    }
    // Filter suggestions as user types
    setFilteredSuggestions(
      SUGGESTIONS.filter(s => s.label.toLowerCase().includes(searchText.toLowerCase()))
    );
    setShowSuggestions(filteredSuggestions.length > 0);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchRef.current = searchText;
      setImages([]);
      setHasMore(true);
      setError('');
      pageRef.current = 1;
      fetchImages(true);
    }, 600);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchText]);

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

  const screenWidth = Dimensions.get('window').width;
  const imageWidth = (screenWidth - 48) / 2;

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
    padding: 16,
  },
  image: {
    width: imageWidth,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    marginRight: 16,
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
              onChangeText={(text) => {
                setSearchText(text);
                setShowSuggestions(true);
              }}
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
                  onPress={() => {
                    setSearchText(s.label);
                    setShowSuggestions(false);
                    searchRef.current = s.label;
                    setImages([]);
                    setHasMore(true);
                    setError('');
                    pageRef.current = 1;
                    fetchImages(true);
                    Keyboard.dismiss();
                  }}
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
              keyExtractor={(item) => item.label}
              renderItem={renderSuggestionTile}
              numColumns={2}
              contentContainerStyle={styles.suggestionGrid}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <>
            {images.length > 0 && (
              <Text style={{ color: 'green', textAlign: 'center', marginTop: 8 }}>
                Showing {images.length} images
              </Text>
            )}
            {error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>{error}</Text>
            ) : null}
            {debugInfo && images.length === 0 ? (
              <Text style={{ color: 'orange', fontSize: 12, margin: 8, padding: 4, backgroundColor: '#222', borderRadius: 6 }} selectable>
                {debugInfo}
              </Text>
            ) : null}
            {images.length === 0 && !loading ? (
              <Text style={{ color: isDarkMode ? '#fff' : '#181D1C', textAlign: 'center', marginTop: 32, fontSize: 16 }}>
                No results found
              </Text>
            ) : null}
            <FlatList
              data={images}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              numColumns={2}
              contentContainerStyle={styles.grid}
              style={{ flex: 1 }}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
              showsVerticalScrollIndicator={false}
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
