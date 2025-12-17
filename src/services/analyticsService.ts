/**
 * Analytics Service - Track key user events
 * Stores events in Supabase 'analytics_events' table
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Event types for type safety
export type AnalyticsEvent = 
  | 'app_open'
  | 'scan_started'
  | 'scan_completed'
  | 'scan_abandoned'
  | 'lead_submitted'
  | 'provider_found'
  | 'provider_not_found'
  | 'google_search_clicked'
  | 'call_initiated'
  | 'text_initiated'
  | 'callback_requested'
  | 'education_viewed'
  | 'terms_viewed'
  | 'privacy_viewed';

interface EventProperties {
  room_type?: string;
  zip_code?: string;
  contact_type?: string;
  provider_name?: string;
  steps_completed?: number;
  total_steps?: number;
  photos_taken?: number;
  flags_count?: number;
  session_id?: string;
  [key: string]: string | number | boolean | undefined;
}

// Simple device ID for session tracking (not PII)
let deviceId: string | null = null;

const getDeviceId = async (): Promise<string> => {
  if (deviceId) return deviceId;
  
  // Create a simple hash from device info (not a real device ID, just for analytics grouping)
  const deviceInfo = [
    Platform.OS,
    Platform.Version,
    Device.modelName || 'unknown',
    Device.osName || 'unknown',
  ].join('-');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < deviceInfo.length; i++) {
    const char = deviceInfo.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  deviceId = `device_${Math.abs(hash).toString(36)}`;
  return deviceId;
};

/**
 * Track an analytics event
 */
export async function trackEvent(
  event: AnalyticsEvent,
  properties?: EventProperties
): Promise<void> {
  // Always log to console in development
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, properties || '');
  }

  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const device_id = await getDeviceId();
    
    const eventData = {
      event_name: event,
      properties: properties || {},
      device_id,
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version || '1.0.0',
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('analytics_events')
      .insert(eventData);

    if (error) {
      console.warn('Analytics tracking failed:', error.message);
    }
  } catch (err) {
    // Don't let analytics errors affect app functionality
    console.warn('Analytics error:', err);
  }
}

/**
 * Track app open event
 */
export function trackAppOpen(): void {
  trackEvent('app_open');
}

/**
 * Track scan started
 */
export function trackScanStarted(roomType: string): void {
  trackEvent('scan_started', { room_type: roomType });
}

/**
 * Track scan completed
 */
export function trackScanCompleted(
  roomType: string,
  stepsCompleted: number,
  totalSteps: number,
  photosTaken: number,
  flagsCount: number,
  sessionId?: string
): void {
  trackEvent('scan_completed', {
    room_type: roomType,
    steps_completed: stepsCompleted,
    total_steps: totalSteps,
    photos_taken: photosTaken,
    flags_count: flagsCount,
    session_id: sessionId,
  });
}

/**
 * Track scan abandoned (left before completing)
 */
export function trackScanAbandoned(
  roomType: string,
  stepsCompleted: number,
  totalSteps: number
): void {
  trackEvent('scan_abandoned', {
    room_type: roomType,
    steps_completed: stepsCompleted,
    total_steps: totalSteps,
  });
}

/**
 * Track lead submitted
 */
export function trackLeadSubmitted(
  zipCode: string,
  contactType: string,
  providerFound: boolean,
  providerName?: string
): void {
  trackEvent('lead_submitted', {
    zip_code: zipCode,
    contact_type: contactType,
    provider_found: providerFound,
    provider_name: providerName,
  });
}

/**
 * Track provider lookup result
 */
export function trackProviderLookup(
  zipCode: string,
  found: boolean,
  providerName?: string
): void {
  if (found) {
    trackEvent('provider_found', {
      zip_code: zipCode,
      provider_name: providerName,
    });
  } else {
    trackEvent('provider_not_found', {
      zip_code: zipCode,
    });
  }
}

/**
 * Track Google search fallback clicked
 */
export function trackGoogleSearchClicked(zipCode: string): void {
  trackEvent('google_search_clicked', { zip_code: zipCode });
}

/**
 * Track contact action
 */
export function trackContactAction(
  type: 'call' | 'text' | 'callback',
  zipCode: string,
  providerName?: string
): void {
  const eventMap = {
    call: 'call_initiated' as const,
    text: 'text_initiated' as const,
    callback: 'callback_requested' as const,
  };
  
  trackEvent(eventMap[type], {
    zip_code: zipCode,
    provider_name: providerName,
  });
}

/**
 * Track page views
 */
export function trackPageView(page: 'education' | 'terms' | 'privacy'): void {
  const eventMap = {
    education: 'education_viewed' as const,
    terms: 'terms_viewed' as const,
    privacy: 'privacy_viewed' as const,
  };
  
  trackEvent(eventMap[page]);
}

