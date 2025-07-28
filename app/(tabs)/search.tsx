import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

type ImageItem = {
  id: string;
  url: string;
  title?: string;
  description?: string;
  user?: {
    name: string;
    avatar: string;
  };
};

type CategoryItem = {
  id: string;
  title: string;
  imageUrl: any;
};

type Suggestion = {
  id: string;
  text: string;
  type: 'suggestion';
};

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 2;

// Search suggestions database
const suggestionDatabase = [
  'african fashion', 'art', 'baking', 'beauty',
  'cars', 'cooking', 'design', 'fashion',
  'food', 'hairstyles', 'home decor', 'interior design',
  'makeup', 'nail art', 'outfit inspiration', 'photography',
  'quotes', 'shoes', 'skincare', 'tattoo designs',
  'wallpaper', 'wedding', 'yoga', 'zen'
];

// Popular categories on Clipnest
const popularCategories: CategoryItem[] = [
  { id: '1', title: 'Natural hairstyles', imageUrl: require('../../assets/images/hairstyles.png') },
  { id: '2', title: 'Outfit inspiration', imageUrl: require('../../assets/images/outfit_inspo.png') },
  { id: '3', title: 'Interior decor', imageUrl: require('../../assets/images/interior_decor.png') },
  { id: '4', title: 'Makeup looks', imageUrl: require('../../assets/images/makeup.png') },
  { id: '5', title: 'Art & Design', imageUrl: require('../../assets/images/art.png') },
  { id: '6', title: 'Photography', imageUrl: require('../../assets/images/photography.png') },
  { id: '7', title: 'Fashion trends', imageUrl: require('../../assets/images/african_fashion.png') },
  { id: '8', title: 'DIY & Crafts', imageUrl: require('../../assets/images/gift_ideas.png') },
];

// Fallback images that always load
const fallbackImages = [
  'https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg',
  'https://images.pexels.com/photos/1038001/pexels-photo-1038001.jpeg',
  'https://images.pexels.com/photos/1038002/pexels-photo-1038002.jpeg',
  'https://images.pexels.com/photos/1038003/pexels-photo-1038003.jpeg',
  'https://images.pexels.com/photos/1038004/pexels-photo-1038004.jpeg',
  'https://images.pexels.com/photos/1038005/pexels-photo-1038005.jpeg',
  'https://images.pexels.com/photos/1038006/pexels-photo-1038006.jpeg',
  'https://images.pexels.com/photos/1038007/pexels-photo-1038007.jpeg',
  'https://images.pexels.com/photos/1038008/pexels-photo-1038008.jpeg',
  'https://images.pexels.com/photos/1038009/pexels-photo-1038009.jpeg',
];

