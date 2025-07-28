import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
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

const { width } = Dimensions.get('window');
const imageWidth = (width - 48) / 2; // 2 columns with 16px padding on each side and 16px gap

export default function HomeScreen() {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>({});

  const [images, setImages] = useState<ImageItem[]>([]);

  const fetchImages = async (isRefresh = false) => {
    if (isRefresh) {
      setPage(1);
      setHasMore(true);
    }

    // Simulate API call with dummy data
    const newImages = Array.from({ length: 20 }, (_, i) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}-${isRefresh ? 'refresh' : page}`,
      url: `https://picsum.photos/400/${Math.floor(Math.random() * 300) + 300}?random=${Math.random()}`,
      title: `Image ${i + 1}`,
      description: `Description for image ${i + 1}`,
      user: {
        name: `User ${i + 1}`,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50) + 1}.jpg`,
      },
    }));

    if (isRefresh) {
      setImages(newImages);
    } else {
      setImages(prev => [...prev, ...newImages]);
      setPage(p => p + 1);
    }
    setHasMore(page < 5); // Limit to 5 pages for demo
  };

  useEffect(() => {
    fetchImages(true);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchImages(true);
    setRefreshing(false);
  }, []);

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    await fetchImages();
    setIsLoadingMore(false);
  };

  const renderAvatar = useCallback((avatar?: string) => {
    if (!avatar || imageLoadErrors[avatar]) {
      return (
        <View style={[styles.avatar, { backgroundColor: isDarkMode ? '#232B2B' : '#E2F1ED' }]}>
          <Ionicons name="person" size={12} color={isDarkMode ? '#7BD4C8' : '#181D1C'} />
        </View>
      );
    }
    return (
      <Image 
        source={{ uri: avatar }} 
        style={styles.avatar}
        onError={() => setImageLoadErrors(prev => ({ ...prev, [avatar]: true }))}
      />
    );
  }, [isDarkMode, imageLoadErrors]);

  const renderItem = useCallback(({ item, index }: { item: ImageItem; index: number }) => {
    // Generate random height for masonry effect
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
          onError={() => setImageLoadErrors(prev => ({ ...prev, [item.url]: true }))}
        />
        {!imageLoadErrors[item.url] && (
          <View style={styles.imageOverlay}>
            <View style={styles.userInfo}>
              {renderAvatar(item.user?.avatar)}
              <Text style={styles.username}>{item.user?.name}</Text>
            </View>
            <TouchableOpacity style={styles.saveButton}>
              <Ionicons name="bookmark-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [images, imageWidth, router, imageLoadErrors, renderAvatar]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#4EE0C1' : '#27403B'}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={isDarkMode ? '#4EE0C1' : '#27403B'} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
