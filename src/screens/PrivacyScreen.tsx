/**
 * Privacy Policy Screen - Placeholder for privacy information
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';
import { trackPageView } from '../services/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'Privacy'>;

export const PrivacyScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    trackPageView('privacy');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy Policy</Text>
        </View>

        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

        {/* Privacy Highlight */}
        <View style={styles.highlightCard}>
          <Ionicons name="shield-checkmark" size={32} color={colors.success} />
          <Text style={styles.highlightTitle}>Your Privacy is Protected</Text>
          <Text style={styles.highlightText}>
            Photos taken in this app stay on your device only. They are never uploaded, stored on our servers, or shared with anyone.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect minimal information to provide our services:
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location (ZIP Code)</Text>
                <Text style={styles.infoDesc}>Used only to connect you with local pest control professionals</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Contact Preference</Text>
                <Text style={styles.infoDesc}>How you prefer to be contacted (call, text, callback)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.paragraph}>
            Photos taken using the App are stored locally on your device only. We do not:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
              <Text style={styles.bulletText}>Upload photos to any server</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
              <Text style={styles.bulletText}>Store photos in the cloud</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
              <Text style={styles.bulletText}>Share photos with third parties</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
              <Text style={styles.bulletText}>Access your photo library</Text>
            </View>
          </View>
          <Text style={[styles.paragraph, { marginTop: spacing.md }]}>
            When you close the App, all session photos are automatically deleted from temporary storage.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Information</Text>
          <Text style={styles.paragraph}>
            The limited information we collect is used to:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>Connect you with local pest control professionals in your area</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>Facilitate communication between you and service providers</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>Improve our services based on aggregate, anonymized usage patterns</Text>
            </View>
          </View>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.paragraph}>
            When you choose to contact a pest control professional through the App, your ZIP code and contact preference may be shared with that service provider to facilitate your request. We only share the minimum information necessary.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>Request information about data we've collected</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>Request deletion of your data</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>Opt out of communications</Text>
            </View>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            The App is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
          </Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us through the App's support channels.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="lock-closed" size={24} color={colors.success} />
          <Text style={styles.footerText}>
            Your privacy matters to us. We're committed to being transparent about how we handle your information.
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
    flex: 1,
  },
  lastUpdated: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  highlightCard: {
    backgroundColor: colors.success + '12',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  highlightTitle: {
    ...typography.heading3,
    color: colors.success,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  highlightText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  infoContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  infoDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  bulletList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success + '30',
    alignItems: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

