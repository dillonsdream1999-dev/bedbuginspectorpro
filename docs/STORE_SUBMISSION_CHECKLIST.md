# Bed Bug Inspection Pro - Store Submission Checklist

## Phase 1: Developer Account Setup

### Apple (Required for iOS)
- [ ] **Apple Developer Program** - $99/year
  - Go to: https://developer.apple.com/programs/
  - Sign up with your Apple ID
  - Complete enrollment (may take 24-48 hours to process)
  - Note your **Team ID** (found in Membership section)

### Google (Required for Android)
- [ ] **Google Play Console** - $25 one-time
  - Go to: https://play.google.com/console
  - Create developer account
  - Complete identity verification

---

## Phase 2: Expo Account Setup

- [ ] Create Expo account at https://expo.dev
- [ ] Run `eas login` and enter credentials
- [ ] Run `eas build:configure` to link project
- [ ] Copy the generated **projectId** to `app.json` → `extra.eas.projectId`
- [ ] Set your **owner** in `app.json` to your Expo username

---

## Phase 3: App Assets (REQUIRED for stores)

### App Icon
- [ ] **1024x1024 PNG** (no transparency for iOS)
- [ ] Save as `./assets/icon.png`
- [ ] Create Android adaptive icon foreground (1024x1024): `./assets/adaptive-icon.png`

### Splash Screen
- [ ] Design splash with logo (1284x2778 recommended for modern phones)
- [ ] Save as `./assets/splash-icon.png`

### Screenshots (for store listings)
- [ ] **iPhone 6.5" display** (1284x2778) - at least 3 screenshots
- [ ] **iPhone 5.5" display** (1242x2208) - at least 3 screenshots
- [ ] **iPad Pro 12.9"** (2048x2732) - if supporting tablets
- [ ] **Android Phone** (1080x1920 or similar) - at least 3 screenshots

### Feature Graphic (Android only)
- [ ] **1024x500 PNG** for Play Store header

---

## Phase 4: Store Listing Content

### App Metadata
- [ ] **App Name**: Bed Bug Inspection Pro
- [ ] **Short Description** (80 chars max):
  > Guided room inspection for common bed bug hiding spots.
- [ ] **Full Description** (4000 chars max):
  ```
  Bed Bug Inspection Pro helps you inspect rooms for common bed bug hiding spots using a step-by-step photo guide.

  DON'T JUST CHECK THE MATTRESS
  Bed bugs hide in many places you might not expect. This app guides you through a thorough room inspection with interactive markers showing exactly where to look.

  FEATURES:
  • Step-by-step photo checklist for bedrooms, hotels, and living rooms
  • Interactive inspection markers on your photos
  • Educational guidance on what to look for
  • One-tap connection to local pest control professionals
  • Photo documentation for your records

  IMPORTANT DISCLAIMER:
  This app provides educational guidance only. It does not diagnose infestations. Only a trained professional can confirm or rule out bed bug presence.

  Perfect for:
  • Travelers checking hotel rooms
  • Renters inspecting new apartments
  • Homeowners learning prevention
  • Anyone wanting to know what to look for
  ```
- [ ] **Category**: Utilities or Lifestyle
- [ ] **Keywords** (iOS): bed bug, inspection, hotel, travel, pest, home
- [ ] **Content Rating**: Complete questionnaire (app has no objectionable content)

### Required URLs
- [ ] **Privacy Policy URL** - REQUIRED by both stores
  - Must explain what data you collect (photos, location, lead info)
  - Host on your website or use a service like Termly/Iubenda
- [ ] **Support URL** - Link to support email or page
- [ ] **Marketing URL** (optional) - Your website

### Contact Info
- [ ] **Support Email** - Required for stores
- [ ] **Phone Number** (Android) - Required for Google Play

---

## Phase 5: Build & Test

### Create Development Build (for testing on real devices)
```powershell
cd C:\Users\jdill\BedBugInspectionPro
eas build --profile development --platform all
```

### Create Preview Build (internal testers)
```powershell
eas build --profile preview --platform all
```

### Create Production Build (for store submission)
```powershell
# iOS (for TestFlight / App Store)
eas build --profile production --platform ios

# Android (for Play Console)
eas build --profile production --platform android
```

---

## Phase 6: TestFlight (iOS Beta Testing)

1. [ ] Build completes on EAS → download `.ipa` or use `eas submit`
2. [ ] Go to **App Store Connect** → Create new app
3. [ ] Fill in app metadata (name, bundle ID, etc.)
4. [ ] Upload build via:
   ```powershell
   eas submit --platform ios
   ```
5. [ ] Wait for Apple processing (5-30 minutes)
6. [ ] Go to TestFlight tab → Add external testers (up to 10,000)
7. [ ] Testers get invite via email → install via TestFlight app

---

## Phase 7: Play Console (Android Beta Testing)

1. [ ] Build completes on EAS → download `.aab`
2. [ ] Go to **Google Play Console** → Create app
3. [ ] Complete app content questionnaire
4. [ ] Upload `.aab` to **Internal Testing** track
5. [ ] Add testers by email
6. [ ] Testers get invite link → install via Play Store

---

## Phase 8: Production Release

### iOS App Store
1. [ ] Prepare screenshots and metadata
2. [ ] Submit for **App Review** (1-3 days typically)
3. [ ] If rejected, address feedback and resubmit
4. [ ] Once approved → Release to App Store

### Google Play Store
1. [ ] Complete all store listing sections
2. [ ] Move from Internal → Production track
3. [ ] Submit for review (hours to days)
4. [ ] Once approved → Rollout (staged or full)

---

## Configuration Placeholders to Replace

In `app.json`:
- [ ] `YOUR_EAS_PROJECT_ID` → Get from `eas build:configure`
- [ ] `YOUR_EXPO_USERNAME` → Your Expo account username

In `eas.json`:
- [ ] `YOUR_APPLE_ID@email.com` → Your Apple ID email
- [ ] `YOUR_APP_STORE_CONNECT_APP_ID` → Found in App Store Connect after creating app
- [ ] `YOUR_APPLE_TEAM_ID` → Found in Apple Developer Membership
- [ ] `./google-service-account.json` → Create in Google Cloud Console for Play uploads

---

## Quick Command Reference

```powershell
# Navigate to app
cd C:\Users\jdill\BedBugInspectionPro

# Login to Expo
eas login

# Configure project (first time)
eas build:configure

# Build for stores
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Check build status
eas build:list
```

---

## Estimated Timeline

| Step | Time |
|------|------|
| Developer account setup | 1-3 days |
| Asset creation (icons, screenshots) | 1-2 days |
| First build | 30-60 minutes |
| TestFlight/Internal testing | 1-7 days |
| App Store review | 1-3 days |
| Play Store review | Hours to 1 day |
| **Total to live** | **1-2 weeks** |

---

## Need Help?

- Expo EAS docs: https://docs.expo.dev/eas/
- App Store guidelines: https://developer.apple.com/app-store/review/guidelines/
- Play Store policies: https://play.google.com/console/about/guides/

