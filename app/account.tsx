import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AccountSettings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Settings</Text>
      {/* Add your account settings options/components here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3FAF8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181D1C',
  },
});