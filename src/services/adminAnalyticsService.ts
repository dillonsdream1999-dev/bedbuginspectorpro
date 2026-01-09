/**
 * Admin Analytics Service
 * Fetches analytics data for the admin dashboard
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface UsageStats {
  totalUsers: number;
  totalAppOpens: number;
  totalScans: number;
  totalLeads: number;
  scansByRoomType: {
    bedroom: number;
    living_room: number;
    hotel: number;
  };
  recentActivity: {
    date: string;
    appOpens: number;
    scans: number;
    leads: number;
  }[];
}

export interface ZipCodeAnalytics {
  zipCode: string;
  appOpens: number;
  scans: number;
  leads: number;
  providerLookups: number;
  providerFound: number;
  providerNotFound: number;
}

/**
 * Get overall usage statistics
 */
export async function getUsageStats(
  days: number = 30
): Promise<{ success: boolean; data?: UsageStats; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Service not configured' };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Get total unique users (device_ids)
    const { data: uniqueUsers, error: usersError } = await supabase
      .from('analytics_events')
      .select('device_id')
      .gte('created_at', startDateStr);

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    const totalUsers = new Set(uniqueUsers?.map((u) => u.device_id) || []).size;

    // Get total app opens
    const { count: appOpensCount, error: appOpensError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'app_open')
      .gte('created_at', startDateStr);

    if (appOpensError) {
      console.error('Error fetching app opens:', appOpensError);
    }

    // Get total scans (scan_started events)
    const { count: scansCount, error: scansError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'scan_started')
      .gte('created_at', startDateStr);

    if (scansError) {
      console.error('Error fetching scans:', scansError);
    }

    // Get total leads
    const { count: leadsCount, error: leadsError } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'lead_submitted')
      .gte('created_at', startDateStr);

    if (leadsError) {
      console.error('Error fetching leads:', leadsError);
    }

    // Get scans by room type
    const { data: scansByRoom, error: roomTypeError } = await supabase
      .from('analytics_events')
      .select('properties')
      .eq('event_name', 'scan_started')
      .gte('created_at', startDateStr);

    if (roomTypeError) {
      console.error('Error fetching room types:', roomTypeError);
    }

    const scansByRoomType = {
      bedroom: 0,
      living_room: 0,
      hotel: 0,
    };

    scansByRoom?.forEach((event) => {
      const roomType = event.properties?.room_type;
      if (roomType === 'bedroom') scansByRoomType.bedroom++;
      else if (roomType === 'living_room') scansByRoomType.living_room++;
      else if (roomType === 'hotel') scansByRoomType.hotel++;
    });

    // Get recent activity (last 7 days)
    const recentActivity: { date: string; appOpens: number; scans: number; leads: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString();

      const [appOpensRes, scansRes, leadsRes] = await Promise.all([
        supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_name', 'app_open')
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr),
        supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_name', 'scan_started')
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr),
        supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_name', 'lead_submitted')
          .gte('created_at', dateStr)
          .lt('created_at', nextDateStr),
      ]);

      recentActivity.push({
        date: dateStr,
        appOpens: appOpensRes.count || 0,
        scans: scansRes.count || 0,
        leads: leadsRes.count || 0,
      });
    }

    return {
      success: true,
      data: {
        totalUsers,
        totalAppOpens: appOpensCount || 0,
        totalScans: scansCount || 0,
        totalLeads: leadsCount || 0,
        scansByRoomType,
        recentActivity,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch usage stats' };
  }
}

/**
 * Get ZIP code analytics
 */
export async function getZipCodeAnalytics(
  days: number = 30
): Promise<{ success: boolean; data?: ZipCodeAnalytics[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Service not configured' };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Get all events with ZIP codes
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('event_name, properties')
      .gte('created_at', startDateStr)
      .not('properties->zip_code', 'is', null);

    if (eventsError) {
      return { success: false, error: eventsError.message };
    }

    // Aggregate by ZIP code
    const zipMap = new Map<string, ZipCodeAnalytics>();

    events?.forEach((event) => {
      const zipCode = event.properties?.zip_code;
      if (!zipCode) return;

      if (!zipMap.has(zipCode)) {
        zipMap.set(zipCode, {
          zipCode,
          appOpens: 0,
          scans: 0,
          leads: 0,
          providerLookups: 0,
          providerFound: 0,
          providerNotFound: 0,
        });
      }

      const stats = zipMap.get(zipCode)!;

      switch (event.event_name) {
        case 'app_open':
          stats.appOpens++;
          break;
        case 'scan_started':
          stats.scans++;
          break;
        case 'lead_submitted':
          stats.leads++;
          break;
        case 'provider_found':
          stats.providerLookups++;
          stats.providerFound++;
          break;
        case 'provider_not_found':
          stats.providerLookups++;
          stats.providerNotFound++;
          break;
      }
    });

    // Convert to array and sort by total activity
    const zipAnalytics = Array.from(zipMap.values())
      .map((zip) => ({
        ...zip,
        totalActivity: zip.appOpens + zip.scans + zip.leads + zip.providerLookups,
      }))
      .sort((a, b) => b.totalActivity - a.totalActivity)
      .map(({ totalActivity, ...rest }) => rest); // Remove totalActivity before returning

    return { success: true, data: zipAnalytics };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch ZIP code analytics' };
  }
}

