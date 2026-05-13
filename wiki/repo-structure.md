# Repository Structure

This document provides an annotated tour of the Renaissance repository structure.

## Root Directory

```
renaissance/
├── App.tsx              # Main application entry point
├── app.json             # Expo configuration (name, plugins, native settings)
├── eas.json             # EAS Build configuration (dev/preview/production profiles)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── babel.config.js      # Babel configuration
├── metro.config.js      # Metro bundler configuration
├── yarn.lock            # Yarn lockfile
├── assets/              # Static assets (icons, images, fonts)
├── src/                 # Application source code
└── wiki/                # Developer documentation (this wiki)
```

## `App.tsx`

The main entry point that:
- Imports polyfills (`text-encoding-polyfill`)
- Sets up React Navigation container
- Configures push notifications (Expo Notifications)
- Handles deep links and share intents
- Wraps the app in context providers:
  - `GestureHandlerRootView`
  - `LocalStorageProvider`
  - `TenantProvider`
  - `AuthProvider`
  - `FarcasterFrameProvider`
  - `AudioPlayerProvider`
  - `BottomSheetModalProvider`
  - `NavigationContainer`

## `src/` Directory

### `src/api/`
API client modules for backend communication.

| File | Purpose |
|------|---------|
| `user.ts` | User-related API calls (profile, settings) |
| `connections.ts` | Social connections API |
| `bookmarks.ts` | Event bookmarks API |
| `sports-games.ts` | Sports games data |
| `featured-events.ts` | Featured events listing |
| `block-submissions.ts` | Community block submissions |
| `send-usdc.ts` | USDC transfer functionality |
| `usdc-balance.ts` | USDC balance queries |
| `treasury.ts` | Treasury balance queries |
| `web3.ts` | Web3 utility functions |
| `convert-points.ts` | Points-to-USDC conversion |
| `grant-governance.ts` | Grant governance features |

### `src/Screens/`
Screen components for each view in the app. Major screens include:

| Screen | Purpose |
|--------|---------|
| `CalendarScreen.tsx` | Main event calendar (56KB, primary landing screen) |
| `AccountManagementScreen.tsx` | User account settings (58KB) |
| `SharedURLScreen.tsx` | Handle shared URLs from other apps |
| `MiniAppScreen.tsx` | In-app webview for mini apps |
| `WalletScreen.tsx` | Web3 wallet management |
| `EventScreen.tsx` | Individual event detail view |
| `RenaissanceEventScreen.tsx` | Renaissance-specific event view |
| `FarcasterProfileScreen.tsx` | Farcaster profile display |
| `LoginScreen.tsx` | Authentication flow |
| `SearchScreen.tsx` | Event and content search |
| `MapScreen.tsx` / `BrowseMapScreen.tsx` | Map-based event browsing |
| `RestaurantsScreen.tsx` | Restaurant discovery feature |
| `BookmarksScreen.tsx` | Saved events view |
| `ConnectionsScreen.tsx` | Social connections management |

### `src/Components/`
Reusable UI components organized by feature.

**Event-related:**
- `EventCard.tsx`, `EventRenderer.tsx`, `EventsSectionList.tsx`
- `LumaEventCard.tsx`, `RAEventCard.tsx`, `MeetupEventCard.tsx`
- `InstagramEventCard.tsx`, `RenaissanceEventCard.tsx`
- `EventBookmarkButton.tsx`, `EventCheckInButton.tsx`
- `EventWebModal.tsx`, `DAEventModal.tsx`
- `CreateFlyerModal.tsx`, `EventForecast.tsx`

**Navigation & Modals:**
- `MiniAppModal.tsx`, `MiniAppsModal.tsx`, `MiniAppButton.tsx`
- `BookmarksModal.tsx`, `BookmarksContent.tsx`
- `ConnectionsModal.tsx`, `ConnectionsContent.tsx`
- `WalletModal.tsx`, `QRCodeModal.tsx`, `SearchModal.tsx`
- `DismissibleScrollModal.tsx`, `InstagramPostModal.tsx`

**User & Social:**
- `ConnectionAvatars.tsx`
- `FarcasterProfileScreen.tsx` (in Screens)
- `BadgeDisplay.tsx`

**UI Primitives:**
- `Button.tsx`, `Icon.tsx`, `RoundButton.tsx`
- `Carousel.tsx`, `CategoryChip.tsx`, `FilterBubble.tsx`
- `SectionHeader.tsx`, `SectionTitle.tsx`
- `DateTimePicker.tsx`, `TextInputGroup.tsx`

