# Environment & Configuration

This document covers environment variables, configuration files, and build profiles for the Renaissance app.

## Configuration Files

### `app.json`

The main Expo configuration file containing:

```json
{
  "expo": {
    "name": "Renaissance",
    "slug": "renaissance",
    "scheme": "renaissance",
    "version": "1.1.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/renaissance.png",
      "resizeMode": "cover",
      "backgroundColor": "#ffffff"
    }
  }
}
```

**Key Fields:**

| Field | Description |
|-------|-------------|
| `name` | Display name in app stores |
| `slug` | URL-friendly identifier |
| `scheme` | Deep link scheme (`renaissance://`) |
| `version` | App version (semver) |
| `icon` | App icon path |
| `splash` | Splash screen configuration |

**Platform Configuration:**

```json
{
  "ios": {
    "bundleIdentifier": "tech.dpop.renaissance",
    "supportsTablet": true,
    "infoPlist": {
      "UIBackgroundModes": ["audio"],
      "ITSAppUsesNonExemptEncryption": false,
      "LSApplicationQueriesSchemes": ["farcaster"]
    }
  },
  "android": {
    "package": "tech.dpop.renaissance",
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png"
    }
  }
}
```

**Plugins:**

```json
{
  "plugins": [
    "@react-native-google-signin/google-signin",
    "expo-secure-store",
    "expo-build-properties",
    "@react-native-community/datetimepicker",
    "expo-font",
    ["react-native-vision-camera", { "enableCodeScanner": true }],
    ["expo-share-intent", { /* iOS activation rules */ }]
  ]
}
```

**EAS Configuration:**

```json
{
  "extra": {
    "eas": {
      "projectId": "fcef4426-6f5e-4f44-a958-c7e61c011ab6"
    }
  },
  "runtimeVersion": {
    "policy": "sdkVersion"
  },
  "updates": {
    "url": "https://u.expo.dev/fcef4426-6f5e-4f44-a958-c7e61c011ab6"
  }
}
```

### `eas.json`

EAS Build configuration with profiles:

```json
{
  "cli": {
    "version": ">= 3.15.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "node": "22.9.0"
    },
    "development-simulator": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "node": "22.9.0"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "node": "22.9.0"
    },
    "production": {
      "channel": "production",
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Build Profiles:**

| Profile | Purpose | Distribution |
|---------|---------|--------------|
| `development` | Local dev with dev client | Internal |
| `development-simulator` | iOS simulator builds | Internal |
| `preview` | Testing builds | Internal |
| `production` | App store releases | Store |

### `package.json`

Key configuration in package.json:

```json
{
  "name": "renaissance",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "postinstall": "patch-package"
  },
  "engines": {
    "node": ">=20.19.0"
  }
}
```

### `tsconfig.json`

TypeScript configuration:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### `babel.config.js`

Babel transpilation config:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo']
  };
};
```

### `metro.config.js`

Metro bundler configuration for custom resolver settings and asset extensions.

## Environment Variables

### Runtime Configuration

Environment variables can be set via:
1. `.env` file (with `react-native-dotenv`)
2. EAS secrets
3. Build-time injection

### Type Definitions (`src/env.d.ts`)

```typescript
declare module '@env' {
  export const API_URL: string;
  export const GOOGLE_CLIENT_ID: string;
  // Add other env vars as needed
}
```

### Common Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_URL` | Backend API base URL | Optional (has default) |
| `GOOGLE_CLIENT_ID` | Google Sign-In client ID | For Google auth |
| `NEYNAR_API_KEY` | Neynar API key | For Farcaster features |
| `EAS_PROJECT_ID` | EAS project identifier | In app.json |

## Source Configuration

### API Endpoints (`src/dpop.ts`)

```typescript
const hostname = "https://api.detroiter.network";
```

This is the primary backend API. Other endpoints:
- `https://events.builddetroit.xyz` – Event extraction
- `https://dpop.nyc3.digitaloceanspaces.com` – Content storage

### Theme Configuration (`src/colors.ts`)

Theme tokens for dark and light modes. The default theme is dark:

```typescript
export const theme = darkTheme;
```

### Rewards Configuration (`src/config/rewards.ts`)

```typescript
export const DEFAULT_REWARD_CONFIG = {
  pointValues: {
    event_checkin: 50,
    create_flyer: 100,
    referral: { referrer: 200, referee: 50 },
    daily_login: 10,
  },
  conversionRate: 100, // 100 points = $1 USDC
  minConversionAmount: 100,
};
```

## Build Configuration

### Development Build

```bash
# iOS Simulator
npx eas build --profile development-simulator --platform ios

# Android
npx eas build --profile development --platform android

# Run with dev client
npx expo start --dev-client
```

### Preview Build

```bash
npx eas build --profile preview --platform all
```

### Production Build

```bash
npx eas build --profile production --platform all
```

### OTA Updates

```bash
# Publish update to channel
npx eas update --branch preview --message "Description of changes"
```

## Native Configuration

### iOS (`app.json` ios section)

- `bundleIdentifier`: `tech.dpop.renaissance`
- Background modes: `audio`
- URL schemes: `renaissance`
- Queries schemes: `farcaster`

### Android (`app.json` android section)

- `package`: `tech.dpop.renaissance`
- Intent filters for share handling
- Deep link support for http/https

### Gradle Properties

```json
{
  "android": {
    "gradleProperties": {
      "VisionCamera_enableCodeScanner": "true"
    }
  }
}
```

## Secrets Management

### Local Development

1. Create `.env` file (gitignored)
2. Add required variables
3. Access via `@env` module

### EAS Secrets

For CI/CD builds, use EAS Secrets:

```bash
# Set secret
npx eas secret:create --name GOOGLE_CLIENT_ID --value "your-value"

# List secrets
npx eas secret:list
```

### Sensitive Data Storage

Runtime sensitive data uses Expo SecureStore:
- Authentication tokens
- Wallet keys
- User credentials
