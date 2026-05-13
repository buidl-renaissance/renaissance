# Local Development Setup

This guide will help you get the Renaissance app running on your local machine.

## Prerequisites

### Required Software

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | >= 20.19.0 | Required by `engines` in package.json |
| **Yarn** | 1.x (Classic) | Package manager |
| **Expo CLI** | Latest | Installed globally or via npx |
| **Watchman** | Latest | Recommended for macOS/Linux |

### For iOS Development
- macOS (required)
- Xcode 15+ with Command Line Tools
- iOS Simulator or physical iOS device
- CocoaPods (`sudo gem install cocoapods`)

### For Android Development
- Android Studio with Android SDK
- Android Emulator or physical Android device
- Java Development Kit (JDK) 17

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/buidl-renaissance/renaissance.git
cd renaissance
```

### 2. Install Dependencies

```bash
yarn install
```

This will also run `postinstall` which applies any patches via `patch-package`.

### 3. Environment Setup

The app uses environment variables for API endpoints and configuration. Create a `.env` file if needed (check with the team for required values).

Common environment variables:
- API endpoints
- Third-party API keys (Google, Neynar, etc.)

### 4. Start the Development Server

```bash
# Start Expo development server
yarn start

# Or explicitly
npx expo start
```

This opens the Expo DevTools in your browser.

### 5. Run on Simulator/Emulator

**iOS Simulator:**
```bash
yarn ios
# Or press 'i' in the Expo DevTools terminal
```

**Android Emulator:**
```bash
yarn android
# Or press 'a' in the Expo DevTools terminal
```

### 6. Run on Physical Device

1. Install **Expo Go** from the App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal or Expo DevTools
3. The app will load on your device

**Note:** Some features (camera, vision camera) require a development build and won't work in Expo Go.

## Development Builds

For full native module access (camera, vision-camera, etc.), you need a development build:

### Create Development Build

```bash
# iOS Simulator
npx eas build --profile development-simulator --platform ios

# Android
npx eas build --profile development --platform android
```

### Run with Development Client

```bash
npx expo start --dev-client
```

## Common Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start | `yarn start` | Start Expo dev server |
| iOS | `yarn ios` | Run on iOS simulator |
| Android | `yarn android` | Run on Android emulator |
| Web | `yarn web` | Run in web browser |

## Common Gotchas & Troubleshooting

### Metro Bundler Issues

**Clear cache and restart:**
```bash
npx expo start --clear
# Or
yarn start --clear
```

**Reset Metro cache completely:**
```bash
rm -rf node_modules/.cache
watchman watch-del-all  # If using watchman
yarn start --clear
```

### iOS Build Failures

**Pod install issues:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Clean Xcode build:**
```bash
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Android Build Failures

**Clean Gradle:**
```bash
cd android
./gradlew clean
cd ..
```

**Clear Android build cache:**
```bash
rm -rf android/app/build
rm -rf android/.gradle
```

### Node/Yarn Issues

**Node version mismatch:**
```bash
# Check your Node version
node --version
# Should be >= 20.19.0

# Use nvm to switch versions
nvm use 20
```

**Reinstall dependencies:**
```bash
rm -rf node_modules
rm yarn.lock
yarn install
```

### Camera/Vision Camera Not Working

The app uses `react-native-vision-camera` which requires:
1. A development build (not Expo Go)
2. Physical device for full camera features
3. Proper permissions granted

See [MIGRATION_NOTES.md](../MIGRATION_NOTES.md) for camera-specific setup.

### Expo Updates Not Loading

If OTA updates aren't loading:
```bash
# Force clear Expo cache
npx expo start --clear

# Or clear Expo caches manually
rm -rf ~/.expo
```

### TypeScript Errors

**Rebuild TypeScript:**
```bash
npx tsc --noEmit
```

**Check tsconfig.json** for proper include/exclude paths.

## Development Tips

### Hot Reloading
- Hot reloading is enabled by default
- Press `r` in the terminal to force reload
- Press `m` to toggle the menu

### Debugging
- Shake device or press `d` to open React Native dev menu
- Use React DevTools for component inspection
- Console logs appear in the terminal running Expo

### Network Debugging
- The app connects to `api.detroiter.network` for backend services
- Use a proxy like Charles or mitmproxy to inspect network requests
- Check `src/dpop.ts` for the base hostname configuration

## Next Steps

Once you have the app running:
1. Read [Repository Structure](./repo-structure.md) to understand the codebase
2. Review [Architecture](./architecture.md) for technical design
3. Check [Contributing](./contributing.md) before making changes
