/**
 * Provider Service - Look up territory owners by ZIP code
 * 
 * Database structure:
 * - territories: has zip_codes array (PostgreSQL text[]), territory info, dma_id (FK to territories.id - self-referential)
 *   - DMAs are territories with is_dma = true and dma_id = null
 *   - Individual territories have dma_id pointing to their parent DMA territory
 * - territory_ownership: links territory_id to company_id
 * - companies: company details (name, phone, email, description, services, etc.)
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface Provider {
  id: string;
  companyName: string;
  phone: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  services?: string[]; // Array of service names
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
  metroArea?: string;  // DMA (Designated Market Area)
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
    // Step 1: Find territory containing this ZIP
    // Note: We don't filter by status here because ownership can be via DMA
    console.log('[ProviderService] Looking up territory for ZIP:', zip);
    const territoryQuery = supabase
      .from('territories')
      .select('*')
      .filter('zip_codes', 'cs', `{${zip}}`);
    
    const territoryResult = (await withTimeout(
      territoryQuery as unknown as Promise<{ data: any[] | null; error: any }>,
      LOOKUP_TIMEOUT_MS
    )) as { data: any[] | null; error: any };
    
    const { data: territories, error: territoryError } = territoryResult;

    if (territoryError) {
      console.error('[ProviderService] Territory lookup error:', territoryError);
      if (isNetworkError(territoryError)) {
        return { found: false, error: 'Network error. Check your connection.', errorType: 'network_error' };
      }
      return { found: false, error: 'Unable to search this area', errorType: 'unknown' };
    }

    if (!territories || territories.length === 0) {
      console.log(`[ProviderService] No territory found for ZIP: ${zip}`);
      return { found: false, errorType: 'no_territory' };
    }

    const territory = territories[0];
    console.log('[ProviderService] Territory found:', territory.id, territory.name, 'dma_id:', territory.dma_id);
    
    // Step 1b: Get DMA name if dma_id exists
    // Note: DMAs are territories themselves (is_dma = true), not a separate table
    // Individual territories have dma_id pointing to their parent DMA territory
    let metroArea: string | undefined;
    let dmaTerritory: any = null;
    if (territory.dma_id) {
      try {
        console.log('[ProviderService] Looking up DMA territory for dma_id:', territory.dma_id);
        // Query the territories table again - the DMA is just another territory with is_dma = true
        const dmaQuery = supabase
          .from('territories')
          .select('name, is_dma, status')
          .eq('id', territory.dma_id)
          .maybeSingle();
        
        const dmaResult = (await withTimeout(
          dmaQuery as unknown as Promise<{ data: any | null; error: any }>,
          LOOKUP_TIMEOUT_MS
        )) as { data: any | null; error: any };
        
        if (dmaResult.data && !dmaResult.error && dmaResult.data.name) {
          dmaTerritory = dmaResult.data;
          metroArea = dmaResult.data.name;
          console.log('[ProviderService] DMA territory found:', metroArea);
        } else if (dmaResult.error) {
          console.warn('[ProviderService] Error fetching DMA territory:', dmaResult.error);
        }
      } catch (dmaErr) {
        console.warn('[ProviderService] Could not fetch DMA territory, continuing without it:', dmaErr);
      }
    }
    // Fallback to direct property if it exists (for backward compatibility)
    if (!metroArea && territory.metro_area) {
      metroArea = territory.metro_area;
      console.log('[ProviderService] Using metro_area from territory:', metroArea);
    }

    // Step 2: Find ownership - check BOTH direct ownership AND DMA ownership
    // According to documentation: ownership can be direct (territory_ownership for individual territory)
    // OR via DMA (territory_ownership for parent DMA territory)
    let ownership: any = null;
    
    // First, check for direct ownership of the individual territory
    console.log('[ProviderService] Checking direct ownership for territory:', territory.id);
    const directOwnershipQuery = supabase
      .from('territory_ownership')
      .select('*')
      .eq('territory_id', territory.id)
      .eq('status', 'active')
      .is('ended_at', null);
    
    const directOwnershipResult = (await withTimeout(
      directOwnershipQuery as unknown as Promise<{ data: any[] | null; error: any }>,
      LOOKUP_TIMEOUT_MS
    )) as { data: any[] | null; error: any };
    
    if (directOwnershipResult.data && directOwnershipResult.data.length > 0 && !directOwnershipResult.error) {
      ownership = directOwnershipResult.data[0];
      console.log('[ProviderService] Found direct ownership:', ownership.company_id);
    } else if (territory.dma_id) {
      // If no direct ownership, check if the parent DMA is owned
      console.log('[ProviderService] No direct ownership, checking DMA ownership for dma_id:', territory.dma_id);
      const dmaOwnershipQuery = supabase
        .from('territory_ownership')
        .select('*')
        .eq('territory_id', territory.dma_id)
        .eq('status', 'active')
        .is('ended_at', null);
      
      const dmaOwnershipResult = (await withTimeout(
        dmaOwnershipQuery as unknown as Promise<{ data: any[] | null; error: any }>,
        LOOKUP_TIMEOUT_MS
      )) as { data: any[] | null; error: any };
      
      if (dmaOwnershipResult.data && dmaOwnershipResult.data.length > 0 && !dmaOwnershipResult.error) {
        ownership = dmaOwnershipResult.data[0];
        console.log('[ProviderService] Found DMA ownership:', ownership.company_id);
      }
    }
    
    // Fallback: Check status field (some territories may be marked 'taken' without ownership record)
    if (!ownership && territory.status === 'taken') {
      console.log('[ProviderService] Territory status is "taken" but no ownership record found');
      // Still return no_company - we need an ownership record to get company details
    }

    if (!ownership) {
      console.log('[ProviderService] No ownership found (neither direct nor via DMA)');
      // Still return territory info even if no provider, so leads can be saved
      return { 
        found: false, 
        errorType: 'no_company',
        territoryId: territory.id,
        territoryName: territory.name,
        metroArea: metroArea,
      };
    }

    // Step 3: Get company details
    console.log('Looking up company:', ownership.company_id);
    const companyQuery = supabase
      .from('companies')
      .select('*')
      .eq('id', ownership.company_id)
      .maybeSingle();
    
    const companyResult = (await withTimeout(
      companyQuery as unknown as Promise<{ data: any | null; error: any }>,
      LOOKUP_TIMEOUT_MS
    )) as { data: any | null; error: any };
    
    const { data: company, error: companyError } = companyResult;

    if (companyError || !company) {
      return { found: false, error: 'Provider info unavailable', errorType: 'no_company' };
    }

    // Parse services - handle both array and JSON string formats
    let services: string[] | undefined = undefined;
    if (company.services) {
      if (Array.isArray(company.services)) {
        services = company.services;
      } else if (typeof company.services === 'string') {
        try {
          const parsed = JSON.parse(company.services);
          services = Array.isArray(parsed) ? parsed : undefined;
        } catch {
          // If parsing fails, treat as single service
          services = [company.services];
        }
      }
    } else if (company.services_list) {
      try {
        const parsed = typeof company.services_list === 'string' 
          ? JSON.parse(company.services_list) 
          : company.services_list;
        services = Array.isArray(parsed) ? parsed : undefined;
      } catch {
        services = undefined;
      }
    }

    // Build provider object
    const provider: Provider = {
      id: company.id,
      companyName: company.name || company.company_name || 'Local Expert',
      phone: company.phone || company.phone_number || '',
      email: company.email || undefined,
      website: company.website || undefined,
      logoUrl: company.logo_url || company.logo || undefined,
      description: company.description || undefined,
      services: services,
    };

    console.log('[ProviderService] Provider found successfully:', {
      companyName: provider.companyName,
      territoryId: territory.id,
      territoryName: territory.name,
      metroArea: metroArea,
      ownershipType: territory.dma_id && ownership.territory_id === territory.dma_id ? 'via_dma' : 'direct'
    });

    return {
      found: true,
      provider,
      territoryId: territory.id,
      territoryName: territory.name,
      metroArea: metroArea, // DMA name from parent DMA territory
    };

  } catch (err: any) {
    console.error('Provider lookup exception:', err);
    
    if (err?.message === 'TIMEOUT') {
      return { found: false, error: 'Request timed out.', errorType: 'timeout' };
    }

    if (isNetworkError(err)) {
      return { found: false, error: 'Network error. Check your connection.', errorType: 'network_error' };
    }

    // Check if Supabase returned an error
    if (err?.error) {
      if (isNetworkError(err.error)) {
        return { found: false, error: 'Network error. Check your connection.', errorType: 'network_error' };
      }
      return { found: false, error: err.error.message || 'Database error', errorType: 'unknown' };
    }

    return { found: false, error: err?.message || 'Something went wrong', errorType: 'unknown' };
  }
}

export async function hasProviderForZip(zip: string): Promise<boolean> {
  const result = await getProviderByZip(zip);
  return result.found;
}
