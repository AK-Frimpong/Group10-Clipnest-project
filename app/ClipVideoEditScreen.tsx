import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Alert, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';

const { width } = Dimensions.get('window');
const BUTTON_COLOR = '#4EE0C1';
const EDIT_TOOLS = [
  { key: 'size', label: 'Size', icon: 'aspect-ratio' },
  { key: 'media', label: 'Media', icon: 'image-multiple' },
  { key: 'text', label: 'Text', icon: 'format-text' },
  { key: 'draw', label: 'Draw', icon: 'draw' },
  { key: 'stickers', label: 'Stickers', icon: 'sticker-emoji' },
  { key: 'audio', label: 'Audio', icon: 'music' },
  { key: 'filters', label: 'Filters', icon: 'filter-variant' },
];

export default function ClipVideoEditScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeContext();
  const { videoUri, duration } = useLocalSearchParams();
  const videoRef = useRef(null);

  const handleBack = () => {
    Alert.alert('Discard changes?', 'Are you sure you want to discard this video?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const handleTool = (tool: string) => {
    Alert.alert(tool, `This is a placeholder for the ${tool} tool.`);
  };

  const handleNext = () => {
    // Navigate to the next step (e.g., description screen)
    router.push({ pathname: '/CreateClipScreen', params: { uri: videoUri, height: 250 } });
  };

  // Progress bar calculation
  const progress = 1; // For now, always full length (implement actual progress if needed)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton}>
          <Ionicons name="help-circle-outline" size={26} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.nextButton, { backgroundColor: BUTTON_COLOR }]} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      {/* Video Preview */}
      <View style={styles.videoContainer}>
        {videoUri ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUri as string }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay
            useNativeControls={false}
          />
        ) : (
          <View style={[styles.video, { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }]}> 
            <Text style={{ color: '#fff' }}>No video</Text>
          </View>
        )}
      </View>
      {/* Progress Bar */}
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarBg} />
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
      {/* Edit Tools */}
      <View style={styles.toolsRow}>
        {EDIT_TOOLS.map((tool) => (
          <TouchableOpacity key={tool.key} style={styles.toolButton} onPress={() => handleTool(tool.label)}>
            <MaterialCommunityIcons name={tool.icon as any} size={28} color={isDarkMode ? '#fff' : '#222'} />
            <Text style={[styles.toolLabel, { color: isDarkMode ? '#fff' : '#222' }]}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    paddingHorizontal: 12,
    paddingTop: 8,
    marginBottom: 8,
  },
  topButton: {
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 18,
    padding: 6,
  },
  nextButton: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginLeft: 12,
  },
  nextButtonText: {
    color: '#181D1C',
    fontWeight: 'bold',
    fontSize: 16,
  },
  videoContainer: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width - 16,
    height: width * 1.2,
    borderRadius: 18,
  },
  progressBarWrapper: {
    height: 18,
    justifyContent: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  progressBarBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#eee',
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 2,
    backgroundColor: BUTTON_COLOR,
  },
  toolsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  toolButton: {
    alignItems: 'center',
    flex: 1,
  },
  toolLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
}); 