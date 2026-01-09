/**
 * Bed Bug Inspection Pro - Expo App
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { trackAppOpen } from './src/services/analyticsService';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { RootStackParamList } from './src/types';
import { colors, typography } from './src/constants/theme';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { SelectRoomScreen } from './src/screens/SelectRoomScreen';
import { BedBugEducationScreen } from './src/screens/BedBugEducationScreen';
import { TermsScreen } from './src/screens/TermsScreen';
import { PrivacyScreen } from './src/screens/PrivacyScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { ObjectDetectionScreen } from './src/screens/ObjectDetectionScreen';
import { PhotoCaptureScreen } from './src/screens/PhotoCaptureScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { LeadFlowScreen } from './src/screens/LeadFlowScreen';

// Photo Scan Feature
import {
  PhotoScanFlowScreen,
  CapturePhotoScreen,
  PhotoAnnotateScreen,
  PhotoScanSummaryScreen,
} from './src/features/scanPhoto';

// Admin
import { AdminLoginScreen } from './src/screens/AdminLoginScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // Track app open
  useEffect(() => {
    if (fontsLoaded) {
      trackAppOpen();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: {
              ...typography.heading3,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
            animation: 'slide_from_right',
            animationDuration: 300,
            animationTypeForReplace: 'push',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: true,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SelectRoom"
            component={SelectRoomScreen}
            options={{ title: 'Select Room' }}
          />
          <Stack.Screen
            name="BedBugEducation"
            component={BedBugEducationScreen}
            options={{ title: 'About Bed Bugs' }}
          />
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Privacy"
            component={PrivacyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Scan"
            component={ScanScreen}
            options={{ title: 'Inspection', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="ObjectDetection"
            component={ObjectDetectionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PhotoCapture"
            component={PhotoCaptureScreen}
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="Summary"
            component={SummaryScreen}
            options={{ title: 'Summary', headerBackVisible: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="LeadFlow"
            component={LeadFlowScreen}
            options={{ headerShown: false, presentation: 'modal' }}
          />
          {/* Photo Scan Flow */}
          <Stack.Screen
            name="PhotoScanFlow"
            component={PhotoScanFlowScreen}
            options={{ title: 'Photo Scan', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="PhotoScanCapture"
            component={CapturePhotoScreen}
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="PhotoAnnotate"
            component={PhotoAnnotateScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PhotoScanSummary"
            component={PhotoScanSummaryScreen}
            options={{ title: 'Summary', headerBackVisible: false, gestureEnabled: false }}
          />
          {/* Admin */}
          <Stack.Screen
            name="AdminLogin"
            component={AdminLoginScreen}
            options={{ title: 'Admin Login', headerShown: false }}
          />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
            options={{ title: 'Admin Dashboard', headerShown: false, gestureEnabled: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
