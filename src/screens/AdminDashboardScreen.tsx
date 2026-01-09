/**
 * Admin Dashboard Screen
 * Displays analytics for app usage and ZIP code data
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { getUsageStats, getZipCodeAnalytics, getLeads, UsageStats, ZipCodeAnalytics, Lead } from '../services/adminAnalyticsService';
import { signOutAdmin, isAdminAuthenticated } from '../services/adminAuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

type TabType = 'analytics' | 'leads';

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [zipAnalytics, setZipAnalytics] = useState<ZipCodeAnalytics[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsCount, setLeadsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [daysFilter, setDaysFilter] = useState(30);
  const [leadsStatusFilter, setLeadsStatusFilter] = useState<string | undefined>(undefined);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await isAdminAuthenticated();
      if (!isAuthenticated) {
        navigation.replace('AdminLogin');
      }
    };
    checkAuth();
  }, [navigation]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      if (activeTab === 'analytics') {
        const [usageResult, zipResult] = await Promise.all([
          getUsageStats(daysFilter),
          getZipCodeAnalytics(daysFilter),
        ]);

        if (usageResult.success && usageResult.data) {
          setUsageStats(usageResult.data);
        }

        if (zipResult.success && zipResult.data) {
          setZipAnalytics(zipResult.data);
        }
      } else {
        const leadsResult = await getLeads(100, 0, leadsStatusFilter);
        console.log('[AdminDashboard] Leads result:', leadsResult);
        if (leadsResult.success) {
          setLeads(leadsResult.data || []);
          setLeadsCount(leadsResult.count || 0);
          setLeadsError(null);
        } else {
          console.error('[AdminDashboard] Failed to load leads:', leadsResult.error);
          setLeadsError(leadsResult.error || 'Failed to load leads');
          // Still set empty array so UI shows error instead of loading forever
          setLeads([]);
          setLeadsCount(0);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [daysFilter, activeTab, leadsStatusFilter]);

  const handleSignOut = async () => {
    await signOutAdmin();
    navigation.replace('AdminLogin');
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: string; color?: string }> = ({
    title,
    value,
    icon,
    color = colors.primary,
  }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        ...shadows.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
          {title}
        </Text>
      </View>
      <Text style={[typography.heading2, { color: colors.textPrimary }]}>{value.toLocaleString()}</Text>
    </View>
  );

  if (loading && activeTab === 'analytics' && !usageStats) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
          Loading analytics...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={[typography.heading2, { color: colors.textPrimary }]}>Admin Dashboard</Text>
        <Pressable
          onPress={handleSignOut}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.sm,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => setActiveTab('analytics')}
          style={{
            flex: 1,
            paddingBottom: spacing.sm,
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'analytics' ? colors.primary : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={[
              typography.bodyBold,
              { color: activeTab === 'analytics' ? colors.primary : colors.textSecondary },
            ]}
          >
            Analytics
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('leads')}
          style={{
            flex: 1,
            paddingBottom: spacing.sm,
            borderBottomWidth: 2,
            borderBottomColor: activeTab === 'leads' ? colors.primary : 'transparent',
            alignItems: 'center',
          }}
        >
          <Text
            style={[
              typography.bodyBold,
              { color: activeTab === 'leads' ? colors.primary : colors.textSecondary },
            ]}
          >
            Leads ({leadsCount})
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.primary} />}
      >
        {activeTab === 'analytics' ? (
          <>
            {/* Time Filter */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: spacing.lg,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                padding: spacing.xs,
              }}
            >
              {[7, 30, 90].map((days) => (
                <Pressable
                  key={days}
                  onPress={() => setDaysFilter(days)}
                  style={{
                    flex: 1,
                    padding: spacing.sm,
                    borderRadius: borderRadius.sm,
                    backgroundColor: daysFilter === days ? colors.primary : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: daysFilter === days ? colors.textOnPrimary : colors.textSecondary },
                    ]}
                  >
                    {days}d
                  </Text>
                </Pressable>
              ))}
            </View>

        {/* Usage Stats */}
        <Text style={[typography.heading3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
          Usage Statistics
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs }}>
          <View style={{ width: '50%', paddingHorizontal: spacing.xs }}>
            <StatCard title="Total Users" value={usageStats?.totalUsers || 0} icon="people-outline" />
          </View>
          <View style={{ width: '50%', paddingHorizontal: spacing.xs }}>
            <StatCard title="App Opens" value={usageStats?.totalAppOpens || 0} icon="phone-portrait-outline" />
          </View>
          <View style={{ width: '50%', paddingHorizontal: spacing.xs }}>
            <StatCard title="Scans Started" value={usageStats?.totalScans || 0} icon="camera-outline" />
          </View>
          <View style={{ width: '50%', paddingHorizontal: spacing.xs }}>
            <StatCard title="Leads Generated" value={usageStats?.totalLeads || 0} icon="mail-outline" color={colors.success} />
          </View>
        </View>

        {/* Scans by Room Type */}
        {usageStats && (
          <View
            style={{
              backgroundColor: colors.surface,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              marginTop: spacing.md,
              marginBottom: spacing.lg,
              ...shadows.md,
            }}
          >
            <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              Scans by Room Type
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.sm }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={[typography.heading3, { color: colors.textPrimary }]}>
                  {usageStats.scansByRoomType.bedroom}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Bedroom</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[typography.heading3, { color: colors.textPrimary }]}>
                  {usageStats.scansByRoomType.living_room}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Living Room</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={[typography.heading3, { color: colors.textPrimary }]}>
                  {usageStats.scansByRoomType.hotel}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Hotel</Text>
              </View>
            </View>
          </View>
        )}

        {/* ZIP Code Analytics */}
        <Text style={[typography.heading3, { color: colors.textPrimary, marginBottom: spacing.md, marginTop: spacing.lg }]}>
          ZIP Code Analytics
        </Text>
        {zipAnalytics.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              padding: spacing.lg,
              borderRadius: borderRadius.md,
              alignItems: 'center',
            }}
          >
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              No ZIP code data available
            </Text>
          </View>
        ) : (
          zipAnalytics.slice(0, 20).map((zip) => (
            <View
              key={zip.zipCode}
              style={{
                backgroundColor: colors.surface,
                padding: spacing.md,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
                ...shadows.sm,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={[typography.bodyBold, { color: colors.textPrimary }]}>{zip.zipCode}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {zip.appOpens + zip.scans + zip.leads + zip.providerLookups} total events
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs }}>
                {zip.appOpens > 0 && (
                  <View style={{ marginRight: spacing.md, marginBottom: spacing.xs }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Opens: <Text style={{ color: colors.textPrimary }}>{zip.appOpens}</Text>
                    </Text>
                  </View>
                )}
                {zip.scans > 0 && (
                  <View style={{ marginRight: spacing.md, marginBottom: spacing.xs }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Scans: <Text style={{ color: colors.textPrimary }}>{zip.scans}</Text>
                    </Text>
                  </View>
                )}
                {zip.leads > 0 && (
                  <View style={{ marginRight: spacing.md, marginBottom: spacing.xs }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Leads: <Text style={{ color: colors.success }}>{zip.leads}</Text>
                    </Text>
                  </View>
                )}
                {zip.providerLookups > 0 && (
                  <View style={{ marginRight: spacing.md, marginBottom: spacing.xs }}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Lookups: <Text style={{ color: colors.textPrimary }}>{zip.providerLookups}</Text>
                    </Text>
                  </View>
                )}
                {zip.providerFound > 0 && (
                  <View style={{ marginRight: spacing.md, marginBottom: spacing.xs }}>
                    <Text style={[typography.caption, { color: colors.success }]}>
                      Found: {zip.providerFound}
                    </Text>
                  </View>
                )}
                {zip.providerNotFound > 0 && (
                  <View style={{ marginRight: spacing.md, marginBottom: spacing.xs }}>
                    <Text style={[typography.caption, { color: colors.warning }]}>
                      Not Found: {zip.providerNotFound}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        {zipAnalytics.length > 20 && (
          <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md }]}>
            Showing top 20 ZIP codes. Total: {zipAnalytics.length}
          </Text>
        )}
          </>
        ) : (
          <>
            {/* Leads Tab */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: spacing.lg,
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                padding: spacing.xs,
              }}
            >
              <Pressable
                onPress={() => setLeadsStatusFilter(undefined)}
                style={{
                  flex: 1,
                  padding: spacing.sm,
                  borderRadius: borderRadius.sm,
                  backgroundColor: leadsStatusFilter === undefined ? colors.primary : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[
                    typography.captionBold,
                    { color: leadsStatusFilter === undefined ? colors.textOnPrimary : colors.textSecondary },
                  ]}
                >
                  All
                </Text>
              </Pressable>
              {['new', 'contacted', 'converted', 'closed'].map((status) => (
                <Pressable
                  key={status}
                  onPress={() => setLeadsStatusFilter(status)}
                  style={{
                    flex: 1,
                    padding: spacing.sm,
                    borderRadius: borderRadius.sm,
                    backgroundColor: leadsStatusFilter === status ? colors.primary : 'transparent',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={[
                      typography.captionBold,
                      { color: leadsStatusFilter === status ? colors.textOnPrimary : colors.textSecondary },
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {loading && leads.length === 0 && !leadsError ? (
              <View style={{ alignItems: 'center', padding: spacing.xl }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
                  Loading leads...
                </Text>
              </View>
            ) : leadsError ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: spacing.lg,
                  borderRadius: borderRadius.md,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.danger,
                }}
              >
                <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                <Text style={[typography.bodyBold, { color: colors.danger, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                  Error Loading Leads
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center' }]}>
                  {leadsError}
                </Text>
                <Pressable
                  onPress={() => loadData(true)}
                  style={{
                    marginTop: spacing.md,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.md,
                  }}
                >
                  <Text style={[typography.captionBold, { color: colors.textOnPrimary }]}>Retry</Text>
                </Pressable>
              </View>
            ) : leads.length === 0 ? (
              <View
                style={{
                  backgroundColor: colors.surface,
                  padding: spacing.lg,
                  borderRadius: borderRadius.md,
                  alignItems: 'center',
                }}
              >
                <Ionicons name="mail-outline" size={48} color={colors.textMuted} />
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
                  No leads found
                </Text>
                {leadsStatusFilter && (
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                    Try selecting "All" to see all leads
                  </Text>
                )}
              </View>
            ) : (
              leads.map((lead) => (
                <View
                  key={lead.id}
                  style={{
                    backgroundColor: colors.surface,
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    marginBottom: spacing.md,
                    ...shadows.sm,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                        <Ionicons name="location-outline" size={16} color={colors.primary} />
                        <Text style={[typography.bodyBold, { color: colors.textPrimary, marginLeft: spacing.xs }]}>
                          ZIP: {lead.zip}
                        </Text>
                        <View
                          style={{
                            marginLeft: spacing.sm,
                            paddingHorizontal: spacing.sm,
                            paddingVertical: 2,
                            borderRadius: borderRadius.sm,
                            backgroundColor:
                              lead.status === 'new'
                                ? colors.primary + '20'
                                : lead.status === 'contacted'
                                ? colors.info + '20'
                                : lead.status === 'converted'
                                ? colors.success + '20'
                                : colors.textMuted + '20',
                          }}
                        >
                          <Text
                            style={[
                              typography.small,
                              {
                                color:
                                  lead.status === 'new'
                                    ? colors.primary
                                    : lead.status === 'contacted'
                                    ? colors.info
                                    : lead.status === 'converted'
                                    ? colors.success
                                    : colors.textSecondary,
                                textTransform: 'uppercase',
                              },
                            ]}
                          >
                            {lead.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        {new Date(lead.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View style={{ marginTop: spacing.sm }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xs }}>
                      <View style={{ marginRight: spacing.md, marginBottom: spacing.xs }}>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          Room: <Text style={{ color: colors.textPrimary }}>{lead.room_type?.replace('_', ' ') || 'N/A'}</Text>
                        </Text>
                      </View>
                      <View style={{ marginRight: spacing.md, marginBottom: spacing.xs }}>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                          Contact: <Text style={{ color: colors.textPrimary }}>{lead.contact_pref?.replace('_', ' ') || 'N/A'}</Text>
                        </Text>
                      </View>
                    </View>

                    {lead.customer_name && (
                      <View style={{ marginTop: spacing.xs }}>
                        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                          Customer Info:
                        </Text>
                        <Text style={[typography.body, { color: colors.textPrimary }]}>{lead.customer_name}</Text>
                        {lead.customer_phone && (
                          <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing.xs }]}>
                            📞 {lead.customer_phone}
                          </Text>
                        )}
                        {lead.customer_email && (
                          <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing.xs }]}>
                            ✉️ {lead.customer_email}
                          </Text>
                        )}
                      </View>
                    )}

                    {lead.provider_name && (
                      <View style={{ marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                          Provider:
                        </Text>
                        <Text style={[typography.body, { color: colors.success }]}>{lead.provider_name}</Text>
                      </View>
                    )}

                    {lead.notes && (
                      <View style={{ marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
                        <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                          Notes:
                        </Text>
                        <Text style={[typography.body, { color: colors.textPrimary }]}>{lead.notes}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

