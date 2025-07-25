import { ThemedText } from '@/components/ThemedText';
import { useThemeContext } from '@/theme/themecontext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DisplayScreen() {
  const router = useRouter();
  const { theme, setTheme, isDarkMode } = useThemeContext();

  const renderOption = (label: string, value: 'light' | 'dark' | 'system') => {
    const isSelected = theme === value;

    return (
      <TouchableOpacity
        onPress={() => setTheme(value)}
        style={styles.optionRow}
      >
        <ThemedText
          style={[
            styles.optionLabel,
            { color: isDarkMode ? '#F3FAF8' : '#181D1C' },
          ]}
        >
          {label}
        </ThemedText>
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={20}
            color={isDarkMode ? '#F3FAF8' : '#181D1C'}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={isDarkMode ? '#F3FAF8' : '#181D1C'}
            />
          </TouchableOpacity>
          <ThemedText
            style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}
          >
            Display
          </ThemedText>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.optionsContainer}>
          {renderOption('Light Mode', 'light')}
          {renderOption('Dark Mode', 'dark')}
          {renderOption('Use device theme', 'system')}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsContainer: {
    padding: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(238, 238, 238, 0.2)',
  },
  optionLabel: {
    fontSize: 16,
  },
});