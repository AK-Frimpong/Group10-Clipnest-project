import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useThemeContext } from '../../theme/themecontext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function PostCreationModal({ visible, onClose }: Props) {
  const { isDarkMode } = useThemeContext();
  const modalBg = isDarkMode ? '#181D1C' : '#F3FAF8';
  const buttonBg = isDarkMode ? '#252A29' : '#E2F1ED';
  const iconColor = isDarkMode ? '#fff' : '#181D1C';
  const textColor = isDarkMode ? '#fff' : '#181D1C';

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.background} onPress={onClose} />
        <View style={[styles.modalContent, { backgroundColor: modalBg }]}> {/* theme color */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={32} color={iconColor} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: textColor }]}>Start creating now</Text>
            <View style={{ width: 32 }} />
          </View>
          <View style={styles.iconRow}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: buttonBg }]}> {/* theme color */}
              <MaterialCommunityIcons name="pin" size={36} color={iconColor} />
              <Text style={[styles.actionLabel, { color: textColor }]}>Pin</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: buttonBg }]}> {/* theme color */}
              <MaterialCommunityIcons name="collage" size={36} color={iconColor} />
              <Text style={[styles.actionLabel, { color: textColor }]}>Collage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: buttonBg }]}> {/* theme color */}
              <MaterialIcons name="dashboard" size={36} color={iconColor} />
              <Text style={[styles.actionLabel, { color: textColor }]}>Board</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.handleBar, { backgroundColor: isDarkMode ? '#444' : '#ccc' }]} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 4,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 24,
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  handleBar: {
    width: 80,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 16,
  },
});
