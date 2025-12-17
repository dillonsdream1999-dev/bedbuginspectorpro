/**
 * Scan Screen - Guided Checklist
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { CTASection } from '../components/CTASection';
import { COPY } from '../constants/copy';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { RootStackParamList, ChecklistItem } from '../types';
import { useScanStore } from '../store/useScanStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

export const ScanScreen: React.FC<Props> = ({ navigation }) => {
  const { currentSession, updateItemStatus } = useScanStore();
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No active session</Text>
      </SafeAreaView>
    );
  }

  const items = currentSession.items;
  const checkedCount = items.filter((i) => i.status === 'checked').length;
  const flaggedCount = items.filter((i) => i.status === 'flagged').length;
  const progress = (checkedCount / items.length) * 100;

  const handleItemPress = (item: ChecklistItem) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleMarkChecked = () => {
    if (selectedItem) {
      updateItemStatus(selectedItem.id, 'checked');
      setShowDetail(false);
    }
  };

  const handleMarkFlagged = () => {
    if (selectedItem) {
      updateItemStatus(selectedItem.id, 'flagged');
      setShowDetail(false);
    }
  };

  const handleTakePhoto = () => {
    if (selectedItem) {
      setShowDetail(false);
      navigation.navigate('PhotoCapture', { itemId: selectedItem.id });
    }
  };

  const handleComplete = () => {
    navigation.navigate('Summary', { sessionId: currentSession.id });
  };

  const handleContactExpert = () => {
    navigation.navigate('LeadFlow', { roomType: currentSession.roomType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Guided Inspection</Text>
          <Text style={styles.subtitle}>
            Tap each area to inspect and mark as checked or flagged
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            {checkedCount} of {items.length} areas checked
            {flaggedCount > 0 && ` • ${flaggedCount} flagged`}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.checklist}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checklistItem}
              onPress={() => handleItemPress(item)}
            >
              <View
                style={[
                  styles.checkbox,
                  item.status === 'checked' && styles.checkboxChecked,
                  item.status === 'flagged' && styles.checkboxFlagged,
                ]}
              >
                {item.status === 'checked' && (
                  <Ionicons name="checkmark" size={16} color={colors.textDark} />
                )}
                {item.status === 'flagged' && (
                  <Ionicons name="flag" size={16} color={colors.textPrimary} />
                )}
              </View>
              <View style={styles.checklistText}>
                <Text
                  style={[
                    styles.checklistTitle,
                    item.status === 'checked' && styles.checklistTitleChecked,
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.checklistDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              {item.photoUri && (
                <Ionicons name="camera" size={20} color={colors.success} />
              )}
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Outlet warning */}
        <View style={styles.warningBox}>
          <Ionicons name="warning-outline" size={20} color={colors.warning} />
          <Text style={styles.warningText}>{COPY.OUTLET_WARNING}</Text>
        </View>

        {/* CTA */}
        <CTASection onPress={handleContactExpert} variant="full" />

        {/* Complete button */}
        <Button
          title="Complete Inspection"
          onPress={handleComplete}
          variant="primary"
          size="large"
          style={styles.completeButton}
          icon={<Ionicons name="checkmark-circle" size={20} color={colors.textDark} />}
        />
      </ScrollView>

      {/* Item Detail Modal */}
      <Modal
        visible={showDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetail(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetail(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {selectedItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <TouchableOpacity onPress={() => setShowDetail(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {selectedItem.warning && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning-outline" size={20} color={colors.warning} />
                    <Text style={styles.warningText}>{selectedItem.warning}</Text>
                  </View>
                )}

                <Text style={styles.modalDescription}>
                  {selectedItem.description}
                </Text>

                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      selectedItem.status === 'checked' && styles.statusButtonActive,
                    ]}
                    onPress={handleMarkChecked}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={selectedItem.status === 'checked' ? colors.success : colors.textMuted}
                    />
                    <Text style={styles.statusButtonText}>Checked</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      selectedItem.status === 'flagged' && styles.statusButtonFlagged,
                    ]}
                    onPress={handleMarkFlagged}
                  >
                    <Ionicons
                      name="flag"
                      size={24}
                      color={selectedItem.status === 'flagged' ? colors.danger : colors.textMuted}
                    />
                    <Text style={styles.statusButtonText}>Flagged</Text>
                  </TouchableOpacity>
                </View>

                <Button
                  title={COPY.BTN_TAKE_PHOTO}
                  onPress={handleTakePhoto}
                  variant="secondary"
                  size="large"
                  icon={<Ionicons name="camera" size={20} color={colors.textPrimary} />}
                />

                <View style={styles.modalCTA}>
                  <CTASection onPress={handleContactExpert} variant="compact" />
                </View>
              </>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  progressText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  checklist: {
    marginBottom: spacing.lg,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxFlagged: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  checklistText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  checklistTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  checklistTitleChecked: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  checklistDescription: {
    ...typography.small,
    color: colors.textSecondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    flex: 1,
  },
  completeButton: {
    marginTop: spacing.lg,
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
    paddingBottom: spacing.xxl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
  statusButtonFlagged: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  statusButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  modalCTA: {
    marginTop: spacing.lg,
  },
});

