import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';
import { ImageItem, PinBoardContext } from './context/PinBoardContext';

export default function ClipDescriptionScreen() {
  const router = useRouter();
  const { uri, height } = useLocalSearchParams();
  const { addPin } = useContext(PinBoardContext);
  const { isDarkMode } = useThemeContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}> 
      <View style={styles.previewContainer}>
        {uri && (
          <Image source={{ uri: uri as string }} style={styles.previewImage} resizeMode="cover" />
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222' }]}>Title</Text>
        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#222', borderColor: isDarkMode ? '#444' : '#ccc' }]}
          placeholder="Tell everyone what your Clip is about"
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <Text style={[styles.label, { color: isDarkMode ? '#fff' : '#222', marginTop: 16 }]}>Description</Text>
        <TextInput
          style={[styles.input, { color: isDarkMode ? '#fff' : '#222', borderColor: isDarkMode ? '#444' : '#ccc', height: 80 }]}
          placeholder="Add a description, mention or hashtags to your Clip."
          placeholderTextColor={isDarkMode ? '#aaa' : '#888'}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: 220,
    height: 220,
    borderRadius: 16,
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  createButton: {
    backgroundColor: '#4EE0C1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 