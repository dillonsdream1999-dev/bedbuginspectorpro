/**
 * Photo Annotate Screen - Display photo with overlay pins + bottom sheet
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/Button';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { usePhotoScanStore } from './usePhotoScanStore';
import { Pin } from './models';
import { PHOTO_SCAN_COPY } from './copy';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoAnnotate'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PhotoAnnotateScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stepId } = route.params;
  const { session, updatePinStatus, updatePinPosition, markStepReviewed } = usePhotoScanStore();
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [draggingPin, setDraggingPin] = useState<Pin | null>(null);
  const photoContainerRef = useRef<View>(null);
  const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const step = session?.steps.find((s) => s.id === stepId);

  if (!step || !step.photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Photo not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" size="medium" />
      </SafeAreaView>
    );
  }

  // Convert screen coordinates to normalized (0-1) coordinates
  const screenToNormalized = (screenX: number, screenY: number) => {
    if (containerLayout.width === 0 || containerLayout.height === 0) {
      return { x: 0.5, y: 0.5 };
    }
    
    const relativeX = screenX - containerLayout.x;
    const relativeY = screenY - containerLayout.y;
    
    const normalizedX = Math.max(0, Math.min(1, relativeX / containerLayout.width));
    const normalizedY = Math.max(0, Math.min(1, relativeY / containerLayout.height));
    
    return { x: normalizedX, y: normalizedY };
  };

  const handlePinTap = (pin: Pin) => {
    // If dragging, don't open modal
    if (draggingPin) {
      return;
    }
    setSelectedPin(pin);
  };


  // Pan responder for dragging pins
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !!draggingPin,
        onMoveShouldSetPanResponder: () => !!draggingPin,
        onPanResponderMove: (event) => {
          if (draggingPin) {
            const { pageX, pageY } = event.nativeEvent;
            const normalized = screenToNormalized(pageX, pageY);
            updatePinPosition(stepId, draggingPin.id, normalized.x, normalized.y);
          }
        },
        onPanResponderRelease: () => {
          if (draggingPin) {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setDraggingPin(null);
          }
        },
      }),
    [draggingPin, stepId, updatePinPosition]
  );

  const handlePinStartDrag = (pin: Pin) => {
    setDraggingPin(pin);
    setSelectedPin(null);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleMarkChecked = () => {
    if (selectedPin && stepId) {
      updatePinStatus(stepId, selectedPin.id, 'checked');
      setSelectedPin(null);
    }
  };

  const handleMarkConcerned = () => {
    if (selectedPin && stepId) {
      updatePinStatus(stepId, selectedPin.id, 'concerned');
      setSelectedPin(null);
    }
  };

  const handleDone = () => {
    markStepReviewed(stepId);
    navigation.goBack();
  };

  const handleContactExpert = () => {
    navigation.navigate('LeadFlow', { roomType: session?.roomType });
  };

  const checkedCount = step.pins.filter((p) => p.status !== 'unchecked').length;
  const totalPins = step.pins.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{step.title}</Text>
          <Text style={styles.headerSubtitle}>
            {checkedCount}/{totalPins} pins reviewed
          </Text>
        </View>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Photo with pins */}
      <View 
        ref={photoContainerRef}
        style={styles.photoContainer}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          setContainerLayout({ x, y, width, height });
        }}
        {...panResponder.panHandlers}
      >
        <Image source={{ uri: step.photoUri }} style={styles.photo} resizeMode="contain" />

        {/* Pin overlays */}
        {step.pins.map((pin) => {
          const isDragging = draggingPin?.id === pin.id;
          
          return (
            <Pressable
              key={pin.id}
              style={[
                styles.pinMarker,
                {
                  left: `${pin.x * 100}%`,
                  top: `${pin.y * 100}%`,
                },
                pin.status === 'checked' && styles.pinChecked,
                pin.status === 'concerned' && styles.pinConcerned,
                isDragging && styles.pinDragging,
              ]}
              onPress={() => {
                if (!draggingPin) {
                  handlePinTap(pin);
                }
              }}
              onLongPress={() => handlePinStartDrag(pin)}
            >
              <Ionicons
                name={
                  pin.status === 'checked'
                    ? 'checkmark-circle'
                    : pin.status === 'concerned'
                    ? 'alert-circle'
                    : 'location'
                }
                size={isDragging ? 28 : 24}
                color={
                  pin.status === 'checked'
                    ? colors.success
                    : pin.status === 'concerned'
                    ? colors.danger
                    : colors.accent
                }
              />
              {isDragging && (
                <View style={styles.dragIndicator}>
                  <Text style={styles.dragText}>Drag to adjust</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Adjustment notice */}
      {step.pinsManuallyAdjusted && !draggingPin && (
        <View style={styles.adjustmentNotice}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.adjustmentText}>Pin positions adjusted</Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionBar}>
        <Ionicons name="finger-print-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.instructionText}>
          {draggingPin ? 'Drag to adjust position, release when done' : 'Tap pins to inspect • Long press to move'}
        </Text>
      </View>

      {/* Pin Detail Modal */}
      <Modal
        visible={!!selectedPin}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPin(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPin(null)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {selectedPin && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Pin header */}
                <View style={styles.pinHeader}>
                  <View
                    style={[
                      styles.pinIcon,
                      selectedPin.status === 'checked' && styles.pinIconChecked,
                      selectedPin.status === 'concerned' && styles.pinIconConcerned,
                    ]}
                  >
                    <Ionicons
                      name="location"
                      size={24}
                      color={
                        selectedPin.status === 'checked'
                          ? colors.success
                          : selectedPin.status === 'concerned'
                          ? colors.danger
                          : colors.accent
                      }
                    />
                  </View>
                  <Text style={styles.pinLabel}>{selectedPin.label}</Text>
                </View>

                {/* Why it matters */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Why This Matters</Text>
                  <Text style={styles.sectionText}>{selectedPin.description}</Text>
                </View>

                {/* What to look for */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>What to Look For</Text>
                  <Text style={styles.sectionText}>{selectedPin.whatToLook}</Text>
                </View>

                {/* Status buttons */}
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[styles.statusButton, selectedPin.status === 'checked' && styles.statusButtonActive]}
                    onPress={handleMarkChecked}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={selectedPin.status === 'checked' ? colors.success : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.statusButtonText,
                        selectedPin.status === 'checked' && styles.statusButtonTextActive,
                      ]}
                    >
                      {PHOTO_SCAN_COPY.MARK_CHECKED}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.statusButton, selectedPin.status === 'concerned' && styles.statusButtonConcerned]}
                    onPress={handleMarkConcerned}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={24}
                      color={selectedPin.status === 'concerned' ? colors.danger : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.statusButtonText,
                        selectedPin.status === 'concerned' && styles.statusButtonTextConcerned,
                      ]}
                    >
                      {PHOTO_SCAN_COPY.MARK_CONCERNED}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* CTA */}
                <View style={styles.ctaSection}>
                  <Button
                    title={PHOTO_SCAN_COPY.CTA_BUTTON}
                    onPress={handleContactExpert}
                    variant="outline"
                    size="medium"
                  />
                  <Text style={styles.ctaSupporting}>{PHOTO_SCAN_COPY.CTA_SUPPORTING}</Text>
                  <Text style={styles.disclaimer}>{PHOTO_SCAN_COPY.CTA_DISCLAIMER}</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.small,
    color: colors.textMuted,
  },
  doneButton: {
    padding: spacing.sm,
  },
  doneText: {
    ...typography.bodyBold,
    color: colors.accent,
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.surfaceLight,
  },
  photo: {
    flex: 1,
    width: '100%',
  },
  pinMarker: {
    position: 'absolute',
    width: 48,
    height: 48,
    marginLeft: -24,
    marginTop: -24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 24,
    zIndex: 10,
  },
  pinDragging: {
    backgroundColor: 'rgba(255, 160, 0, 0.6)',
    zIndex: 20,
    transform: [{ scale: 1.2 }],
  },
  dragIndicator: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  dragText: {
    ...typography.small,
    fontSize: 10,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  pinChecked: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  pinConcerned: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
  },
  instructionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  instructionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlayLight,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  pinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIconChecked: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  pinIconConcerned: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  pinLabel: {
    ...typography.heading3,
    color: colors.textPrimary,
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  sectionText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  statusButtonActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  statusButtonConcerned: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  statusButtonText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statusButtonTextActive: {
    color: colors.success,
  },
  statusButtonTextConcerned: {
    color: colors.danger,
  },
  ctaSection: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  ctaSupporting: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  disclaimer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  adjustmentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.success + '15',
    borderTopWidth: 1,
    borderTopColor: colors.success + '30',
  },
  adjustmentText: {
    ...typography.small,
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
});

