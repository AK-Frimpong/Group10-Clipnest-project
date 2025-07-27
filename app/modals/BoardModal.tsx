import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useThemeContext } from '../../theme/themecontext';
import { ImageItem, PinBoardContext } from '../context/PinBoardContext';

const UNSPLASH_ACCESS_KEY = 'BFOYbWJ2jnhmYi-W7Ew3uBsoQ7V-F_qals3ICv4SNIs';
const PEXELS_API_KEY = 'hVq7HPVbO1wmVUqvsA47uaHqeZdESbtdG2lovKcBkzTuopoaErCa226H';

interface Board {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  items: ImageItem[];
  coverImage?: string;
  createdAt: Date;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function BoardModal({ visible, onClose }: Props) {
  const { isDarkMode } = useThemeContext();
  const { pins, collages, boards, addBoard, addToBoard } = useContext(PinBoardContext);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ImageItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const modalBg = isDarkMode ? '#181D1C' : '#F3FAF8';
  const cardBg = isDarkMode ? '#252A29' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#181D1C';
  const borderColor = isDarkMode ? '#333' : '#E0E0E0';
  const accentColor = '#4EE0C1';

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) {
      Alert.alert('Error', 'Please enter a board name');
      return;
    }

    const newBoard: Board = {
      id: `board_${Date.now()}`,
      name: newBoardName.trim(),
      description: newBoardDescription.trim(),
      isPrivate,
      items: [],
      createdAt: new Date(),
    };

