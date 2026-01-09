/**
 * Scan Service - Persists scan sessions, steps, pins, and photos to Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { PhotoScanSession, ScanStep, Pin, RoomType } from '../features/scanPhoto/models';
import * as FileSystem from 'expo-file-system';

// Types for database records
interface DbScanSession {
  id: string;
  room_type: string;
  started_at: string;
  ended_at?: string;
  ar_supported: boolean;
  summary_json?: object;
}

interface DbScanStep {
  id: string;
  session_id: string;
  step_key: string;
  step_title: string;
  status: string;
  photo_storage_path?: string;
}

interface DbScanPin {
  id: string;
  step_id: string;
  session_id: string;
  label: string;
  x: number;
  y: number;
  status: string;
}

interface DbPhoto {
  id: string;
  session_id: string;
  step_id?: string;
  storage_path: string;
}

interface DbLead {
  zip: string;
  room_type: string;
  session_id?: string;
  contact_pref: string;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  provider_id?: string;
  provider_name?: string;
  notes?: string;
}

/**
 * Create a new scan session in the database
 */
export async function createScanSession(
  session: PhotoScanSession
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured - session not saved');
    return { success: true }; // Silent success for offline mode
  }

  try {
    const dbSession: DbScanSession = {
      id: session.id,
      room_type: session.roomType,
      started_at: session.startedAt.toISOString(),
      ar_supported: false, // Photo-based scan
    };

    const { error } = await supabase.from('scan_sessions').insert(dbSession);

    if (error) {
      console.error('Error creating session:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception creating session:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Save a completed step with photo
 */
export async function saveStepWithPhoto(
  sessionId: string,
  step: ScanStep
): Promise<{ success: boolean; photoUrl?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured - step not saved');
    return { success: true };
  }

  try {
    let photoStoragePath: string | undefined;

    // Upload photo if exists
    if (step.photoUri) {
      const uploadResult = await uploadPhoto(sessionId, step.id, step.photoUri);
      if (uploadResult.success) {
        photoStoragePath = uploadResult.path;
      }
    }

    // Save step record
    const dbStep: DbScanStep = {
      id: step.id,
      session_id: sessionId,
      step_key: step.key,
      step_title: step.title,
      status: step.status,
      photo_storage_path: photoStoragePath,
    };

    const { error: stepError } = await supabase.from('scan_steps').upsert(dbStep);

    if (stepError) {
      console.error('Error saving step:', stepError);
      return { success: false, error: stepError.message };
    }

    // Save pins for this step
    const dbPins: DbScanPin[] = step.pins.map((pin) => ({
      id: pin.id,
      step_id: step.id,
      session_id: sessionId,
      label: pin.label,
      x: pin.x,
      y: pin.y,
      status: pin.status,
    }));

    if (dbPins.length > 0) {
      const { error: pinsError } = await supabase.from('scan_pins').upsert(dbPins);
      if (pinsError) {
        console.error('Error saving pins:', pinsError);
      }
    }

    return { success: true, photoUrl: photoStoragePath };
  } catch (err) {
    console.error('Exception saving step:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Upload a photo to Supabase Storage
 */
async function uploadPhoto(
  sessionId: string,
  stepId: string,
  localUri: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Generate storage path
    const fileName = `${sessionId}/${stepId}_${Date.now()}.jpg`;
    const filePath = `scan-photos/${fileName}`;

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('scan-photos')
      .upload(fileName, bytes.buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading photo:', error);
      return { success: false, error: error.message };
    }

    // Save photo record in database
    const dbPhoto: DbPhoto = {
      id: `${stepId}_photo`,
      session_id: sessionId,
      step_id: stepId,
      storage_path: filePath,
    };

    await supabase.from('photos').upsert(dbPhoto);

    return { success: true, path: filePath };
  } catch (err) {
    console.error('Exception uploading photo:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Complete a scan session with summary
 */
export async function completeScanSession(
  sessionId: string,
  summary: {
    totalSteps: number;
    completedSteps: number;
    concernedPins: number;
    photosCount: number;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('scan_sessions')
      .update({
        ended_at: new Date().toISOString(),
        summary_json: summary,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error completing session:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception completing session:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Create a lead record (MUST be called BEFORE initiating call/text)
 */
export async function createLead(
  zip: string,
  roomType: RoomType,
  contactPref: string,
  sessionId?: string,
  contactInfo?: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    providerId?: string;
    providerName?: string;
    notes?: string;
  }
): Promise<{ success: boolean; leadId?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured - lead not saved');
    return { success: true, leadId: 'offline_lead' };
  }

  try {
    const dbLead: DbLead = {
      zip,
      room_type: roomType,
      session_id: sessionId,
      contact_pref: contactPref,
      status: 'new',
      customer_name: contactInfo?.customerName,
      customer_phone: contactInfo?.customerPhone,
      customer_email: contactInfo?.customerEmail,
      provider_id: contactInfo?.providerId,
      provider_name: contactInfo?.providerName,
      notes: contactInfo?.notes,
    };

    console.log('[ScanService] Creating lead:', {
      zip,
      roomType,
      contactPref,
      hasProvider: !!contactInfo?.providerId,
      hasCustomerInfo: !!(contactInfo?.customerName || contactInfo?.customerPhone)
    });

    const { data, error } = await supabase
      .from('leads')
      .insert(dbLead)
      .select('id')
      .single();

    if (error) {
      console.error('[ScanService] Error creating lead:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        leadData: dbLead
      });
      return { success: false, error: error.message };
    }

    console.log('[ScanService] Lead created successfully:', { leadId: data?.id });
    return { success: true, leadId: data?.id };
  } catch (err) {
    console.error('[ScanService] Exception creating lead:', err);
    return { success: false, error: String(err) };
  }
}

/**
 * Get all sessions for display (admin/history view)
 */
export async function getScanSessions(): Promise<DbScanSession[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('scan_sessions')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching sessions:', err);
    return [];
  }
}

/**
 * Get photo URL from storage path
 */
export function getPhotoUrl(storagePath: string): string {
  if (!isSupabaseConfigured()) {
    return '';
  }

  const { data } = supabase.storage
    .from('scan-photos')
    .getPublicUrl(storagePath.replace('scan-photos/', ''));

  return data?.publicUrl || '';
}

