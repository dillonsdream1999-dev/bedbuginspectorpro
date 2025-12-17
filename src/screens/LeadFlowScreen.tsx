/**
 * Lead Flow Screen - Territory-based provider lookup
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Button } from '../components/Button';
import { COPY } from '../constants/copy';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { RootStackParamList, ContactPreference, RoomType } from '../types';
import { createLead } from '../services/scanService';
import { getProviderByZip, Provider, LookupErrorType } from '../services/providerService';
import { 
  trackProviderLookup, 
  trackLeadSubmitted, 
  trackContactAction,
  trackGoogleSearchClicked 
} from '../services/analyticsService';
import { usePhotoScanStore } from '../features/scanPhoto/usePhotoScanStore';

type Props = NativeStackScreenProps<RootStackParamList, 'LeadFlow'>;

export const LeadFlowScreen: React.FC<Props> = ({ navigation }) => {
  const [zip, setZip] = useState('');
  const [isDetectingZip, setIsDetectingZip] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAction, setSubmittedAction] = useState<ContactPreference | null>(null);
  
  // Provider lookup state
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLookingUpProvider, setIsLookingUpProvider] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<LookupErrorType | null>(null);

  useEffect(() => {
    detectZip();
  }, []);

  // Look up provider when ZIP changes
  useEffect(() => {
    if (isValidZip(zip)) {
      lookupProvider(zip);
    } else {
      setProvider(null);
      setProviderError(null);
    }
  }, [zip]);

  const lookupProvider = async (zipCode: string) => {
    setIsLookingUpProvider(true);
    setProviderError(null);
    setErrorType(null);
    
    const result = await getProviderByZip(zipCode);
    
    if (result.found && result.provider) {
      setProvider(result.provider);
      setProviderError(null);
      setErrorType(null);
      // Track provider found
      trackProviderLookup(zipCode, true, result.provider.companyName);
    } else {
      setProvider(null);
      setProviderError(result.error || null);
      setErrorType(result.errorType || null);
      // Track provider not found (only for no_territory, not network errors)
      if (result.errorType === 'no_territory' || result.errorType === 'no_company') {
        trackProviderLookup(zipCode, false);
      }
    }
    
    setIsLookingUpProvider(false);
  };

  const detectZip = async () => {
    setIsDetectingZip(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsDetectingZip(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address?.postalCode) {
        setZip(address.postalCode.substring(0, 5));
      }
    } catch (error) {
      console.log('Could not detect ZIP:', error);
    } finally {
      setIsDetectingZip(false);
    }
  };

  const isValidZip = (value: string) => /^\d{5}$/.test(value);

  const handleAction = async (action: ContactPreference) => {
    if (!isValidZip(zip)) {
      Alert.alert('Invalid ZIP Code', 'Please enter a valid 5-digit ZIP code.');
      return;
    }

    setIsSubmitting(true);
    setSubmittedAction(action);

    // Get session info if available
    const session = usePhotoScanStore.getState().session;
    const roomType: RoomType = session?.roomType || 'bedroom';
    const sessionId = session?.id;

    // IMPORTANT: Create lead record BEFORE initiating call/text
    const leadResult = await createLead(zip, roomType, action, sessionId);
    
    if (!leadResult.success) {
      console.warn('Failed to save lead:', leadResult.error);
      // Continue anyway - don't block user from getting help
    }

    // Track lead submission and contact action
    trackLeadSubmitted(zip, action, !!provider, provider?.companyName);
    
    // Handle contact initiation - use provider's phone if available
    const phoneNumber = provider?.phone || '18005550199';
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    
    if (action === 'call_now') {
      trackContactAction('call', zip, provider?.companyName);
      Linking.openURL(`tel:${cleanPhone}`);
    } else if (action === 'text_now') {
      trackContactAction('text', zip, provider?.companyName);
      const message = encodeURIComponent(
        `Hi${provider ? ` ${provider.companyName}` : ''}, I'm looking for bed bug inspection help. My ZIP code is ${zip}. Can you provide more information?`
      );
      Linking.openURL(`sms:${cleanPhone}?body=${message}`);
    } else if (action === 'callback') {
      trackContactAction('callback', zip, provider?.companyName);
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    const providerName = provider?.companyName;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>
            {submittedAction === 'callback' ? 'Callback Requested' : 'Connecting You Now'}
          </Text>
          {providerName && (
            <Text style={styles.successProvider}>{providerName}</Text>
          )}
          <Text style={styles.successText}>
            {submittedAction === 'callback'
              ? `${providerName || 'A local expert'} will contact you soon.`
              : `Connecting you with ${providerName || 'a local expert'}...`}
          </Text>
          <Button
            title={COPY.BTN_DONE}
            onPress={() => navigation.goBack()}
            variant="primary"
            size="large"
            style={styles.doneButton}
          />
          <Text style={styles.disclaimer}>{COPY.CTA_DISCLAIMER}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>{COPY.LEAD_TITLE}</Text>
        </View>

        <Text style={styles.supportingText}>{COPY.CTA_SUPPORTING}</Text>

        {/* ZIP input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{COPY.LEAD_ZIP_LABEL}</Text>
          <View style={styles.zipInputContainer}>
            <TextInput
              style={styles.zipInput}
              value={zip}
              onChangeText={setZip}
              placeholder="Enter ZIP code"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={5}
              editable={!isDetectingZip}
            />
            {isDetectingZip && (
              <Text style={styles.detectingText}>Detecting...</Text>
            )}
            {!isDetectingZip && zip && isValidZip(zip) && !isLookingUpProvider && (
              <Ionicons name="checkmark" size={20} color={colors.success} />
            )}
            {isLookingUpProvider && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>
        </View>

        {/* CASE 1: Provider Found - Show provider info and contact buttons */}
        {provider && (
          <>
            <View style={styles.providerCard}>
              <View style={styles.providerHeader}>
                <View style={styles.providerIcon}>
                  <Ionicons name="business" size={24} color={colors.accent} />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerLabel}>Your Local Expert</Text>
                  <Text style={styles.providerName}>{provider.companyName}</Text>
                </View>
                <View style={styles.providerBadge}>
                  <Ionicons name="shield-checkmark" size={14} color={colors.success} />
                  <Text style={styles.providerBadgeText}>Verified</Text>
                </View>
              </View>
              {provider.phone && (
                <View style={styles.providerContact}>
                  <Ionicons name="call" size={16} color={colors.textSecondary} />
                  <Text style={styles.providerPhone}>{provider.phone}</Text>
                </View>
              )}
            </View>

            {/* Action Buttons - Only shown when provider is found */}
            <View style={styles.actionsSection}>
              <Text style={styles.actionsTitle}>Connect Now</Text>
              
              {/* Call Now Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonCall]}
                onPress={() => handleAction('call_now')}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIcon}>
                  <Ionicons name="call" size={28} color={colors.textOnPrimary} />
                </View>
                <View style={styles.actionButtonContent}>
                  <Text style={styles.actionButtonTitle}>Call Now</Text>
                  <Text style={styles.actionButtonDesc}>
                    Speak directly with {provider.companyName}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textOnPrimary} />
              </TouchableOpacity>

              {/* Text Now Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonText]}
                onPress={() => handleAction('text_now')}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIcon}>
                  <Ionicons name="chatbubble" size={28} color={colors.textOnPrimary} />
                </View>
                <View style={styles.actionButtonContent}>
                  <Text style={styles.actionButtonTitle}>Text Now</Text>
                  <Text style={styles.actionButtonDesc}>
                    Send a message to {provider.companyName}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textOnPrimary} />
              </TouchableOpacity>

              {/* Request Callback Button */}
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonCallback]}
                onPress={() => handleAction('callback')}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonIconOutline}>
                  <Ionicons name="time" size={28} color={colors.accent} />
                </View>
                <View style={styles.actionButtonContent}>
                  <Text style={styles.actionButtonTitleDark}>Request Callback</Text>
                  <Text style={styles.actionButtonDescDark}>
                    {provider.companyName} will call you back
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {isSubmitting && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Connecting...</Text>
              </View>
            )}
          </>
        )}

        {/* CASE 2: Error occurred (network/timeout) - Show retry */}
        {!provider && isValidZip(zip) && !isLookingUpProvider && 
          (errorType === 'network_error' || errorType === 'timeout') && (
          <View style={styles.errorSection}>
            <View style={styles.errorCard}>
              <Ionicons 
                name={errorType === 'timeout' ? 'time-outline' : 'cloud-offline-outline'} 
                size={48} 
                color={colors.warning} 
              />
              <Text style={styles.errorTitle}>
                {errorType === 'timeout' ? 'Request Timed Out' : 'Connection Error'}
              </Text>
              <Text style={styles.errorText}>{providerError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => lookupProvider(zip)}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color={colors.textOnPrimary} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* CASE 3: No Provider for this ZIP - Show Google search button */}
        {!provider && isValidZip(zip) && !isLookingUpProvider && 
          (errorType === 'no_territory' || errorType === 'no_company' || !errorType) && 
          errorType !== 'network_error' && errorType !== 'timeout' && (
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Find Local Experts</Text>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSearch]}
              onPress={() => {
                trackGoogleSearchClicked(zip);
                const searchQuery = encodeURIComponent(`bed bug heat treatment ${zip}`);
                Linking.openURL(`https://www.google.com/search?q=${searchQuery}`);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.actionButtonIconOutline}>
                <Ionicons name="search" size={28} color={colors.primary} />
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitleDark}>See Local Experts</Text>
                <Text style={styles.actionButtonDescDark}>
                  Find bed bug treatment specialists near you
                </Text>
              </View>
              <Ionicons name="open-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* CASE 3: Still looking up or no ZIP entered yet */}
        {!provider && !providerError && isValidZip(zip) && isLookingUpProvider && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding your local expert...</Text>
          </View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{COPY.CTA_DISCLAIMER}</Text>
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
  closeButton: {
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
  supportingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: spacing.lg,
  },
  // Provider card styles
  providerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  providerName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  providerBadgeText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600',
  },
  providerContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  providerPhone: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  noProviderSection: {
    marginBottom: spacing.lg,
  },
  noProviderCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noProviderTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  noProviderText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingSection: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  // Error handling section
  errorSection: {
    marginBottom: spacing.lg,
  },
  errorCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  errorTitle: {
    ...typography.heading3,
    color: colors.warning,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  retryButtonText: {
    ...typography.bodyBold,
    color: colors.textOnPrimary,
  },
  // Action buttons section
  actionsSection: {
    marginBottom: spacing.lg,
  },
  actionsTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  actionButtonCall: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    backgroundColor: colors.success,
  },
  actionButtonCallback: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonSearch: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  actionButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionButtonIconOutline: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    ...typography.bodyBold,
    color: colors.textOnPrimary,
    marginBottom: 2,
  },
  actionButtonTitleDark: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  actionButtonDesc: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtonDescDark: {
    ...typography.small,
    color: colors.textSecondary,
  },
  loadingOverlay: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  inputLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  zipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
  },
  zipInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  detectingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionIconSelected: {
    backgroundColor: colors.primary,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  disclaimer: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successProvider: {
    ...typography.heading3,
    color: colors.accent,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  doneButton: {
    width: '100%',
    marginBottom: spacing.lg,
  },
});

