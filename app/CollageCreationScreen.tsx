import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useThemeContext } from '../theme/themecontext';
import { ImageItem, PinBoardContext } from './context/PinBoardContext';

interface CollageImage {
  id: string;
  uri: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedImages?: string[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CANVAS_WIDTH = screenWidth - 40;
const CANVAS_HEIGHT = screenHeight * 0.6;

export default function CollageCreationScreen({ visible, onClose, selectedImages = [] }: Props) {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const { addToCollage } = useContext(PinBoardContext);
  const [collageImages, setCollageImages] = useState<CollageImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const modalBg = isDarkMode ? '#181D1C' : '#F3FAF8';
  const textColor = isDarkMode ? '#FFFFFF' : '#181D1C';
  const buttonBg = isDarkMode ? '#252A29' : '#E2F1ED';
  const accentColor = '#4EE0C1';

  const pickImageFromGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      if (permissionResult.canAskAgain === false) {
        Alert.alert(
          'Permission required',
          'Please enable gallery access in your device settings.',
          [
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Permission to access gallery is required!');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets) {
      const newImages: CollageImage[] = result.assets.map((asset, index) => ({
        id: `img_${Date.now()}_${index}`,
        uri: asset.uri,
        x: 50 + (index * 20),
        y: 50 + (index * 20),
        width: 120,
        height: 120,
        scale: 1,
        rotation: 0,
      }));

      setCollageImages(prev => [...prev, ...newImages]);
    }
  };

  const handleImagePress = (imageId: string) => {
    setSelectedImageId(selectedImageId === imageId ? null : imageId);
  };

  const handleImageMove = (imageId: string, translationX: number, translationY: number) => {
    setCollageImages(prev =>
      prev.map(img => {
        if (img.id === imageId) {
          // Add a factor to make movement slower and smoother
          const slowFactor = 0.5;
          const newX = img.x + (translationX * slowFactor);
          const newY = img.y + (translationY * slowFactor);
          
          // Constrain images to stay within the white canvas boundaries
          const minX = 0;
          const maxX = CANVAS_WIDTH - img.width;
          const minY = 0;
          const maxY = CANVAS_HEIGHT - img.height;
          
          return { 
            ...img, 
            x: Math.max(minX, Math.min(maxX, newX)),
            y: Math.max(minY, Math.min(maxY, newY))
          };
        }
        return img;
      })
    );
  };

  const removeImage = (imageId: string) => {
    setCollageImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImageId(null);
  };

  const handleSaveCollage = async () => {
    if (collageImages.length === 0) return;
    
    setIsSaving(true);
    
    try {
      // Create a collage image from the current layout
      const collageId = `collage_${Date.now()}`;
      
      // Create a collage representation
      // In a real implementation, you would capture the canvas as an image
      // For now, we'll create a collage object that represents the layout
      const collageImage: ImageItem = {
        id: collageId,
        url: collageImages.length > 1 
          ? 'https://via.placeholder.com/300x300/FFFFFF/000000?text=My+Collage' 
          : collageImages[0]?.uri || 'https://via.placeholder.com/300x300/FFFFFF/000000?text=Collage',
        height: CANVAS_HEIGHT,
      };
      
      // Add the collage to the user's profile
      addToCollage(collageImage);
      
      // Show success message
      Alert.alert(
        'Collage Saved!',
        'Your collage has been saved to your profile.',
        [
          {
            text: 'View in Profile',
            onPress: () => {
              onClose();
              // Navigate to profile with collages tab active
              router.push({
                pathname: '/profile',
                params: { activeTab: 'collages' }
              });
            }
          },
          {
            text: 'OK',
            onPress: onClose
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save collage. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: textColor }]}>Create Collage</Text>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: collageImages.length > 0 ? accentColor : '#ccc',
                },
              ]}
              onPress={handleSaveCollage}
              disabled={collageImages.length === 0 || isSaving}
            >
              <Text style={[styles.saveButtonText, { color: collageImages.length > 0 ? '#181D1C' : '#666' }]}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Canvas Area */}
          <View style={styles.canvasContainer}>
            <View style={styles.canvas}>
              {collageImages.map((image) => (
                <PanGestureHandler
                  key={image.id}
                  onGestureEvent={(event: any) => {
                    const { translationX, translationY } = event.nativeEvent;
                    handleImageMove(image.id, translationX, translationY);
                  }}
                >
                  <Pressable
                    style={[
                      styles.collageImage,
                      {
                        left: image.x,
                        top: image.y,
                        width: image.width,
                        height: image.height,
                        borderWidth: selectedImageId === image.id ? 3 : 0,
                        borderColor: accentColor,
                      },
                    ]}
                    onPress={() => handleImagePress(image.id)}
                  >
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.imageContent}
                      resizeMode="cover"
                    />
                    {selectedImageId === image.id && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImage(image.id)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF4444" />
                      </TouchableOpacity>
                    )}
                  </Pressable>
                </PanGestureHandler>
              ))}
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={[styles.photoButton, { backgroundColor: buttonBg }]}
              onPress={pickImageFromGallery}
            >
              <MaterialCommunityIcons name="image-plus" size={24} color={textColor} />
              <Text style={[styles.photoButtonText, { color: textColor }]}>Add Photos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  canvasContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  collageImage: {
    position: 'absolute',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContent: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 