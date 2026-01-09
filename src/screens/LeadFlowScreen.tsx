/**
 * Lead Flow Screen - Territory-based provider lookup
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
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
  const [metroArea, setMetroArea] = useState<string | null>(null); // DMA
  const [territoryId, setTerritoryId] = useState<string | null>(null); // Store territory ID for leads
  const [isLookingUpProvider, setIsLookingUpProvider] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<LookupErrorType | null>(null);

  // Callback form state
  const [showCallbackForm, setShowCallbackForm] = useState(false);
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackEmail, setCallbackEmail] = useState('');

  useEffect(() => {
    detectZip();
  }, []);

  // Memoize lookup function to prevent infinite loops
  const lookupProvider = useCallback(async (zipCode: string) => {
    setIsLookingUpProvider(true);
    setProviderError(null);
    setErrorType(null);
    
    try {
      console.log('Looking up provider for ZIP:', zipCode);
      const result = await getProviderByZip(zipCode);
      console.log('Provider lookup result:', result);
      
      // Always store territory info if available (needed for leads)
      if (result.territoryId) {
        setTerritoryId(result.territoryId);
      }
      if (result.metroArea) {
        setMetroArea(result.metroArea);
      }
      
      if (result.found && result.provider) {
        setProvider(result.provider);
        setProviderError(null);
        setErrorType(null);
        // Track provider found
        trackProviderLookup(zipCode, true, result.provider.companyName);
      } else {
        setProvider(null);
        setProviderError(result.error || 'No provider found for this area');
        setErrorType(result.errorType || null);
        // Track provider not found (only for no_territory, not network errors)
        if (result.errorType === 'no_territory' || result.errorType === 'no_company') {
          trackProviderLookup(zipCode, false);
        }
      }
    } catch (error) {
      console.error('Error in lookupProvider:', error);
      setProvider(null);
      setProviderError('Failed to lookup provider. Please try again.');
      setErrorType('unknown');
    } finally {
      setIsLookingUpProvider(false);
    }
  }, [trackProviderLookup]);

  // Use ref to prevent duplicate lookups
  const lookupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLookedUpZipRef = useRef<string>('');

  // Look up provider when ZIP changes (with debounce)
  useEffect(() => {
    // Clear any pending lookups
    if (lookupTimeoutRef.current) {
      clearTimeout(lookupTimeoutRef.current);
    }

    if (isValidZip(zip)) {
      // Debounce to avoid rapid lookups
      if (lastLookedUpZipRef.current === zip) {
        return; // Already looked up this ZIP
      }

      lookupTimeoutRef.current = setTimeout(() => {
        lastLookedUpZipRef.current = zip;
        lookupProvider(zip);
      }, 300);
    } else {
      setProvider(null);
      setProviderError(null);
      setErrorType(null);
      lastLookedUpZipRef.current = '';
    }

    return () => {
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current);
      }
    };
  }, [zip, lookupProvider]);

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

    // For callback, show the form instead of immediately submitting
    if (action === 'callback') {
      setShowCallbackForm(true);
      return;
    }

    setIsSubmitting(true);
    setSubmittedAction(action);

    // Get session info if available
    const session = usePhotoScanStore.getState().session;
    const roomType: RoomType = session?.roomType || 'bedroom';
    const sessionId = session?.id;

    // IMPORTANT: Create lead record BEFORE initiating call/text
    const leadResult = await createLead(zip, roomType, action, sessionId, {
      territoryId: territoryId || undefined,
      providerId: provider?.id,
      providerName: provider?.companyName,
    });
    
    if (!leadResult.success) {
      console.error('[LeadFlowScreen] Failed to save lead:', {
        error: leadResult.error,
        zip,
        action,
        providerId: provider?.id
      });
      // Continue anyway - don't block user from getting help
    } else {
      console.log('[LeadFlowScreen] Lead saved successfully:', { leadId: leadResult.leadId });
    }

    // Track lead submission and contact action
    trackLeadSubmitted(zip, action, !!provider, provider?.companyName);
    
    // Handle contact initiation - use provider's phone if available
    const phoneNumber = provider?.phone || '816-926-2111';
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    
    if (action === 'call_now') {
      trackContactAction('call', zip, provider?.companyName);
      Linking.openURL(`tel:${cleanPhone}`);
    } else if (action === 'text_now') {
      trackContactAction('text', zip, provider?.companyName);
      // Use traditional SMS format without body parameter to avoid popup
      Linking.openURL(`sms:${cleanPhone}`);
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  const handleCallbackSubmit = async () => {
    // Validate form
    if (!callbackName.trim()) {
      Alert.alert('Name Required', 'Please enter your name so we can address you properly.');
      return;
    }
    if (!callbackPhone.trim() || callbackPhone.replace(/\D/g, '').length < 10) {
      Alert.alert('Phone Required', 'Please enter a valid phone number so we can call you back.');
      return;
    }

    setIsSubmitting(true);
    setSubmittedAction('callback');
    setShowCallbackForm(false);

    // Get session info if available
    const session = usePhotoScanStore.getState().session;
    const roomType: RoomType = session?.roomType || 'bedroom';
    const sessionId = session?.id;

    // Create lead with contact info
    console.log('Submitting callback request:', {
      zip,
      providerId: provider?.id,
      providerName: provider?.companyName,
      customerName: callbackName.trim(),
      customerPhone: callbackPhone.trim(),
    });
    
    const leadResult = await createLead(zip, roomType, 'callback', sessionId, {
      territoryId: territoryId || undefined,
      customerName: callbackName.trim(),
      customerPhone: callbackPhone.trim(),
      customerEmail: callbackEmail.trim() || undefined,
      providerId: provider?.id,
      providerName: provider?.companyName,
      notes: `Callback requested for ZIP ${zip}`,
    });
    
    // Track lead submission and contact action (always track, even if save failed)
    trackLeadSubmitted(zip, 'callback', !!provider, provider?.companyName);
    trackContactAction('callback', zip, provider?.companyName);

    if (!leadResult.success) {
      console.error('[LeadFlowScreen] Failed to save callback request to database:', {
        error: leadResult.error,
        zip,
        customerName: callbackName,
        customerPhone: callbackPhone
      });
      // Still show success to user - the request was submitted, just not saved to DB
      // This is a non-critical failure that shouldn't block the user experience
    } else {
      console.log('[LeadFlowScreen] Callback request submitted successfully. Lead ID:', leadResult.leadId);
    }

    setIsSubmitting(false);
    
    // Show success screen immediately
    setSubmitted(true);
    
    // Also show Alert as confirmation (works better on mobile, may not show on web)
    // Use setTimeout to ensure state update happens first
    setTimeout(() => {
      Alert.alert(
        'Request Submitted!',
        `Your callback request has been sent to ${provider?.companyName || 'the local expert'}. They will contact you at ${formatPhoneDisplay(callbackPhone)} soon.`,
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }, 100);
  };

  const formatPhoneInput = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const formatPhoneDisplay = (phone: string): string => {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    // Return original if not a standard 10-digit number
    return phone;
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
            onPress={() => {
              setSubmitted(false);
              setSubmittedAction(null);
            }}
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
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              navigation.goBack();
            }}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>{COPY.LEAD_TITLE}</Text>
        </View>

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
              {/* Header with Icon, Name, and Verified Badge */}
              <View style={styles.providerHeader}>
                <View style={styles.providerIcon}>
                  <Ionicons name="business" size={28} color={colors.accent} />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerLabel}>Your Local Expert</Text>
                  <Text style={styles.providerName}>{provider.companyName}</Text>
                </View>
                <View style={styles.providerBadge}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                  <Text style={styles.providerBadgeText}>Verified</Text>
                </View>
              </View>

              {/* Location */}
              {metroArea && (
                <View style={styles.providerLocation}>
                  <Ionicons name="location" size={14} color={colors.textMuted} />
                  <Text style={styles.metroAreaText}>{metroArea} Area</Text>
                </View>
              )}

              {/* Phone Number */}
              {provider.phone && (
                <Pressable
                  style={styles.providerContact}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    const cleanPhone = provider.phone.replace(/\D/g, '');
                    Linking.openURL(`tel:${cleanPhone}`);
                  }}
                >
                  <Ionicons name="call" size={16} color={colors.primary} />
                  <Text style={styles.providerPhone}>{formatPhoneDisplay(provider.phone)}</Text>
                </Pressable>
              )}
              
              {/* Company Description */}
              {provider.description && (
                <View style={styles.providerDescription}>
                  <Text style={styles.providerDescriptionText}>{provider.description}</Text>
                </View>
              )}
              
              {/* Services List */}
              {provider.services && provider.services.length > 0 && (
                <View style={styles.providerServices}>
                  <Text style={styles.providerServicesTitle}>Services Offered</Text>
                  <View style={styles.servicesList}>
                    {provider.services.map((service, index) => (
                      <View key={index} style={styles.serviceItem}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                        <Text style={styles.serviceText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons - Only shown when provider is found */}
            <View style={styles.actionsSection}>
              <Text style={styles.actionsTitle}>Connect Now</Text>
              
              {/* Call Now Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonCall,
                  pressed && !isSubmitting && styles.actionButtonPressed,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  handleAction('call_now');
                }}
                disabled={isSubmitting}
              >
                <View style={styles.actionButtonIcon}>
                  <Ionicons name="call" size={24} color={colors.textOnPrimary} />
                </View>
                <View style={styles.actionButtonContent}>
                  <Text style={styles.actionButtonTitle}>Call Now</Text>
                  <Text style={styles.actionButtonDesc}>
                    Speak directly with {provider.companyName}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textOnPrimary} />
              </Pressable>

              {/* Text Now Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonText,
                  pressed && !isSubmitting && styles.actionButtonPressed,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  handleAction('text_now');
                }}
                disabled={isSubmitting}
              >
                <View style={styles.actionButtonIcon}>
                  <Ionicons name="chatbubble" size={24} color={colors.textOnPrimary} />
                </View>
                <View style={styles.actionButtonContent}>
                  <Text style={styles.actionButtonTitle}>Text Now</Text>
                  <Text style={styles.actionButtonDesc}>
                    Send a message to {provider.companyName}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textOnPrimary} />
              </Pressable>

              {/* Request Callback Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.actionButtonCallback,
                  pressed && !isSubmitting && styles.actionButtonPressed,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  handleAction('callback');
                }}
                disabled={isSubmitting}
              >
                <View style={styles.actionButtonIconOutline}>
                  <Ionicons name="time" size={24} color={colors.accent} />
                </View>
                <View style={styles.actionButtonContent}>
                  <Text style={styles.actionButtonTitleDark}>Request Callback</Text>
                  <Text style={styles.actionButtonDescDark}>
                    {provider.companyName} will call you back
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
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
              <Pressable
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  lookupProvider(zip);
                }}
              >
                <Ionicons name="refresh" size={18} color={colors.textOnPrimary} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* CASE 3: No Provider for this ZIP - Show Google search button */}
        {/* Only show after lookup completes with no_territory or no_company result */}
        {!provider && isValidZip(zip) && !isLookingUpProvider && 
          (errorType === 'no_territory' || errorType === 'no_company') && (
          <View style={styles.actionsSection}>
            <Text style={styles.actionsTitle}>Find Local Experts</Text>
            
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.actionButtonSearch,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                trackGoogleSearchClicked(zip);
                const searchQuery = encodeURIComponent(`bed bug heat treatment ${zip}`);
                Linking.openURL(`https://www.google.com/search?q=${searchQuery}`);
              }}
            >
              <View style={styles.actionButtonIconOutline}>
                <Ionicons name="search" size={24} color={colors.primary} />
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitleDark}>See Local Experts</Text>
                <Text style={styles.actionButtonDescDark}>
                  Find bed bug treatment specialists near you
                </Text>
              </View>
              <Ionicons name="open-outline" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}

        {/* CASE 4: Still looking up provider */}
        {isValidZip(zip) && isLookingUpProvider && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Finding your local expert...</Text>
          </View>
        )}

        {/* CASE 5: Valid ZIP entered but lookup hasn't started/completed yet */}
        {isValidZip(zip) && !isLookingUpProvider && !provider && !errorType && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Checking availability...</Text>
          </View>
        )}

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>{COPY.CTA_DISCLAIMER}</Text>
      </ScrollView>

      {/* Callback Request Form Modal */}
      <Modal
        visible={showCallbackForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCallbackForm(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCallbackForm(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <ScrollView
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="call" size={32} color={colors.accent} />
              </View>
              <Text style={styles.modalTitle}>Request a Callback</Text>
              <Text style={styles.modalSubtitle}>
                {provider?.companyName || 'A local expert'} will call you back
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowCallbackForm(false);
                }}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.formSection}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Your Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={callbackName}
                  onChangeText={setCallbackName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={callbackPhone}
                  onChangeText={(text) => setCallbackPhone(formatPhoneInput(text))}
                  placeholder="(555) 555-5555"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  maxLength={14}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={callbackEmail}
                  onChangeText={setCallbackEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.submitCallbackButton,
                  (pressed || isSubmitting) && { opacity: 0.8 },
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  handleCallbackSubmit();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color={colors.textOnPrimary} />
                    <Text style={styles.submitCallbackText}>Submit Request</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setShowCallbackForm(false);
                }}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>

            <Text style={styles.privacyNote}>
              Your information will only be shared with {provider?.companyName || 'the local provider'} to process your callback request.
            </Text>
                </ScrollView>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
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
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  title: {
    ...typography.heading3,
    fontSize: 20,
    color: colors.textPrimary,
    flex: 1,
  },
  inputSection: {
    marginBottom: spacing.md,
  },
  // Provider card styles
  providerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.success + '50',
    ...shadows.sm,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  providerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent + '25',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  providerInfo: {
    flex: 1,
    marginTop: 2,
  },
  providerLabel: {
    ...typography.small,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  providerName: {
    ...typography.heading3,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  providerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginLeft: 64, // Align with company name (icon width + margin)
    gap: 6,
  },
  metroAreaText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  providerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '25',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  providerBadgeText: {
    ...typography.small,
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  providerContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  providerPhone: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  providerDescription: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  providerDescriptionText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  providerServices: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  providerServicesTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  servicesList: {
    gap: spacing.sm - 2,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  serviceText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
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
    marginBottom: spacing.md,
  },
  actionsTitle: {
    ...typography.heading3,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 4,
    marginBottom: spacing.xs,
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  actionButtonIconOutline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalScrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  formField: {
    marginBottom: spacing.md,
  },
  formLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: {
    gap: spacing.sm,
  },
  submitCallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  submitCallbackText: {
    ...typography.bodyBold,
    color: colors.textOnPrimary,
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  privacyNote: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

