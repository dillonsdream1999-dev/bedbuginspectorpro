/**
 * Admin Login Screen
 * Authenticates admin users using Supabase Auth
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { signInAdmin } from '../services/adminAuthService';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminLogin'>;

export const AdminLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signInAdmin(email.trim(), password);
    
    setLoading(false);

    if (result.success) {
      navigation.replace('AdminDashboard');
    } else {
      setError(result.error || 'Sign in failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={[typography.heading1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            Admin Login
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Sign in to access the admin dashboard
          </Text>
        </View>

        {error && (
          <View
            style={{
              backgroundColor: colors.danger + '20',
              padding: spacing.md,
              borderRadius: borderRadius.md,
              marginBottom: spacing.md,
            }}
          >
            <Text style={[typography.body, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Email
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="admin@inspectionpronetwork.com"
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              borderWidth: 1,
              borderColor: colors.border,
              ...typography.body,
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.captionBold, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
            Password
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={{
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              borderWidth: 1,
              borderColor: colors.border,
              ...typography.body,
            }}
            editable={!loading}
            onSubmitEditing={handleSignIn}
          />
        </View>

        <Pressable
          onPress={handleSignIn}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: loading ? colors.textMuted : colors.primary,
            padding: spacing.md,
            borderRadius: borderRadius.md,
            alignItems: 'center',
            opacity: pressed ? 0.8 : 1,
          })}
        >
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={[typography.bodyBold, { color: colors.textOnPrimary }]}>Sign In</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

