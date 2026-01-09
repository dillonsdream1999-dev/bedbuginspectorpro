/**
 * Admin Authentication Service
 * Uses Supabase Auth with the same credentials as inspectionpronetwork
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
}

/**
 * Sign in as admin using email and password
 * Uses the same Supabase auth as inspectionpronetwork
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Service not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Authentication failed' };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || email,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Sign in failed' };
  }
}

/**
 * Sign out admin
 */
export async function signOutAdmin(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Service not configured' };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Sign out failed' };
  }
}

/**
 * Get current admin session
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email || '',
    };
  } catch {
    return null;
  }
}

/**
 * Check if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin !== null;
}

