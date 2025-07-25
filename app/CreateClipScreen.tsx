import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';
import { ImageItem, PinBoardContext } from './context/PinBoardContext';

export default function CreateClipScreen() {
  const router = useRouter();
  const { uri, height } = useLocalSearchParams();
  const { addPin } = useContext(PinBoardContext);
  const { isDarkMode } = useThemeContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleCreate = () => {
    if (!uri) {
      Alert.alert('No image selected');
      return;
    }
    const newClip: ImageItem = {
      id: `clip_${Date.now()}`,
      url: uri as string,
      height: Number(height) || 250,
    };
    addPin(newClip);
    router.replace('/(tabs)/profile');
  };

  const handleNext = () => {
    // Navigate to description screen
    router.push({
      pathname: '/ClipDescriptionScreen',
      params: { uri: uri as string, height: Number(height) || 250 },
    });
  };

  const editingTools = [
    { id: 'size', icon: 'crop-square', label: 'Size' },
    { id: 'media', icon: 'image', label: 'Media' },
    { id: 'text', icon: 'format-size', label: 'Text' },
    { id: 'draw', icon: 'edit', label: 'Draw' },
    { id: 'stickers', icon: 'sticker-emoji', label: 'Stickers' },
    { id: 'audio', icon: 'mic', label: 'Audio' },
    { id: 'filters', icon: 'tune', label: 'Filters' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton}>
          <Ionicons name="help-circle-outline" size={26} color={isDarkMode ? '#fff' : '#222'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Preview */}
      <View style={styles.photoContainer}>
        {uri && (
          <Image 
            source={{ uri: uri as string }} 
            style={styles.photoPreview} 
            resizeMode="cover" 
          />
        )}
      </View>

      {/* Editing Tools */}
      <View style={styles.toolsContainer}>
        {editingTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[
              styles.toolButton,
              selectedTool === tool.id && styles.toolButtonSelected
            ]}
            onPress={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
          >
            <MaterialCommunityIcons 
              name={tool.icon as any} 
              size={24} 
              color={selectedTool === tool.id ? '#4EE0C1' : (isDarkMode ? '#fff' : '#222')} 
            />
            <Text style={[
              styles.toolLabel,
              { color: selectedTool === tool.id ? '#4EE0C1' : (isDarkMode ? '#fff' : '#222') }
            ]}>
              {tool.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tool Content Area (placeholder for now) */}
      {selectedTool && (
        <View style={styles.toolContent}>
          <Text style={[styles.toolContentText, { color: isDarkMode ? '#fff' : '#222' }]}>
            {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} tools coming soon...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#E60023',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  toolButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  toolButtonSelected: {
    backgroundColor: 'rgba(78, 224, 193, 0.1)',
  },
  toolLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  toolContent: {
    padding: 20,
    alignItems: 'center',
  },
  toolContentText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 