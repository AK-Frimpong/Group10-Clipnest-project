import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function InterestsScreen() {
  const router = useRouter();
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    router.push('/(tabs)');
  };

  const handleImagePress = (id: number) => {
    const isSelected = selectedImages.includes(id);
    if (isSelected) {
      setSelectedImages(prev => prev.filter(i => i !== id));
    } else {
      if (selectedImages.length >= 7) {
        Alert.alert('Limit reached', 'You can select up to 7 interests.');
        return;
      }
      setSelectedImages(prev => [...prev, id]);
    }
  };

  const interests = [
    { id: 0, title: 'Wallpaper', image: require('../../../assets/images/wallpaper.png') },
    { id: 1, title: 'Shoes', image: require('../../../assets/images/shoes.png') },
    { id: 2, title: 'Nail designs', image: require('../../../assets/images/nail_designs.png') },
    { id: 3, title: 'Baking', image: require('../../../assets/images/baking.png') },
    { id: 4, title: 'Skin care', image: require('../../../assets/images/skin_care.png') },
    { id: 5, title: 'Make up', image: require('../../../assets/images/makeup.png') },
    { id: 6, title: 'Interior decor', image: require('../../../assets/images/interior_decor.png') },
    { id: 7, title: 'Tattoo designs', image: require('../../../assets/images/tattoo_designs.png') },
    { id: 8, title: 'Art', image: require('../../../assets/images/art.png') },
    { id: 9, title: 'Quotes', image: require('../../../assets/images/quotes.png') },
    { id: 10, title: 'Hairstyles', image: require('../../../assets/images/hairstyles.png') },
    { id: 11, title: 'Outfit inspo', image: require('../../../assets/images/outfit_inspo.png') },
    { id: 12, title: 'Cooking', image: require('../../../assets/images/cooking.png') },
    { id: 13, title: 'Cars', image: require('../../../assets/images/cars.png') },
    { id: 14, title: 'African fashion', image: require('../../../assets/images/african_fashion.png') },
    { id: 15, title: 'Photography', image: require('../../../assets/images/photography.png') },
    { id: 16, title: 'Gift ideas', image: require('../../../assets/images/gift_ideas.png') },
    { id: 17, title: 'Piercings', image: require('../../../assets/images/piercings.png') },
  ];

  const isNextEnabled = selectedImages.length >= 3;

  return (
    <View style={styles.container}>
      {/* Top Nav */}
      <View style={styles.topNav}>
        <Pressable onPress={handleBack} style={styles.backWrapper}>
          <Image
            source={require('../../../assets/images/backIcon.png')}
            style={styles.backIcon}
          />
        </Pressable>

        <View style={styles.dots}>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === 5 && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>What are you interested in?</Text>
      </View>

      {/* Interests Scroll */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageGrid}>
          {interests.map((item) => {
            const isSelected = selectedImages.includes(item.id);
            return (
              <View key={item.id} style={styles.imageContainer}>
                <Pressable 
                  onPress={() => handleImagePress(item.id)}
                  style={[
                    styles.imageWrapper,
                    isSelected && styles.selectedWrapper
                  ]}
                >
                  <Image
                    source={item.image}
                    style={styles.image}
                  />
                </Pressable>
                <Text style={styles.imageTitle}>{item.title}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.bottomContainer}>
        <Pressable
          onPress={handleNext}
          style={[
            styles.nextButton,
            !isNextEnabled && styles.disabledButton,
          ]}
          disabled={!isNextEnabled}
        >
          <Text
            style={[
              styles.nextButtonText,
              !isNextEnabled && styles.disabledButtonText,
            ]}
          >
            Next
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181D1C',
  },
  topNav: {
    position: 'absolute',
    top: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backWrapper: {
    position: 'absolute',
    left: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AAAAAA',
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#F3FAF8',
    backgroundColor: '#AAAAAA',
    marginTop: -1,
  },
  titleWrapper: {
    position: 'absolute',
    top: 120,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  title: {
    color: '#F3FAF8',
    fontSize: 18,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: 170,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imageWrapper: {
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedWrapper: {
    borderColor: '#7BD4C8',
    transform: [{ scale: 1.1 }],
  },
  image: {
    width: 102,
    height: 102,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  imageTitle: {
    color: '#F3FAF8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#181D1C',
  },
  nextButton: {
    backgroundColor: '#7BD4C8',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#333333',
  },
  nextButtonText: {
    color: '#181D1C',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#666666',
  },
});
