/**
 * Photo Capture Screen
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useScanStore } from '../store/useScanStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoCapture'>;

export const PhotoCaptureScreen: React.FC<Props> = ({ navigation, route }) => {
  const { itemId } = route.params;
  const { setItemPhoto } = useScanStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={48} color={colors.textMuted} />
        <Text style={styles.permissionText}>
          Camera permission is required to take photos.
        </Text>
        <Button
          title="Grant Permission"
          onPress={requestPermission}
          variant="primary"
          size="medium"
        />
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          size="medium"
          style={{ marginTop: spacing.md }}
        />
      </SafeAreaView>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setCapturedUri(photo.uri);
        }
      } catch (error) {
        console.error('Failed to take photo:', error);
      }
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  const handleSave = () => {
    if (capturedUri) {
      setItemPhoto(itemId, capturedUri);
      navigation.goBack();
    }
  };

  // Show preview after capture
  if (capturedUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <View style={styles.previewPlaceholder}>
            <Ionicons name="image" size={64} color={colors.accent} />
            <Text style={styles.previewText}>Photo captured successfully</Text>
          </View>
        </View>
        <View style={styles.previewActions}>
          <Button
            title="Retake"
            onPress={handleRetake}
            variant="outline"
            size="large"
            style={styles.actionButton}
          />
          <Button
            title="Save Photo"
            onPress={handleSave}
            variant="primary"
            size="large"
            style={styles.actionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.instructionText}>
            Take a close-up photo of this area
          </Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tip}>
            <Ionicons name="sunny-outline" size={16} color={colors.accent} />
            <Text style={styles.tipText}>Good lighting</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="search-outline" size={16} color={colors.accent} />
            <Text style={styles.tipText}>Get close</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="hand-left-outline" size={16} color={colors.accent} />
            <Text style={styles.tipText}>Hold steady</Text>
          </View>
        </View>

        {/* Capture button */}
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  permissionText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  instructionText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  tipsContainer: {
    position: 'absolute',
    top: '45%',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tip: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  tipText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.accent,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholder: {
    alignItems: 'center',
    gap: spacing.md,
  },
  previewText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  previewActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

