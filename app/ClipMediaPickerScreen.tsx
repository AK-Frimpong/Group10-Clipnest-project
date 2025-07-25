import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'video', label: 'Videos' },
  { key: 'photo', label: 'Photos' },
];

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 8 * (numColumns + 1)) / numColumns;

type MediaGridItemProps = {
  item: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

function MediaGridItem({ item, isSelected, onSelect }: MediaGridItemProps) {
  const [displayUri, setDisplayUri] = React.useState<string | null>(item.uri.startsWith('file://') ? item.uri : null);
  React.useEffect(() => {
    let mounted = true;
    MediaLibrary.getAssetInfoAsync(item.id).then(info => {
      if (mounted && info.localUri && info.localUri.startsWith('file://')) {
        setDisplayUri(info.localUri);
      } else if (mounted) {
        setDisplayUri(null);
      }
    });
    return () => { mounted = false; };
  }, [item.id]);

  const isVideo = item.mediaType === 'video' && displayUri && displayUri.startsWith('file://');

  return (
    <TouchableOpacity style={[styles.gridItem, isSelected && { borderWidth: 3, borderColor: '#4EE0C1' }]} onPress={() => onSelect(item.id)}>
      {displayUri ? (
        item.mediaType === 'video' ? (
          <Video
            source={{ uri: displayUri }}
            style={styles.gridImage}
            resizeMode={ResizeMode.COVER}
            isMuted
            shouldPlay={false}
          />
        ) : (
          <Image source={{ uri: displayUri }} style={styles.gridImage} />
        )
      ) : (
        <View style={[styles.gridImage, { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }]}> 
          <MaterialCommunityIcons name={item.mediaType === 'video' ? 'video-off' : 'image-off'} size={32} color="#aaa" />
        </View>
      )}
      {item.mediaType === 'video' && (
        <View style={styles.durationOverlay}>
          <MaterialCommunityIcons name="video" size={18} color="#fff" />
          <Text style={styles.durationText}>{item.duration ? Math.round(item.duration) + 's' : ''}</Text>
        </View>
      )}
      {isSelected && (
        <View style={styles.selectedOverlay}>
          <Ionicons name="checkmark-circle" size={28} color="#4EE0C1" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ClipMediaPickerScreen() {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'photo'>('all');
  const [media, setMedia] = useState<any[]>([]);
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 60;

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) return;
    fetchMedia(true);
    // eslint-disable-next-line
  }, [permission, activeTab]);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  const fetchMedia = async (reset = false) => {
    let mediaType: MediaLibrary.MediaTypeValue | MediaLibrary.MediaTypeValue[] | undefined;
    if (activeTab === 'photo') mediaType = 'photo';
    else if (activeTab === 'video') mediaType = 'video';
    else mediaType = ['photo', 'video']; // For All tab
    const result = await MediaLibrary.getAssetsAsync({
      mediaType,
      first: pageSize * (reset ? 1 : page),
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });
    setMedia(result.assets);
  };

  const handleSelect = useCallback((id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleEndReached = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    setPage(1);
    fetchMedia(true);
    setSelected([]);
    // eslint-disable-next-line
  }, [activeTab, permission]);

  useEffect(() => {
    if (page > 1) fetchMedia();
    // eslint-disable-next-line
  }, [page]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <Ionicons name="close" size={28} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <Text style={[styles.dropdown, { color: isDarkMode ? '#fff' : '#222' }]}>All photos</Text>
        <View style={{ width: 28 }} />
      </View>
      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => setActiveTab(tab.key as any)}>
            <Text style={{ color: isDarkMode ? '#fff' : '#222', fontWeight: activeTab === tab.key ? 'bold' : 'normal' }}>{tab.label}</Text>
            {activeTab === tab.key && <View style={[styles.tabUnderline, { backgroundColor: isDarkMode ? '#4EE0C1' : '#181D1C' }]} />}
          </TouchableOpacity>
        ))}
      </View>
      {/* Media Grid */}
      {!permission || !permission.granted ? (
        <Text style={{ color: isDarkMode ? '#aaa' : '#555', textAlign: 'center', marginTop: 32 }}>
          Please allow camera roll access to see your media.
        </Text>
      ) : media.length === 0 ? (
        <Text style={{ color: isDarkMode ? '#aaa' : '#555', textAlign: 'center', marginTop: 32 }}>No media found.</Text>
      ) : (
        <FlatList
          data={media}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.grid}
          renderItem={({ item }: { item: any }) => (
            <MediaGridItem
              item={item}
              isSelected={selected.includes(item.id)}
              onSelect={handleSelect}
            />
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
        />
      )}
      {/* Next Button */}
      {selected.length > 0 && (
        <TouchableOpacity style={styles.nextButton} onPress={() => router.push({ pathname: '/CreateClipScreen', params: { selected: JSON.stringify(media.filter(m => selected.includes(m.id))) } })}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      )}
      {/* Camera Button */}
      <TouchableOpacity style={styles.cameraButton} onPress={() => router.push('/ClipCameraScreen')}>
        <Ionicons name="camera" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#333',
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabUnderline: {
    height: 3,
    width: 28,
    borderRadius: 2,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: 4,
    paddingBottom: 80,
  },
  gridItem: {
    margin: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  gridImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: 10,
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cameraButton: {
    position: 'absolute',
    left: 24,
    bottom: 24,
    backgroundColor: '#181D1C',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
  },
  nextButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#4EE0C1',
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
  },
  nextButtonText: {
    color: '#181D1C',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 