import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

// Type for follower stats data
type FollowerStatsData = {
  ageGroups: {
    men: { label: string; value: number }[];
    women: { label: string; value: number }[];
  };
};

// Placeholder for real follower stats data
// If followerStatsData is null, show '-' for all values
const followerStatsData: FollowerStatsData | null = null; // Replace with real data fetching logic

export default function FollowerStatsScreen() {
  const { isDarkMode } = useThemeContext();
  const textColor = isDarkMode ? '#F3FAF8' : '#181D1C';
  const cardColor = isDarkMode ? '#232B2B' : '#F3FAF8';
  const router = useRouter();

  const renderAgeGroups = (ageGroups: { label: string; value: number }[] | null) => {
    const maxWidth = 100;
    if (!ageGroups) {
      // Show all possible age groups with dashes
      const defaultLabels = ['13-17', '18-24', '25-34', '35-44', '45+'];
      return (
        <View style={{ marginTop: 0 }}>
          {defaultLabels.map(label => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: textColor, width: 54, fontSize: 13 }}>{label}</Text>
              <View style={{ height: 10, backgroundColor: '#eee', borderRadius: 6, width: 10, marginRight: 8 }} />
              <Text style={{ color: textColor, fontSize: 13 }}>-</Text>
            </View>
          ))}
        </View>
      );
    }
    const maxValue = Math.max(...ageGroups.map(g => g.value), 1);
    return (
      <View style={{ marginTop: 0 }}>
        {ageGroups.map((group, idx) => (
          <View key={group.label} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: textColor, width: 54, fontSize: 13 }}>{group.label}</Text>
            <View style={{
              height: 10,
              backgroundColor: '#7BD4C8',
              borderRadius: 6,
              width: Math.max(10, (group.value / maxValue) * maxWidth),
              marginRight: 8,
            }} />
            <Text style={{ color: textColor, fontSize: 13 }}>{group.value}%</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: 20, zIndex: 10 }}>
        <Ionicons name="arrow-back" size={28} color={textColor} />
      </TouchableOpacity>
      <ScrollView style={{ flex: 1, backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <Text style={{ color: textColor, fontSize: 24, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' }}>Follower Age Groups</Text>
        <View style={{ gap: 16 }}>
          <View style={[styles.sectionCard, { backgroundColor: cardColor }]}> 
            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15, marginBottom: 6, textAlign: 'center' }}>Men</Text>
            {renderAgeGroups(followerStatsData ? followerStatsData.ageGroups.men : null)}
          </View>
          <View style={[styles.sectionCard, { backgroundColor: cardColor }]}> 
            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 15, marginBottom: 6, textAlign: 'center' }}>Women</Text>
            {renderAgeGroups(followerStatsData ? followerStatsData.ageGroups.women : null)}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
  },
}); 