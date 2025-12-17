/**
 * Capture Photo Screen - Camera capture for current step
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { RootStackParamList } from '../../types';
import { usePhotoScanStore } from './usePhotoScanStore';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoScanCapture'>;

export const CapturePhotoScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stepId } = route.params;
  const { session, setStepPhoto } = usePhotoScanStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const step = session?.steps.find((s) => s.id === stepId);

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
    if (capturedUri && stepId) {
      setStepPhoto(stepId, capturedUri);
      navigation.goBack();
    }
  };

  // Preview mode
  if (capturedUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedUri }} style={styles.previewImage} />
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
            title="Use Photo"
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
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          {step && (
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{step.title}</Text>
            </View>
          )}
        </View>

        {/* Instruction */}
        {step && (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>{step.instruction}</Text>
          </View>
        )}

        {/* Capture button */}
        <View style={styles.captureContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <View style={styles.privacyBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.success} />
            <Text style={styles.privacyText}>{COPY.PRIVACY_PHOTOS_SHORT}</Text>
          </View>
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
    justifyContent: 'space-between',
    backgroundColor: colors.overlay,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  stepBadgeText: {
    ...typography.caption,
    color: colors.textDark,
    fontWeight: '600',
  },
  instructionContainer: {
    position: 'absolute',
    top: '40%',
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.overlay,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  instructionText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
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
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    gap: 4,
  },
  privacyText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  actionButton: {
    flex: 1,
  },
});

