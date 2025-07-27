import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Dimensions, Image, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useThemeContext } from '../theme/themecontext';
import { ImageItem, PinBoardContext } from './context/PinBoardContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CreateClipScreen() {
  const router = useRouter();
  const { uri, height } = useLocalSearchParams();
  const { addPin } = useContext(PinBoardContext);
  const { isDarkMode } = useThemeContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('9:16'); // Default to 9:16
  const [textOverlays, setTextOverlays] = useState<Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    isEditing: boolean;
    isBold: boolean;
    isItalic: boolean;
  }>>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawingLines, setDrawingLines] = useState<Array<{
    id: string;
    points: Array<{ x: number; y: number }>;
    strokeWidth: number;
    color: string;
  }>>([]);
  const [currentLine, setCurrentLine] = useState<Array<{ x: number; y: number }>>([]);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedPencilSize, setSelectedPencilSize] = useState(3);

  // Font options
  const fontOptions = [
    { id: 'System', name: 'Default' },
    { id: 'Roboto', name: 'Roboto' },
    { id: 'OpenSans', name: 'Open Sans' },
    { id: 'Montserrat', name: 'Montserrat' },
    { id: 'bold', name: 'Bold' },
    { id: 'italic', name: 'Italic' },
  ];

  // Color options
  const colorOptions = [
    { id: 'white', color: '#FFFFFF' },
    { id: 'black', color: '#000000' },
    { id: 'red', color: '#FF0000' },
    { id: 'blue', color: '#0000FF' },
    { id: 'green', color: '#00FF00' },
    { id: 'yellow', color: '#FFFF00' },
    { id: 'purple', color: '#800080' },
    { id: 'orange', color: '#FFA500' },
  ];

  // Filter options
  const filterOptions = [
    { id: 'normal', name: 'Normal', style: {} },
    { id: 'grayscale', name: 'B&W', style: { tintColor: '#000000', opacity: 0.3 } },
    { id: 'sepia', name: 'Sepia', style: { tintColor: '#704214', opacity: 0.3 } },
    { id: 'warm', name: 'Warm', style: { tintColor: '#FF6B6B', opacity: 0.2 } },
    { id: 'cool', name: 'Cool', style: { tintColor: '#4ECDC4', opacity: 0.2 } },
    { id: 'vintage', name: 'Vintage', style: { tintColor: '#8B4513', opacity: 0.25 } },
    { id: 'dramatic', name: 'Dramatic', style: { tintColor: '#2C3E50', opacity: 0.4 } },
    { id: 'fade', name: 'Fade', style: { opacity: 0.7 } },
  ];

  // Drawing colors
  const drawingColors = [
    { id: 'white', color: '#FFFFFF' },
    { id: 'black', color: '#000000' },
    { id: 'red', color: '#FF0000' },
    { id: 'blue', color: '#0000FF' },
    { id: 'green', color: '#00FF00' },
    { id: 'yellow', color: '#FFFF00' },
    { id: 'purple', color: '#800080' },
    { id: 'orange', color: '#FFA500' },
  ];

  // Pencil sizes
  const pencilSizes = [
    { id: 'small', size: 2, label: 'S' },
    { id: 'medium', size: 4, label: 'M' },
    { id: 'large', size: 6, label: 'L' },
    { id: 'xlarge', size: 8, label: 'XL' },
  ];

  // Size options
  const sizeOptions = [
    { id: '9:16', name: 'Full', ratio: 9/16 },
    { id: '2:3', name: '2:3', ratio: 2/3 },
    { id: '3:4', name: '3:4', ratio: 3/4 },
    { id: '4:5', name: '4:5', ratio: 4/5 },
    { id: '1:1', name: 'Square', ratio: 1 },
  ];

  const getImageDimensions = () => {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const maxHeight = screenHeight * 0.7; // 70% of screen height for image
    const maxWidth = screenWidth;

    return {
      width: maxWidth,
      height: maxHeight,
    };
  };

  const getGridDimensions = () => {
    if (selectedSize === '9:16') return null;

    const { width: containerWidth, height: containerHeight } = getImageDimensions();
    const selectedOption = sizeOptions.find(option => option.id === selectedSize);
    if (!selectedOption) return null;

    const ratio = selectedOption.ratio;
    let width, height;

    if (containerHeight * ratio <= containerWidth) {
      // Height is the limiting factor
      height = containerHeight;
      width = containerHeight * ratio;
    } else {
      // Width is the limiting factor
      width = containerWidth;
      height = containerWidth / ratio;
    }

    return {
      width,
      height,
    };
  };

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
    if (!uri) return;

    const gridDimensions = getGridDimensions();
    const imageSize = gridDimensions || getImageDimensions();
    
    router.push({
      pathname: '/ClipDescriptionScreen',
      params: { 
        uri: uri as string,
        width: imageSize.width,
        height: imageSize.height,
        size: selectedSize,
      },
    });
  };

  const editingTools = [
    { id: 'size', icon: 'crop-square', label: 'Size' },
    { id: 'text', icon: 'format-size', label: 'Text' },
    { id: 'draw', icon: 'edit', label: 'Draw' },
    { id: 'filters', icon: 'tune', label: 'Filters' },
  ];

  // Text functionality
  const handleTextToolPress = () => {
    const { width, height } = getImageDimensions();
    const newText = {
      id: `text_${Date.now()}`,
      text: '',
      x: width / 2 - 50,
      y: height / 2 - 20,
      fontSize: 24,
      fontFamily: 'System',
      color: '#FFFFFF',
      isEditing: true,
      isBold: false,
      isItalic: false,
    };
    setTextOverlays([...textOverlays, newText]);
    setActiveTextId(newText.id);
    setSelectedTool('text');
  };

  const handleTextPress = (textId: string) => {
    const textOverlay = textOverlays.find(t => t.id === textId);
    if (textOverlay) {
      setActiveTextId(textId);
      updateTextOverlay(textId, { isEditing: true });
    }
  };

  const updateTextOverlay = (id: string, updates: any) => {
    setTextOverlays(prev => 
      prev.map(text => 
        text.id === id ? { ...text, ...updates } : text
      )
    );
  };

  const deleteTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter(text => text.id !== id));
    setActiveTextId(null);
  };

  const handleTextMove = (id: string, translationX: number, translationY: number) => {
    const text = textOverlays.find(t => t.id === id);
    if (text) {
      const { width, height } = getImageDimensions();
      const newX = Math.max(0, Math.min(width - 100, text.x + translationX));
      const newY = Math.max(0, Math.min(height - 40, text.y + translationY));
      updateTextOverlay(id, {
        x: newX,
        y: newY,
      });
    }
  };

  const getFilterStyle = () => {
    const selectedFilterOption = filterOptions.find(option => option.id === selectedFilter);
    return selectedFilterOption?.style || {};
  };

  // Drawing functionality
  const handleDrawingStart = (x: number, y: number) => {
    if (drawingMode) {
      // Ensure coordinates are within bounds
      const { width, height } = getGridDimensions() || getImageDimensions();
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        setCurrentLine([{ x, y }]);
      }
    }
  };

  const handleDrawingMove = (x: number, y: number) => {
    if (drawingMode && currentLine.length > 0) {
      // Ensure coordinates are within bounds
      const { width, height } = getGridDimensions() || getImageDimensions();
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        setCurrentLine([...currentLine, { x, y }]);
      }
    }
  };

  const handleDrawingEnd = () => {
    if (drawingMode && currentLine.length > 1) {
      const newLine = {
        id: `line_${Date.now()}`,
        points: [...currentLine],
        color: selectedColor,
        strokeWidth: selectedPencilSize,
      };
      setDrawingLines([...drawingLines, newLine]);
      setCurrentLine([]);
    }
  };

  // Drawing overlay component
  const DrawingOverlay = () => (
    <View style={StyleSheet.absoluteFill}>
      {drawingLines.map((line) => (
        <View key={line.id}>
          {line.points.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = line.points[index - 1];
            return (
              <View
                key={index}
                style={[
                  styles.drawingLine,
                  {
                    left: prevPoint.x,
                    top: prevPoint.y,
                    width: Math.sqrt(
                      Math.pow(point.x - prevPoint.x, 2) + 
                      Math.pow(point.y - prevPoint.y, 2)
                    ),
                    height: line.strokeWidth,
                    backgroundColor: line.color,
                    transform: [{
                      rotate: `${Math.atan2(
                        point.y - prevPoint.y,
                        point.x - prevPoint.x
                      )}rad`
                    }],
                    transformOrigin: 'left',
                  }
                ]}
              />
            );
          })}
        </View>
      ))}
      {currentLine.map((point, index) => {
        if (index === 0) return null;
        const prevPoint = currentLine[index - 1];
        return (
          <View
            key={index}
            style={[
              styles.drawingLine,
              {
                left: prevPoint.x,
                top: prevPoint.y,
                width: Math.sqrt(
                  Math.pow(point.x - prevPoint.x, 2) + 
                  Math.pow(point.y - prevPoint.y, 2)
                ),
                height: selectedPencilSize,
                backgroundColor: selectedColor,
                transform: [{
                  rotate: `${Math.atan2(
                    point.y - prevPoint.y,
                    point.x - prevPoint.x
                  )}rad`
                }],
                transformOrigin: 'left',
              }
            ]}
          />
        );
      })}
    </View>
  );

  // Text overlay component
  const TextOverlays = () => (
    <>
      {textOverlays.map((textOverlay) => (
        <View key={textOverlay.id} style={StyleSheet.absoluteFill}>
          <PanGestureHandler
            enabled={!textOverlay.isEditing}
            onGestureEvent={(event) => {
              const { translationX, translationY } = event.nativeEvent;
              const { width, height } = getImageDimensions();
              const newX = Math.max(0, Math.min(width - 100, textOverlay.x + translationX));
              const newY = Math.max(0, Math.min(height - 40, textOverlay.y + translationY));
              updateTextOverlay(textOverlay.id, { x: newX, y: newY });
            }}
          >
            <View
              style={[
                styles.textContainer,
                {
                  transform: [
                    { translateX: textOverlay.x },
                    { translateY: textOverlay.y }
                  ]
                }
              ]}
            >
              {textOverlay.isEditing ? (
                <TextInput
                  value={textOverlay.text}
                  onChangeText={(text) => {
                    updateTextOverlay(textOverlay.id, { text });
                  }}
                  style={[
                    styles.textInput,
                    {
                      color: textOverlay.color,
                      fontSize: textOverlay.fontSize,
                      fontFamily: textOverlay.fontFamily,
                      fontWeight: textOverlay.isBold ? 'bold' : 'normal',
                      fontStyle: textOverlay.isItalic ? 'italic' : 'normal',
                    }
                  ]}
                  autoFocus
                  multiline
                  onBlur={() => {
                    if (textOverlay.text.trim() === '') {
                      setTextOverlays(textOverlays.filter(t => t.id !== textOverlay.id));
                    } else {
                      updateTextOverlay(textOverlay.id, { isEditing: false });
                    }
                    setActiveTextId(null);
                  }}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => handleTextPress(textOverlay.id)}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        color: textOverlay.color,
                        fontSize: textOverlay.fontSize,
                        fontFamily: textOverlay.fontFamily,
                        fontWeight: textOverlay.isBold ? 'bold' : 'normal',
                        fontStyle: textOverlay.isItalic ? 'italic' : 'normal',
                      }
                    ]}
                  >
                    {textOverlay.text}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </PanGestureHandler>
        </View>
      ))}
    </>
  );

  const renderTextTool = () => (
    <View style={styles.toolContentArea}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <Text style={[styles.toolSectionTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
          Font:
        </Text>
        {fontOptions.map((font) => (
          <TouchableOpacity
            key={font.id}
            style={[
              styles.horizontalStyleOption,
              { borderColor: isDarkMode ? '#333' : '#ddd' }
            ]}
            onPress={() => {
              if (activeTextId) {
                const textOverlay = textOverlays.find(t => t.id === activeTextId);
                if (textOverlay) {
                  if (font.id === 'bold') {
                    updateTextOverlay(activeTextId, { isBold: !textOverlay.isBold });
                  } else if (font.id === 'italic') {
                    updateTextOverlay(activeTextId, { isItalic: !textOverlay.isItalic });
                  } else {
                    updateTextOverlay(activeTextId, { fontFamily: font.id });
                  }
                }
              }
            }}
          >
            <Text style={[
              styles.horizontalStyleOptionText,
              { 
                color: isDarkMode ? '#fff' : '#222',
                fontFamily: font.id !== 'bold' && font.id !== 'italic' ? font.id : 'System',
                fontWeight: font.id === 'bold' ? 'bold' : 'normal',
                fontStyle: font.id === 'italic' ? 'italic' : 'normal',
              }
            ]}>
              {font.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <Text style={[styles.toolSectionTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
          Size:
        </Text>
        {[16, 20, 24, 32, 40, 48].map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.horizontalStyleOption,
              { borderColor: isDarkMode ? '#333' : '#ddd' }
            ]}
            onPress={() => activeTextId && updateTextOverlay(activeTextId, { fontSize: size })}
          >
            <Text style={[
              styles.horizontalStyleOptionText,
              { 
                color: isDarkMode ? '#fff' : '#222',
                fontSize: Math.min(size, 24),
              }
            ]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <Text style={[styles.toolSectionTitle, { color: isDarkMode ? '#fff' : '#222' }]}>
          Color:
        </Text>
        {colorOptions.map((color) => (
          <TouchableOpacity
            key={color.id}
            style={[
              styles.horizontalColorOption,
              { backgroundColor: color.color }
            ]}
            onPress={() => activeTextId && updateTextOverlay(activeTextId, { color: color.color })}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderFilterTool = () => (
    <View style={styles.toolContentArea}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.horizontalFilterOption,
              selectedFilter === filter.id && styles.horizontalFilterOptionSelected,
              { borderColor: isDarkMode ? '#333' : '#ddd' }
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <View style={styles.horizontalFilterPreview}>
              {uri && (
                <Image
                  source={{ uri: uri as string }}
                  style={[
                    styles.filterPreviewImage,
                    filter.style
                  ]}
                  resizeMode="cover"
                />
              )}
            </View>
            <Text style={[
              styles.horizontalFilterOptionText,
              { color: selectedFilter === filter.id ? '#4EE0C1' : (isDarkMode ? '#fff' : '#222') }
            ]}>
              {filter.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDrawTool = () => (
    <View style={styles.toolContentArea}>
      <View style={styles.drawControls}>
        <TouchableOpacity
          style={[
            styles.drawButton,
            drawingMode && styles.drawButtonActive
          ]}
          onPress={() => setDrawingMode(!drawingMode)}
        >
          <Text style={styles.drawButtonText}>
            {drawingMode ? 'Drawing ON' : 'Drawing OFF'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clearDrawButton}
          onPress={() => setDrawingLines([])}
        >
          <Text style={styles.clearDrawButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Pencil Size Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <Text style={styles.toolSectionTitle}>Size:</Text>
        {pencilSizes.map((pencil) => (
          <TouchableOpacity
            key={pencil.id}
            style={[
              styles.pencilOption,
              selectedPencilSize === pencil.size && styles.pencilOptionSelected
            ]}
            onPress={() => setSelectedPencilSize(pencil.size)}
          >
            <View style={[styles.pencilPreview, { height: pencil.size }]} />
            <Text style={styles.pencilLabel}>{pencil.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Color Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <Text style={styles.toolSectionTitle}>Color:</Text>
        {drawingColors.map((color) => (
          <TouchableOpacity
            key={color.id}
            style={[
              styles.colorOption,
              { backgroundColor: color.color },
              selectedColor === color.color && styles.colorOptionSelected
            ]}
            onPress={() => setSelectedColor(color.color)}
          />
        ))}
      </ScrollView>
    </View>
  );

  const renderSizeOptions = () => (
    <View style={styles.toolContentArea}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {sizeOptions.map((size) => (
          <TouchableOpacity
            key={size.id}
            style={[
              styles.horizontalSizeOption,
              selectedSize === size.id && styles.horizontalFilterOptionSelected,
              { borderColor: isDarkMode ? '#333' : '#ddd' }
            ]}
            onPress={() => setSelectedSize(size.id)}
          >
            <View style={[
              styles.sizePreview,
              { aspectRatio: size.ratio }
            ]} />
            <Text style={[
              styles.horizontalSizeOptionText,
              { color: selectedSize === size.id ? '#4EE0C1' : (isDarkMode ? '#fff' : '#222') }
            ]}>
              {size.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const GridOverlay = () => {
    if (selectedSize === '9:16') return null;
    
    return (
      <View style={[
        styles.gridOverlay,
        getGridDimensions()
      ]}>
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    fullScreenImageContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: -1,
    },
    imageContainer: {
      overflow: 'hidden',
      borderRadius: 12,
      backgroundColor: '#000',
    },
    fullScreenImage: {
      width: '100%',
      height: '100%',
    },
    textContainer: {
      position: 'absolute',
      minWidth: 100,
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textInput: {
      minWidth: 100,
      textAlign: 'center',
      padding: 0,
      margin: 0,
      backgroundColor: 'transparent',
    },
    text: {
      textAlign: 'center',
    },
    toolContentArea: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 16,
    },
    horizontalScroll: {
      marginBottom: 16,
    },
    horizontalStyleOption: {
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      minWidth: 60,
    },
    horizontalStyleOptionText: {
      fontSize: 14,
      textAlign: 'center',
    },
    horizontalSizeOption: {
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      minWidth: 40,
    },
    horizontalSizeOptionText: {
      fontSize: 14,
      textAlign: 'center',
    },
    horizontalColorOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 16,
      borderWidth: 2,
      borderColor: '#fff',
    },
    horizontalFilterOption: {
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      width: 80,
    },
    horizontalFilterPreview: {
      width: 64,
      height: 64,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 8,
      backgroundColor: '#000',
    },
    filterPreviewImage: {
      width: '100%',
      height: '100%',
    },
    horizontalFilterOptionText: {
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    horizontalFilterOptionSelected: {
      borderColor: '#4EE0C1',
      borderWidth: 2,
    },
    toolSectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 12,
      alignSelf: 'center',
    },
    gridOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderStyle: 'dashed',
    },
    gridLineHorizontal1: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '33%',
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    gridLineHorizontal2: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '66%',
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    gridLineVertical1: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '33%',
      width: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    gridLineVertical2: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '66%',
      width: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    sizePreview: {
      width: 40,
      backgroundColor: '#333',
      marginBottom: 8,
    },
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 40,
      paddingBottom: 10,
      zIndex: 10,
    },
    topButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    nextButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: '#4EE0C1',
    },
    nextButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    toolsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 10,
    },
    toolButton: {
      alignItems: 'center',
    },
    toolButtonSelected: {
      opacity: 0.7,
    },
    toolLabel: {
      fontSize: 12,
      marginTop: 4,
    },
    drawControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
      paddingHorizontal: 10,
    },
    drawButton: {
      backgroundColor: '#4EE0C1',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    drawButtonActive: {
      backgroundColor: '#333',
    },
    drawButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    clearDrawButton: {
      backgroundColor: '#E60023',
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    clearDrawButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    pencilOption: {
      marginRight: 15,
      alignItems: 'center',
      width: 60,
    },
    pencilOptionSelected: {
      borderColor: '#4EE0C1',
      borderWidth: 2,
    },
    pencilPreview: {
      width: 40,
      borderRadius: 4,
      marginBottom: 8,
      backgroundColor: '#333',
    },
    pencilLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
    colorOption: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginRight: 10,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    colorOptionSelected: {
      borderColor: '#4EE0C1',
      borderWidth: 2,
    },
    drawingLine: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1,
      height: 1,
      backgroundColor: 'transparent',
    },
    toolContentText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#fff',
      textAlign: 'center',
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
            {/* Full Screen Image Background */}
            {uri && (
              <View style={styles.fullScreenImageContainer}>
                <View style={[
                  styles.imageContainer,
                  selectedSize !== '9:16' && getGridDimensions() ? {
                    width: getGridDimensions()?.width,
                    height: getGridDimensions()?.height,
                  } : {
                    width: getImageDimensions().width,
                    height: getImageDimensions().height,
                  }
                ]}>
                  <Image 
                    source={{ uri: uri as string }} 
                    style={[
                      styles.fullScreenImage,
                      getFilterStyle(),
                    ]} 
                    resizeMode="cover" 
                  />
                  <GridOverlay />
                  <View
                    style={StyleSheet.absoluteFill}
                    onTouchStart={(e) => {
                      const { locationX, locationY } = e.nativeEvent;
                      if (activeTextId) {
                        const textOverlay = textOverlays.find(t => t.id === activeTextId);
                        if (textOverlay && textOverlay.isEditing) {
                          if (textOverlay.text.trim() === '') {
                            setTextOverlays(textOverlays.filter(t => t.id !== activeTextId));
                          } else {
                            updateTextOverlay(activeTextId, { isEditing: false });
                          }
                          setActiveTextId(null);
                          Keyboard.dismiss();
                        }
                      } else {
                        handleDrawingStart(locationX, locationY);
                      }
                    }}
                    onTouchMove={(e) => {
                      const { locationX, locationY } = e.nativeEvent;
                      handleDrawingMove(locationX, locationY);
                    }}
                    onTouchEnd={handleDrawingEnd}
                  >
                    <DrawingOverlay />
                    <TextOverlays />
                  </View>
                </View>
              </View>
            )}

            {/* Top Bar - Overlay on Image */}
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.topButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.topButton}>
                <Ionicons name="help-circle-outline" size={26} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
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
                  onPress={() => {
                    if (tool.id === 'text') {
                      handleTextToolPress();
                    } else if (tool.id === 'draw') {
                      setDrawingMode(!drawingMode);
                      setSelectedTool(selectedTool === tool.id ? null : tool.id);
                    } else {
                      setSelectedTool(selectedTool === tool.id ? null : tool.id);
                    }
                  }}
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

            {/* Tool Content Area */}
            {selectedTool === 'size' && (
              renderSizeOptions()
            )}
            {selectedTool === 'text' && (
              renderTextTool()
            )}
            {selectedTool === 'filters' && (
              renderFilterTool()
            )}
            {selectedTool === 'draw' && (
              renderDrawTool()
            )}
            {selectedTool && selectedTool !== 'size' && selectedTool !== 'text' && selectedTool !== 'filters' && selectedTool !== 'draw' && (
              <View style={styles.toolContentArea}>
                <Text style={[styles.toolContentText, { color: isDarkMode ? '#fff' : '#222' }]}>
                  {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} tools coming soon...
                </Text>
              </View>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
} 