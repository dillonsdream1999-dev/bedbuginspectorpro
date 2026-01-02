/**
 * Select Room Screen - LeadSnap-inspired clean design
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
          <Text style={styles.title}>What are you inspecting?</Text>
        </View>

        <View style={styles.buttons}>
          {ROOM_OPTIONS.map((option, index) => (
            <Pressable
              key={option.type}
              style={({ pressed }) => [
                styles.roomButton,
                pressed && styles.roomButtonPressed,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                handleSelectRoom(option.type);
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color + '12' }]}>
                <Ionicons name={option.icon} size={28} color={option.color} />
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
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>
          ))}
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
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.heading3,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  buttons: {
    gap: spacing.sm,
  },
  roomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'ios' ? shadows.sm : { elevation: 2 }),
  },
  roomButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  buttonDescription: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  stepsText: {
    ...typography.small,
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  timeText: {
    ...typography.small,
    fontSize: 11,
    color: colors.textMuted,
  },
});
