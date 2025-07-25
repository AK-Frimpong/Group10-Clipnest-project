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
              setPickerY(controlRefs.timer.current?.measureInWindow((x, y) => setPickerY(y)) || 0);
            }}
          >
            <MaterialCommunityIcons name="timer" size={24} color="#fff" />
            <Text style={styles.controlText}>{timer === 0 ? 'Off' : `${timer}s`}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleToggleFlash}>
            <MaterialCommunityIcons name={flash === 'off' ? 'flash-off' : 'flash'} size={24} color="#fff" />
            <Text style={styles.controlText}>{flash === 'off' ? 'Off' : 'On'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={handleFlip}>
            <MaterialCommunityIcons name="camera-switch" size={24} color="#fff" />
            <Text style={styles.controlText}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.innerPhoto} />
          </TouchableOpacity>
        </View>

        {/* Picker Floating View */}
        {pickerVisible && (
          <Pressable style={styles.pickerOverlay} onPress={() => setPickerVisible(null)}>
            <View style={[styles.pickerContainer, { top: pickerY - 100 }]}>
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
    transform: [{ translateY: -100 }],
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    alignItems: 'center',
    gap: 4,
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
  pickerContainer: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
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
}); 