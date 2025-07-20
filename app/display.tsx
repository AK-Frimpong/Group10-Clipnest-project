import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeContext } from '../theme/themecontext';

export default function DisplayScreen() {
  const router = useRouter();
  const { theme, setTheme, isDarkMode } = useThemeContext();

  const renderOption = (label: string, value: 'light' | 'dark' | 'system') => {
    const isSelected = theme === value;

    return (
      <TouchableOpacity
        onPress={() => setTheme(value)}
        style={[
          styles.optionRow,
          {
            borderColor: isDarkMode ? '#2C2F2E' : '#DDEAE7',
          },
        ]}
      >
        <Text
          style={[
            styles.optionLabel,
            { color: isDarkMode ? '#FFFFFF' : '#000000' },
          ]}
        >
          {label}
        </Text>
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={20}
            color={isDarkMode ? '#FFFFFF' : '#000000'}
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
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              borderColor: isDarkMode ? '#2C2F2E' : '#DDEAE7',
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={28}
              color={isDarkMode ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          <Text
            style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}
          >
            Display
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Theme Options */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  optionLabel: {
    fontSize: 16,
  },
});