    addBoard(newBoard);
    setNewBoardName('');
    setNewBoardDescription('');
    setIsPrivate(false);
    setShowCreateBoard(false);
  };

  const handleAddToBoard = (board: Board, item: ImageItem) => {
    addToBoard(board.id, item);
    Alert.alert('Added!', `Added to "${board.name}"`);
  };

  const searchImages = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Search Unsplash
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const unsplashData = await unsplashResponse.json();
      
      // Search Pexels
      const pexelsResponse = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20`,
        { headers: { Authorization: PEXELS_API_KEY } }
      );
      const pexelsData = await pexelsResponse.json();
      
      // Combine and format results
      const unsplashImages: ImageItem[] = (unsplashData.results || []).map((img: any) => ({
        id: `unsplash_${img.id}`,
        url: img.urls.small,
        height: Math.floor(Math.random() * 100) + 200
      }));
      
      const pexelsImages: ImageItem[] = (pexelsData.photos || []).map((img: any) => ({
        id: `pexels_${img.id}`,
        url: img.src.medium,
        height: Math.floor(Math.random() * 100) + 200
      }));
      
      const combinedResults = [...unsplashImages, ...pexelsImages];
      setSearchResults(combinedResults);
    } catch (error) {
      Alert.alert('Error', 'Failed to search images. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const renderBoardItem = ({ item }: { item: Board }) => (
    <TouchableOpacity
      style={[styles.boardCard, { backgroundColor: cardBg, borderColor }]}
      onPress={() => setSelectedBoard(item)}
    >
      <View style={styles.boardHeader}>
        <View style={styles.boardInfo}>
          <Text style={[styles.boardName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.boardDescription, { color: isDarkMode ? '#aaa' : '#666' }]}>
            {item.description || 'No description'}
          </Text>
          <Text style={[styles.boardStats, { color: isDarkMode ? '#888' : '#999' }]}>
            {item.items.length} items • {item.isPrivate ? 'Private' : 'Public'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textColor} />
      </View>
      {item.coverImage && (
        <Image source={{ uri: item.coverImage }} style={styles.boardCover} resizeMode="cover" />
      )}
    </TouchableOpacity>
  );

  const renderContentItem = ({ item }: { item: ImageItem }) => (
    <TouchableOpacity style={styles.contentItem}>
      <Image source={{ uri: item.url }} style={styles.contentImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  const renderCreateBoardForm = () => (
    <ScrollView style={styles.createFormContainer} contentContainerStyle={styles.createFormContent}>
      <View style={[styles.createForm, { backgroundColor: cardBg }]}>
        <Text style={[styles.formTitle, { color: textColor }]}>Create New Board</Text>
        
        <TextInput
          style={[styles.input, { backgroundColor: modalBg, color: textColor, borderColor }]}
          placeholder="Board name"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={newBoardName}
          onChangeText={setNewBoardName}
          maxLength={50}
          returnKeyType="next"
        />
        
        <TextInput
          style={[styles.input, { backgroundColor: modalBg, color: textColor, borderColor }]}
          placeholder="Description (optional)"
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={newBoardDescription}
          onChangeText={setNewBoardDescription}
          multiline
          maxLength={200}
          numberOfLines={3}
          textAlignVertical="top"
        />
        
        <TouchableOpacity
          style={[styles.privacyToggle, { backgroundColor: modalBg, borderColor }]}
          onPress={() => setIsPrivate(!isPrivate)}
        >
          <Ionicons
            name={isPrivate ? 'lock-closed' : 'globe'}
            size={20}
            color={textColor}
          />
          <Text style={[styles.privacyText, { color: textColor }]}>
            {isPrivate ? 'Private' : 'Public'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.formButtons}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#666' }]}
            onPress={() => {
              setShowCreateBoard(false);
              setNewBoardName('');
              setNewBoardDescription('');
              setIsPrivate(false);
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: accentColor }]}
            onPress={handleCreateBoard}
          >
            <Text style={[styles.buttonText, { color: '#181D1C' }]}>Create</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderBoardDetail = () => {
    if (!selectedBoard) return null;
    
    const allContent = [...pins, ...collages];
    
    return (
      <View style={styles.boardDetail}>
        <View style={styles.detailHeader}>
          <TouchableOpacity 
            onPress={() => setSelectedBoard(null)} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.detailTitle, { color: textColor }]}>{selectedBoard.name}</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <Text style={[styles.detailDescription, { color: isDarkMode ? '#aaa' : '#666' }]}>
          {selectedBoard.description || 'No description'}
        </Text>
        
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Add Images</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: cardBg, color: textColor, borderColor }]}
              placeholder="Search for images (e.g., 'nature', 'food', 'fashion')"
              placeholderTextColor={isDarkMode ? '#666' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => searchImages(searchQuery)}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: accentColor }]}
              onPress={() => searchImages(searchQuery)}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#181D1C" />
              ) : (
                <Ionicons name="search" size={20} color="#181D1C" />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Content Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              { 
                backgroundColor: !showImageSearch ? accentColor : 'transparent',
                borderColor: !showImageSearch ? accentColor : borderColor
              }
            ]}
            onPress={() => setShowImageSearch(false)}
          >
            <Text style={[
              styles.tabText,
              { color: !showImageSearch ? '#181D1C' : textColor }
            ]}>
              My Content ({allContent.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              { 
                backgroundColor: showImageSearch ? accentColor : 'transparent',
                borderColor: showImageSearch ? accentColor : borderColor
              }
            ]}
            onPress={() => setShowImageSearch(true)}
          >
            <Text style={[
              styles.tabText,
              { color: showImageSearch ? '#181D1C' : textColor }
            ]}>
              Web Search ({searchResults.length})
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Content Display */}
        {!showImageSearch ? (
          <FlatList
            data={allContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.addableItem}
                onPress={() => handleAddToBoard(selectedBoard, item)}
              >
                <Image source={{ uri: item.url }} style={styles.addableImage} resizeMode="cover" />
                <View style={styles.addButton}>
                  <Ionicons name="add" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.addableContent}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999', textAlign: 'center', marginTop: 20 }]}>
                No content yet. Search for images above!
              </Text>
            }
          />
        ) : (
          <FlatList
            data={searchResults}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.addableItem}
                onPress={() => handleAddToBoard(selectedBoard, item)}
              >
                <Image source={{ uri: item.url }} style={styles.addableImage} resizeMode="cover" />
                <View style={styles.addButton}>
                  <Ionicons name="add" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.addableContent}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999', textAlign: 'center', marginTop: 20 }]}>
                {searchQuery ? 'No results found. Try a different search term.' : 'Search for images to add to your board!'}
              </Text>
            }
          />
        )}
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => {
        if (showCreateBoard) {
          setShowCreateBoard(false);
          setNewBoardName('');
          setNewBoardDescription('');
          setIsPrivate(false);
        } else if (selectedBoard) {
          setSelectedBoard(null);
        } else {
          onClose();
        }
      }}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView 
              style={[styles.modalContent, { backgroundColor: modalBg }]}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              {showCreateBoard ? (
                renderCreateBoardForm()
              ) : selectedBoard ? (
                renderBoardDetail()
              ) : (
                <>
                  <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>My Boards</Text>
                    <TouchableOpacity
                      style={[styles.createButton, { backgroundColor: accentColor }]}
                      onPress={() => setShowCreateBoard(true)}
                    >
                      <Ionicons name="add" size={20} color="#181D1C" />
                    </TouchableOpacity>
                  </View>
                  
                  {boards.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="view-dashboard" size={64} color={isDarkMode ? '#444' : '#ccc'} />
                      <Text style={[styles.emptyText, { color: isDarkMode ? '#888' : '#999' }]}>
                        No boards yet
                      </Text>
                      <Text style={[styles.emptySubtext, { color: isDarkMode ? '#666' : '#777' }]}>
                        Create your first board to organize your content
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={boards}
                      renderItem={renderBoardItem}
                      keyExtractor={(item) => item.id}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.boardsList}
                    />
                  )}
                </>
              )}
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  createButton: {
    padding: 8,
    borderRadius: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  boardsList: {
    padding: 16,
  },
  boardCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  boardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boardInfo: {
    flex: 1,
  },
  boardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  boardDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  boardStats: {
    fontSize: 12,
  },
  boardCover: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginTop: 12,
  },
  createFormContainer: {
    flex: 1,
  },
  createFormContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  createForm: {
    padding: 20,
    borderRadius: 12,
    margin: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  privacyText: {
    marginLeft: 8,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  boardDetail: {
    flex: 1,
    padding: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  detailDescription: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  searchSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 20,
    marginHorizontal: 16,
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
    margin: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addableItem: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  addableImage: {
    width: '100%',
    height: 120,
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4EE0C1',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentItem: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  contentImage: {
    width: '100%',
    height: 120,
  },
  addableContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
}); 