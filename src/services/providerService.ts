/**
 * Provider Service - Look up territory owners by ZIP code
 * With proper error handling, timeout, and network error detection
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface Provider {
  id: string;
  companyName: string;
  phone: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

export type LookupErrorType = 
  | 'not_configured'
  | 'network_error'
  | 'timeout'
  | 'no_territory'
  | 'no_company'
  | 'unknown';

export interface TerritoryLookupResult {
  found: boolean;
  provider?: Provider;
  territoryId?: string;
  error?: string;
  errorType?: LookupErrorType;
}

const LOOKUP_TIMEOUT_MS = 10000; // 10 second timeout

/**
 * Helper to add timeout to promises
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), ms);
  });
  return Promise.race([promise, timeout]);
}

/**
 * Check if an error is a network-related error
 */
function isNetworkError(error: any): boolean {
  if (!error) return false;
  const message = String(error.message || error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('offline') ||
    message.includes('timeout')
  );
}

/**
 * Look up the provider (territory owner) for a given ZIP code
 */
export async function getProviderByZip(zip: string): Promise<TerritoryLookupResult> {
  // Validate ZIP format
  if (!zip || !/^\d{5}$/.test(zip)) {
    return { found: false, error: 'Invalid ZIP code', errorType: 'unknown' };
  }

  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured - cannot look up provider');
    return { found: false, error: 'Service unavailable', errorType: 'not_configured' };
  }

  try {
    // Step 1: Find the territory that owns this ZIP code (with timeout)
    const territoryQuery = supabase
      .from('territory_ownership')
      .select('*')
      .eq('zip_code', zip)
      .single();

    const { data: territoryData, error: territoryError } = await withTimeout(
      territoryQuery,
      LOOKUP_TIMEOUT_MS
    );

    if (territoryError) {
      // Check if it's a "no rows" error (PGRST116) - this means no territory, not an error
      if (territoryError.code === 'PGRST116') {
        return { found: false, errorType: 'no_territory' };
      }
      console.error('Territory lookup error:', territoryError);
      return { 
        found: false, 
        error: 'Unable to search this area', 
        errorType: isNetworkError(territoryError) ? 'network_error' : 'unknown' 
      };
    }

    if (!territoryData) {
      return { found: false, errorType: 'no_territory' };
    }

    // Step 2: Get the company info for this territory owner
    const companyId = territoryData.company_id;
    
    if (!companyId) {
      console.warn('Territory found but no company_id:', territoryData);
      return { found: false, errorType: 'no_company' };
    }

    const companyQuery = supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    const { data: companyData, error: companyError } = await withTimeout(
      companyQuery,
      LOOKUP_TIMEOUT_MS
    );

    if (companyError || !companyData) {
      console.error('Company lookup error:', companyError);
      return { found: false, error: 'Provider info unavailable', errorType: 'no_company' };
    }

    // Build the provider object
    const provider: Provider = {
      id: companyData.id,
      companyName: companyData.name || companyData.company_name || 'Local Pest Control Expert',
      phone: companyData.phone || companyData.phone_number || '',
      email: companyData.email || undefined,
      website: companyData.website || undefined,
      logoUrl: companyData.logo_url || companyData.logo || undefined,
    };

    // Validate provider has required fields
    if (!provider.phone) {
      console.warn('Provider found but missing phone number:', provider);
    }

    return {
      found: true,
      provider,
      territoryId: territoryData.id || territoryData.territory_id,
    };

  } catch (err: any) {
    console.error('Error looking up provider:', err);
    
    // Handle timeout specifically
    if (err.message === 'TIMEOUT') {
      return { 
        found: false, 
        error: 'Request timed out. Please try again.', 
        errorType: 'timeout' 
      };
    }

    // Handle network errors
    if (isNetworkError(err)) {
      return { 
        found: false, 
        error: 'Network error. Check your connection.', 
        errorType: 'network_error' 
      };
    }

    return { found: false, error: 'Something went wrong', errorType: 'unknown' };
  }
}

/**
 * Check if a ZIP code has a territory owner
 */
export async function hasProviderForZip(zip: string): Promise<boolean> {
  const result = await getProviderByZip(zip);
  return result.found;
}

