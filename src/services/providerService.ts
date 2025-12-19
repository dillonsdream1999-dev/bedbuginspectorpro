/**
 * Provider Service - Look up territory owners by ZIP code
 * 
 * Database structure:
 * - territories: has zip_codes array (PostgreSQL text[]), territory info
 * - territory_ownership: links territory_id to company_id
 * - companies: company details (name, phone, email, etc.)
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
  territoryName?: string;
  error?: string;
  errorType?: LookupErrorType;
}

const LOOKUP_TIMEOUT_MS = 10000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), ms);
  });
  return Promise.race([promise, timeout]);
}

function isNetworkError(error: any): boolean {
  if (!error) return false;
  const message = String(error.message || error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('offline') ||
    message.includes('failed to fetch')
  );
}

/**
 * Look up the provider (territory owner) for a given ZIP code
 */
export async function getProviderByZip(zip: string): Promise<TerritoryLookupResult> {
  if (!zip || !/^\d{5}$/.test(zip)) {
    return { found: false, error: 'Invalid ZIP code', errorType: 'unknown' };
  }

  if (!isSupabaseConfigured()) {
    return { found: false, error: 'Service unavailable', errorType: 'not_configured' };
  }

  try {
    // Step 1: Find territory containing this ZIP (status = taken)
    const { data: territories, error: territoryError } = await withTimeout(
      supabase
        .from('territories')
        .select('*')
        .filter('zip_codes', 'cs', `{${zip}}`)
        .eq('status', 'taken'),
      LOOKUP_TIMEOUT_MS
    );

    if (territoryError) {
      if (isNetworkError(territoryError)) {
        return { found: false, error: 'Network error. Check your connection.', errorType: 'network_error' };
      }
      return { found: false, error: 'Unable to search this area', errorType: 'unknown' };
    }

    if (!territories || territories.length === 0) {
      return { found: false, errorType: 'no_territory' };
    }

    const territory = territories[0];

    // Step 2: Find the ownership record for this territory
    const { data: ownerships, error: ownershipError } = await withTimeout(
      supabase
        .from('territory_ownership')
        .select('*')
        .eq('territory_id', territory.id),
      LOOKUP_TIMEOUT_MS
    );

    if (ownershipError || !ownerships || ownerships.length === 0) {
      return { found: false, errorType: 'no_company' };
    }

    const ownership = ownerships[0];

    // Step 3: Get company details
    const { data: company, error: companyError } = await withTimeout(
      supabase
        .from('companies')
        .select('*')
        .eq('id', ownership.company_id)
        .maybeSingle(),
      LOOKUP_TIMEOUT_MS
    );

    if (companyError || !company) {
      return { found: false, error: 'Provider info unavailable', errorType: 'no_company' };
    }

    // Build provider object
    const provider: Provider = {
      id: company.id,
      companyName: company.name || company.company_name || 'Local Expert',
      phone: company.phone || company.phone_number || '',
      email: company.email || undefined,
      website: company.website || undefined,
      logoUrl: company.logo_url || company.logo || undefined,
    };

    return {
      found: true,
      provider,
      territoryId: territory.id,
      territoryName: territory.name,
    };

  } catch (err: any) {
    if (err.message === 'TIMEOUT') {
      return { found: false, error: 'Request timed out.', errorType: 'timeout' };
    }

    if (isNetworkError(err)) {
      return { found: false, error: 'Network error.', errorType: 'network_error' };
    }

    return { found: false, error: 'Something went wrong', errorType: 'unknown' };
  }
}

export async function hasProviderForZip(zip: string): Promise<boolean> {
  const result = await getProviderByZip(zip);
  return result.found;
}
