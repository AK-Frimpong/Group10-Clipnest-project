import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Camera, CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeContext } from '../theme/themecontext';

const { width } = Dimensions.get('window');

const SPEEDS = [0.3, 0.5, 1, 2, 3];
const TIMERS = [0, 3, 10];
const LIMITS = [15, 30, 60, 300];

export default function ClipCameraScreen() {
  // Move ALL hooks to the very top, before any logic or early return
  const { isDarkMode } = useThemeContext();
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [speed, setSpeed] = useState(1);
  const [limit, setLimit] = useState(300);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [recording, setRecording] = useState(false);
  const [recordedSegments, setRecordedSegments] = useState<{ uri: string; duration: number }[]>([]);
  const [currentDuration, setCurrentDuration] = useState(0); // seconds
  const [timer, setTimer] = useState(0); // live timer while recording
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [pickerVisible, setPickerVisible] = useState<null | 'speed' | 'timer' | 'limit'>(null);
  const [pickerY, setPickerY] = useState<number>(0);
  const controlRefs = {
    speed: useRef<View>(null),
    timer: useRef<View>(null),
    limit: useRef<View>(null),
  };
  const progressAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const totalLimit = limit; // seconds
  const totalRecorded = recordedSegments.reduce((sum, seg) => sum + seg.duration, 0) + (recording ? timer : 0);
  const remaining = Math.max(0, totalLimit - totalRecorded);
  const progress = totalRecorded / totalLimit;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // UI handlers
  const handleToggleMode = async (selected: 'photo' | 'video') => {
    if (selected === 'video') {
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Microphone Permission', 'Please allow microphone access to record videos.');
        return;
      }
    }
    setMode(selected);
  };
  const handleToggleFlash = () => setFlash(flash === 'off' ? 'on' : 'off');
  const handleFlip = () => setCameraType(cameraType === 'back' ? 'front' : 'back');

  // Camera actions (stubbed for now)
  const handleCapture = async () => {
    // TODO: implement photo capture
    router.push('/CreateClipScreen');
  };
  // Start recording
  const handleRecord = async () => {
    console.log('handleRecord called');
    if (!cameraRef.current || totalRecorded >= totalLimit) return;
    setRecording(true);
    setTimer(0);
    progressAnim.setValue(progress);
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t + 1 + totalRecorded >= totalLimit) {
          clearInterval(intervalRef.current!);
          stopRecording();
          return t;
        }
        return t + 1;
      });
    }, 1000);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: remaining, quality: '720p' });
      console.log('video object after recordAsync:', video);
      if (video && video.uri) {
        setRecordedSegments((prev) => {
          const updated = [...prev, { uri: video.uri, duration: timer }];
          console.log('setRecordedSegments called, updated:', updated);
          return updated;
        });
        await stopRecording(video.uri);
        return;
      }
    } catch (e) {
      console.log('Recording error (catch block):', e);
    }
    stopRecording();
  };

  const stopRecording = async (videoUri?: string) => {
    console.log('stopRecording called, videoUri:', videoUri);
    setRecording(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentDuration((d) => d + timer);
    setTimer(0);
    if (videoUri) {
      try {
        await MediaLibrary.requestPermissionsAsync();
        await MediaLibrary.createAssetAsync(videoUri);
        console.log('Saved video to camera roll:', videoUri);
      } catch (e) {
        console.log('Error saving video:', e);
      }
    }
  };

  // Delete/discard
  const handleDelete = () => {
    setRecordedSegments([]);
    setCurrentDuration(0);
    setTimer(0);
    progressAnim.setValue(0);
  };

  // Next: go to edit screen with the first segment (for now)
  const handleNext = () => {
    if (recordedSegments.length > 0) {
      router.push({
        pathname: '/ClipVideoEditScreen',
        params: { videoUri: recordedSegments[0].uri, duration: recordedSegments[0].duration },
      });
    }
  };

  // Picker options
  const pickerOptions = {
    speed: SPEEDS,
    timer: TIMERS,
    limit: LIMITS,
  };
  const pickerLabels = {
    speed: (v: number) => `${v}x`,
    timer: (v: number) => v === 0 ? 'Off' : `${v}s`,
    limit: (v: number) => v < 60 ? `${v}s` : `${v / 60}m`,
  };
  const pickerValue = {
    speed,
    timer,
    limit,
  };
  const setPickerValue = {
    speed: (v: number) => setSpeed(v),
    timer: (v: number) => setTimer(v),
    limit: (v: number) => setLimit(v),
  };

  console.log('render', recordedSegments);

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Checking camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}> 
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Camera Preview with rounded top corners */}
        <View style={styles.cameraPreviewWrapper}>
          {recordedSegments.length > 0 ? (
            <Video
              source={{ uri: recordedSegments[recordedSegments.length - 1].uri }}
              style={styles.cameraPreview}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay
              useNativeControls={false}
            />
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.cameraPreview}
              facing={cameraType}
              flash={flash}
              ratio="16:9"
            />
          )}
        </View>
        {/* Top Bar */}
        <View style={styles.topBar}> 
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>{mode === 'photo' ? 'Take a photo' : 'Record up to 5m'}</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="help-circle-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Hide right controls and mode toggle if any recording exists */}
        {recordedSegments.length === 0 && !recording && (
          <View style={styles.controlsColumn}> 
            {mode === 'video' && (
              <View ref={controlRefs.speed} collapsable={false}>
                <TouchableOpacity style={styles.controlButton} onPress={() => {
                  controlRefs.speed.current?.measure((fx, fy, w, h, px, py) => setPickerY(py));
                  setPickerVisible('speed');
                }}>
                  <MaterialCommunityIcons name="speedometer" size={24} color="#fff" />
                  <Text style={styles.controlText}>{speed}x</Text>
                  <Text style={styles.controlText}>Speed</Text>
                </TouchableOpacity>
              </View>
            )}
            <View ref={controlRefs.timer} collapsable={false}>
              <TouchableOpacity style={styles.controlButton} onPress={() => {
                controlRefs.timer.current?.measure((fx, fy, w, h, px, py) => setPickerY(py));
                setPickerVisible('timer');
              }}>
                <MaterialCommunityIcons name="timer-outline" size={24} color="#fff" />
                <Text style={styles.controlText}>{timer === 0 ? 'Off' : timer + 's'}</Text>
                <Text style={styles.controlText}>Timer</Text>
              </TouchableOpacity>
            </View>
            {mode === 'video' && (
              <View ref={controlRefs.limit} collapsable={false}>
                <TouchableOpacity style={styles.controlButton} onPress={() => {
                  controlRefs.limit.current?.measure((fx, fy, w, h, px, py) => setPickerY(py));
                  setPickerVisible('limit');
                }}>
                  <MaterialCommunityIcons name="timer-sand" size={24} color="#fff" />
                  <Text style={styles.controlText}>{limit < 60 ? limit + 's' : limit / 60 + 'm'}</Text>
                  <Text style={styles.controlText}>Limit</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.controlButton} onPress={handleToggleFlash}>
              <MaterialCommunityIcons name={flash === 'on' ? 'flash' : 'flash-off'} size={24} color="#fff" />
              <Text style={styles.controlText}>Flash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={handleFlip}>
              <MaterialCommunityIcons name="camera-flip" size={24} color="#fff" />
              <Text style={styles.controlText}>Flip</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Picker Floating View */}
        {pickerVisible && (
          <Pressable style={styles.pickerFloatOverlay} onPress={() => setPickerVisible(null)}>
            <View style={[styles.pickerFloat, { top: pickerY - 10 }]}> 
              {pickerOptions[pickerVisible].map((v: number) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.pickerOption, pickerValue[pickerVisible] === v && styles.pickerOptionSelected]}
                  onPress={() => {
                    setPickerValue[pickerVisible](v);
                    setPickerVisible(null);
                  }}
                >
                  <Text style={[styles.pickerOptionText, pickerValue[pickerVisible] === v && styles.pickerOptionTextSelected]}>
                    {pickerLabels[pickerVisible](v)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        )}
        {/* Timer at top center while recording */}
        {recording && (
          <View style={{ position: 'absolute', top: 48, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '600' }}>{`0:${(timer < 10 ? '0' : '') + timer}`}</Text>
          </View>
        )}
        {/* After recording, show remaining time */}
        {!recording && totalRecorded > 0 && (
          <View style={{ position: 'absolute', top: 48, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{`Record up to ${Math.floor(remaining/60)}m ${remaining%60 < 10 ? '0' : ''}${remaining%60 }s`}</Text>
          </View>
        )}
        {/* Progress Bar (always visible if recording or has recorded) */}
        {(recording || totalRecorded > 0) && (
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: 90, height: 8, justifyContent: 'center', zIndex: 20 }}>
            <View style={{ height: 4, backgroundColor: '#eee', borderRadius: 2, marginHorizontal: 12 }} />
            <Animated.View
              style={{
                position: 'absolute',
                left: 12,
                height: 4,
                borderRadius: 2,
                backgroundColor: '#4EE0C1',
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        )}
        {/* Show Next and Delete after recording */}
        {!recording && totalRecorded > 0 && (
          <>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, backgroundColor: '#4EE0C1', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 8, zIndex: 30 }} onPress={handleNext}>
              <Text style={{ color: '#181D1C', fontWeight: 'bold', fontSize: 16 }}>Next</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ position: 'absolute', bottom: 30, left: 30, zIndex: 30 }} onPress={handleDelete}>
              <MaterialCommunityIcons name="delete" size={32} color="#fff" />
            </TouchableOpacity>
          </>
        )}
        {/* Bottom Bar */}
        <View style={styles.bottomBar}> 
          {/* Hide mode toggle if any recording exists or while recording */}
          {recordedSegments.length === 0 && !recording && (
            <View style={styles.modeToggleWrapper}>
              <TouchableOpacity
                style={[styles.modeToggle, mode === 'video' && styles.modeSelected]}
                onPress={() => handleToggleMode('video')}
              >
                <Text style={[styles.modeText, mode === 'video' && styles.modeTextSelected]}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeToggle, mode === 'photo' && styles.modeSelected]}
                onPress={() => handleToggleMode('photo')}
              >
                <Text style={[styles.modeText, mode === 'photo' && styles.modeTextSelected]}>Photo</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {/* Delete button after recording */}
            {recordedSegments.length > 0 && !recording && (
              <TouchableOpacity style={{ marginRight: 32 }} onPress={handleDelete}>
                <MaterialCommunityIcons name="delete" size={32} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.captureButton, mode === 'video' ? styles.recordButton : styles.photoButton, totalRecorded >= totalLimit && { opacity: 0.5 } ]}
              onPress={mode === 'photo' ? handleCapture : (recording ? () => stopRecording() : handleRecord)}
              disabled={totalRecorded >= totalLimit}
            >
              {mode === 'video' ? (
                recording ? (
                  <View style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: '#fff' }} />
                ) : (
                  <View style={styles.innerRecord} />
                )
              ) : (
                <View style={styles.innerPhoto} />
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#000',
  },
  cameraPreview: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    zIndex: 10,
  },
  topTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsColumn: {
    position: 'absolute',
    right: 16,
    top: 100,
    alignItems: 'center',
    zIndex: 10,
  },
  controlButton: {
    alignItems: 'center',
    marginBottom: 28,
  },
  controlText: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
    zIndex: 10,
  },
  modeToggleWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    marginBottom: 18,
    alignSelf: 'center',
  },
  modeToggle: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 24,
  },
  modeSelected: {
    backgroundColor: '#fff',
  },
  modeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modeTextSelected: {
    color: '#181D1C',
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  recordButton: {
    backgroundColor: '#E60023',
  },
  photoButton: {
    backgroundColor: '#fff',
  },
  innerRecord: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
  },
  innerPhoto: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E60023',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
    minWidth: 320,
    minHeight: 70,
  },
  pickerOption: {
    marginHorizontal: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  pickerOptionSelected: {
    backgroundColor: '#fff',
  },
  pickerOptionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerOptionTextSelected: {
    color: '#181D1C',
  },
  pickerFloatOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  pickerFloat: {
    position: 'absolute',
    right: 48, // closer to the controls
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 18,
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 0,
    minHeight: 0,
    zIndex: 101,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
}); 