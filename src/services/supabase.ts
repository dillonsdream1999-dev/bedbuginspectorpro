/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get environment variables from Expo config or use defaults
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://slprilsytlezwaaznrvs.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscHJpbHN5dGxlendhYXpucnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NTk0NTgsImV4cCI6MjA4MTEzNTQ1OH0.Fjn0JFI2Jr0cyZwD_sYIbX9_nE6HrudjTWG_g3McXFA';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Data will not persist.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('placeholder');
};

