/**
 * Photo Scan Flow Screen - Step-by-step guided flow
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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

          {/* Inspection Checklist */}
          <View style={styles.checklistContainer}>
            <Text style={styles.checklistTitle}>Inspection Checklist</Text>
            <Text style={styles.checklistSubtitle}>Check off areas as you inspect them</Text>
            {currentStep.checklistItems.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.checklistItem,
                  pressed && styles.checklistItemPressed,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  usePhotoScanStore.getState().toggleChecklistItem(currentStep.id, item.id);
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.checked && styles.checkboxChecked,
                  ]}
                >
                  {item.checked && (
                    <Ionicons name="checkmark" size={16} color={colors.textOnPrimary} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checklistText,
                    item.checked && styles.checklistTextChecked,
                  ]}
                >
                  {item.text}
                </Text>
              </Pressable>
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
            <Pressable 
              style={({ pressed }) => [
                styles.photoPreview,
                pressed && styles.photoPreviewPressed,
              ]}
              onPress={handleViewAnnotate}
            >
              <Image source={{ uri: currentStep.photoUri }} style={styles.previewImage} />
              <View style={styles.previewOverlay}>
                <Ionicons name="eye-outline" size={20} color={colors.textOnPrimary} />
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
            </Pressable>
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
            <Pressable
              key={step.id}
              style={[
                styles.dot,
                index === session.currentStepIndex && styles.dotActive,
                step.status === 'reviewed' && styles.dotCompleted,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                usePhotoScanStore.getState().goToStep(index);
              }}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            session.currentStepIndex === 0 && styles.navButtonDisabled,
            pressed && !(session.currentStepIndex === 0) && styles.navButtonPressed,
          ]}
          onPress={previousStep}
          disabled={session.currentStepIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={22}
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
        </Pressable>

        {isLastStep ? (
          <Button
            title={PHOTO_SCAN_COPY.COMPLETE_SCAN}
            onPress={handleComplete}
            variant="primary"
            size="medium"
            style={styles.completeButton}
          />
        ) : (
          <Pressable 
            style={({ pressed }) => [
              styles.navButton,
              pressed && styles.navButtonPressed,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>{PHOTO_SCAN_COPY.NEXT_STEP}</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </Pressable>
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
    marginBottom: spacing.md,
  },
  progressText: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'ios' ? shadows.sm : { elevation: 2 }),
  },
  stepTitle: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepInstruction: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  checklistContainer: {
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.md,
  },
  checklistTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  checklistSubtitle: {
    ...typography.small,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs + 2,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    gap: spacing.sm,
  },
  checklistItemPressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checklistText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  checklistTextChecked: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
    gap: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  warningText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  photoPreview: {
    position: 'relative',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.xs,
    ...(Platform.OS === 'ios' ? shadows.md : { elevation: 4 }),
  },
  photoPreviewPressed: {
    opacity: 0.9,
  },
  previewImage: {
    width: '100%',
    height: 180,
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
    padding: spacing.xs + 2,
    gap: spacing.xs,
  },
  previewText: {
    ...typography.caption,
    fontSize: 12,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...(Platform.OS === 'ios' ? shadows.sm : { elevation: 2 }),
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.xs + 2,
  },
  navButtonPressed: {
    opacity: 0.7,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.primary,
  },
  navButtonTextDisabled: {
    color: colors.textMuted,
  },
  completeButton: {
    minWidth: 150,
  },
});

