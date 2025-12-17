/**
 * Photo Annotate Screen - Display photo with overlay pins + bottom sheet
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
  const { session, updatePinStatus, markStepReviewed } = usePhotoScanStore();
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

  const step = session?.steps.find((s) => s.id === stepId);

  if (!step || !step.photoUri) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Photo not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} variant="outline" size="medium" />
      </SafeAreaView>
    );
  }

  const handlePinTap = (pin: Pin) => {
    setSelectedPin(pin);
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
      <View style={styles.photoContainer}>
        <Image source={{ uri: step.photoUri }} style={styles.photo} resizeMode="contain" />

        {/* Pin overlays */}
        {step.pins.map((pin) => (
          <TouchableOpacity
            key={pin.id}
            style={[
              styles.pinMarker,
              {
                left: `${pin.x * 100}%`,
                top: `${pin.y * 100}%`,
              },
              pin.status === 'checked' && styles.pinChecked,
              pin.status === 'concerned' && styles.pinConcerned,
            ]}
            onPress={() => handlePinTap(pin)}
          >
            <Ionicons
              name={
                pin.status === 'checked'
                  ? 'checkmark-circle'
                  : pin.status === 'concerned'
                  ? 'alert-circle'
                  : 'location'
              }
              size={24}
              color={
                pin.status === 'checked'
                  ? colors.success
                  : pin.status === 'concerned'
                  ? colors.danger
                  : colors.accent
              }
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Instructions */}
      <View style={styles.instructionBar}>
        <Ionicons name="finger-print-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.instructionText}>Tap pins to inspect each area</Text>
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
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
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
});

