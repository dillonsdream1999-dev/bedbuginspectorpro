/**
 * Terms of Service Screen - Placeholder for legal terms
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';
import { trackPageView } from '../services/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'Terms'>;

export const TermsScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    trackPageView('terms');
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
          <Text style={styles.title}>Terms of Service</Text>
        </View>

        <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By downloading, installing, or using Bed Bug Inspection Pro ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Educational Purpose Only</Text>
          <Text style={styles.paragraph}>
            The App is designed for educational purposes only. It provides guidance on where to look for signs of bed bugs but DOES NOT diagnose, confirm, or rule out bed bug infestations. The App is not a substitute for professional pest control inspection and treatment.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. No Warranty</Text>
          <Text style={styles.paragraph}>
            The App is provided "as is" without warranty of any kind, express or implied. We do not guarantee the accuracy, completeness, or usefulness of any information provided through the App.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall the developers, owners, or operators of the App be liable for any damages arising from the use or inability to use the App, including but not limited to damages from bed bug infestations, property damage, or health issues.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            The App may connect you with third-party pest control professionals. We do not endorse, guarantee, or assume responsibility for the services provided by these third parties. Your interactions with these service providers are solely between you and them.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            You are responsible for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Using the App safely and not removing electrical covers or performing dangerous actions</Text>
            <Text style={styles.bulletItem}>• Seeking professional assistance for suspected infestations</Text>
            <Text style={styles.bulletItem}>• Providing accurate information when contacting service providers</Text>
          </View>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contact</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms of Service, please contact us through the App's support channels.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using this App, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
  bulletList: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  bulletItem: {
    ...typography.body,
    color: colors.textSecondary,
    paddingLeft: spacing.sm,
  },
  footer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

