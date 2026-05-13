# Current State

This document describes what the Renaissance app actually does right now—its implemented features, known limitations, and areas of active development.

## Implemented Features

### Event Discovery ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Luma events | ✅ Implemented | Via `useLumaEvents.ts` |
| Resident Advisor events | ✅ Implemented | Via `useRAEvents.ts` |
| Meetup events | ✅ Implemented | Via `useMeetupEvents.ts` |
| Instagram events | ✅ Implemented | Via `useInstagramEvents.ts` |
| Renaissance native events | ✅ Implemented | Via `useRenaissanceEvents.ts` |
| Unified calendar view | ✅ Implemented | `CalendarScreen.tsx` (56KB, primary screen) |
| Event filtering | ✅ Implemented | By source, category |
| Event detail views | ✅ Implemented | Separate cards for each source type |
| Map view | ✅ Implemented | `MapScreen.tsx`, `BrowseMapScreen.tsx` |
| Search | ✅ Implemented | `SearchScreen.tsx`, `SearchModal.tsx` |

### Event Interaction ✅

| Feature | Status | Notes |
|---------|--------|-------|
| RSVP | ✅ Implemented | Via `submitEventRsvp()` in `dpop.ts` |
| Check-in | ✅ Implemented | Via `submitEventCheckIn()` + rewards |
| Bookmarks | ✅ Implemented | `BookmarksScreen.tsx`, stored in AsyncStorage |
| Share events | ✅ Implemented | Deep linking + share intent handling |
| Comments | ✅ Implemented | Via `submitEventComment()` |

### Social Features ✅

| Feature | Status | Notes |
|---------|--------|-------|
| User profiles | ✅ Implemented | `AccountScreen.tsx`, `AccountManagementScreen.tsx` |
| QR code connections | ✅ Implemented | `QRCodeScreen.tsx`, `QRCodeModal.tsx` |
| Connection list | ✅ Implemented | `ConnectionsScreen.tsx`, `ConnectionsModal.tsx` |
| Shared bookmarks | ✅ Implemented | `useConnectionBookmarks.ts` |

### Rewards System ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Points earning | ✅ Implemented | Check-in, referral, flyer creation |
| Badge system | ✅ Implemented | `BadgeDisplay.tsx`, `src/utils/badges.ts` |
| Points display | ✅ Implemented | In wallet and account screens |
| Points-to-USDC conversion | ✅ Implemented | `src/api/convert-points.ts` |

### Content Creation ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Flyer upload | ✅ Implemented | `CreateFlyerModal.tsx` |
| AI flyer extraction | ✅ Implemented | Via `events.builddetroit.xyz/api/events/extract` |
| Event creation from flyer | ✅ Implemented | `createFlyer()` in `dpop.ts` |
| Audio recording | ✅ Implemented | `AudioRecorder.tsx`, `AudioRecorderContext` |
| Image upload | ✅ Implemented | `uploadImage()` in `dpop.ts` |

### Wallet & Web3 ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Wallet screen | ✅ Implemented | `WalletScreen.tsx`, `WalletModal.tsx` |
| USDC balance | ✅ Implemented | `useUSDCBalance.ts` |
| USDC transfers | ✅ Implemented | `src/api/send-usdc.ts` |
| Treasury balance | ✅ Implemented | `useTreasuryBalance.ts` |
| DPoP auth | ✅ Implemented | `src/dpop.ts`, `submitDPoPAuth()` |

### Farcaster Integration ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Farcaster sign-in | ✅ Implemented | Via Neynar, `src/utils/neynarAuth.ts` |
| Profile display | ✅ Implemented | `FarcasterProfileScreen.tsx` |
| Frame support | ✅ Implemented | `@farcaster/frame-host-react-native` |
| Frame provider | ✅ Implemented | `FarcasterFrameProvider` context |

### Multi-Tenant ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Tenant context | ✅ Implemented | `TenantContext.tsx` |
| Detroit tenant | ✅ Implemented | Default |
| Denver tenant | ✅ Implemented | Including ETH Denver events |
| Tenant selection | ✅ Implemented | `TenantSelectScreen.tsx` |

### Authentication ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Email/password | ✅ Implemented | `login()`, `register()` in `dpop.ts` |
| Google Sign-In | ✅ Implemented | `@react-native-google-signin/google-signin` |
| Farcaster/Neynar | ✅ Implemented | `src/utils/neynarAuth.ts` |
| Session management | ✅ Implemented | DPoP tokens in AsyncStorage |

### Other Features ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Push notifications | ✅ Implemented | Expo Notifications in `App.tsx` |
| OTA updates | ✅ Implemented | `checkForUpdates.ts`, auto-reload |
| Deep linking | ✅ Implemented | `renaissance://` scheme |
| Share intent handling | ✅ Implemented | `expo-share-intent` |
| Mini apps (webview) | ✅ Implemented | `MiniAppScreen.tsx`, `MiniAppModal.tsx` |
| Restaurants feature | ✅ Implemented | `RestaurantsScreen.tsx`, bucket lists |
| Sports games | ✅ Implemented | `SportsGameCard.tsx`, `useSportsGames.ts` |

## Technical State

### Dependencies
- **React Native**: 0.81.5 (current)
- **Expo SDK**: 54 (current)
- **TypeScript**: 5.9.x (current)
- **React Navigation**: 6.x (stable)

### Code Quality
- TypeScript strict mode enabled
- Consistent component patterns
- Theme system with semantic tokens
- Custom hooks for data fetching

### Known Warnings Suppressed
The app suppresses `defaultProps` deprecation warnings from `react-native-render-html` (see `App.tsx`). This is a known library issue expected to be fixed upstream.

## Known Limitations

### Testing
- No comprehensive test suite currently exists
- Manual testing on iOS/Android required

### Camera
- Vision camera requires development builds (not Expo Go)
- Some camera features need physical device

### Offline
- Limited offline caching implemented
- Full offline mode not yet robust

## Active Development Areas

Based on recent git history:

1. **App Blocks** – Recent commits show active work on "app blocks" feature
2. **Denver/ETH Denver** – Multi-tenant expansion to Denver
3. **QR Authentication** – QR-based auth flow improvements
4. **Event Polling** – Background event ingestion (in-progress branch)

## Backend Dependencies

The app requires these backend services to be available:

| Service | URL | Purpose |
|---------|-----|---------|
| Detroiter API | `api.detroiter.network` | Primary backend |
| Events API | `events.builddetroit.xyz` | Flyer extraction |
| Storage | `dpop.nyc3.digitaloceanspaces.com` | Media storage |

## Build Configuration

- **EAS Build** configured for development, preview, and production profiles
- **Expo Updates** enabled for OTA deployments
- **patch-package** used for dependency patches
