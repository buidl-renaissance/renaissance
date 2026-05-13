# Architecture

This document describes the high-level architecture of the Renaissance mobile application.

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React Native 0.81.5 |
| **Platform** | Expo SDK 54 |
| **Language** | TypeScript 5.9.x |
| **Navigation** | React Navigation 6.x (Stack + Bottom Tabs) |
| **State** | React Context API |
| **Storage** | AsyncStorage (via `@react-native-async-storage/async-storage`) |
| **Web3** | ethers.js 5.x, CosmJS 0.33.x |
| **Styling** | React Native StyleSheet + Theme system |

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  (Entry point, providers, navigation container)              │
├─────────────────────────────────────────────────────────────┤
│                    Context Providers                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Local   │ │  Tenant  │ │   Auth   │ │ Farcaster│       │
│  │ Storage  │ │ Context  │ │ Provider │ │  Frame   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  ┌──────────┐ ┌──────────┐                                  │
│  │  Audio   │ │   Web3   │                                  │
│  │  Player  │ │ Context  │                                  │
│  └──────────┘ └──────────┘                                  │
├─────────────────────────────────────────────────────────────┤
│                  Navigation (React Navigation)               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              HomeNavigationStack                        ││
│  │  (Stack Navigator with 40+ screen routes)               ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                         Screens                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │Calendar │ │ Event   │ │ Account │ │  Mini   │ ...       │
│  │ Screen  │ │ Screen  │ │ Screen  │ │  App    │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
├─────────────────────────────────────────────────────────────┤
│                       Components                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Event   │ │ Modal   │ │  Card   │ │  Form   │ ...       │
│  │ Cards   │ │ Dialogs │ │ Layouts │ │ Inputs  │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Hooks & Utilities                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ useAll  │ │  use    │ │  use    │ │  Auth   │ ...       │
│  │ Events  │ │ Rewards │ │ Wallet  │ │ Utils   │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
├─────────────────────────────────────────────────────────────┤
│                      API Layer                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │   dpop.ts (main API client)    │    src/api/* modules   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────────┐
              │         Backend Services         │
              │  api.detroiter.network          │
              │  events.builddetroit.xyz        │
              │  dpop.nyc3.digitaloceanspaces   │
              └─────────────────────────────────┘
```

## Navigation Architecture

The app uses a single Stack Navigator (`HomeNavigationStack`) that contains all screen routes. This provides:
- Simple, predictable navigation flow
- Consistent header styling via theme
- Deep link support

### Screen Routes

The navigation stack includes 40+ screens covering:
- **Core**: Calendar, Event, Search, Map
- **Account**: Login, Account, AccountManagement, FarcasterProfile
- **Social**: Connections, SharedEvents, QRCode
- **Content**: Art, Artwork, AddContent, ContentUpload
- **Features**: MiniApp, Wallet, Restaurants, BestOf, Games, Fitness, Tech
- **Admin**: Admin, ReviewEvents, EventEdit, BlockSubmissions

See `src/Navigation/HomeNavigationStack.tsx` for the complete route list.

## State Management

### Context Providers

The app uses React Context for global state instead of Redux/MobX:

| Context | Purpose | Location |
|---------|---------|----------|
| `LocalStorageProvider` | AsyncStorage wrapper with getters/setters | `src/context/LocalStorage.tsx` |
| `TenantProvider` | Multi-tenant configuration (city/location) | `src/context/TenantContext.tsx` |
| `AuthProvider` | User authentication state and session | `src/context/Auth.tsx` |
| `FarcasterFrameProvider` | Farcaster frame/auth integration | `src/context/FarcasterFrame.tsx` |
| `AudioPlayerProvider` | Audio playback state | `src/context/AudioPlayer.tsx` |
| `Web3Provider` | Wallet and blockchain state | `src/context/Web3.tsx` |

### Local Storage

Persistent data is stored via `AsyncStorage`:
- User session tokens (`DPoPToken`, `DPoPUser`, `DPoPContact`)
- Bookmarks and saved events
- Check-in history
- Rewards points and badges
- Connection data

## API Layer

### Primary API Client (`src/dpop.ts`)

The main API client handles:
- Authentication (login, register, token management)
- Events (CRUD, RSVPs, check-ins, comments)
- Content (upload, create, update)
- Media uploads (images, video, audio)
- User management

**Base URL:** `https://api.detroiter.network`

### API Modules (`src/api/`)

Specialized API modules for specific features:
- `user.ts` – User profile operations
- `connections.ts` – Social connections
- `bookmarks.ts` – Event bookmarks
- `sports-games.ts` – Sports data
- `send-usdc.ts`, `usdc-balance.ts` – USDC transactions
- `treasury.ts` – Treasury balance

### External Data Sources

Events are aggregated from multiple sources via hooks:
- **Luma** (`useLumaEvents.ts`)
- **Resident Advisor** (`useRAEvents.ts`)
- **Meetup** (`useMeetupEvents.ts`)
- **Instagram** (`useInstagramEvents.ts`)
- **Renaissance** (`useRenaissanceEvents.ts`)

## Theming System

### Theme Definition (`src/colors.ts`)

The app supports dark and light themes with semantic color tokens:

```typescript
export const darkTheme = {
  // Base colors
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  
  // Brand colors
  primary: '#3449ff',
  primaryLight: '#6B7FFF',
  
  // Status colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Event source colors
  eventLuma: '#ff6b6b',
  eventRA: '#7c3aed',
  eventMeetup: '#f97316',
  // ...
};
```

Theme is applied via:
- Navigation header styles
- Component StyleSheet definitions
- Direct color references

## Component Architecture

### Screen Components

Screens in `src/Screens/` are full-page views that:
- Receive navigation props
- Fetch data via hooks
- Compose UI from components
- Handle user interactions

### Reusable Components

Components in `src/Components/` are reusable UI elements:
- **Event Cards** – Display event information (Luma, RA, Meetup variants)
- **Modals** – Bottom sheets and overlays (Wallet, Bookmarks, Search)
- **Forms** – Input groups and pickers
- **Layout** – Sections, headers, carousels

### Styled Components

`src/Components/Styled/` contains themed UI primitives for consistent styling.

## Custom Hooks

Hooks in `src/hooks/` encapsulate:
- Data fetching logic
- State management
- Side effects

### Data Hooks Pattern

```typescript
export const useEvents = () => {
  const [events, setEvents] = useState<DAEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error, refetch };
};
```

## Interface Definitions

TypeScript interfaces are defined in:
- `src/interfaces.ts` – Main interface file
- `src/interfaces/` – Additional modules

Key interfaces:
- `DAEvent`, `DAVenue`, `DAUser`, `DAContent` – Core domain types
- `LumaEvent`, `RAEvent`, `MeetupEvent` – External source types
- `RenaissanceEvent` – Internal event type
- `Contact`, `User` – User types
- `ContentUpload`, `DAUpload` – Media types

## Deep Linking

The app handles deep links for:
- Authentication callbacks (`renaissance://authenticate?token=...`)
- Shared URLs (http/https)
- Share sheet intents

Deep link handling is configured in `App.tsx` and `app.json`.

## Push Notifications

Expo Notifications is configured for:
- Push token registration
- Notification handling
- Background notification processing

See `App.tsx` for notification setup.

## OTA Updates

Expo Updates enables over-the-air updates:
- Configured in `app.json` under `updates`
- Auto-reload on app foreground (`checkForUpdates`)
- Uses EAS Update service
