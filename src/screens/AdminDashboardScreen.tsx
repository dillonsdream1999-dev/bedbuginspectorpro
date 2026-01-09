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
import { getUsageStats, getZipCodeAnalytics, UsageStats, ZipCodeAnalytics } from '../services/adminAnalyticsService';
import { signOutAdmin, isAdminAuthenticated } from '../services/adminAuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

export const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [zipAnalytics, setZipAnalytics] = useState<ZipCodeAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [daysFilter, setDaysFilter] = useState(30);

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
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [daysFilter]);

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

  if (loading && !usageStats) {
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor={colors.primary} />}
      >
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
      </ScrollView>
    </SafeAreaView>
  );
};