export default function SearchScreen() {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<{ [key: string]: boolean }>({});

  // Reset to default state when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      setSearchQuery('');
      setImages([]);
      setShowResults(false);
      setShowSuggestions(false);
      setSuggestions([]);
      setImageLoadErrors({});
      setIsSearching(false);
    }, [])
  );

  // Remove the problematic useEffect that was interfering with search results
  // useEffect(() => {
  //   if (searchQuery.trim() && !showResults) {
  //     const filtered = suggestionDatabase
  //       .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  //       .slice(0, 8)
  //       .map(item => ({
  //         id: item,
  //         text: item,
  //         type: 'suggestion' as const
  //       }));
  //     setSuggestions(filtered);
  //     setShowSuggestions(true);
  //   } else if (!searchQuery.trim()) {
  //     setSuggestions([]);
  //     setShowSuggestions(false);
  //     setShowResults(false);
  //   }
  // }, [searchQuery, showResults]);

  const handleCancel = () => {
    setSearchQuery('');
    setImages([]);
    setShowResults(false);
    setShowSuggestions(false);
    setSuggestions([]);
    setImageLoadErrors({});
    setIsSearching(false);
    Keyboard.dismiss();
  };

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) return;
    
    // Set search state immediately
    setSearchQuery(query);
    setShowSuggestions(false);
    setShowResults(true);
    setPage(1);
    setHasMore(true);
    setIsSearching(true);

    // Create fallback images - these will always be shown
    const fallbackGrid = fallbackImages.map((url, i) => ({
      id: `search-${Date.now()}-${i}`,
      url,
      title: `${query} ${i + 1}`,
      description: `${query} inspiration`,
      user: {
        name: `Creator ${i + 1}`,
        avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
      },
    }));
    
    // Set images immediately and stop loading
    setImages(fallbackGrid);
    setImageLoadErrors({});
    setIsSearching(false);

    // Try to get Unsplash images in background
    try {
      const now = Date.now();
      const unsplashUrls = await Promise.all(
        Array.from({ length: 10 }, async (_, i) => {
          try {
            const res = await fetch(`https://source.unsplash.com/400x400/?${encodeURIComponent(query)}&sig=${now}-${i}`);
            return res.url;
          } catch {
            return null;
          }
        })
      );
      
      const validUrls = unsplashUrls.filter((u): u is string => u !== null);
      
      // Only update if we got valid results
      if (validUrls.length > 0) {
        validUrls.forEach((url, i) => {
          setImages(prev => {
            const newGrid = [...prev];
            if (newGrid[i]) {
              newGrid[i] = {
                id: `unsplash-${now}-${i}`,
                url,
                title: `${query} ${i + 1}`,
                description: `${query} inspiration`,
                user: {
                  name: `Creator ${i + 1}`,
                  avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
                },
              };
            }
            return newGrid;
          });
        });
      }
    } catch (error) {
      // Keep fallback images - do nothing
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoadingMore || isSearching) return;
    setIsLoadingMore(true);
    
    const nextPage = page + 1;
    const startIndex = page * 10;
    
    try {
      const now = Date.now();
      const urls = await Promise.all(
        Array.from({ length: 10 }, async (_, i) => {
          try {
            const res = await fetch(`https://source.unsplash.com/400x400/?${encodeURIComponent(searchQuery)}&sig=${now}-${startIndex + i}`);
            return res.url;
          } catch {
            return null;
          }
        })
      );
      
      const validUrls = urls.filter((u): u is string => u !== null);
      const newImages = validUrls.map((url, i) => ({
        id: `loadmore-${now}-${startIndex + i}`,
        url,
        title: `${searchQuery} ${startIndex + i + 1}`,
        description: `${searchQuery} inspiration`,
        user: {
          name: `Creator ${startIndex + i + 1}`,
          avatar: `https://i.pravatar.cc/150?img=${((startIndex + i) % 70) + 1}`,
        },
      }));
      
      setImages(prev => [...prev, ...newImages]);
      setPage(nextPage);
      setHasMore(nextPage < 5);
    } catch (error) {
      // Add fallback images if load more fails
      const fallbackNewImages = fallbackImages.map((url, i) => ({
        id: `fallback-loadmore-${Date.now()}-${startIndex + i}`,
        url,
        title: `${searchQuery} ${startIndex + i + 1}`,
        description: `${searchQuery} inspiration`,
        user: {
          name: `Creator ${startIndex + i + 1}`,
          avatar: `https://i.pravatar.cc/150?img=${((startIndex + i) % 70) + 1}`,
        },
      }));
      setImages(prev => [...prev, ...fallbackNewImages]);
      setPage(nextPage);
      setHasMore(nextPage < 5);
    }
    
    setIsLoadingMore(false);
  };

  const handleCategoryPress = (category: string) => {
    setSearchQuery(category);
    setShowSuggestions(false);
    setSuggestions([]);
    setTimeout(() => {
      handleSearch(category);
    }, 0);
  };

  const renderSuggestion = ({ item }: { item: Suggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }]}
      onPress={() => {
        setSearchQuery(item.text);
        handleSearch(item.text);
      }}
    >
      <Ionicons name="search" size={16} color={isDarkMode ? '#7BD4C8' : '#181D1C'} />
      <Text style={[styles.suggestionText, { color: isDarkMode ? '#fff' : '#181D1C' }]}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={[styles.categoryItem, { backgroundColor: isDarkMode ? '#232B2B' : '#fff' }]}
      onPress={() => handleCategoryPress(item.title)}
      activeOpacity={0.8}
    >
      <Image source={item.imageUrl} style={styles.categoryImage} />
      <Text style={[styles.categoryTitle, { color: isDarkMode ? '#fff' : '#181D1C' }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderImageItem = ({ item, index }: { item: ImageItem; index: number }) => {
    const imageHeight = Math.floor(Math.random() * 100) + 200;
    
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
          onError={() => setImageLoadErrors(prev => ({ ...prev, [item.url]: true }))}
        />
        {!imageLoadErrors[item.url] && (
          <View style={styles.imageOverlay}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }]}>
                <Ionicons name="person" size={12} color={isDarkMode ? '#7BD4C8' : '#181D1C'} />
              </View>
              <Text style={styles.username}>{item.user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.saveButton}>
              <Ionicons name="bookmark-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPopularCategories = () => (
    <View style={{ flex: 1 }}>
      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
        Popular on Clipnest
      </Text>
      <FlatList
        data={popularCategories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        numColumns={2}
        scrollEnabled={true}
        contentContainerStyle={styles.categoriesGrid}
        style={{ flex: 1 }}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchBarRow}>
            <View style={[styles.searchInputContainer, { backgroundColor: isDarkMode ? '#232B2B' : '#fff' }]}>
              <Ionicons name="search" size={20} color={isDarkMode ? '#7BD4C8' : '#181D1C'} />
              <TextInput
                style={[styles.searchInput, { color: isDarkMode ? '#fff' : '#181D1C' }]}
                placeholder="Search Clipnest..."
                placeholderTextColor={isDarkMode ? '#7BD4C8' : '#666'}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  // Only show suggestions when typing and no results are showing
                  if (text.trim() && !showResults) {
                    const filtered = suggestionDatabase
                      .filter(item => item.toLowerCase().includes(text.toLowerCase()))
                      .slice(0, 8)
                      .map(item => ({
                        id: item,
                        text: item,
                        type: 'suggestion' as const
                      }));
                    setSuggestions(filtered);
                    setShowSuggestions(true);
                  } else if (!text.trim()) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                    setShowResults(false);
                  }
                }}
                onSubmitEditing={() => handleSearch()}
              />
            </View>
            {(searchQuery.length > 0 || showResults || showSuggestions) && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={[styles.cancelText, { color: isDarkMode ? '#7BD4C8' : '#27403B' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            {isSearching ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={isDarkMode ? '#4EE0C1' : '#27403B'} />
              </View>
            ) : showResults && images.length > 0 ? (
              <FlatList
                data={images}
                renderItem={renderImageItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isLoadingMore ? (
                    <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color={isDarkMode ? '#4EE0C1' : '#27403B'} />
                    </View>
                  ) : null
                }
              />
            ) : showSuggestions && suggestions.length > 0 ? (
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={item => item.id}
                keyboardShouldPersistTaps="handled"
                style={{ marginTop: 16 }}
                numColumns={1}
              />
            ) : (
              renderPopularCategories()
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    gap: 12,
  },
  suggestionText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoriesGrid: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    textAlign: 'center',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
