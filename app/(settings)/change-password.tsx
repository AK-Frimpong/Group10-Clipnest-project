import { useThemeContext } from '@/theme/themecontext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function ChangePasswordScreen() {
  const { isDarkMode } = useThemeContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidPassword = (password: string) => {
    const minLength = password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*_\-+=?]/.test(password);
    const noInvalidChars = !/[^a-zA-Z0-9!@#$%^&*_\-+=?]/.test(password);
    
    return minLength && hasLetter && hasNumber && hasSpecial && noInvalidChars;
  };

  const handleSubmit = () => {
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError('Please meet all password requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    // Here you would typically make an API call to change the password
    // For now, we'll just go back
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#181D1C' : '#F3FAF8' }]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={28} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Change Password</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Form */}
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Current Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#232B2B' : '#FFFFFF', borderColor: isDarkMode ? '#2E3837' : '#DDD' }]}>
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter your current password"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <MaterialIcons name={showCurrentPassword ? "visibility" : "visibility-off"} size={24} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>New Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#232B2B' : '#FFFFFF', borderColor: isDarkMode ? '#2E3837' : '#DDD' }]}>
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter your new password"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <MaterialIcons name={showNewPassword ? "visibility" : "visibility-off"} size={24} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Confirm New Password</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDarkMode ? '#232B2B' : '#FFFFFF', borderColor: isDarkMode ? '#2E3837' : '#DDD' }]}>
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your new password"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={24} color={isDarkMode ? '#F3FAF8' : '#181D1C'} />
                </TouchableOpacity>
              </View>
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={[styles.requirementsTitle, { color: isDarkMode ? '#F3FAF8' : '#181D1C' }]}>Password must:</Text>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={newPassword.length >= 6 ? "check-circle" : "cancel"} 
                  size={16} 
                  color={newPassword.length >= 6 ? "#7BD4C8" : "#AAAAAA"} 
                />
                <Text style={[styles.requirementText, { color: newPassword.length >= 6 ? "#7BD4C8" : "#AAAAAA" }]}>
                  Be at least 6 characters
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={/[a-zA-Z]/.test(newPassword) ? "check-circle" : "cancel"} 
                  size={16} 
                  color={/[a-zA-Z]/.test(newPassword) ? "#7BD4C8" : "#AAAAAA"} 
                />
                <Text style={[styles.requirementText, { color: /[a-zA-Z]/.test(newPassword) ? "#7BD4C8" : "#AAAAAA" }]}>
                  Include at least one letter
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={/[0-9]/.test(newPassword) ? "check-circle" : "cancel"} 
                  size={16} 
                  color={/[0-9]/.test(newPassword) ? "#7BD4C8" : "#AAAAAA"} 
                />
                <Text style={[styles.requirementText, { color: /[0-9]/.test(newPassword) ? "#7BD4C8" : "#AAAAAA" }]}>
                  Include at least one number
                </Text>
              </View>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={/[!@#$%^&*_\-+=?]/.test(newPassword) ? "check-circle" : "cancel"} 
                  size={16} 
                  color={/[!@#$%^&*_\-+=?]/.test(newPassword) ? "#7BD4C8" : "#AAAAAA"} 
                />
                <Text style={[styles.requirementText, { color: /[!@#$%^&*_\-+=?]/.test(newPassword) ? "#7BD4C8" : "#AAAAAA" }]}>
                  Include at least one special character (!@#$%^&*_-+=?)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { opacity: (!currentPassword || !newPassword || !confirmPassword) ? 0.5 : 1 }]}
              onPress={handleSubmit}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              <Text style={styles.submitButtonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  content: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 20,
    fontSize: 14,
  },
  requirementsContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#27403B',
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 