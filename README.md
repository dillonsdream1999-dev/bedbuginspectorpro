# Bed Bug Inspection Pro

A React Native (Expo) mobile app that guides users through a step-by-step bed bug inspection process and connects them with local pest control professionals.

## Features

- **Guided Room Inspections** - Step-by-step photo-guided inspections for bedrooms, living rooms, and hotel rooms
- **Interactive Photo Markers** - Pin-based annotations showing exactly where to look for signs of bed bugs
- **Educational Content** - Learn about bed bug life stages, how they spread, and why DIY treatments fail
- **Provider Matching** - Automatically connects users with territory owners based on ZIP code
- **Lead Generation** - Call, text, or request callback from local professionals
- **Privacy-First** - Photos stay on device only, never uploaded

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Native Stack)
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Custom theme with Poppins font family
- **Analytics**: Custom event tracking to Supabase

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
# Clone the repository
git clone https://github.com/dillonsdream1999-dev/bedbuginspectorpro.git
cd bedbuginspectorpro

# Install dependencies
npm install

# Start the development server
npm run web    # For web
npm run ios    # For iOS simulator
npm run android # For Android emulator
```

### Environment Setup

The app uses Supabase for backend services. Update `src/services/supabase.ts` with your credentials or configure via `app.config.js`:

```javascript
// app.config.js
export default {
  expo: {
    extra: {
      supabaseUrl: 'YOUR_SUPABASE_URL',
      supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
    },
  },
};
```

## Database Schema

### Required Tables

```sql
-- Territory ownership (provider matching)
CREATE TABLE territory_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  zip_code TEXT NOT NULL
);

-- Companies (pest control providers)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip TEXT NOT NULL,
  room_type TEXT NOT NULL,
  contact_pref TEXT NOT NULL,
  session_id TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  device_id TEXT,
  platform TEXT,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── constants/        # Theme, copy text, configuration
├── features/         # Feature modules (scanPhoto)
├── screens/          # App screens
├── services/         # API services (Supabase, analytics)
├── store/            # Zustand state stores
└── types/            # TypeScript type definitions
```

## Analytics Events

The app tracks these events:
- `app_open` - App launched
- `scan_started` / `scan_completed` - Inspection flow
- `lead_submitted` - Lead form submitted
- `provider_found` / `provider_not_found` - Territory lookup results
- `call_initiated` / `text_initiated` / `callback_requested` - Contact actions

## License

Proprietary - All rights reserved.

## Contact

For questions about territory licensing or the InspectionProNetwork, contact the development team.












