/**
 * Photo Scan Flow Screen - Step-by-step guided flow
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { usePhotoScanStore } from './usePhotoScanStore';
import { PHOTO_SCAN_COPY } from './copy';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoScanFlow'>;

export const PhotoScanFlowScreen: React.FC<Props> = ({ navigation, route }) => {
  const { roomType } = route.params;
  const { session, startSession, getCurrentStep, getProgress, nextStep, previousStep } = usePhotoScanStore();

  useEffect(() => {
    if (!session || session.roomType !== roomType) {
      startSession(roomType);
    }
  }, [roomType]);

  const currentStep = getCurrentStep();
  const progress = getProgress();

  if (!session || !currentStep) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const handleCapture = () => {
    navigation.navigate('PhotoScanCapture', { stepId: currentStep.id });
  };

  const handleViewAnnotate = () => {
    if (currentStep.photoUri) {
      navigation.navigate('PhotoAnnotate', { stepId: currentStep.id });
    }
  };

  const handleNext = () => {
    if (!nextStep()) {
      // At end, go to summary
      navigation.navigate('PhotoScanSummary', { sessionId: session.id });
    }
  };

  const handleComplete = () => {
    navigation.navigate('PhotoScanSummary', { sessionId: session.id });
  };

  const isLastStep = progress.current === progress.total;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Step {progress.current} of {progress.total}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
          </View>
        </View>

        {/* Step Card */}
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>{currentStep.title}</Text>
          <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            {currentStep.tips.map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Warning */}
          {currentStep.warning && (
            <View style={styles.warningBox}>
              <Ionicons name="warning-outline" size={20} color={colors.warning} />
              <Text style={styles.warningText}>{currentStep.warning}</Text>
            </View>
          )}

          {/* Photo preview or capture button */}
          {currentStep.photoUri ? (
            <TouchableOpacity style={styles.photoPreview} onPress={handleViewAnnotate}>
              <Image source={{ uri: currentStep.photoUri }} style={styles.previewImage} />
              <View style={styles.previewOverlay}>
                <Ionicons name="eye-outline" size={24} color={colors.textOnPrimary} />
                <Text style={styles.previewText}>Tap to review & annotate</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  currentStep.status === 'reviewed' ? styles.statusReviewed : styles.statusCaptured,
                ]}
              >
                <Text style={styles.statusText}>
                  {currentStep.status === 'reviewed' ? '✓ Reviewed' : 'Captured'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Button
              title="Take Photo"
              onPress={handleCapture}
              variant="primary"
              size="large"
              icon={<Ionicons name="camera" size={20} color={colors.textOnPrimary} />}
            />
          )}

          {/* Retake option */}
          {currentStep.photoUri && (
            <Button
              title={PHOTO_SCAN_COPY.RETAKE_PHOTO}
              onPress={handleCapture}
              variant="ghost"
              size="medium"
              style={styles.retakeButton}
            />
          )}
        </View>

        {/* Step navigation dots */}
        <View style={styles.dotsContainer}>
          {session.steps.map((step, index) => (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.dot,
                index === session.currentStepIndex && styles.dotActive,
                step.status === 'reviewed' && styles.dotCompleted,
              ]}
              onPress={() => usePhotoScanStore.getState().goToStep(index)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navButton, session.currentStepIndex === 0 && styles.navButtonDisabled]}
          onPress={previousStep}
          disabled={session.currentStepIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={session.currentStepIndex === 0 ? colors.textMuted : colors.primary}
          />
          <Text
            style={[
              styles.navButtonText,
              session.currentStepIndex === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Back
          </Text>
        </TouchableOpacity>

        {isLastStep ? (
          <Button
            title={PHOTO_SCAN_COPY.COMPLETE_SCAN}
            onPress={handleComplete}
            variant="primary"
            size="medium"
            style={styles.completeButton}
          />
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>{PHOTO_SCAN_COPY.NEXT_STEP}</Text>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressText: {
    ...typography.captionBold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  stepCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  stepTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  stepInstruction: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tipsContainer: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  warningText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  photoPreview: {
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlay,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  previewText: {
    ...typography.caption,
    color: colors.textOnPrimary,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusCaptured: {
    backgroundColor: colors.info,
  },
  statusReviewed: {
    backgroundColor: colors.success,
  },
  statusText: {
    ...typography.small,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  retakeButton: {
    marginTop: spacing.xs,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  dotCompleted: {
    backgroundColor: colors.success,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.sm,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  navButtonTextDisabled: {
    color: colors.textMuted,
  },
  completeButton: {
    minWidth: 150,
  },
});

