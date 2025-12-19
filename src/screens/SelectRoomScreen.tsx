/**
 * Select Room Screen - LeadSnap-inspired clean design
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COPY } from '../constants/copy';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { RootStackParamList, RoomType } from '../types';
import { trackScanStarted } from '../services/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectRoom'>;

const ROOM_OPTIONS: { 
  type: RoomType; 
  title: string; 
  description: string; 
  steps: number; 
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    type: 'bedroom',
    title: COPY.ROOM_BEDROOM,
    description: COPY.ROOM_BEDROOM_DESC,
    steps: 9,
    icon: 'bed',
    color: colors.primary,
  },
  {
    type: 'living_room',
    title: COPY.ROOM_LIVING,
    description: COPY.ROOM_LIVING_DESC,
    steps: 8,
    icon: 'tv',
    color: colors.success,
  },
  {
    type: 'hotel',
    title: COPY.ROOM_HOTEL,
    description: COPY.ROOM_HOTEL_DESC,
    steps: 10,
    icon: 'business',
    color: colors.accent,
  },
];

export const SelectRoomScreen: React.FC<Props> = ({ navigation }) => {
  const handleSelectRoom = (roomType: RoomType) => {
    trackScanStarted(roomType);
    navigation.navigate('PhotoScanFlow', { roomType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="search" size={24} color={colors.primary} />
          </View>
          <Text style={styles.title}>What are you inspecting?</Text>
          <Text style={styles.subtitle}>
            Select a room type to start your guided inspection
          </Text>
        </View>

        <View style={styles.buttons}>
          {ROOM_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.type}
              style={styles.roomButton}
              onPress={() => handleSelectRoom(option.type)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color + '12' }]}>
                <Ionicons name={option.icon} size={32} color={option.color} />
              </View>
              <View style={styles.buttonContent}>
                <Text style={styles.buttonTitle}>{option.title}</Text>
                <Text style={styles.buttonDescription}>{option.description}</Text>
                <View style={styles.stepsRow}>
                  <View style={styles.statBadge}>
                    <Ionicons name="camera-outline" size={12} color={colors.primary} />
                    <Text style={styles.stepsText}>{option.steps} photos</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.timeText}>~{option.steps * 2} min</Text>
                  </View>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={styles.footerText}>
            Each inspection guides you through key hiding spots with interactive photo markers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttons: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  buttonDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  stepsText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  timeText: {
    ...typography.small,
    color: colors.textMuted,
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  footerText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
