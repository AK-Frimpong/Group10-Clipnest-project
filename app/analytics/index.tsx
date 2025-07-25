import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

// Type for analytics data
type AnalyticsData = {
  totalPosts: number;
  totalLikes: number;
  followerRatio: { men: number; women: number };
  engagedAudience: number;
  topLikedPin: { image: string; likes: number };
};

// Placeholder for real analytics data
// If analyticsData is null, show '-' for all values
const analyticsData: AnalyticsData | null = null; // Replace with real data fetching logic

export default function AnalyticsScreen() {
  const { isDarkMode } = useThemeContext();
  const textColor = isDarkMode ? '#F3FAF8' : '#181D1C';
  const cardColor = isDarkMode ? '#232B2B' : '#F3FAF8';
  const router = useRouter();

  // renderFollowerRatio removed (inlined above)

  return (
    <ScrollView style={{ flex: 1, backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 60, left: 20, zIndex: 10 }}>
        <Ionicons name="arrow-back" size={28} color={textColor} />
      </TouchableOpacity>
      <Text style={{ color: textColor, fontSize: 24, fontWeight: 'bold', marginBottom: 18, textAlign: 'center' }}>Your Analytics</Text>
      {/* Stats Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
        <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
          <Text style={{ color: textColor, fontSize: 15 }}>Total Posts</Text>
          <Text style={{ color: '#7BD4C8', fontWeight: 'bold', fontSize: 22 }}>{analyticsData ? analyticsData.totalPosts : '-'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
          <Text style={{ color: textColor, fontSize: 15 }}>Total Likes</Text>
          <Text style={{ color: '#7BD4C8', fontWeight: 'bold', fontSize: 22 }}>{analyticsData ? analyticsData.totalLikes : '-'}</Text>
        </View>
      </View>
      {/* Follower Ratio */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/analytics/follower-stats')}
        style={{ marginBottom: 6 }}
      >
        <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 17, textDecorationLine: 'underline', textAlign: 'center' }}>Follower Ratio</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
        <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
          <Ionicons name="male" size={20} color="#7BD4C8" />
          <Text style={{ color: textColor, fontSize: 15, marginTop: 2 }}>Men</Text>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18 }}>{analyticsData ? analyticsData.followerRatio?.men + '%' : '-'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: cardColor }]}> 
          <Ionicons name="female" size={20} color="#F47C7C" />
          <Text style={{ color: textColor, fontSize: 15, marginTop: 2 }}>Women</Text>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 18 }}>{analyticsData ? analyticsData.followerRatio?.women + '%' : '-'}</Text>
        </View>
      </View>
      {/* Engaged Audience */}
      <View style={[styles.sectionCard, { backgroundColor: cardColor, flexDirection: 'row', alignItems: 'center' }]}> 
        <Feather name="users" size={32} color="#7BD4C8" style={{ marginRight: 16 }} />
        <View>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 17 }}>Engaged Audience</Text>
          <Text style={{ color: textColor, fontSize: 14, marginTop: 2 }}>{analyticsData ? analyticsData.engagedAudience + '% of your followers engaged this month' : '- of your followers engaged this month'}</Text>
        </View>
      </View>
      {/* Top Liked Pin */}
      <View style={[styles.sectionCard, { backgroundColor: cardColor, flexDirection: 'row', alignItems: 'center', paddingLeft: 0, paddingRight: 18, paddingTop: 18, paddingBottom: 18 }]}> 
        {analyticsData && analyticsData.topLikedPin?.image ? (
          <Image source={{ uri: analyticsData.topLikedPin.image }} style={{ width: 60, height: 60, borderRadius: 10, marginRight: 16 }} />
        ) : (
          <View style={{ width: 60, height: 60, borderRadius: 10, marginRight: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#ccc', fontSize: 28, fontWeight: 'bold' }}>-</Text>
          </View>
        )}
        <View style={{ alignItems: 'flex-start', justifyContent: 'center', flex: 1, marginLeft: 0, paddingLeft: 0 }}>
          <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 17 }}>Top Liked Pin</Text>
          <Text style={{ color: textColor, fontSize: 14, marginTop: 2 }}>Likes: <Text style={{ color: '#7BD4C8', fontWeight: 'bold' }}>{analyticsData ? analyticsData.topLikedPin?.likes : '-'}</Text></Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    marginRight: 10,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    elevation: 2,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
    elevation: 2,
  },
}); 