**Styled Components:** `src/Components/Styled/` – Themed UI primitives

**Content:** `src/Components/Content/` – Content display components

### `src/Navigation/`
Navigation configuration.

| File | Purpose |
|------|---------|
| `HomeNavigationStack.tsx` | Main stack navigator with all screen routes |
| `BottomTabNavigator.tsx` | Bottom tab navigation (if enabled) |

### `src/context/`
React Context providers for global state.

| Context | Purpose |
|---------|---------|
| `Auth.tsx` | Authentication state and user session |
| `LocalStorage.tsx` | AsyncStorage wrapper for persistent data |
| `TenantContext.tsx` | Multi-tenant/location configuration |
| `FarcasterFrame.tsx` | Farcaster frame and auth integration |
| `AudioPlayer.tsx` | Audio playback state |
| `AudioRecorder.tsx` | Audio recording state |
| `Web3.tsx` | Web3/wallet provider |

### `src/hooks/`
Custom React hooks for data fetching and utilities.

**Event hooks:**
- `useAllEvents.ts` – Aggregated events from all sources
- `useEvents.ts` – Generic event fetching
- `useLumaEvents.ts`, `useRAEvents.ts`, `useMeetupEvents.ts`
- `useInstagramEvents.ts`, `useRenaissanceEvents.ts`
- `useDenverEvents.ts`, `useEthDenverEvents.ts`
- `useFeaturedRAEvents.ts`

**Utility hooks:**
- `useArtwork.ts` – Artwork data
- `useVenues.ts` – Venue data
- `useWeather.ts` – Weather forecasts
- `useSportsGames.ts` – Sports game schedules
- `useRewards.ts` – Rewards/points system
- `useConnectionBookmarks.ts` – Shared bookmarks
- `useUSDCBalance.ts`, `useTreasuryBalance.ts` – Web3 balances

**Camera/Media:**
- `useVisionCamera.ts` – react-native-vision-camera wrapper
- `useBarcodeScanner.ts` – QR/barcode scanning
- `useImagePicker.ts` – Image selection
- `useWebModal.ts` – Web modal state

### `src/interfaces/`
TypeScript type definitions.

- `src/interfaces.ts` – Main interface file with event, user, venue, and API types
- `src/interfaces/` directory – Additional interface modules

Key interfaces: `DAEvent`, `DAVenue`, `DAUser`, `DAContent`, `DAArtwork`, `LumaEvent`, `RAEvent`, `MeetupEvent`, `RenaissanceEvent`

### `src/utils/`
Utility functions and helpers.

| File | Purpose |
|------|---------|
| `bookmarks.ts` | Bookmark storage and sync |
| `connections.ts` | Connection management |
| `eventDates.ts`, `eventGrouping.ts`, `eventKeys.ts` | Event date/grouping utilities |
| `event-checkin.ts` | Check-in logic |
| `farcasterAuth.ts`, `farcasterSigner.ts` | Farcaster authentication |
| `neynarAuth.ts` | Neynar API authentication |
| `rewards-storage.ts` | Rewards persistence |
| `sharedEvents.ts`, `sharedUrls.ts` | Sharing utilities |
| `urlDetection.ts` | URL parsing and detection |
| `wallet.ts`, `web3.ts` | Web3 utilities |
| `badges.ts` | Badge system |
| `bucketLists.ts` | Restaurant bucket lists |
| `formatDate.ts`, `formatTime.ts` | Date/time formatting |
| `uploadImage.ts` | Image upload helpers |
| `checkForUpdate.ts` | OTA update checking |

### `src/config/`
Configuration files.

- `rewards.ts` – Rewards system configuration (point values, conversion rates)

### `src/mocks/`
Mock data for development and testing.

### `src/build/`
Build-related utilities and scripts.

### Other Root Files

- `src/dpop.ts` – DPoP API client (authentication, events, content, media upload)
- `src/colors.ts` – Theme definitions (dark/light themes, colors, semantic tokens)
- `src/env.d.ts` – Environment variable type declarations

## `assets/`

Static assets directory:
- `icon.png` – App icon
- `adaptive-icon.png` – Android adaptive icon
- `splash.png` / `renaissance.png` – Splash screen
- `favicon.png` – Web favicon

## Configuration Files

| File | Purpose |
|------|---------|
| `app.json` | Expo configuration (plugins, native settings, EAS project ID) |
| `eas.json` | EAS Build profiles (development, preview, production) |
| `tsconfig.json` | TypeScript compiler options |
| `babel.config.js` | Babel transpilation config |
| `metro.config.js` | Metro bundler settings |
