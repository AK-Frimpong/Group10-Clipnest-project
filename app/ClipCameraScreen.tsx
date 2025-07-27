import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';

const { width } = Dimensions.get('window');

const TIMERS = [0, 3, 10];

export default function ClipCameraScreen() {
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [timer, setTimer] = useState(0);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [pickerVisible, setPickerVisible] = useState<null | 'timer'>(null);
  const [pickerY, setPickerY] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const controlRefs = {
    timer: useRef<View>(null),
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.getCameraPermissionsAsync();
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        const { status: requestStatus } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(requestStatus === 'granted');
      }
    })();
  }, []);

  // UI handlers
  const handleToggleFlash = () => setFlash(flash === 'off' ? 'on' : 'off');
  const handleFlip = () => setCameraType(cameraType === 'back' ? 'front' : 'back');

  // Countdown timer function
  const startCountdown = () => {
    if (timer === 0) {
      handleCapture();
      return;
    }
    
    setIsCountingDown(true);
    setCountdown(timer);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev && prev > 1) {
          return prev - 1;
        } else {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          setCountdown(null);
          handleCapture();
          return null;
        }
      });
    }, 1000);
  };

  // Photo capture
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      if (photo && photo.uri) {
        // Save to camera roll
        try {
          await MediaLibrary.requestPermissionsAsync();
          await MediaLibrary.createAssetAsync(photo.uri);
        } catch (e) {
          console.log('Error saving photo:', e);
        }
        
        // Navigate to edit screen
        router.push({
          pathname: '/CreateClipScreen',
          params: { uri: photo.uri, height: 250 },
        });
      }
    } catch (e) {
      console.log('Photo capture error:', e);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Picker options
  const pickerOptions = {
    timer: TIMERS,
  };
  const pickerLabels = {
    timer: (v: number) => v === 0 ? 'Off' : `${v}s`,
  };
  const pickerValue = {
    timer,
  };
  const setPickerValue = {
    timer: (v: number) => setTimer(v),
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Checking camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}> 
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Camera Preview */}
        <View style={styles.cameraPreviewWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.cameraPreview}
            facing={cameraType}
            flash={flash}
            ratio="16:9"
          />
        </View>

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton}>
            <Ionicons name="help-circle-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Right Controls */}
        <View style={styles.rightControls}>
          <TouchableOpacity
            ref={controlRefs.timer}
            style={styles.controlButton}
            onPress={() => {
              setPickerVisible('timer');
              // Position the picker right next to the timer button
              setPickerY(controlRefs.timer.current?.measureInWindow((x, y) => y) || 0);
            }}
          >
            <MaterialCommunityIcons name="timer-outline" size={28} color="#fff" />
            <Text style={styles.controlText}>{timer === 0 ? 'Off' : `${timer}s`}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleToggleFlash}>
            <MaterialCommunityIcons name={flash === 'off' ? 'flash-off' : 'flash'} size={28} color="#fff" />
            <Text style={styles.controlText}>{flash === 'off' ? 'Off' : 'On'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleFlip}>
            <MaterialCommunityIcons name="camera-switch" size={28} color="#fff" />
            <Text style={styles.controlText}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={startCountdown}
            disabled={isCountingDown}
          >
            <View style={styles.innerPhoto} />
          </TouchableOpacity>
        </View>

        {/* Countdown Display */}
        {isCountingDown && countdown && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}

        {/* Picker Floating View - Positioned next to timer button */}
        {pickerVisible && (
          <Pressable style={styles.pickerOverlay} onPress={() => setPickerVisible(null)}>
            <View style={{ 
              position: 'absolute',
              right: 140,
              top: '50%',
              transform: [{ translateY: -60 }],
              backgroundColor: '#222',
              borderRadius: 12,
              paddingVertical: 8,
              minWidth: 80,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              {pickerOptions[pickerVisible].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.pickerOption,
                    pickerValue[pickerVisible] === value && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setPickerValue[pickerVisible](value);
                    setPickerVisible(null);
                  }}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    pickerValue[pickerVisible] === value && styles.pickerOptionTextSelected,
                  ]}>
                    {pickerLabels[pickerVisible](value)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPreviewWrapper: {
    flex: 1,
    position: 'relative',
  },
  cameraPreview: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    zIndex: 10,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightControls: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -120 }],
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  innerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 20,
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#4EE0C1',
  },
  pickerOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  countdownOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 30,
  },
  countdownText: {
    color: '#fff',
    fontSize: 60,
    fontWeight: 'bold',
  },
}); 